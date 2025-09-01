import chromadb
from chromadb.config import Settings
from typing import List, Dict, Any, Optional
from pathlib import Path
from loguru import logger


class VectorStore:
    def __init__(self, persist_directory: str = "vectordb"):
        self.persist_directory = Path(persist_directory)
        self.persist_directory.mkdir(parents=True, exist_ok=True)
        
        self.client = chromadb.PersistentClient(
            path=str(self.persist_directory),
            settings=Settings(
                anonymized_telemetry=False,
                allow_reset=True
            )
        )
        
        self.voice_embeddings_collection = self.client.get_or_create_collection(
            name="voice_embeddings",
            metadata={"hnsw:space": "cosine"}
        )
        
        self.audio_features_collection = self.client.get_or_create_collection(
            name="audio_features", 
            metadata={"hnsw:space": "cosine"}
        )
        
        logger.info(f"Vector store initialized at {self.persist_directory}")
    
    def store_voice_embedding(
        self, 
        voice_id: str, 
        embedding: List[float], 
        metadata: Optional[Dict[str, Any]] = None
    ):
        """Store voice embedding for voice cloning"""
        try:
            self.voice_embeddings_collection.add(
                embeddings=[embedding],
                metadatas=[metadata or {}],
                ids=[voice_id]
            )
            logger.info(f"Voice embedding stored: {voice_id}")
            
        except Exception as e:
            logger.error(f"Failed to store voice embedding {voice_id}: {e}")
            raise
    
    def get_voice_embedding(self, voice_id: str) -> Optional[List[float]]:
        """Retrieve voice embedding by ID"""
        try:
            result = self.voice_embeddings_collection.get(
                ids=[voice_id],
                include=['embeddings']
            )
            
            if result['embeddings']:
                return result['embeddings'][0]
            return None
            
        except Exception as e:
            logger.error(f"Failed to get voice embedding {voice_id}: {e}")
            return None
    
    def find_similar_voices(
        self, 
        query_embedding: List[float], 
        n_results: int = 5
    ) -> Dict[str, Any]:
        """Find similar voices based on embedding"""
        try:
            results = self.voice_embeddings_collection.query(
                query_embeddings=[query_embedding],
                n_results=n_results,
                include=['embeddings', 'metadatas', 'distances']
            )
            
            return {
                'ids': results['ids'][0] if results['ids'] else [],
                'distances': results['distances'][0] if results['distances'] else [],
                'metadatas': results['metadatas'][0] if results['metadatas'] else []
            }
            
        except Exception as e:
            logger.error(f"Failed to find similar voices: {e}")
            return {'ids': [], 'distances': [], 'metadatas': []}
    
    def store_audio_features(
        self, 
        audio_id: str, 
        features: List[float], 
        metadata: Optional[Dict[str, Any]] = None
    ):
        """Store audio features for analysis and retrieval"""
        try:
            self.audio_features_collection.add(
                embeddings=[features],
                metadatas=[metadata or {}],
                ids=[audio_id]
            )
            logger.info(f"Audio features stored: {audio_id}")
            
        except Exception as e:
            logger.error(f"Failed to store audio features {audio_id}: {e}")
            raise
    
    def search_audio_by_features(
        self, 
        query_features: List[float], 
        n_results: int = 10
    ) -> Dict[str, Any]:
        """Search for similar audio by features"""
        try:
            results = self.audio_features_collection.query(
                query_embeddings=[query_features],
                n_results=n_results,
                include=['embeddings', 'metadatas', 'distances']
            )
            
            return {
                'ids': results['ids'][0] if results['ids'] else [],
                'distances': results['distances'][0] if results['distances'] else [],
                'metadatas': results['metadatas'][0] if results['metadatas'] else []
            }
            
        except Exception as e:
            logger.error(f"Failed to search audio by features: {e}")
            return {'ids': [], 'distances': [], 'metadatas': []}
    
    def delete_voice_embedding(self, voice_id: str):
        """Delete voice embedding"""
        try:
            self.voice_embeddings_collection.delete(ids=[voice_id])
            logger.info(f"Voice embedding deleted: {voice_id}")
            
        except Exception as e:
            logger.error(f"Failed to delete voice embedding {voice_id}: {e}")
            raise
    
    def reset_collections(self):
        """Reset all collections (use with caution)"""
        try:
            self.client.reset()
            logger.warning("All vector store collections have been reset")
            
        except Exception as e:
            logger.error(f"Failed to reset collections: {e}")
            raise


# Global vector store instance
_vector_store: Optional[VectorStore] = None

def get_vector_store() -> VectorStore:
    """Get or create global vector store instance"""
    global _vector_store
    if _vector_store is None:
        _vector_store = VectorStore()
    return _vector_store