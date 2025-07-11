# Dockerfile
FROM python:3.10-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set work directory
WORKDIR /code

# Install system dependencies
RUN apt-get update && apt-get install -y netcat-openbsd gcc

# Install Python dependencies
COPY requirements.txt /code/
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Copy project files
COPY . /code/

# Default service
ENV SERVICE=web

# Entrypoint logic
CMD if [ "$SERVICE" = "web" ]; then \
      gunicorn oj_backend.wsgi:application --bind 0.0.0.0:8000; \
    elif [ "$SERVICE" = "celery" ]; then \
      celery -A oj_backend worker --loglevel=info; \
    elif [ "$SERVICE" = "beat" ]; then \
      celery -A oj_backend beat --loglevel=info --scheduler django_celery_beat.schedulers:DatabaseScheduler; \
    fi
