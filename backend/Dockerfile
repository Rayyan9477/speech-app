# backend/Dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Set environment variables
ENV FLASK_APP=app/app.py
ENV FLASK_RUN_HOST=0.0.0.0

# Run the application
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app.app:create_app()"]