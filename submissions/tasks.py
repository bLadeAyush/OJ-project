import os
import subprocess
import uuid
import time
import requests
import logging
import markdown
from django.conf import settings
from .models import Submission
from problems.models import Problem
from celery import shared_task
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))  # Only once globally
logger = logging.getLogger(__name__)


def run_docker_with_timeout(command_base, timeout_seconds):
    container_name = f"oj_{uuid.uuid4().hex[:8]}"
    parts = command_base.strip().split()

    if len(parts) < 3 or parts[0] != "docker" or "run" not in parts:
        raise ValueError(f"Invalid Docker command: {command_base}")

    image = parts[-1]
    if image == "docker":
        raise ValueError("🚨 Image name resolved as 'docker'. Check how you're constructing your docker run command.")

    volume_and_flags = " ".join(parts[:-1])
    command = f'docker run --rm --name {container_name} {volume_and_flags} {image}'

    logger.info("Running Docker container: %s", container_name)

    process = subprocess.Popen(
        command,
        shell=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )

    start_time = time.time()

    while process.poll() is None:
        if time.time() - start_time > timeout_seconds:
            logger.warning("TLE detected. Killing container: %s", container_name)
            subprocess.run(f"docker kill {container_name}", shell=True)
            return "", "Time limit exceeded", -9, timeout_seconds
        time.sleep(0.5)

    stdout, stderr = process.communicate()
    end_time = time.time()
    return stdout.decode().strip(), stderr.decode().strip(), process.returncode, end_time - start_time


@shared_task
def evaluate_submission(submission_id):
    submission = Submission.objects.get(id=submission_id)
    problem = submission.problem
    statement = problem.statement
    lang = submission.language
    code = submission.code

    test_cases = problem.test_cases or [
        {"input": problem.sample_input, "output": problem.sample_output}
    ]

    base_path = os.path.join(os.path.expanduser("~"), "oj_temp")
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

        folder_path_docker = folder_path.replace("\\", "/")
        docker_base_command = f'docker run --rm -v "{folder_path_docker}:/app" {image}'

        logger.info("Folder path (host): %s", folder_path)
        logger.info("Docker base command: %s", docker_base_command)

        all_passed = True
        total_time = 0.0

        for index, case in enumerate(test_cases):
            with open(input_path, "w") as f:
                f.write(case["input"])

            stdout, stderr, return_code, exec_time = run_docker_with_timeout(docker_base_command, 10)
            total_time += exec_time
            submission.output = stdout
            submission.error = stderr

            logger.info("Test Case #%d", index + 1)
            logger.info("Input: %s", case["input"])
            logger.info("STDOUT: %s", stdout)
            logger.error("STDERR: %s", stderr)

            if return_code == -9:
                submission.verdict = "TLE"
                all_passed = False
                break

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

        submission.time_taken = round(total_time / len(test_cases), 3)
        logger.info("Avg Time Taken: %s", submission.time_taken)

    except Exception as e:
        submission.verdict = "RE"
        submission.error = str(e)
        logger.exception("Exception during evaluation:")

    finally:
        submission.save()
        logger.info("Verdict saved: %s", submission.verdict)

        try:
            subprocess.run(f'rm -rf "{folder_path}"', shell=True)
        except Exception as e:
            logger.warning("Cleanup failed: %s", str(e))

        if submission.verdict in ["WA", "RE", "CE", "TLE"]:
            feedback = generate_ai_feedback(
                problem, lang, statement, code,
                submission.error, test_cases[0]["input"], test_cases[0]["output"]
            )
            submission.feedback = feedback
            logger.info("Feedback generated")
            submission.save()



def generate_ai_feedback(problem, language, statement, code, stderr, input_data, output, model="models/gemini-1.5-flash-latest"):
    try:
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

        prompt = f"""The following code failed a programming test.

📘 Problem Statement:
{statement}

💻 Code in {language}:
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
