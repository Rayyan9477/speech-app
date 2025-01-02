# backend/app/models/translator.py
from transformers import T5ForConditionalGeneration, T5Tokenizer
import torch
import logging

logger = logging.getLogger(__name__)

model_name = "google-t5/t5-large"
tokenizer = None
model = None

def load_model():
    global tokenizer, model
    try:
        tokenizer = T5Tokenizer.from_pretrained(model_name)
        model = T5ForConditionalGeneration.from_pretrained(model_name)
        logger.info(f"Loaded T5 model: {model_name}")
    except Exception as e:
        logger.error(f"Error loading T5 model: {str(e)}")
        raise

def translate_text(text, target_language):
    if tokenizer is None or model is None:
        load_model()

    try:
        input_text = f"translate {text} to {target_language}"
        input_ids = tokenizer.encode(input_text, return_tensors="pt")
        
        with torch.no_grad():
            outputs = model.generate(input_ids, max_length=1000)
        
        translated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        logger.info(f"Successfully translated text to {target_language}")
        return translated_text
    except Exception as e:
        logger.error(f"Error translating text: {str(e)}")
        raise