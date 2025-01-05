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
ENV UVICORN_APP=app.app:app
ENV UVICORN_HOST=0.0.0.0
ENV UVICORN_PORT=5000

# Run the application
CMD ["uvicorn", "app.app:app", "--host", "0.0.0.0", "--port", "5000"]