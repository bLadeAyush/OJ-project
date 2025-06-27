import os
import subprocess
import uuid
import logging
from django.conf import settings
from .models import Submission
from problems.models import Problem
from celery import shared_task

logger = logging.getLogger(__name__)

@shared_task
def evaluate_submission(submission_id):
    submission = Submission.objects.get(id=submission_id)
    problem = submission.problem

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
        command = f'docker run --rm -v "{folder_path_docker}:/app" {image}'

        logger.info("Folder path (host): %s", folder_path)
        logger.info("Docker command: %s", command)

        all_passed = True

        for index, case in enumerate(test_cases):
            with open(input_path, "w") as f:
                f.write(case["input"])

            result = subprocess.run(
                command,
                shell=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                timeout=10
            )

            stdout = result.stdout.decode().strip()
            stderr = result.stderr.decode().strip()

            submission.output = stdout
            submission.error = stderr

            logger.info("Test Case #%d", index + 1)
            logger.info("Input: %s", case["input"])
            logger.info("STDOUT: %s", stdout)
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

        submission.time_taken = 0

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
        logger.info("Verdict saved: %s", submission.verdict)

        try:
            subprocess.run(f'rm -rf "{folder_path}"', shell=True)
        except Exception as e:
            logger.warning("Cleanup failed: %s", str(e))
