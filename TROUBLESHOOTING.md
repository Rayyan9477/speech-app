# Troubleshooting Guide

## Common Issues and Solutions

### 🐳 Docker Issues

#### Docker Desktop not running
```bash
# On Windows/Mac: Start Docker Desktop
# On Linux: Start Docker daemon
sudo systemctl start docker
```

#### Port conflicts
```bash
# Check what's using port 3000 or 8000
netstat -tulpn | grep :3000
netstat -tulpn | grep :8000

# Kill process using the port
sudo kill -9 <process_id>
```

#### Permission issues
```bash
# Fix Docker permissions (Linux)
sudo usermod -aG docker $USER
# Then log out and log back in
```

### 🧠 Model Loading Issues

#### Insufficient VRAM/RAM
```bash
# Monitor resource usage
docker stats

# Solutions:
# 1. Close other applications
# 2. Use CPU-only mode (set CUDA_VISIBLE_DEVICES="")
# 3. Increase virtual memory/swap
```

#### Model download failures
```bash
# Clear model cache
docker-compose exec backend rm -rf /app/models_cache/*

# Or from host
rm -rf backend/models_cache/*

# Restart services
docker-compose restart backend
```

#### Hugging Face token issues
```bash
# Set HF token if using gated models
export HF_TOKEN="your_token_here"

# Or add to backend/.env
echo "HF_TOKEN=your_token_here" >> backend/.env
```

### 🔧 Service Issues

#### Backend not starting
```bash
# Check backend logs
docker-compose logs backend

# Common fixes:
# 1. Check environment variables
# 2. Verify Python dependencies
# 3. Check file permissions
```

#### Frontend not loading
```bash
# Check frontend logs
docker-compose logs frontend

# Check if build succeeded
docker-compose exec frontend ls -la /usr/share/nginx/html/

# Rebuild frontend
docker-compose up --build frontend
```

### 🔊 Audio Issues

#### Audio file format not supported
- Supported formats: WAV, MP3, OGG, M4A, FLAC
- Max file size: 50MB
- Convert unsupported files:
```bash
# Using ffmpeg
ffmpeg -i input.webm output.wav
```

#### Poor transcription quality
- Use high-quality audio (16kHz+, mono/stereo)
- Minimize background noise
- Ensure clear speech with good microphone

#### TTS not working
- Check if fallback model (SpeechT5) is loading
- Verify audio output directory permissions
- Check browser audio policies (HTTPS may be required)

### 🗄️ Database Issues

#### ChromaDB connection errors
```bash
# Check database files
ls -la backend/vectordb/

# Reset database
docker-compose exec backend rm -rf /app/vectordb/*
docker-compose restart backend
```

#### SQLite errors
```bash
# Check database file
ls -la backend/app_data.db

# Reset SQLite database
docker-compose exec backend rm -f /app/app_data.db
docker-compose restart backend
```

### 🔒 Security and Permissions

#### File permission errors
```bash
# Fix ownership of volumes
sudo chown -R $USER:$USER backend/uploads backend/audio_outputs

# Or use Docker user mapping in docker-compose.yml
```

#### Encryption errors
```bash
# Disable encryption for testing
# In backend/.env:
echo "ENCRYPT_AUDIO_FILES=false" >> backend/.env
docker-compose restart backend
```

### 🌐 Network Issues

#### API calls failing
```bash
# Check if backend is accessible
curl http://localhost:8000/health

# Check CORS settings in backend configuration
# Verify API_PREFIX matches frontend configuration
```

#### Frontend can't reach backend
```bash
# In frontend/.env.local, ensure:
VITE_API_URL=http://localhost:8000

# For Docker internal networking, backend should be:
# http://backend:8000 (in docker-compose networking)
```

### 💾 Storage Issues

#### Disk space full
```bash
# Check disk usage
df -h

# Clean up Docker
docker system prune -a --volumes

# Clean up model cache
rm -rf backend/models_cache/*
```

#### Upload directory full
```bash
# Clean old uploads
find backend/uploads -type f -mtime +1 -delete
find backend/audio_outputs -type f -mtime +1 -delete
```

### 🔄 Performance Issues

#### Slow transcription
```bash
# Check if GPU is being used
docker-compose exec backend python -c "import torch; print(torch.cuda.is_available())"

# Monitor GPU usage
nvidia-smi

# Use smaller model for faster processing (edit backend/app/core/config.py):
WHISPER_MODEL="openai/whisper-base"
```

#### High memory usage
```bash
# Monitor memory
docker stats

# Reduce batch sizes in model configurations
# Restart services periodically
docker-compose restart
```

## Logs and Debugging

### Accessing Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Enable Debug Mode
```bash
# Backend debug mode
echo "DEBUG=true" >> backend/.env
echo "LOG_LEVEL=DEBUG" >> backend/.env
docker-compose restart backend

# Frontend debug mode
echo "VITE_DEBUG=true" >> frontend/.env.local
docker-compose restart frontend
```

### Health Checks
```bash
# Backend health
curl http://localhost:8000/health

# API status
curl http://localhost:8000/api/v1/status

# Frontend (should return HTML)
curl http://localhost:3000
```

## Getting Help

### Before Reporting Issues
1. Check this troubleshooting guide
2. Review the logs: `docker-compose logs`
3. Verify system requirements are met
4. Try restarting services: `docker-compose restart`
5. Try rebuilding: `docker-compose up --build`

### Information to Include in Bug Reports
```bash
# System information
uname -a                    # OS info
docker --version           # Docker version
docker-compose --version   # Docker Compose version
nvidia-smi                 # GPU info (if applicable)

# Application logs
docker-compose logs backend
docker-compose logs frontend

# Configuration
cat backend/.env           # Remove sensitive data
cat frontend/.env.local    # Remove sensitive data
```

### Performance Monitoring
```bash
# Resource usage
docker stats

# Disk usage
docker system df

# Network connectivity
docker-compose exec backend curl http://localhost:8000/health
docker-compose exec frontend curl http://backend:8000/health
```

---

For more help, check the main [README.md](README.md) or create an issue with the information above.