import { useState, useCallback } from 'react';
import { Voice, AudioSettings, TextBlock } from '../contexts/TTSProjectContext';

interface TTSResponse {
  audioUrl: string;
  waveformData: number[];
  duration: number;
  format: string;
  sampleRate: number;
}

interface TTSGenerationOptions {
  text: string;
  voice: Voice;
  settings: AudioSettings;
  format?: 'mp3' | 'wav' | 'aac' | 'flac';
  sampleRate?: number;
}

interface VoiceLibraryResponse {
  aiVoices: Voice[];
  userVoices: Voice[];
  premiumVoices: Voice[];
}

interface TTSAPIHook {
  generateSpeech: (options: TTSGenerationOptions) => Promise<TTSResponse>;
  generateBatchSpeech: (blocks: TextBlock[], settings: AudioSettings) => Promise<TTSResponse[]>;
  isGenerating: boolean;
  progress: number;
  error: string | null;
  
  // Voice management
  fetchVoiceLibrary: () => Promise<VoiceLibraryResponse>;
  createVoiceClone: (audioFile: File, name: string) => Promise<Voice>;
  deleteVoice: (voiceId: string) => Promise<void>;
  
  // Audio processing
  generateWaveform: (audioUrl: string) => Promise<number[]>;
  convertAudioFormat: (audioUrl: string, targetFormat: string) => Promise<string>;
  
  // Utilities
  clearError: () => void;
  cancelGeneration: () => void;
}

// API endpoints - replace with actual backend URLs
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';

const TTS_ENDPOINTS = {
  GENERATE: `${API_BASE_URL}/tts/generate`,
  BATCH_GENERATE: `${API_BASE_URL}/tts/generate-batch`,
  VOICES: `${API_BASE_URL}/voices`,
  VOICE_CLONE: `${API_BASE_URL}/voices/clone`,
  WAVEFORM: `${API_BASE_URL}/audio/waveform`,
  CONVERT: `${API_BASE_URL}/audio/convert`
};

export function useTTSAPI(): TTSAPIHook {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const cancelGeneration = useCallback(() => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setIsGenerating(false);
      setProgress(0);
    }
  }, [abortController]);

  const generateSpeech = useCallback(async (options: TTSGenerationOptions): Promise<TTSResponse> => {
    setIsGenerating(true);
    setProgress(0);
    setError(null);

    const controller = new AbortController();
    setAbortController(controller);

    try {
      // For development, use mock data if API is not available
      if (process.env.NODE_ENV === 'development' && !process.env.REACT_APP_USE_REAL_API) {
        return await mockTTSGeneration(options);
      }

      const response = await fetch(TTS_ENDPOINTS.GENERATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: options.text,
          voiceId: options.voice.id,
          settings: {
            pitch: options.settings.pitch,
            speed: options.settings.speed + 1, // Convert from -100/+100 to 0.x/2.x range
            volume: options.settings.volume,
          },
          format: options.format || 'mp3',
          sampleRate: options.sampleRate || 44100,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`TTS generation failed: ${response.statusText}`);
      }

      const result: TTSResponse = await response.json();
      
      setProgress(100);
      setIsGenerating(false);
      setAbortController(null);
      
      return result;
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Generation was cancelled
        throw new Error('Generation cancelled');
      }
      
      const errorMessage = err instanceof Error ? err.message : 'TTS generation failed';
      setError(errorMessage);
      setIsGenerating(false);
      setProgress(0);
      setAbortController(null);
      throw new Error(errorMessage);
    }
  }, []);

  const generateBatchSpeech = useCallback(async (
    blocks: TextBlock[], 
    settings: AudioSettings
  ): Promise<TTSResponse[]> => {
    setIsGenerating(true);
    setProgress(0);
    setError(null);

    const controller = new AbortController();
    setAbortController(controller);

    try {
      if (process.env.NODE_ENV === 'development' && !process.env.REACT_APP_USE_REAL_API) {
        const results: TTSResponse[] = [];
        
        for (let i = 0; i < blocks.length; i++) {
          const block = blocks[i];
          setProgress((i / blocks.length) * 100);
          
          const result = await mockTTSGeneration({
            text: block.content,
            voice: block.voice,
            settings,
          });
          
          results.push(result);
        }
        
        setProgress(100);
        setIsGenerating(false);
        setAbortController(null);
        return results;
      }

      const response = await fetch(TTS_ENDPOINTS.BATCH_GENERATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          blocks: blocks.map(block => ({
            id: block.id,
            text: block.content,
            voiceId: block.voice.id,
          })),
          settings: {
            pitch: settings.pitch,
            speed: settings.speed + 1,
            volume: settings.volume,
          },
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Batch TTS generation failed: ${response.statusText}`);
      }

      const result: TTSResponse[] = await response.json();
      
      setProgress(100);
      setIsGenerating(false);
      setAbortController(null);
      
      return result;
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error('Batch generation cancelled');
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Batch TTS generation failed';
      setError(errorMessage);
      setIsGenerating(false);
      setProgress(0);
      setAbortController(null);
      throw new Error(errorMessage);
    }
  }, []);

  const fetchVoiceLibrary = useCallback(async (): Promise<VoiceLibraryResponse> => {
    try {
      if (process.env.NODE_ENV === 'development' && !process.env.REACT_APP_USE_REAL_API) {
        return mockVoiceLibrary();
      }

      const response = await fetch(TTS_ENDPOINTS.VOICES);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch voices: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch voice library';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const createVoiceClone = useCallback(async (audioFile: File, name: string): Promise<Voice> => {
    setIsGenerating(true);
    setProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('audio', audioFile);
      formData.append('name', name);

      if (process.env.NODE_ENV === 'development' && !process.env.REACT_APP_USE_REAL_API) {
        // Mock voice clone creation
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const newVoice: Voice = {
          id: Date.now().toString(),
          name,
          gender: 'Unknown',
          language: 'English',
          avatar: '/api/placeholder/48/48',
          isPremium: false,
          provider: 'clone',
          style: 'Personal'
        };
        
        setProgress(100);
        setIsGenerating(false);
        return newVoice;
      }

      const response = await fetch(TTS_ENDPOINTS.VOICE_CLONE, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Voice cloning failed: ${response.statusText}`);
      }

      const result: Voice = await response.json();
      
      setProgress(100);
      setIsGenerating(false);
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Voice cloning failed';
      setError(errorMessage);
      setIsGenerating(false);
      setProgress(0);
      throw new Error(errorMessage);
    }
  }, []);

  const deleteVoice = useCallback(async (voiceId: string): Promise<void> => {
    try {
      if (process.env.NODE_ENV === 'development' && !process.env.REACT_APP_USE_REAL_API) {
        // Mock deletion
        await new Promise(resolve => setTimeout(resolve, 1000));
        return;
      }

      const response = await fetch(`${TTS_ENDPOINTS.VOICES}/${voiceId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete voice: ${response.statusText}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete voice';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const generateWaveform = useCallback(async (audioUrl: string): Promise<number[]> => {
    try {
      if (process.env.NODE_ENV === 'development' && !process.env.REACT_APP_USE_REAL_API) {
        // Generate mock waveform data
        const dataPoints = 1000;
        return Array.from({ length: dataPoints }, (_, i) => {
          const t = i / dataPoints;
          return Math.sin(t * Math.PI * 10) * Math.exp(-t * 2) * (Math.random() * 0.5 + 0.5);
        });
      }

      const response = await fetch(TTS_ENDPOINTS.WAVEFORM, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ audioUrl }),
      });

      if (!response.ok) {
        throw new Error(`Waveform generation failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.waveformData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Waveform generation failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const convertAudioFormat = useCallback(async (audioUrl: string, targetFormat: string): Promise<string> => {
    try {
      if (process.env.NODE_ENV === 'development' && !process.env.REACT_APP_USE_REAL_API) {
        // Mock format conversion
        await new Promise(resolve => setTimeout(resolve, 2000));
        return audioUrl.replace(/\.\w+$/, `.${targetFormat}`);
      }

      const response = await fetch(TTS_ENDPOINTS.CONVERT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ audioUrl, targetFormat }),
      });

      if (!response.ok) {
        throw new Error(`Audio conversion failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.convertedUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Audio conversion failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  return {
    generateSpeech,
    generateBatchSpeech,
    isGenerating,
    progress,
    error,
    fetchVoiceLibrary,
    createVoiceClone,
    deleteVoice,
    generateWaveform,
    convertAudioFormat,
    clearError,
    cancelGeneration,
  };
}

// Mock functions for development
async function mockTTSGeneration(options: TTSGenerationOptions): Promise<TTSResponse> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));
  
  // Generate mock waveform data based on text length
  const dataPoints = Math.min(Math.max(options.text.length * 10, 500), 2000);
  const waveformData = Array.from({ length: dataPoints }, (_, i) => {
    const t = i / dataPoints;
    const frequency = 2 + Math.sin(t * Math.PI * 0.5) * 1.5;
    const amplitude = Math.sin(t * Math.PI * frequency) * Math.exp(-t * 1.5) * (Math.random() * 0.3 + 0.7);
    return amplitude;
  });

  const duration = dataPoints / 44.1; // Approximate duration in seconds

  return {
    audioUrl: `/mock-audio/${Date.now()}.mp3`,
    waveformData,
    duration,
    format: 'mp3',
    sampleRate: 44100,
  };
}

function mockVoiceLibrary(): VoiceLibraryResponse {
  return {
    aiVoices: [
      {
        id: '1',
        name: 'Olivia',
        gender: 'F',
        language: 'English',
        avatar: '/api/placeholder/48/48',
        isPremium: false,
        provider: 'openai',
        style: 'Natural'
      },
      {
        id: '2',
        name: 'Marcus',
        gender: 'M',
        language: 'English',
        avatar: '/api/placeholder/48/48',
        isPremium: true,
        provider: 'elevenlabs',
        style: 'Professional'
      },
      {
        id: '3',
        name: 'Luna',
        gender: 'F',
        language: 'Spanish',
        avatar: '/api/placeholder/48/48',
        isPremium: false,
        provider: 'google',
        style: 'Friendly'
      }
    ],
    userVoices: [
      {
        id: '4',
        name: 'My Voice Clone',
        gender: 'F',
        language: 'English',
        avatar: '/api/placeholder/48/48',
        isPremium: false,
        provider: 'clone',
        style: 'Personal'
      }
    ],
    premiumVoices: [
      {
        id: '5',
        name: 'Celebrity Voice',
        gender: 'M',
        language: 'English',
        avatar: '/api/placeholder/48/48',
        isPremium: true,
        provider: 'premium',
        style: 'Celebrity'
      }
    ]
  };
}