from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from problems.models import Problem
from .models import Submission
from .serializers import SubmissionSerializer
from .tasks import evaluate_submission


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
