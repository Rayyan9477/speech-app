# backend/app/models/text_to_speech.py
import torch
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import soundfile as sf
import os
import logging

logger = logging.getLogger(__name__)

model_name = "fishaudio/fish-speech-1.5"
tokenizer = None
model = None

def load_model():
    global tokenizer, model
    try:
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
        logger.info(f"Loaded Fish Speech model: {model_name}")
    except Exception as e:
        logger.error(f"Error loading Fish Speech model: {str(e)}")
        raise

def generate_speech(text, language='en'):
    if tokenizer is None or model is None:
        load_model()

    try:
        with torch.no_grad():
            inputs = tokenizer(text, return_tensors="pt")
            generated_ids = model.generate(inputs.input_ids, max_length=1000)
            generated_speech = model.generate_speech(generated_ids[0])
        
        # Save the generated speech
        output_dir = 'audio_outputs'
        os.makedirs(output_dir, exist_ok=True)
        output_path = os.path.join(output_dir, f'{hash(text)}.wav')
        sf.write(output_path, generated_speech.cpu().numpy(), samplerate=16000)
        
        logger.info(f"Successfully generated speech for text: {text[:50]}...")
        return output_path
    except Exception as e:
        logger.error(f"Error generating speech: {str(e)}")
        raise