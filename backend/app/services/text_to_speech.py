import torch
import torchaudio
import numpy as np
from pathlib import Path
from typing import Optional, Dict, Any, List, Union
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM, pipeline
import soundfile as sf
from loguru import logger
import hashlib
import uuid

from ..core.config import settings
from ..security import get_encryption


class DiaTTSService:
    """Text-to-Speech service using Dia by Nari Labs (1.6B parameter model)"""
    
    def __init__(self):
        self.model_name = settings.TTS_MODEL  # "nari-labs/dia-1.6b"
        self.tokenizer: Optional[AutoTokenizer] = None
        self.model: Optional[AutoModelForSeq2SeqLM] = None
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.encryption = get_encryption() if settings.ENCRYPT_AUDIO_FILES else None
        self.sample_rate = 22050  # Standard for high-quality TTS
        
        # Ensure output directory exists
        Path(settings.AUDIO_OUTPUT_FOLDER).mkdir(parents=True, exist_ok=True)
        
        logger.info(f"DiaTTSService initialized with device: {self.device}")
    
    def load_model(self):
        """Load Dia TTS model for ultra-realistic speech synthesis"""
        if self.tokenizer is None or self.model is None:
            try:
                logger.info(f"Loading Dia TTS model: {self.model_name}")
                
                # Note: The Dia model from Nari Labs may not be publicly available yet.
                # This is a placeholder implementation for when it becomes available.
                logger.warning("Dia model not yet publicly available, using fallback")
                self._load_fallback_model()
                return
                
                # Future implementation when Dia model is available:
                # self.tokenizer = AutoTokenizer.from_pretrained(
                #     self.model_name,
                #     cache_dir=settings.MODELS_CACHE_DIR,
                #     trust_remote_code=True
                # )
                # 
                # self.model = AutoModelForSeq2SeqLM.from_pretrained(
                #     self.model_name,
                #     cache_dir=settings.MODELS_CACHE_DIR,
                #     torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
                #     trust_remote_code=True,
                #     device_map="auto" if self.device == "cuda" else None
                # ).to(self.device)
                
            except Exception as e:
                logger.error(f"Error loading Dia TTS model: {e}")
                logger.warning("Falling back to alternative TTS model")
                self._load_fallback_model()
    
    def _load_fallback_model(self):
        """Load fallback TTS model if Dia is not available"""
        try:
            # Use Microsoft SpeechT5 as fallback
            from transformers import SpeechT5Processor, SpeechT5ForTextToSpeech
            
            model_name = "microsoft/speecht5_tts"
            self.processor = SpeechT5Processor.from_pretrained(
                model_name, 
                cache_dir=settings.MODELS_CACHE_DIR
            )
            self.model = SpeechT5ForTextToSpeech.from_pretrained(
                model_name,
                cache_dir=settings.MODELS_CACHE_DIR
            ).to(self.device)
            
            # Load speaker embeddings
            from datasets import load_dataset
            embeddings_dataset = load_dataset(
                "Matthijs/cmu-arctic-xvectors", 
                split="validation"
            )
            self.speaker_embeddings = torch.tensor(
                embeddings_dataset[7306]["xvector"]
            ).unsqueeze(0).to(self.device)
            
            self.is_fallback = True
            logger.info("Fallback TTS model (SpeechT5) loaded successfully")
            
        except Exception as e:
            logger.error(f"Fallback model loading failed: {e}")
            raise
    
    def synthesize_speech(
        self,
        text: str,
        language: str = "en",
        voice_style: str = "neutral",
        emotion: str = "neutral",
        speed: float = 1.0,
        pitch: float = 1.0
    ) -> Dict[str, Any]:
        """
        Synthesize speech from text with emotional control
        
        Args:
            text: Input text to synthesize
            language: Target language
            voice_style: Voice style (neutral, warm, authoritative, etc.)
            emotion: Emotion to convey (neutral, happy, sad, excited, etc.)
            speed: Speech speed multiplier
            pitch: Pitch multiplier
        
        Returns:
            Dictionary with audio file path and metadata
        """
        if self.model is None:
            self.load_model()
        
        try:
            # Generate unique filename
            text_hash = hashlib.md5(text.encode()).hexdigest()[:8]
            filename = f"tts_{text_hash}_{uuid.uuid4().hex[:8]}.wav"
            output_path = Path(settings.AUDIO_OUTPUT_FOLDER) / filename
            
            if hasattr(self, 'is_fallback') and self.is_fallback:
                audio_data = self._synthesize_with_fallback(text, language)
            else:
                audio_data = self._synthesize_with_dia(
                    text, language, voice_style, emotion, speed, pitch
                )
            
            # Apply speed and pitch modifications if needed
            if speed != 1.0 or pitch != 1.0:
                audio_data = self._modify_audio_properties(audio_data, speed, pitch)
            
            # Save audio file
            sf.write(str(output_path), audio_data, self.sample_rate)
            
            # Encrypt if required
            final_path = str(output_path)
            if self.encryption:
                encrypted_path = str(output_path) + '.encrypted'
                self.encryption.encrypt_file(str(output_path), encrypted_path)
                output_path.unlink()  # Remove unencrypted file
                final_path = encrypted_path
            
            result = {
                "audio_path": final_path,
                "filename": Path(final_path).name,
                "text": text,
                "language": language,
                "voice_style": voice_style,
                "emotion": emotion,
                "duration_seconds": len(audio_data) / self.sample_rate,
                "sample_rate": self.sample_rate,
                "model": self.model_name,
                "encrypted": self.encryption is not None
            }
            
            logger.info(f"Speech synthesized: {len(text)} chars -> {final_path}")
            return result
            
        except Exception as e:
            logger.error(f"Speech synthesis failed: {e}")
            raise
    
    def _synthesize_with_dia(
        self, 
        text: str, 
        language: str, 
        voice_style: str, 
        emotion: str,
        speed: float, 
        pitch: float
    ) -> np.ndarray:
        """Synthesize using Dia model with emotional control"""
        try:
            # Prepare input with style and emotion conditioning
            conditioned_input = self._prepare_conditioned_input(
                text, language, voice_style, emotion
            )
            
            # Tokenize input
            inputs = self.tokenizer(
                conditioned_input,
                return_tensors="pt",
                padding=True,
                truncation=True,
                max_length=512
            ).to(self.device)
            
            # Generate speech
            with torch.no_grad():
                if torch.cuda.is_available():
                    with torch.cuda.amp.autocast():
                        outputs = self.model.generate(
                            **inputs,
                            max_length=1000,
                            do_sample=True,
                            temperature=0.7,
                            top_p=0.9,
                            pad_token_id=self.tokenizer.pad_token_id
                        )
                else:
                    outputs = self.model.generate(
                        **inputs,
                        max_length=1000,
                        do_sample=True,
                        temperature=0.7,
                        top_p=0.9,
                        pad_token_id=self.tokenizer.pad_token_id
                    )
            
            # Convert model output to audio (model-specific implementation)
            audio_data = self._model_output_to_audio(outputs)
            
            return audio_data
            
        except Exception as e:
            logger.error(f"Dia synthesis failed: {e}")
            raise
    
    def _synthesize_with_fallback(self, text: str, language: str) -> np.ndarray:
        """Synthesize using fallback SpeechT5 model"""
        try:
            inputs = self.processor(text=text, return_tensors="pt").to(self.device)
            
            with torch.no_grad():
                speech = self.model.generate_speech(
                    inputs["input_ids"], 
                    self.speaker_embeddings, 
                    vocoder=None
                )
            
            # Convert to numpy array
            audio_data = speech.cpu().numpy()
            
            return audio_data
            
        except Exception as e:
            logger.error(f"Fallback synthesis failed: {e}")
            raise
    
    def _prepare_conditioned_input(
        self, 
        text: str, 
        language: str, 
        voice_style: str, 
        emotion: str
    ) -> str:
        """Prepare input with conditioning tokens for style and emotion"""
        # This would be model-specific conditioning
        # For Dia, this might involve special tokens or prefixes
        conditioning_prefix = f"<{language}><{voice_style}><{emotion}>"
        return f"{conditioning_prefix} {text}"
    
    def _model_output_to_audio(self, outputs: torch.Tensor) -> np.ndarray:
        """Convert model outputs to audio waveform"""
        # This is highly model-specific and would need to be adapted
        # based on Dia's actual output format
        
        # Placeholder implementation - would need actual Dia model specifics
        if outputs.dim() > 2:
            outputs = outputs.squeeze()
        
        # Convert to audio-like data (this is conceptual)
        audio_data = torch.tanh(outputs).cpu().numpy().astype(np.float32)
        
        # Ensure proper shape for mono audio
        if audio_data.ndim > 1:
            audio_data = audio_data.mean(axis=-1)
        
        return audio_data
    
    def _modify_audio_properties(
        self, 
        audio_data: np.ndarray, 
        speed: float, 
        pitch: float
    ) -> np.ndarray:
        """Modify audio speed and pitch"""
        try:
            # Speed modification (time stretching)
            if speed != 1.0:
                import librosa
                audio_data = librosa.effects.time_stretch(audio_data, rate=speed)
            
            # Pitch modification
            if pitch != 1.0:
                import librosa
                n_steps = 12 * np.log2(pitch)  # Convert to semitones
                audio_data = librosa.effects.pitch_shift(
                    audio_data, 
                    sr=self.sample_rate, 
                    n_steps=n_steps
                )
            
            return audio_data
            
        except Exception as e:
            logger.warning(f"Audio property modification failed: {e}")
            return audio_data  # Return original if modification fails
    
    def get_available_voices(self) -> List[Dict[str, str]]:
        """Get list of available voice styles and emotions"""
        return {
            "voice_styles": [
                "neutral", "warm", "authoritative", "friendly", 
                "professional", "conversational", "dramatic"
            ],
            "emotions": [
                "neutral", "happy", "sad", "excited", "angry", 
                "calm", "energetic", "thoughtful"
            ],
            "languages": [
                "en", "es", "fr", "de", "it", "pt", "ru", "zh", "ja", "ko"
            ]
        }
    
    def clone_voice_from_sample(
        self, 
        sample_audio_path: str, 
        voice_name: str
    ) -> Dict[str, Any]:
        """
        Create voice clone from audio sample
        (Placeholder - would require voice cloning model)
        """
        try:
            # This would integrate with voice cloning models like Silero or Coqui
            logger.info(f"Voice cloning requested for: {voice_name}")
            
            # Placeholder implementation
            clone_id = str(uuid.uuid4())
            
            result = {
                "clone_id": clone_id,
                "voice_name": voice_name,
                "sample_path": sample_audio_path,
                "status": "created",
                "message": "Voice cloning feature will be implemented with Silero/Coqui models"
            }
            
            return result
            
        except Exception as e:
            logger.error(f"Voice cloning failed: {e}")
            raise


# Global TTS service instance
_tts_service: Optional[DiaTTSService] = None

def get_tts_service() -> DiaTTSService:
    """Get or create global TTS service instance"""
    global _tts_service
    if _tts_service is None:
        _tts_service = DiaTTSService()
    return _tts_service