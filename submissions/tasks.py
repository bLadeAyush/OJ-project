import os
import subprocess
import uuid
import time
import requests
import logging
from django.conf import settings
from .models import Submission
from problems.models import Problem
from celery import shared_task
from dotenv import load_dotenv

load_dotenv()
api_token = os.getenv("HUGGINGFACE_API_TOKEN")
logger = logging.getLogger(__name__)



def run_docker_with_timeout(command_base, timeout_seconds):
    container_name = f"oj_{uuid.uuid4().hex[:8]}"

    parts = command_base.split()
    image = parts[-1]
    volume_and_flags = " ".join(parts[:-1])

    # Correctly place --name before image name
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
            return "", "Time limit exceeded", -9
        time.sleep(0.5)

    stdout, stderr = process.communicate()
    return stdout.decode().strip(), stderr.decode().strip(), process.returncode


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

        for index, case in enumerate(test_cases):
            with open(input_path, "w") as f:
                f.write(case["input"])

            stdout, stderr, return_code = run_docker_with_timeout(docker_base_command, 10)

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

        submission.time_taken = 0

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
            submission.feedback = generate_ai_feedback(
                problem, lang, statement, code,
                submission.error, test_cases[0]["input"], test_cases[0]["output"]
            )
            logger.info("Feedback generated: %s", submission.feedback)
            submission.save()


def generate_ai_feedback(problem, language, statement, code, stderr, input_data, output, model="mistralai/Mixtral-8x7B-Instruct-v0.1"):
    token = api_token
    if not token:
        logger.warning("TOKEN is not set. AI feedback is disabled.")
        return "AI feedback is not configured."

    prompt = f"""The following code failed a programming test.
Problem Statement:
{problem}
{statement}
Code in {language}:
{code}
Input:
{input_data}
Expected output:
{output}
Error:
{stderr}
Wrong Answer
What could be the reason for the failure and how can the user fix it?"""

    try:
        response = requests.post(
            f"https://api-inference.huggingface.co/models/{model}",
            headers={"Authorization": f"Bearer {token}"},
            json={"inputs": prompt},
            timeout=30
        )
        response.raise_for_status()
        json_response = response.json()

        logging.info("🤖 Raw HF response: %s", json_response)

        if isinstance(json_response, list) and "generated_text" in json_response[0]:
            return json_response[0]["generated_text"]
        elif "generated_text" in json_response:
            return json_response["generated_text"]
        else:
            return "🤷 Unexpected feedback format: " + str(json_response)

    except Exception as e:
        logging.error("❌ AI Feedback error: %s", e)
        return "No feedback generated due to an error."
