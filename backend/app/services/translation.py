import torch
from typing import Optional, Dict, Any, List
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM, pipeline
from loguru import logger

from ..core.config import settings


class TranslationService:
    """Translation service using open-source models as per privacy requirements"""
    
    def __init__(self):
        # Use open-source models for privacy (as specified in plan)
        self.models = {
            "aya": "CohereForAI/aya-23-8B",  # As mentioned in the plan
            "nllb": "facebook/nllb-200-distilled-600M",  # Good multilingual model
            "m2m": "facebook/m2m100_418M"  # Another good option
        }
        
        self.default_model = "nllb"  # Start with NLLB as it's more lightweight
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        
        self.tokenizer: Optional[AutoTokenizer] = None
        self.model: Optional[AutoModelForSeq2SeqLM] = None
        self.current_model_name = None
        
        # Language mappings for different models
        self.language_codes = {
            "english": "en",
            "spanish": "es", 
            "french": "fr",
            "german": "de",
            "italian": "it",
            "portuguese": "pt",
            "russian": "ru",
            "chinese": "zh",
            "japanese": "ja",
            "korean": "ko",
            "arabic": "ar",
            "hindi": "hi",
            "dutch": "nl",
            "polish": "pl",
            "turkish": "tr"
        }
        
        logger.info(f"TranslationService initialized with device: {self.device}")
    
    def load_model(self, model_type: str = "nllb"):
        """Load specified translation model"""
        if model_type not in self.models:
            raise ValueError(f"Unknown model type: {model_type}")
        
        model_name = self.models[model_type]
        
        if self.current_model_name == model_name and self.model is not None:
            return  # Model already loaded
        
        try:
            logger.info(f"Loading translation model: {model_name}")
            
            self.tokenizer = AutoTokenizer.from_pretrained(
                model_name,
                cache_dir=settings.MODELS_CACHE_DIR,
                trust_remote_code=True
            )
            
            self.model = AutoModelForSeq2SeqLM.from_pretrained(
                model_name,
                cache_dir=settings.MODELS_CACHE_DIR,
                torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
                trust_remote_code=True,
                device_map="auto" if self.device == "cuda" else None
            ).to(self.device)
            
            self.model.eval()
            self.current_model_name = model_name
            
            logger.info(f"Translation model loaded successfully: {model_name}")
            
        except Exception as e:
            logger.error(f"Error loading translation model {model_name}: {e}")
            raise
    
    def translate_text(
        self,
        text: str,
        source_language: str,
        target_language: str,
        model_type: str = "nllb"
    ) -> Dict[str, Any]:
        """
        Translate text from source to target language
        
        Args:
            text: Text to translate
            source_language: Source language code or name
            target_language: Target language code or name
            model_type: Model to use (nllb, aya, m2m)
        
        Returns:
            Dictionary with translation and metadata
        """
        if self.model is None or self.current_model_name != self.models[model_type]:
            self.load_model(model_type)
        
        try:
            # Normalize language codes
            src_lang = self._normalize_language_code(source_language)
            tgt_lang = self._normalize_language_code(target_language)
            
            # Prepare input based on model type
            if model_type == "nllb":
                translation_result = self._translate_with_nllb(text, src_lang, tgt_lang)
            elif model_type == "m2m":
                translation_result = self._translate_with_m2m(text, src_lang, tgt_lang)
            else:  # aya or other models
                translation_result = self._translate_with_generic(text, src_lang, tgt_lang)
            
            result = {
                "translated_text": translation_result,
                "source_language": src_lang,
                "target_language": tgt_lang,
                "original_text": text,
                "model": self.current_model_name,
                "confidence": 1.0  # Most models don't provide confidence scores
            }
            
            logger.info(f"Translation completed: {src_lang} -> {tgt_lang}")
            return result
            
        except Exception as e:
            logger.error(f"Translation failed: {e}")
            raise
    
    def _translate_with_nllb(self, text: str, src_lang: str, tgt_lang: str) -> str:
        """Translate using NLLB model"""
        try:
            # NLLB uses specific language codes
            nllb_src = self._get_nllb_lang_code(src_lang)
            nllb_tgt = self._get_nllb_lang_code(tgt_lang)
            
            self.tokenizer.src_lang = nllb_src
            
            inputs = self.tokenizer(
                text,
                return_tensors="pt",
                padding=True,
                truncation=True,
                max_length=512
            ).to(self.device)
            
            with torch.no_grad():
                generated_tokens = self.model.generate(
                    **inputs,
                    forced_bos_token_id=self.tokenizer.lang_code_to_id[nllb_tgt],
                    max_length=512,
                    num_beams=4,
                    early_stopping=True
                )
            
            translation = self.tokenizer.batch_decode(
                generated_tokens, 
                skip_special_tokens=True
            )[0]
            
            return translation.strip()
            
        except Exception as e:
            logger.error(f"NLLB translation failed: {e}")
            raise
    
    def _translate_with_m2m(self, text: str, src_lang: str, tgt_lang: str) -> str:
        """Translate using M2M100 model"""
        try:
            self.tokenizer.src_lang = src_lang
            
            inputs = self.tokenizer(
                text,
                return_tensors="pt",
                padding=True,
                truncation=True,
                max_length=512
            ).to(self.device)
            
            with torch.no_grad():
                generated_tokens = self.model.generate(
                    **inputs,
                    forced_bos_token_id=self.tokenizer.get_lang_id(tgt_lang),
                    max_length=512,
                    num_beams=4,
                    early_stopping=True
                )
            
            translation = self.tokenizer.batch_decode(
                generated_tokens, 
                skip_special_tokens=True
            )[0]
            
            return translation.strip()
            
        except Exception as e:
            logger.error(f"M2M translation failed: {e}")
            raise
    
    def _translate_with_generic(self, text: str, src_lang: str, tgt_lang: str) -> str:
        """Generic translation method for other models"""
        try:
            # For models like Aya, use a more generic approach
            prompt = f"Translate the following text from {src_lang} to {tgt_lang}: {text}"
            
            inputs = self.tokenizer(
                prompt,
                return_tensors="pt",
                padding=True,
                truncation=True,
                max_length=512
            ).to(self.device)
            
            with torch.no_grad():
                generated_tokens = self.model.generate(
                    **inputs,
                    max_length=512,
                    num_beams=4,
                    early_stopping=True,
                    do_sample=True,
                    temperature=0.7
                )
            
            translation = self.tokenizer.batch_decode(
                generated_tokens, 
                skip_special_tokens=True
            )[0]
            
            # Clean up the response (remove the prompt if it's repeated)
            if prompt in translation:
                translation = translation.replace(prompt, "").strip()
            
            return translation
            
        except Exception as e:
            logger.error(f"Generic translation failed: {e}")
            raise
    
    def _normalize_language_code(self, language: str) -> str:
        """Normalize language input to standard code"""
        language = language.lower().strip()
        
        # If it's already a code, return as-is
        if len(language) == 2:
            return language
        
        # Map from full name to code
        return self.language_codes.get(language, language)
    
    def _get_nllb_lang_code(self, lang: str) -> str:
        """Get NLLB-specific language codes"""
        nllb_codes = {
            "en": "eng_Latn",
            "es": "spa_Latn", 
            "fr": "fra_Latn",
            "de": "deu_Latn",
            "it": "ita_Latn",
            "pt": "por_Latn",
            "ru": "rus_Cyrl",
            "zh": "zho_Hans",
            "ja": "jpn_Jpan",
            "ko": "kor_Hang",
            "ar": "ara_Arab",
            "hi": "hin_Deva",
            "nl": "nld_Latn",
            "pl": "pol_Latn",
            "tr": "tur_Latn"
        }
        return nllb_codes.get(lang, f"{lang}_Latn")
    
    def get_supported_languages(self) -> Dict[str, List[str]]:
        """Get list of supported languages for each model"""
        return {
            "nllb": [
                "en", "es", "fr", "de", "it", "pt", "ru", "zh", "ja", "ko", 
                "ar", "hi", "nl", "pl", "tr", "sv", "da", "no", "fi"
            ],
            "m2m": [
                "en", "es", "fr", "de", "it", "pt", "ru", "zh", "ja", "ko",
                "ar", "hi", "nl", "pl", "tr"
            ],
            "aya": [
                "en", "es", "fr", "de", "it", "pt", "ru", "zh", "ja", "ko",
                "ar", "hi", "nl", "pl", "tr", "th", "vi", "id", "ms"
            ]
        }
    
    def detect_language(self, text: str) -> str:
        """
        Simple language detection (placeholder)
        In production, would use fasttext or similar
        """
        try:
            # This is a very simple heuristic - in production use proper language detection
            char_counts = {}
            for char in text:
                if char.isalpha():
                    char_counts[char] = char_counts.get(char, 0) + 1
            
            # Very basic detection based on character patterns
            if any(ord(c) > 127 for c in text):
                if any(ord(c) > 0x4e00 and ord(c) < 0x9fff for c in text):
                    return "zh"  # Chinese
                elif any(ord(c) > 0x3040 and ord(c) < 0x30ff for c in text):
                    return "ja"  # Japanese
                elif any(ord(c) > 0xac00 and ord(c) < 0xd7af for c in text):
                    return "ko"  # Korean
                else:
                    return "unknown"
            else:
                return "en"  # Default to English for Latin script
                
        except Exception as e:
            logger.error(f"Language detection failed: {e}")
            return "unknown"


# Global translation service instance
_translation_service: Optional[TranslationService] = None

def get_translation_service() -> TranslationService:
    """Get or create global translation service instance"""
    global _translation_service
    if _translation_service is None:
        _translation_service = TranslationService()
    return _translation_service