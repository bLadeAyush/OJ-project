from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .tasks import evaluate_submission
from rest_framework.generics import ListAPIView

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
