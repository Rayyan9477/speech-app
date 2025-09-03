# Speech App Test Suite

Comprehensive test coverage for the AI Language Processor Speech App, including unit tests, integration tests, performance tests, security tests, and end-to-end tests.

## Test Structure

```
tests/
├── conftest.py                     # Global test fixtures and configuration
├── test-requirements.txt           # Testing dependencies
├── pytest.ini                      # Pytest configuration
├── README.md                      # This file
├── unit/                          # Unit tests
│   ├── api/
│   │   └── routes/               # API endpoint tests
│   │       ├── test_stt.py      # Speech-to-Text API tests
│   │       ├── test_tts.py      # Text-to-Speech API tests
│   │       ├── test_voice_cloning.py  # Voice cloning API tests
│   │       └── test_streaming.py     # Real-time streaming tests
│   └── services/                 # Service layer tests
├── integration/                  # Integration tests
│   └── test_api_integration.py  # Full API workflow tests
├── performance/                  # Performance and load tests
│   └── test_audio_performance.py # Audio processing performance tests
├── security/                    # Security tests
│   └── test_security_validation.py # Security validation tests
├── e2e/                         # End-to-end tests
│   └── test_user_workflows.py   # Complete user journey tests
└── fixtures/                    # Test data and utilities
    └── test_data/               # Sample audio files and test data
```

## Test Categories

### 1. Unit Tests (`unit/`)

**Coverage**: Individual functions and components in isolation

- **API Routes** (`unit/api/routes/`):
  - STT endpoint validation and error handling
  - TTS synthesis parameter validation
  - Voice cloning creation and management
  - WebSocket streaming functionality
  - Input validation and sanitization
  - Response format verification

- **Services** (`unit/services/`):
  - Audio processing algorithms
  - File handling and encryption
  - Database operations
  - External API integrations

**Key Features**:
- Comprehensive mocking of dependencies
- Edge case and boundary condition testing
- Error handling validation
- Input sanitization verification

### 2. Integration Tests (`integration/`)

**Coverage**: Component interactions and service integration

- Complete API request/response cycles
- Service-to-service communication
- Database integration
- File system operations
- Cross-service workflows (STT → TTS, Voice cloning → Synthesis)

**Key Features**:
- Realistic service interactions
- End-to-end data flow validation
- Error propagation testing
- Transaction integrity verification

### 3. Performance Tests (`performance/`)

**Coverage**: System performance and resource usage

- **Audio Processing Performance**:
  - Transcription speed benchmarks
  - Synthesis performance metrics
  - Voice cloning creation speed
  - Memory usage monitoring
  - Concurrent request handling
  - Resource cleanup verification

- **Load Testing**:
  - Concurrent user scenarios
  - API response time benchmarks
  - Memory leak detection
  - WebSocket connection scaling

**Key Features**:
- Benchmark testing with pytest-benchmark
- Memory usage monitoring with psutil
- Concurrency testing with ThreadPoolExecutor
- Performance regression detection

### 4. Security Tests (`security/`)

**Coverage**: Security vulnerabilities and data protection

- **Input Validation**:
  - SQL injection prevention
  - XSS attack mitigation
  - Path traversal protection
  - File upload security
  - Parameter validation

- **Encryption & Privacy**:
  - File encryption/decryption
  - Audio data protection
  - Key management security
  - Data sanitization

- **Authentication & Authorization**:
  - Session management
  - User access control
  - API security headers

**Key Features**:
- Malicious input testing
- Encryption algorithm validation
- Security header verification
- Data privacy compliance

### 5. End-to-End Tests (`e2e/`)

**Coverage**: Complete user workflows and scenarios

- **Complete User Journeys**:
  - STT: Upload → Transcribe → Retrieve session
  - TTS: Configure → Synthesize → Download audio
  - Voice Cloning: Create → List → Synthesize → Compare
  - Cross-service workflows

- **Error Recovery**:
  - Failed operation recovery
  - Service unavailability handling
  - Data consistency verification

**Key Features**:
- Realistic user scenario simulation
- Multi-step workflow validation
- Error recovery testing
- Service integration verification

## Test Markers

Use pytest markers to run specific test categories:

```bash
# Run only unit tests
pytest -m unit

# Run performance tests
pytest -m performance

# Run security tests  
pytest -m security

# Run integration tests
pytest -m integration

# Run end-to-end tests
pytest -m e2e

# Run specific service tests
pytest -m "voice_cloning"
pytest -m "streaming"
pytest -m "audio"

# Run slow tests
pytest -m slow

# Skip slow tests
pytest -m "not slow"
```

## Running Tests

### Prerequisites

1. Install test dependencies:
```bash
cd backend
pip install -r test-requirements.txt
```

2. Ensure the main application dependencies are installed:
```bash
pip install -r requirements.txt
```

### Basic Test Execution

```bash
# Run all tests
pytest

# Run with verbose output
pytest -v

# Run with coverage report
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/unit/api/routes/test_stt.py

# Run specific test function
pytest tests/unit/api/routes/test_stt.py::TestSTTTranscription::test_transcribe_audio_success
```

### Performance Testing

```bash
# Run performance tests with benchmarking
pytest tests/performance/ --benchmark-only

# Generate performance report
pytest tests/performance/ --benchmark-html=benchmark_report.html

# Memory profiling
pytest tests/performance/ --profile
```

### Security Testing

```bash
# Run security tests
pytest tests/security/ -v

# Generate security report
pytest tests/security/ --html=security_report.html
```

### Coverage Reporting

```bash
# Generate comprehensive coverage report
pytest --cov=app --cov-report=html --cov-report=term --cov-report=xml

# Coverage with branch analysis
pytest --cov=app --cov-branch --cov-report=html
```

## Test Configuration

### pytest.ini Settings

- **Coverage**: Minimum 85% coverage requirement
- **Markers**: Defined for test categorization
- **Async Support**: Auto mode for asyncio tests
- **Warnings**: Filtered for clean output
- **Logging**: Configured for test debugging

### conftest.py Fixtures

- **Test Client**: Async FastAPI test client
- **Mock Services**: Pre-configured service mocks
- **Test Data**: Audio files and sample data
- **Temporary Files**: Automatic cleanup
- **Database Mocks**: In-memory test databases

## Test Data Management

### Audio Test Files

- **Sample Audio**: Short test audio files (1-5 seconds)
- **Long Audio**: Extended files for performance testing (30+ seconds)
- **Corrupted Files**: Invalid audio for error testing
- **Various Formats**: WAV, MP3, OGG for format testing

### Mock Data Factories

- **Voice Clone Objects**: Realistic voice clone data
- **Transcription Responses**: Various transcription results
- **Synthesis Results**: TTS output samples
- **User Sessions**: Session management data

## Continuous Integration

### GitHub Actions Integration

```yaml
# Example workflow for test automation
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: |
          pip install -r backend/requirements.txt
          pip install -r backend/test-requirements.txt
      - name: Run tests
        run: |
          cd backend
          pytest --cov=app --cov-report=xml
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Test Best Practices

### Writing Tests

1. **Use descriptive test names** that explain what is being tested
2. **Follow AAA pattern**: Arrange, Act, Assert
3. **Mock external dependencies** to ensure test isolation
4. **Test both success and failure scenarios**
5. **Use proper fixtures** for test data setup
6. **Clean up resources** after tests complete

### Performance Testing

1. **Set reasonable benchmarks** based on requirements
2. **Monitor memory usage** for leak detection
3. **Test with realistic data sizes**
4. **Use profiling** for bottleneck identification

### Security Testing

1. **Test with malicious inputs** to verify sanitization
2. **Verify encryption** functionality thoroughly
3. **Check for information disclosure** in error messages
4. **Validate authentication** and authorization

## Troubleshooting

### Common Issues

1. **Import Errors**: Ensure PYTHONPATH includes the app directory
2. **Async Test Failures**: Use pytest-asyncio properly
3. **Mock Issues**: Verify mock patches are applied correctly
4. **File Permission Errors**: Check temporary directory permissions

### Debugging Tests

```bash
# Run with debugging output
pytest -vvv --tb=long

# Run single test with pdb
pytest --pdb tests/unit/api/routes/test_stt.py::test_name

# Show test coverage gaps
pytest --cov=app --cov-report=term-missing
```

## Contributing

When adding new tests:

1. **Place tests** in appropriate category directories
2. **Use existing fixtures** when possible
3. **Add new markers** for new test types
4. **Update documentation** for new test categories
5. **Ensure tests pass** in CI environment

## Test Metrics

Target metrics for the test suite:

- **Code Coverage**: >85% line and branch coverage
- **Performance**: Response times <2s for API endpoints
- **Reliability**: <1% test flakiness
- **Security**: 100% coverage of security-critical paths

## Documentation Updates

This test suite documentation should be updated when:

- New test categories are added
- Test structure changes significantly
- New testing tools are introduced
- CI/CD processes are modified