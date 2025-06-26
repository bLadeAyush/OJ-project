import subprocess
import sys

try:
    result = subprocess.run(
        ["python3", "/app/main.py"],
        stdin=open("/app/input.txt"),
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        timeout=5
    )
    print(result.stdout.decode())
    print(result.stderr.decode(), file=sys.stderr)
except Exception as e:
    print("Execution error:", e, file=sys.stderr)
