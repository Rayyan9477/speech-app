// Legacy API service - migrated to use new API client
import { apiClient } from '../api/client';
import type { TranscriptionResponse, SynthesisResponse, TranslationResponse } from '../api/client';

// Backward compatibility wrappers for existing components
export const transcribe = async (file: File): Promise<{ transcription: string }> => {
  const response = await apiClient.transcribeAudio(file);
  return { transcription: response.transcription };
};

export const translate = async (text: string, targetLanguage: string): Promise<{ translated_text: string }> => {
  // Try to detect source language first, fallback to 'auto'
  let sourceLanguage = 'en'; // Default assumption
  try {
    const detected = await apiClient.detectTextLanguage(text);
    sourceLanguage = detected.detected_language;
  } catch (e) {
    console.warn('Language detection failed, using default source language');
  }
  
  const response = await apiClient.translateText(text, sourceLanguage, targetLanguage);
  return { translated_text: response.translated_text };
};

export const synthesize = async (text: string, language: string): Promise<{ audio_url: string }> => {
  const response = await apiClient.synthesizeSpeech(text, language);
  // Convert new API response format to old format expected by components
  const audioUrl = apiClient.getAudioFile(response.filename);
  return { audio_url: audioUrl };
};

// Export new API client for enhanced functionality
export { apiClient };

// Re-export types for convenience
export type {
  TranscriptionResponse,
  SynthesisResponse,
  TranslationResponse
};