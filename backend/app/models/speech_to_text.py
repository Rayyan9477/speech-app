# backend/app/models/speech_to_text.py
import torch
from transformers import WhisperForConditionalGeneration, WhisperProcessor
import logging

logger = logging.getLogger(__name__)

model_name = "openai/whisper-large-v3-turbo"
processor = None
model = None

def load_model():
    global processor, model
    try:
        processor = WhisperProcessor.from_pretrained(model_name)
        model = WhisperForConditionalGeneration.from_pretrained(model_name)
        logger.info(f"Loaded Whisper model: {model_name}")
    except Exception as e:
        logger.error(f"Error loading Whisper model: {str(e)}")
        raise

def transcribe_audio(audio_path):
    if processor is None or model is None:
        load_model()

    try:
        with torch.no_grad():
            # Load and preprocess the audio
            audio_input = processor(audio_path, return_tensors="pt").input_features
            
            # Generate the transcription
            predicted_ids = model.generate(audio_input)
            transcription = processor.batch_decode(predicted_ids, skip_special_tokens=True)[0]
        
        logger.info(f"Successfully transcribed audio: {audio_path}")
        return transcription
    except Exception as e:
        logger.error(f"Error transcribing audio: {str(e)}")
        raise