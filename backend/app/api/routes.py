# backend/app/api/routes.py
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from ..models.speech_to_text import transcribe_audio
from ..models.text_to_speech import generate_speech
from ..models.translator import translate_text
from ..utils.file_handler import save_uploaded_file, get_file_path, allowed_file, cleanup_old_files
import os

api_bp = Blueprint('api', __name__)

@api_bp.before_request
def before_request():
    cleanup_old_files(current_app.config['UPLOAD_FOLDER'], max_age=3600)  # Cleanup files older than 1 hour

@api_bp.route('/transcribe', methods=['POST'])
def transcribe():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file and allowed_file(file.filename, {'wav', 'mp3', 'ogg'}):
        try:
            filename = save_uploaded_file(file, current_app.config['UPLOAD_FOLDER'])
            file_path = get_file_path(filename, current_app.config['UPLOAD_FOLDER'])
            transcription = transcribe_audio(file_path)
            os.remove(file_path)  # Clean up the uploaded file
            return jsonify({'transcription': transcription})
        except Exception as e:
            current_app.logger.error(f"Transcription error: {str(e)}")
            return jsonify({'error': 'Transcription failed'}), 500
    return jsonify({'error': 'Invalid file type'}), 400

@api_bp.route('/synthesize', methods=['POST'])
def synthesize():
    data = request.json
    if not data or 'text' not in data:
        return jsonify({'error': 'No text provided'}), 400
    text = data['text']
    language = data.get('language', 'en')  # Default to English
    try:
        audio_path = generate_speech(text, language)
        return jsonify({'audio_url': f'/audio/{os.path.basename(audio_path)}'})
    except Exception as e:
        current_app.logger.error(f"Speech synthesis error: {str(e)}")
        return jsonify({'error': 'Speech synthesis failed'}), 500

@api_bp.route('/translate', methods=['POST'])
def translate():
    data = request.json
    if not data or 'text' not in data or 'target_language' not in data:
        return jsonify({'error': 'Invalid request'}), 400
    text = data['text']
    target_language = data['target_language']
    try:
        translated_text = translate_text(text, target_language)
        return jsonify({'translated_text': translated_text})
    except Exception as e:
        current_app.logger.error(f"Translation error: {str(e)}")
        return jsonify({'error': 'Translation failed'}), 500
