import os
import subprocess
import uuid
import time
import logging
import markdown
from django.conf import settings
from .models import Submission
from problems.models import Problem
from celery import shared_task
from dotenv import load_dotenv
import google.generativeai as genai
from django.core.exceptions import ObjectDoesNotExist
from celery.exceptions import MaxRetriesExceededError

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))  
logger = logging.getLogger(__name__)

def check_db_connection():
    """Verify database connectivity"""
    from django.db import connections
    from django.db.utils import OperationalError
    try:
        connections['default'].ensure_connection()
        return True
    except OperationalError:
        return False
    

@shared_task(bind=True, max_retries=3, default_retry_delay=5)
def evaluate_submission(self, submission_id):
    try:
        try:
            submission = Submission.objects.get(id=submission_id)
        except ObjectDoesNotExist as exc:
            print(f"Submission {submission_id} does not exist")
            raise self.retry(exc=exc, countdown=5)  
            
        problem = submission.problem
        statement = problem.statement
        lang = submission.language
        code = submission.code

        test_cases = problem.test_cases or [
            {"input": problem.sample_input, "output": problem.sample_output}
        ]

        base_path = os.path.join("/var/tmp/oj_temp", str(uuid.uuid4()))
        #base_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../oj_temp")
        base_path = os.path.abspath(base_path)
        os.makedirs(base_path, exist_ok=True)

        run_id = str(uuid.uuid4())
        folder_path = os.path.join(base_path, run_id)
        os.makedirs(folder_path, exist_ok=True)

        file_name = {
            "python": "main.py",
            "cpp": "main.cpp",
            "java": "Main.java"
        }[lang]

        code_path = os.path.join(folder_path, file_name)
        input_path = os.path.join(folder_path, "input.txt")

        with open(code_path, "w") as f:
            f.write(code)

        try:
            image = {
                "python": "oj-python",
                "cpp": "oj-cpp",
                "java": "oj-java"
            }[lang]

            compile_cmds = {
                "python": "",
                "cpp": "g++ main.cpp -o main",
                "java": "javac Main.java"
            }

            exec_cmds = {
                "python": "cat input.txt | python3 main.py",
                "cpp": "cat input.txt | ./main",
                "java": "cat input.txt | java Main"
            }

            compile_cmd = compile_cmds[lang]
            exec_cmd = exec_cmds[lang]
            full_cmd = f"{compile_cmd} && {exec_cmd}" if compile_cmd else exec_cmd
            print(f"Contents of {folder_path} before execution: {os.listdir(folder_path)}")
            print(f"Input file exists: {os.path.exists(input_path)}")
            command = (
                f'docker run --rm -i -v "{folder_path}:/app" -w /app {image} '
                f'sh -c "{full_cmd}"'
            )

            print(f"Image selected: {image}")
            print("Folder path (host): %s", folder_path)
            print("Docker command: %s", command)

            all_passed = True
            total_exec_time = 0
            for index, case in enumerate(test_cases):
                with open(input_path, "w") as f:
                    print(f"Files in folder before Docker run: {os.listdir(folder_path)}")
                    f.write(case["input"])
                start_time = time.time()
                result = subprocess.run(
                    command,
                    shell=True,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    timeout=10
                )
                end_time = time.time()
                elapsed = end_time - start_time
                total_exec_time += elapsed
                stdout = result.stdout.decode().strip()
                stderr = result.stderr.decode().strip()

                submission.output = stdout
                submission.error = stderr

                print("Test Case #%d", index + 1)
                print("Input: %s", case["input"])
                print("STDOUT: %s", stdout)
                logger.error("STDERR: %s", stderr)

                if stderr:
                    if "error" in stderr.lower():
                        submission.verdict = "CE"
                    else:
                        submission.verdict = "RE"
                    all_passed = False
                    break

                if stdout != case["output"].strip():
                    submission.verdict = "WA"
                    all_passed = False
                    break

            if all_passed:
                submission.verdict = "AC"
                # In Django shell
                submission.save()
                print(f"Verdict saved: {submission.verdict}")

                print("Verdict saved: %s", submission.verdict)
            submission.time_taken = round(total_exec_time, 4)

        except subprocess.TimeoutExpired:
            submission.verdict = "TLE"
            submission.error = "Time limit exceeded"
            logger.error("Timeout during execution.")
        except Exception as e:
            submission.verdict = "RE"
            submission.error = str(e)
            logger.exception("Exception during evaluation:")
        finally:
            submission.save()
            print("Verdict saved:", submission.verdict)
            if submission.verdict in ["WA", "RE", "CE", "TLE" , "AC"]:
                feedback = generate_ai_feedback(
                    problem, lang, statement, code,
                    submission.error, test_cases[0]["input"], test_cases[0]["output"]
                )
                submission.feedback = feedback
                print("Feedback generated")
                submission.save()    

            try:
                subprocess.run(f'rm -rf "{folder_path}"', shell=True)
            except Exception as e:
                logger.warning("Cleanup failed: %s", str(e))

    except Exception as exc:
        logger.error(f"Error processing submission {submission_id}: {str(exc)}")
        try:
            raise self.retry(exc=exc)
        except MaxRetriesExceededError:
            logger.error(f"Max retries exceeded for submission {submission_id}")
            return {
                'status': 'error',
                'message': f'Max retries exceeded for submission {submission_id}',
                'submission_id': submission_id
            }

def generate_ai_feedback(problem, lang, statement, code, stderr, input_data, output, model="models/gemini-1.5-flash-latest"):
    try:
        prompt = f"""The following code failed a programming test.

📘 Problem Statement:
{statement}

💻 Code in {lang}:
{code}

📥 Input:
{input_data}

📤 Expected Output:
{output}

❌ Error:
{stderr or "Wrong Answer"}

🤔 What could be the reason for the failure and how can the user fix it?
Please give corrected code if possible.
"""

        model = genai.GenerativeModel(model)
        response = model.generate_content(prompt)

        return response.text if hasattr(response, 'text') else "⚠️ Unexpected Gemini response format."
    except Exception as e:
        logging.error("❌ Gemini AI Feedback error: %s", e)
        return "No feedback generated due to an error."