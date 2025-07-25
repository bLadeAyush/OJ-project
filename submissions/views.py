import os
import uuid
import shutil
import subprocess
import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from rest_framework.generics import ListAPIView
from django.db.models import Count, Avg, Case, When, IntegerField, Q, Sum
from django.conf import settings
from users.models import User
from problems.models import Problem
from .models import Submission
from .serializers import SubmissionSerializer
from .tasks import evaluate_submission

logger = logging.getLogger(__name__)

class SubmitCodeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logger.info("SubmitCodeView request received")
        
        problem_code = request.data.get("problem_code")
        code = request.data.get("code")
        language = request.data.get("language")

        if not all([problem_code, code, language]):
            logger.warning("Missing required fields in submission")
            return Response(
                {"error": "problem_code, code, and language are required fields"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            problem = Problem.objects.get(code=problem_code)
            logger.info(f"Found problem: {problem_code}")
        except Problem.DoesNotExist:
            logger.error(f"Problem not found: {problem_code}")
            return Response(
                {"error": "Problem not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            submission = Submission.objects.create(
                user=request.user,
                problem=problem,
                code=code,
                language=language,
                verdict="PENDING"
            )
            print(f"Created submission with ID: {submission.id}")

            
            evaluate_submission.delay(submission.id)
            print(f"Submitted task to Celery for submission {submission.id}")

            return Response(
                {
                    "submission_id": submission.id,
                    "verdict": "PENDING",
                    "message": "Submission received and being processed"
                },
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            print(f"Error creating submission: {str(e)}")
            return Response(
                {"error": "Internal server error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class RunCodeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logger.info("RunCodeView request received")
        
        code = request.data.get("code")
        language = request.data.get("language")
        custom_input = request.data.get("input", "")

        if not all([code, language]):
            logger.warning("Missing code or language in request")
            return Response(
                {"error": "code and language are required fields"},
                status=status.HTTP_400_BAD_REQUEST
            )

        print(f"Running code in {language} with custom input: {custom_input}")
        base_path = os.path.join("/var/tmp/oj_temp", str(uuid.uuid4()))
        temp_dir = os.path.join(base_path, "temp")
        print(f"Temp directory: {temp_dir}")


        try:
            os.makedirs(temp_dir, exist_ok=True)
            print(f"Created temp directory: {temp_dir}")

            filename = {
                "python": "main.py",
                "cpp": "main.cpp", 
                "java": "Main.java"
            }[language]
            
            code_path = os.path.join(temp_dir, filename)
            input_path = os.path.join(temp_dir, "input.txt")

            with open(code_path, "w") as f:
                f.write(code)
            with open(input_path, "w") as f:
                f.write(custom_input)

            image = {
                "python": "oj-python",
                "cpp": "oj-cpp",
                "java": "oj-java"
            }[language]

            compile_cmds = {
                "python": "",
                "cpp": "g++ main.cpp -o main",
                "java": "javac Main.java"
            }

            exec_cmds = {
                "python": "python3 main.py",
                "cpp": "./main",
                "java": "java Main"
            }

            compile_cmd = compile_cmds[language]
            exec_cmd = exec_cmds[language]
            full_cmd = f"{compile_cmd} && {exec_cmd}" if compile_cmd else exec_cmd

            
            docker_path = os.path.abspath(temp_dir).replace("\\", "/")
           
           
            
            command = (
                f'docker run --rm -i -v "{docker_path}:/app" -w /app {image} '
                f'sh -c "{full_cmd}"'
            )
            if shutil.which("docker") is None:
                print("Docker is not installed or not in PATH")

            print(f"Executing command: {command}")
            for root, dirs, files in os.walk(temp_dir):
                for d in dirs:
                    os.chmod(os.path.join(root, d), 0o755)
                for f in files:
                    os.chmod(os.path.join(root, f), 0o644)
            os.chmod(temp_dir, 0o755)

            try:
                result = subprocess.run(
                    command,
                    shell=True,
                    input=custom_input.encode(),
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    timeout=10
                )
                output = result.stdout.decode().strip()
                error = result.stderr.decode().strip()

                if result.returncode != 0:
                    logger.warning(f"Execution failed with error: {error}")
                else:
                    logger.info("Execution completed successfully")

            except subprocess.TimeoutExpired:
                output = ""
                error = "Time Limit Exceeded (10 seconds)"
                logger.warning("Code execution timed out")

            return Response({
                "output": output,
                "error": error,
                "status": "success" if not error else "error"
            })

        except Exception as e:
            logger.error(f"Error in RunCodeView: {str(e)}")
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        finally:
            try:
                subprocess.run(f'rm -rf "{temp_dir}"', shell=True, timeout=5)
                logger.info(f"Cleaned up temp directory: {temp_dir}")
            except Exception as e:
                logger.warning(f"Failed to clean up temp directory: {str(e)}")


class SubmissionStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, submission_id):
        print(f"Checking status for submission {submission_id}")
        
        try:
            submission = Submission.objects.get(id=submission_id, user=request.user)
            serializer = SubmissionSerializer(submission)
            return Response(serializer.data)
        except Submission.DoesNotExist:
            logger.warning(f"Submission not found or access denied: {submission_id}")
            return Response(
                {"error": "Submission not found or you don't have permission"},
                status=status.HTTP_404_NOT_FOUND
            )


class SubmissionListView(ListAPIView):
    serializer_class = SubmissionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        problem_code = self.request.query_params.get("problem")
        verdict = self.request.query_params.get("verdict")
        
        queryset = Submission.objects.filter(user=user).select_related('problem')
        
        if problem_code:
            queryset = queryset.filter(problem__code=problem_code)
        if verdict:
            queryset = queryset.filter(verdict=verdict)
            
        return queryset.order_by("-submitted_at")


class LeaderboardView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        logger.info("Generating leaderboard data")
        
        try:
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
            ).order_by('-total_points', '-total_ac', 'avg_time')

            data = [
                {
                    "username": user.username,
                    "total_ac": user.total_ac or 0,
                    "total_points": user.total_points or 0,
                    "avg_time": round(user.avg_time or 0, 3) if user.avg_time else 0
                }
                for user in users
            ]

            return Response(data)
        except Exception as e:
            logger.error(f"Error generating leaderboard: {str(e)}")
            return Response(
                {"error": "Could not generate leaderboard"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )