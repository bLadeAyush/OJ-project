FROM python:3.10-slim

# Environment setup
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Working directory
WORKDIR /code

# Install system dependencies
RUN apt-get update && apt-get install -y gcc netcat-openbsd


# Install Python packages
COPY requirements.txt /code/
RUN pip install --upgrade pip
RUN pip install -r requirements.txt


RUN apt-get update && \
    apt-get install -y docker.io && \
    apt-get clean
# Copy project
COPY . /code/

# Default command (overridden in docker-compose)
CMD ["gunicorn", "oj_backend.wsgi:application", "--bind", "0.0.0.0:8000"]
