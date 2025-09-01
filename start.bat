@echo off
REM AI Language Processor - Windows Startup Script

echo 🚀 Starting AI Language Processor v2.0...

REM Check if Docker is running
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is required but not installed or not running. Aborting.
    exit /b 1
)

docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose is required but not installed. Aborting.
    exit /b 1
)

REM Create necessary directories
echo 📁 Creating directories...
if not exist "backend\logs" mkdir "backend\logs"
if not exist "backend\uploads" mkdir "backend\uploads"
if not exist "backend\audio_outputs" mkdir "backend\audio_outputs"
if not exist "backend\models_cache" mkdir "backend\models_cache"
if not exist "backend\vectordb" mkdir "backend\vectordb"
if not exist "backend\voice_embeddings" mkdir "backend\voice_embeddings"

REM Copy environment files if they don't exist
echo ⚙️ Setting up environment configuration...

if not exist "backend\.env" (
    echo Copying backend environment template...
    copy "backend\.env.example" "backend\.env"
)

if not exist "frontend\.env.local" (
    echo Copying frontend environment template...
    copy "frontend\.env.example" "frontend\.env.local"
)

REM Build and start services
echo 🐳 Building and starting Docker services...
docker-compose down --remove-orphans 2>nul
docker-compose up --build -d

REM Wait for services to be ready
echo ⏳ Waiting for services to be ready...

timeout /t 10 /nobreak >nul

REM Check backend health
:check_backend
curl -s http://localhost:8000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend is healthy!
    goto check_frontend
)
echo Waiting for backend...
timeout /t 5 /nobreak >nul
goto check_backend

:check_frontend
REM Check frontend
curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend is healthy!
    goto success
)
echo Waiting for frontend...
timeout /t 5 /nobreak >nul
goto check_frontend

:success
echo 🎉 AI Language Processor is ready!
echo.
echo 📍 Access URLs:
echo    Frontend:  http://localhost:3000
echo    Backend:   http://localhost:8000
echo    API Docs:  http://localhost:8000/docs
echo.
echo 🔧 Useful commands:
echo    View logs:     docker-compose logs -f
echo    Stop services: docker-compose down
echo    Restart:       docker-compose restart
echo.
echo 📖 For troubleshooting, see README.md
pause