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
    input_data = problem.sample_input
    expected_output = problem.sample_output.strip()

    # ✅ Use safe Windows-compatible base path
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
    with open(input_path, "w") as f:
        f.write(input_data)

    try:
        image = {
            "python": "oj-python",
            "cpp": "oj-cpp",
            "java": "oj-java"
        }[lang]

        folder_path_docker = folder_path.replace("\\", "/")
        command = f'docker run --rm -v "{folder_path_docker}:/app" {image}'

        # ✅ Debug logs
        logger.info("📦 Folder path (host): %s", folder_path)
        logger.info("🐳 Docker mount path: %s", folder_path_docker)
        logger.info("🚀 Docker command: %s", command)
        logger.info("📄 main.py exists? %s", os.path.exists(code_path))
        logger.info("📄 input.txt exists? %s", os.path.exists(input_path))

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

        logger.info("✅ STDOUT: %s", stdout)
        logger.error("❌ STDERR: %s", stderr)

        if stderr:
            if "error" in stderr.lower():
                submission.verdict = "CE"
            else:
                submission.verdict = "RE"
        else:
            submission.verdict = "AC" if stdout.strip() == expected_output else "WA"

        submission.time_taken = 0

    except subprocess.TimeoutExpired:
        submission.verdict = "TLE"
        submission.error = "Time limit exceeded"
        logger.error("🕒 Timeout during execution.")
    except Exception as e:
        submission.verdict = "RE"
        submission.error = str(e)
        logger.exception("🔥 Exception during evaluation:")
    finally:
        submission.save()
        logger.info("💾 Verdict saved: %s", submission.verdict)

        try:
            subprocess.run(f'rm -rf "{folder_path}"', shell=True)
        except Exception as e:
            logger.warning("🧹 Cleanup failed: %s", str(e))
