#!/bin/bash

# AI Language Processor - Startup Script

set -e

echo "🚀 Starting AI Language Processor v2.0..."

# Check if Docker and Docker Compose are installed
command -v docker >/dev/null 2>&1 || { echo "❌ Docker is required but not installed. Aborting." >&2; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo "❌ Docker Compose is required but not installed. Aborting." >&2; exit 1; }

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p backend/logs
mkdir -p backend/uploads
mkdir -p backend/audio_outputs
mkdir -p backend/models_cache
mkdir -p backend/vectordb
mkdir -p backend/voice_embeddings

# Copy environment files if they don't exist
echo "⚙️ Setting up environment configuration..."

if [ ! -f backend/.env ]; then
    echo "Copying backend environment template..."
    cp backend/.env.example backend/.env
fi

if [ ! -f frontend/.env.local ]; then
    echo "Copying frontend environment template..."
    cp frontend/.env.example frontend/.env.local
fi

# Build and start services
echo "🐳 Building and starting Docker services..."
docker-compose down --remove-orphans 2>/dev/null || true
docker-compose up --build -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
timeout=60
elapsed=0

while [ $elapsed -lt $timeout ]; do
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        echo "✅ Backend is healthy!"
        break
    fi
    sleep 2
    elapsed=$((elapsed + 2))
    echo "Waiting for backend... (${elapsed}s/${timeout}s)"
done

if [ $elapsed -ge $timeout ]; then
    echo "❌ Backend failed to start within ${timeout} seconds"
    echo "🔍 Checking backend logs..."
    docker-compose logs backend
    exit 1
fi

# Check frontend
timeout=30
elapsed=0

while [ $elapsed -lt $timeout ]; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo "✅ Frontend is healthy!"
        break
    fi
    sleep 2
    elapsed=$((elapsed + 2))
    echo "Waiting for frontend... (${elapsed}s/${timeout}s)"
done

if [ $elapsed -ge $timeout ]; then
    echo "❌ Frontend failed to start within ${timeout} seconds"
    echo "🔍 Checking frontend logs..."
    docker-compose logs frontend
    exit 1
fi

echo "🎉 AI Language Processor is ready!"
echo ""
echo "📍 Access URLs:"
echo "   Frontend:  http://localhost:3000"
echo "   Backend:   http://localhost:8000"
echo "   API Docs:  http://localhost:8000/docs"
echo ""
echo "🔧 Useful commands:"
echo "   View logs:    docker-compose logs -f"
echo "   Stop services: docker-compose down"
echo "   Restart:      docker-compose restart"
echo ""
echo "📖 For troubleshooting, see README.md"