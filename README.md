# AI Language Processor v2.0

AI Language Processor is a comprehensive application that leverages state-of-the-art AI models to provide speech-to-text conversion, text-to-speech synthesis, voice cloning, translation capabilities, and more. This project is designed to break down language barriers and facilitate seamless communication while maintaining privacy through local processing.

## ✨ Features

### 🎤 Advanced Speech-to-Text (STT)
- **Model**: OpenAI Whisper Large V3 Turbo
- **Capabilities**: 
  - Real-time transcription
  - Multi-language support with auto-detection
  - High accuracy and speed
  - Timestamp support for detailed analysis

### 🔊 Ultra-Realistic Text-to-Speech (TTS)
- **Model**: Dia by Nari Labs (1.6B parameters)
- **Capabilities**:
  - Ultra-realistic, emotional speech synthesis
  - Multiple voice styles (neutral, warm, authoritative, etc.)
  - Emotion control (happy, sad, excited, etc.)
  - Speed and pitch adjustment
  - High-quality 22kHz audio output

### 👥 Voice Cloning
- **Technology**: Advanced voice embedding models
- **Capabilities**:
  - Create personalized voice clones from audio samples
  - High-fidelity voice replication
  - Voice similarity search
  - Secure storage of voice embeddings

### 🌐 Privacy-First Translation
- **Models**: NLLB, M2M100, Aya 23
- **Capabilities**:
  - 50+ language support
  - Context-aware translation
  - Batch processing
  - No external API dependencies

### 🔒 Privacy & Security
- **Local Processing**: All AI models run locally or on private infrastructure
- **Encryption**: Optional file encryption for sensitive audio data
- **No Data Leakage**: Zero external API calls that send user data off-premise
- **Secure Storage**: Encrypted vector databases and secure file handling

## 🏗️ Architecture

### Backend (Python/FastAPI)
```
backend/
├── app/
│   ├── core/           # Configuration and settings
│   ├── database/       # SQLite + ChromaDB integration
│   ├── security/       # Encryption and security utilities
│   ├── services/       # Core AI services (STT, TTS, Translation, Voice Cloning)
│   ├── api/           # FastAPI routes and endpoints
│   └── app.py         # Main FastAPI application
├── main.py            # Application entry point
├── requirements.txt   # Python dependencies
└── Dockerfile        # Container configuration
```

### Frontend (React/TypeScript)
```
frontend/
├── src/
│   ├── api/           # API client and type definitions
│   ├── components/    # Reusable UI components
│   │   ├── ui/        # Base UI components
│   │   ├── VoiceCloning/  # Voice cloning components
│   │   └── AdvancedTTS/   # Advanced TTS controls
│   ├── pages/         # Application pages
│   ├── services/      # Legacy API compatibility layer
│   └── lib/          # Utilities and helpers
├── package.json      # Node.js dependencies
└── Dockerfile       # Container configuration
```

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Python 3.11+ (for local development)
- Node.js 18+ (for frontend development)

### Using Docker (Recommended)
```bash
# Clone the repository
git clone <repository-url>
cd speech-app

# Quick start (Linux/Mac)
chmod +x start.sh
./start.sh

# Quick start (Windows)
start.bat

# Manual start
docker-compose up --build -d

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Documentation: http://localhost:8000/docs
```

### Local Development

#### Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment configuration
cp .env.example .env
# Edit .env with your configuration

# Run the application
python main.py
```

#### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev
```

## 📖 API Documentation

### Speech-to-Text Endpoints
- `POST /api/v1/stt/transcribe` - Transcribe audio file
- `POST /api/v1/stt/transcribe-with-timestamps` - Transcribe with word-level timestamps
- `POST /api/v1/stt/detect-language` - Detect audio language

### Text-to-Speech Endpoints
- `POST /api/v1/tts/synthesize` - Generate speech from text
- `GET /api/v1/tts/voices` - Get available voice styles and emotions
- `GET /api/v1/tts/audio/{filename}` - Download generated audio

### Translation Endpoints
- `POST /api/v1/translate/translate` - Translate text
- `POST /api/v1/translate/detect-language` - Detect text language
- `GET /api/v1/translate/supported-languages` - Get supported languages

### Voice Cloning Endpoints
- `POST /api/v1/voice/create-clone` - Create voice clone from sample
- `POST /api/v1/voice/synthesize` - Synthesize with cloned voice
- `GET /api/v1/voice/list` - List available voice clones
- `DELETE /api/v1/voice/{clone_id}` - Delete voice clone

For detailed API documentation, visit `/docs` endpoint when running the backend.

## ⚙️ Configuration

### Backend Configuration (`backend/.env`)
```env
# Application
APP_NAME="AI Language Processor"
DEBUG=false

# Security
SECRET_KEY="your-secret-key"
ENCRYPT_AUDIO_FILES=true

# AI Models
WHISPER_MODEL="openai/whisper-large-v3-turbo"
TTS_MODEL="nari-labs/dia-1.6b"

# Storage
MODELS_CACHE_DIR="models_cache"
CHROMADB_PATH="vectordb"

# Logging
LOG_LEVEL="INFO"
```

### Frontend Configuration (`frontend/.env.local`)
```env
# API Configuration
VITE_API_URL=http://localhost:8000

# Feature Flags
VITE_ENABLE_VOICE_CLONING=true
VITE_USE_ENHANCED_UI=true
```

## 🔧 Model Requirements

### GPU Requirements (Recommended)
- **NVIDIA GPU with CUDA support**
- **VRAM**: 8GB+ recommended for optimal performance
- **CUDA**: Version 11.8 or later

### CPU Requirements (Fallback)
- **CPU**: Multi-core processor (8+ cores recommended)
- **RAM**: 16GB+ system memory
- **Storage**: 20GB+ free space for model cache

### Model Downloads
Models are automatically downloaded on first use:
- **Whisper Large V3 Turbo**: ~3GB
- **Dia TTS Model**: ~6GB
- **Translation Models**: ~2GB each
- **Voice Embedding Models**: ~500MB

## 📊 Performance Benchmarks

### Speech-to-Text (Whisper Large V3 Turbo)
- **Speed**: 2-5x real-time (depending on hardware)
- **Languages**: 50+ languages with high accuracy
- **Audio Formats**: WAV, MP3, OGG, M4A, FLAC

### Text-to-Speech (Dia)
- **Quality**: Ultra-realistic with emotional nuance
- **Speed**: ~100-200 characters per second
- **Voices**: 7 styles × 8 emotions = 56 combinations

### Voice Cloning
- **Sample Length**: 10-60 seconds recommended
- **Processing Time**: 30-60 seconds per clone
- **Quality**: High-fidelity replication

## 🛠️ Development

### Adding New Features
1. **Backend**: Add services in `backend/app/services/`
2. **API**: Add routes in `backend/app/api/routes/`
3. **Frontend**: Add components in `frontend/src/components/`
4. **Integration**: Update API client in `frontend/src/api/client.ts`

### Testing
```bash
# Backend tests
cd backend
python -m pytest tests/

# Frontend tests (when implemented)
cd frontend
npm test
```

### Code Style
- **Backend**: Follow PEP 8, use `black` formatter
- **Frontend**: Follow Airbnb style guide, use `prettier`
- **Documentation**: Keep README and code comments updated

## 📈 Monitoring & Logging

### Application Logs
- **Location**: `backend/logs/app.log`
- **Rotation**: 10MB files, 10 days retention
- **Levels**: DEBUG, INFO, WARNING, ERROR

### Health Checks
- **Backend**: `/health` endpoint
- **Docker**: Built-in health checks
- **Services**: Individual service status monitoring

## 🔒 Security Considerations

### Data Privacy
- **Local Processing**: All AI inference runs locally
- **Encryption**: Optional file encryption for sensitive data
- **No Telemetry**: No usage data sent to external services
- **Secure APIs**: All endpoints use HTTPS in production

### Deployment Security
- **Non-root User**: Docker containers run as non-root
- **Secret Management**: Environment variables for secrets
- **Network Security**: Internal container networking
- **Input Validation**: Comprehensive input sanitization

## 📋 Troubleshooting

### Common Issues

#### Model Download Failures
```bash
# Check internet connection and disk space
# Clear model cache if needed
rm -rf backend/models_cache/*
```

#### GPU/CUDA Issues
```bash
# Verify CUDA installation
nvidia-smi
python -c "import torch; print(torch.cuda.is_available())"
```

#### Memory Issues
```bash
# Monitor memory usage
docker stats
# Adjust batch sizes in configuration
```

#### Audio Processing Errors
```bash
# Verify audio file format and integrity
# Check file permissions and size limits
```

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Follow the development guidelines
4. Add tests for new features
5. Submit a pull request

### Bug Reports
Please include:
- System information (OS, hardware)
- Error logs and stack traces
- Steps to reproduce
- Expected vs actual behavior

## 📜 License

This project uses state-of-the-art AI models and follows their respective licensing terms. Please review model-specific licenses before commercial use.

## 🙏 Acknowledgments

- **OpenAI** for Whisper models
- **Nari Labs** for Dia TTS technology
- **Facebook/Meta** for NLLB and M2M translation models
- **Cohere** for Aya multilingual models
- **ChromaDB** for vector database technology

## 🗺️ Roadmap

### Version 2.1 (Planned)
- [ ] Mobile app development (React Native/Expo)
- [ ] Real-time streaming capabilities
- [ ] Custom avatar integration
- [ ] Advanced voice effects
- [ ] Multi-speaker separation

### Version 2.2 (Future)
- [ ] WebRTC real-time communication
- [ ] Plugin system for extensions
- [ ] Advanced analytics dashboard
- [ ] Multi-language UI support
- [ ] Cloud deployment options

---

For more information, visit our [documentation](docs/) or join our [community discussions](https://github.com/your-repo/discussions).