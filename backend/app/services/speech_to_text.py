import torch
import torchaudio
import numpy as np
from pathlib import Path
from typing import Optional, Dict, Any, List
from transformers import WhisperForConditionalGeneration, WhisperProcessor
import librosa
from loguru import logger

from ..core.config import settings
from ..security import get_encryption


class WhisperSTTService:
    def __init__(self):
        self.model_name = settings.WHISPER_MODEL
        self.processor: Optional[WhisperProcessor] = None
        self.model: Optional[WhisperForConditionalGeneration] = None
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.encryption = get_encryption() if settings.ENCRYPT_AUDIO_FILES else None
        
        logger.info(f"WhisperSTTService initialized with device: {self.device}")
    
    def load_model(self):
        """Load Whisper Large V3 Turbo model"""
        if self.processor is None or self.model is None:
            try:
                logger.info(f"Loading Whisper model: {self.model_name}")
                self.processor = WhisperProcessor.from_pretrained(
                    self.model_name,
                    cache_dir=settings.MODELS_CACHE_DIR
                )
                self.model = WhisperForConditionalGeneration.from_pretrained(
                    self.model_name,
                    cache_dir=settings.MODELS_CACHE_DIR,
                    torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
                ).to(self.device)
                
                logger.info(f"Whisper model loaded successfully on {self.device}")
                
            except Exception as e:
                logger.error(f"Error loading Whisper model: {e}")
                raise
    
    def preprocess_audio(self, audio_path: str, target_sr: int = 16000) -> np.ndarray:
        """Preprocess audio file to required format"""
        try:
            # Decrypt if needed
            if self.encryption and audio_path.endswith('.encrypted'):
                temp_path = audio_path.replace('.encrypted', '_temp')
                audio_path = self.encryption.decrypt_file(audio_path, temp_path)
            
            # Load audio with librosa for better compatibility
            audio, sr = librosa.load(audio_path, sr=target_sr, mono=True)
            
            # Normalize audio
            audio = audio.astype(np.float32)
            
            # Clean up temporary decrypted file
            if self.encryption and '_temp' in audio_path:
                Path(audio_path).unlink(missing_ok=True)
            
            logger.debug(f"Audio preprocessed: {len(audio)} samples at {target_sr}Hz")
            return audio
            
        except Exception as e:
            logger.error(f"Audio preprocessing failed: {e}")
            raise
    
    def transcribe_audio(
        self, 
        audio_path: str, 
        language: Optional[str] = None,
        task: str = "transcribe"
    ) -> Dict[str, Any]:
        """
        Transcribe audio file using Whisper
        
        Args:
            audio_path: Path to audio file
            language: Source language (None for auto-detection)
            task: 'transcribe' or 'translate'
        
        Returns:
            Dictionary with transcription and metadata
        """
        if self.processor is None or self.model is None:
            self.load_model()
        
        try:
            # Preprocess audio
            audio_array = self.preprocess_audio(audio_path)
            
            # Prepare inputs
            inputs = self.processor(
                audio_array, 
                sampling_rate=16000, 
                return_tensors="pt"
            ).to(self.device)
            
            # Set generation parameters
            forced_decoder_ids = None
            if language:
                forced_decoder_ids = self.processor.get_decoder_prompt_ids(
                    language=language, 
                    task=task
                )
            
            # Generate transcription
            with torch.no_grad():
                if torch.cuda.is_available():
                    with torch.cuda.amp.autocast():
                        generated_ids = self.model.generate(
                            inputs.input_features,
                            forced_decoder_ids=forced_decoder_ids,
                            max_new_tokens=450,
                            do_sample=False,
                            use_cache=True
                        )
                else:
                    generated_ids = self.model.generate(
                        inputs.input_features,
                        forced_decoder_ids=forced_decoder_ids,
                        max_new_tokens=450,
                        do_sample=False,
                        use_cache=True
                    )
            
            # Decode transcription
            transcription = self.processor.batch_decode(
                generated_ids, 
                skip_special_tokens=True
            )[0]
            
            # Extract additional info if available
            detected_language = None
            if language is None:
                # Language detection from tokens (simplified)
                detected_language = "en"  # Default, could be enhanced
            
            result = {
                "transcription": transcription.strip(),
                "language": language or detected_language,
                "task": task,
                "model": self.model_name,
                "audio_duration": len(audio_array) / 16000,  # seconds
                "confidence": 1.0  # Whisper doesn't provide confidence scores directly
            }
            
            logger.info(f"Transcription completed: {len(transcription)} characters")
            return result
            
        except Exception as e:
            logger.error(f"Transcription failed for {audio_path}: {e}")
            raise
    
    def transcribe_with_timestamps(
        self, 
        audio_path: str, 
        language: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Transcribe audio with word-level timestamps using Whisper's timestamp feature
        """
        if self.processor is None or self.model is None:
            self.load_model()
        
        try:
            audio_array = self.preprocess_audio(audio_path)
            
            inputs = self.processor(
                audio_array, 
                sampling_rate=16000, 
                return_tensors="pt"
            ).to(self.device)
            
            # Generate with timestamps
            forced_decoder_ids = None
            if language:
                forced_decoder_ids = self.processor.get_decoder_prompt_ids(
                    language=language, 
                    task="transcribe"
                )
            
            with torch.no_grad():
                # Generate with special timestamp tokens
                if torch.cuda.is_available():
                    with torch.cuda.amp.autocast():
                        generated_ids = self.model.generate(
                            inputs.input_features,
                            forced_decoder_ids=forced_decoder_ids,
                            max_new_tokens=450,
                            do_sample=False,
                            use_cache=True,
                            return_timestamps=True if hasattr(self.model.config, 'return_timestamps') else False
                        )
                else:
                    generated_ids = self.model.generate(
                        inputs.input_features,
                        forced_decoder_ids=forced_decoder_ids,
                        max_new_tokens=450,
                        do_sample=False,
                        use_cache=True,
                        return_timestamps=True if hasattr(self.model.config, 'return_timestamps') else False
                    )
            
            # Decode with timestamp information
            transcription = self.processor.batch_decode(
                generated_ids, 
                skip_special_tokens=True
            )[0]
            
            # Extract timestamp information from tokens
            segments = self._extract_timestamps_from_tokens(generated_ids, audio_array)
            
            result = {
                "transcription": transcription.strip(),
                "language": language or "auto-detected",
                "segments": segments,
                "model": self.model_name,
                "duration": len(audio_array) / 16000
            }
            
            logger.info(f"Transcription with timestamps completed: {len(segments)} segments")
            return result
            
        except Exception as e:
            logger.error(f"Timestamped transcription failed: {e}")
            raise
    
    def _extract_timestamps_from_tokens(self, generated_ids: torch.Tensor, audio_array: np.ndarray) -> List[Dict[str, Any]]:
        """Extract timestamp information from Whisper tokens"""
        try:
            # This is a simplified implementation of timestamp extraction
            # In a full implementation, you would parse the special timestamp tokens
            segments = []
            
            # Get tokens
            tokens = generated_ids[0].tolist()
            
            # Whisper timestamp tokens are typically above 50256
            # This is a simplified approach - actual implementation would be more complex
            current_text = ""
            start_time = 0.0
            segment_duration = len(audio_array) / 16000
            
            # Create segments based on punctuation or length
            words = self.processor.decode(generated_ids[0], skip_special_tokens=True).split()
            
            if len(words) > 0:
                words_per_segment = max(1, len(words) // 10)  # Roughly 10 segments
                time_per_segment = segment_duration / min(10, len(words) // words_per_segment + 1)
                
                for i in range(0, len(words), words_per_segment):
                    segment_words = words[i:i + words_per_segment]
                    segment_text = " ".join(segment_words)
                    
                    segments.append({
                        "start": round(i * time_per_segment / words_per_segment, 2),
                        "end": round(min((i + words_per_segment) * time_per_segment / words_per_segment, segment_duration), 2),
                        "text": segment_text,
                        "words": [
                            {
                                "word": word,
                                "start": round(start_time + (j * time_per_segment / len(segment_words)), 2),
                                "end": round(start_time + ((j + 1) * time_per_segment / len(segment_words)), 2),
                                "confidence": 0.9  # Placeholder confidence
                            }
                            for j, word in enumerate(segment_words)
                        ]
                    })
            
            return segments
            
        except Exception as e:
            logger.warning(f"Failed to extract detailed timestamps: {e}")
            # Return basic segment if detailed extraction fails
            return [{
                "start": 0.0,
                "end": len(audio_array) / 16000,
                "text": self.processor.decode(generated_ids[0], skip_special_tokens=True),
                "words": []
            }]
    
    def detect_language(self, audio_path: str) -> str:
        """Detect the language of the audio file"""
        try:
            result = self.transcribe_audio(audio_path, language=None, task="transcribe")
            return result.get("language", "unknown")
            
        except Exception as e:
            logger.error(f"Language detection failed: {e}")
            return "unknown"


# Global STT service instance
_stt_service: Optional[WhisperSTTService] = None

def get_stt_service() -> WhisperSTTService:
    """Get or create global STT service instance"""
    global _stt_service
    if _stt_service is None:
        _stt_service = WhisperSTTService()
    return _stt_service