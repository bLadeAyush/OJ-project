from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated , AllowAny
from rest_framework import status
from .tasks import evaluate_submission
from rest_framework.generics import ListAPIView
from django.db.models import Count, Avg, Case, When, IntegerField, Q ,Sum
from users.models import User
from .models import Submission
from problems.models import Problem
from .models import Submission
from .serializers import SubmissionSerializer

import uuid
import os
import subprocess

class SubmitCodeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        print("SubmitCodeView hit!") 
        print("User:", request.user)

        problem_code = request.data.get("problem_code")
        code = request.data.get("code")
        language = request.data.get("language")

        if not all([problem_code, code, language]):
            return Response({"error": "Missing fields"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            problem = Problem.objects.get(code=problem_code)
        except Problem.DoesNotExist:
            print("Problem not found:", problem_code)
            return Response({"error": "Problem not found"}, status=status.HTTP_404_NOT_FOUND)

      
        submission = Submission.objects.create(
            user=request.user,
            problem=problem,
            code=code,
            language=language
        )
        print("Submission saved:", submission.id)

        
        evaluate_submission.delay(submission.id)

        return Response({
            "submission_id": submission.id,
            "verdict": "PENDING"
        }, status=status.HTTP_201_CREATED)

class RunCodeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        code = request.data.get("code")
        language = request.data.get("language")
        custom_input = request.data.get("input", "")

        if not all([code, language]):
            return Response({"error": "Missing fields"}, status=400)

        folder = os.path.join(os.path.expanduser("~"), "oj_temp", str(uuid.uuid4()))
        os.makedirs(folder, exist_ok=True)

        filename = {"python": "main.py", "cpp": "main.cpp", "java": "Main.java"}[language]
        code_path = os.path.join(folder, filename)
        input_path = os.path.join(folder, "input.txt")

        with open(code_path, "w") as f:
            f.write(code)
        with open(input_path, "w") as f:
            f.write(custom_input)

        image = {"python": "oj-python", "cpp": "oj-cpp", "java": "oj-java"}[language]
        folder_docker = folder.replace("\\", "/")
        command = f'docker run --rm -v "{folder_docker}:/app" {image}'

        try:
            result = subprocess.run(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=10)
            output = result.stdout.decode()
            error = result.stderr.decode()
        except subprocess.TimeoutExpired:
            output = ""
            error = "TLE"

        subprocess.run(f'rm -rf "{folder}"', shell=True)

        return Response({
            "output": output.strip(),
            "error": error.strip()
        })
class SubmissionStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, submission_id):
        try:
            submission = Submission.objects.get(id=submission_id, user=request.user)
            serializer = SubmissionSerializer(submission)
            return Response(serializer.data)
        except Submission.DoesNotExist:
            return Response({"error": "Submission not found"}, status=404)
        
class SubmissionListView(ListAPIView):
    serializer_class = SubmissionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        problem_code = self.request.query_params.get("problem")
        queryset = Submission.objects.filter(user=user)
        if problem_code:
            queryset = queryset.filter(problem__code=problem_code)
        return queryset.order_by("-submitted_at")


class LeaderboardView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        users = User.objects.annotate(
            total_ac=Count(
                'submissions',
                filter=Q(submissions__verdict='AC'),
                distinct=True
            ),
            total_points=Sum(
                Case(
                    When(submissions__verdict='AC', submissions__problem__difficulty='Easy', then=100),
                    When(submissions__verdict='AC', submissions__problem__difficulty='Medium', then=200),
                    When(submissions__verdict='AC', submissions__problem__difficulty='Hard', then=300),
                    default=0,
                    output_field=IntegerField()
                )
            ),
            avg_time=Avg('submissions__time_taken', filter=Q(submissions__verdict='AC'))
        ).order_by('-total_ac', 'avg_time')

        data = [
            {
                "username": user.username,
                "total_ac": user.total_ac or 0,
                "total_points": user.total_points or 0,
                "avg_time": round(user.avg_time or 0, 3)
            }
            for user in users
        ]

        return Response(data)
