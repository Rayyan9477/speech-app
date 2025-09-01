import torch
import torchaudio
import numpy as np
from pathlib import Path
from typing import Optional, Dict, Any, List, Union
import uuid
import hashlib
from datetime import datetime
from loguru import logger

from ..core.config import settings
from ..database import get_vector_store, get_database, VoiceClone
from ..security import get_encryption


class VoiceCloningService:
    """Voice cloning service using Silero or Coqui TTS models as specified in plan"""
    
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.vector_store = get_vector_store()
        self.db = get_database()
        self.encryption = get_encryption() if settings.ENCRYPT_AUDIO_FILES else None
        
        # Model configuration (to be implemented with actual models)
        self.embedding_model = None
        self.cloning_model = None
        self.sample_rate = 22050
        
        logger.info(f"VoiceCloningService initialized on {self.device}")
    
    def extract_voice_embedding(self, audio_path: str) -> np.ndarray:
        """
        Extract voice embedding from audio sample
        This would use models like Silero or similar for voice characterization
        """
        try:
            # Decrypt if needed
            if self.encryption and audio_path.endswith('.encrypted'):
                temp_path = audio_path.replace('.encrypted', '_temp')
                audio_path = self.encryption.decrypt_file(audio_path, temp_path)
            
            # Load audio
            waveform, sr = torchaudio.load(audio_path)
            
            # Resample if needed
            if sr != self.sample_rate:
                resampler = torchaudio.transforms.Resample(sr, self.sample_rate)
                waveform = resampler(waveform)
            
            # Convert to mono if stereo
            if waveform.shape[0] > 1:
                waveform = torch.mean(waveform, dim=0, keepdim=True)
            
            # Extract features using a voice embedding model
            embedding = self._extract_features_with_model(waveform)
            
            # Clean up temp file
            if self.encryption and '_temp' in audio_path:
                Path(audio_path).unlink(missing_ok=True)
            
            logger.info(f"Voice embedding extracted: {embedding.shape}")
            return embedding
            
        except Exception as e:
            logger.error(f"Voice embedding extraction failed: {e}")
            raise
    
    def _extract_features_with_model(self, waveform: torch.Tensor) -> np.ndarray:
        """
        Extract voice features using embedding model
        Placeholder for actual implementation with Silero or similar
        """
        try:
            # This is a placeholder implementation
            # In practice, would use:
            # - Silero voice embeddings: torch.hub.load('snakers4/silero-models', 'silero_te')
            # - Or Coqui TTS voice encoder
            # - Or WaveRNN/WaveNet based encoders
            
            # For now, create a mock embedding using audio statistics
            waveform_np = waveform.squeeze().numpy()
            
            # Extract basic audio features as placeholder
            features = []
            
            # Spectral features
            fft = np.fft.fft(waveform_np)
            spectral_centroid = np.mean(np.abs(fft))
            features.append(spectral_centroid)
            
            # Statistical features
            features.extend([
                np.mean(waveform_np),
                np.std(waveform_np),
                np.max(waveform_np),
                np.min(waveform_np),
                np.median(waveform_np)
            ])
            
            # Pad or truncate to standard embedding size (e.g., 512 dimensions)
            embedding_size = 512
            if len(features) < embedding_size:
                features.extend([0.0] * (embedding_size - len(features)))
            else:
                features = features[:embedding_size]
            
            return np.array(features, dtype=np.float32)
            
        except Exception as e:
            logger.error(f"Feature extraction failed: {e}")
            raise
    
    def create_voice_clone(
        self,
        name: str,
        sample_audio_path: str,
        user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Create a new voice clone from audio sample
        
        Args:
            name: Name for the voice clone
            sample_audio_path: Path to the audio sample
            user_id: Optional user identifier
        
        Returns:
            Dictionary with clone information
        """
        try:
            # Generate unique ID
            clone_id = str(uuid.uuid4())
            
            # Extract voice embedding
            embedding = self.extract_voice_embedding(sample_audio_path)
            
            # Save embedding to vector store
            embedding_metadata = {
                "clone_id": clone_id,
                "name": name,
                "user_id": user_id,
                "sample_path": sample_audio_path,
                "created_at": datetime.now().isoformat()
            }
            
            self.vector_store.store_voice_embedding(
                voice_id=clone_id,
                embedding=embedding.tolist(),
                metadata=embedding_metadata
            )
            
            # Save embedding file
            embedding_dir = Path("voice_embeddings")
            embedding_dir.mkdir(exist_ok=True)
            embedding_path = embedding_dir / f"{clone_id}.npy"
            np.save(embedding_path, embedding)
            
            # Encrypt embedding if needed
            if self.encryption:
                encrypted_embedding_path = str(embedding_path) + '.encrypted'
                self.encryption.encrypt_file(str(embedding_path), encrypted_embedding_path)
                embedding_path.unlink()  # Remove unencrypted
                embedding_path = Path(encrypted_embedding_path)
            
            # Create database record
            voice_clone = VoiceClone(
                id=clone_id,
                name=name,
                sample_audio_path=sample_audio_path,
                voice_embedding_path=str(embedding_path),
                created_at=datetime.now(),
                metadata=embedding_metadata
            )
            
            # Note: Database creation would need to be implemented in the database models
            
            result = {
                "clone_id": clone_id,
                "name": name,
                "status": "created",
                "embedding_path": str(embedding_path),
                "embedding_dimensions": len(embedding),
                "sample_path": sample_audio_path
            }
            
            logger.info(f"Voice clone created: {name} ({clone_id})")
            return result
            
        except Exception as e:
            logger.error(f"Voice clone creation failed: {e}")
            raise
    
    def synthesize_with_cloned_voice(
        self,
        text: str,
        clone_id: str,
        language: str = "en"
    ) -> Dict[str, Any]:
        """
        Synthesize speech using a cloned voice
        
        Args:
            text: Text to synthesize
            clone_id: ID of the voice clone to use
            language: Target language
        
        Returns:
            Dictionary with synthesized audio information
        """
        try:
            # Retrieve voice embedding
            embedding = self.vector_store.get_voice_embedding(clone_id)
            if embedding is None:
                raise ValueError(f"Voice clone not found: {clone_id}")
            
            # Synthesize using the cloned voice
            # This would use the actual voice cloning model (Silero, Coqui, etc.)
            audio_data = self._synthesize_with_embedding(text, embedding, language)
            
            # Save synthesized audio
            output_dir = Path(settings.AUDIO_OUTPUT_FOLDER)
            output_dir.mkdir(exist_ok=True)
            
            filename = f"cloned_{clone_id[:8]}_{hashlib.md5(text.encode()).hexdigest()[:8]}.wav"
            output_path = output_dir / filename
            
            # Save audio
            torchaudio.save(
                str(output_path), 
                torch.from_numpy(audio_data).unsqueeze(0), 
                self.sample_rate
            )
            
            # Encrypt if needed
            final_path = str(output_path)
            if self.encryption:
                encrypted_path = str(output_path) + '.encrypted'
                self.encryption.encrypt_file(str(output_path), encrypted_path)
                output_path.unlink()
                final_path = encrypted_path
            
            result = {
                "audio_path": final_path,
                "clone_id": clone_id,
                "text": text,
                "language": language,
                "duration": len(audio_data) / self.sample_rate,
                "sample_rate": self.sample_rate
            }
            
            logger.info(f"Speech synthesized with cloned voice: {clone_id}")
            return result
            
        except Exception as e:
            logger.error(f"Cloned voice synthesis failed: {e}")
            raise
    
    def _synthesize_with_embedding(
        self, 
        text: str, 
        voice_embedding: List[float], 
        language: str
    ) -> np.ndarray:
        """
        Synthesize speech using voice embedding
        Placeholder for actual voice cloning model implementation
        """
        try:
            # This is where the actual voice cloning model would be used
            # Examples:
            # - Silero TTS with voice conversion
            # - Coqui TTS with speaker embedding
            # - Custom neural vocoder with embedding conditioning
            
            # Placeholder implementation
            # Generate synthetic audio data based on text length and embedding
            duration = max(1.0, len(text) * 0.1)  # Rough estimate
            samples = int(duration * self.sample_rate)
            
            # Create synthetic waveform (in practice, this would be model output)
            t = np.linspace(0, duration, samples)
            
            # Use embedding to influence synthesis parameters
            embedding_array = np.array(voice_embedding)
            base_freq = 200 + np.mean(embedding_array[:10]) * 100  # Vary fundamental frequency
            formant_shift = np.mean(embedding_array[10:20])  # Formant characteristics
            
            # Generate synthetic speech-like signal
            waveform = np.sin(2 * np.pi * base_freq * t)
            waveform += 0.5 * np.sin(2 * np.pi * base_freq * 2 * t)  # Harmonics
            waveform *= np.exp(-t * 0.5)  # Decay envelope
            
            # Add some voice-specific characteristics based on embedding
            noise = np.random.normal(0, 0.1, samples) * (1 + formant_shift)
            waveform = waveform * 0.8 + noise * 0.2
            
            # Normalize
            waveform = waveform / np.max(np.abs(waveform)) * 0.7
            
            logger.info(f"Synthetic speech generated: {duration:.2f}s")
            return waveform.astype(np.float32)
            
        except Exception as e:
            logger.error(f"Embedding-based synthesis failed: {e}")
            raise
    
    def find_similar_voices(self, clone_id: str, n_results: int = 5) -> Dict[str, Any]:
        """Find voices similar to the given clone"""
        try:
            # Get the embedding for the query voice
            query_embedding = self.vector_store.get_voice_embedding(clone_id)
            if query_embedding is None:
                raise ValueError(f"Voice clone not found: {clone_id}")
            
            # Search for similar voices
            results = self.vector_store.find_similar_voices(
                query_embedding=query_embedding,
                n_results=n_results + 1  # +1 to exclude the query voice itself
            )
            
            # Filter out the query voice from results
            filtered_results = {
                'ids': [id for id in results['ids'] if id != clone_id],
                'distances': [d for i, d in enumerate(results['distances']) 
                            if results['ids'][i] != clone_id],
                'metadatas': [m for i, m in enumerate(results['metadatas']) 
                            if results['ids'][i] != clone_id]
            }
            
            return filtered_results[:n_results]
            
        except Exception as e:
            logger.error(f"Similar voice search failed: {e}")
            return {'ids': [], 'distances': [], 'metadatas': []}
    
    def list_voice_clones(self, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """List available voice clones"""
        try:
            # This would query the database for voice clones
            # Placeholder implementation
            clones = []
            
            # In practice, would query database:
            # clones = self.db.get_voice_clones(user_id=user_id)
            
            logger.info(f"Retrieved {len(clones)} voice clones")
            return clones
            
        except Exception as e:
            logger.error(f"Voice clone listing failed: {e}")
            return []
    
    def delete_voice_clone(self, clone_id: str) -> bool:
        """Delete a voice clone"""
        try:
            # Delete from vector store
            self.vector_store.delete_voice_embedding(clone_id)
            
            # Delete embedding file
            embedding_path = Path(f"voice_embeddings/{clone_id}.npy")
            if embedding_path.exists():
                embedding_path.unlink()
            
            encrypted_path = Path(f"voice_embeddings/{clone_id}.npy.encrypted")
            if encrypted_path.exists():
                encrypted_path.unlink()
            
            # Delete from database (would be implemented)
            # self.db.delete_voice_clone(clone_id)
            
            logger.info(f"Voice clone deleted: {clone_id}")
            return True
            
        except Exception as e:
            logger.error(f"Voice clone deletion failed: {e}")
            return False


# Global voice cloning service instance
_voice_cloning_service: Optional[VoiceCloningService] = None

def get_voice_cloning_service() -> VoiceCloningService:
    """Get or create global voice cloning service instance"""
    global _voice_cloning_service
    if _voice_cloning_service is None:
        _voice_cloning_service = VoiceCloningService()
    return _voice_cloning_service