# backend/tests/test_api.py
import pytest
from app.app import create_app
import io

@pytest.fixture
def client():
    app = create_app()
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_health_check(client):
    response = client.get('/health')
    assert response.status_code == 200
    assert response.json['status'] == 'healthy'

def test_transcribe_no_file(client):
    response = client.post('/api/transcribe')
    assert response.status_code == 400
    assert 'error' in response.json

def test_synthesize_no_text(client):
    response = client.post('/api/synthesize', json={})
    assert response.status_code == 400
    assert 'error' in response.json

def test_translate_invalid_request(client):
    response = client.post('/api/translate', json={})
    assert response.status_code == 400
    assert 'error' in response.json

# Add more tests for successful scenarios (mocking the AI models)