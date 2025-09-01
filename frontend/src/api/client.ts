// API client for the AI Language Processor backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_PREFIX = '/api/v1';

export interface TranscriptionResponse {
  transcription: string;
  language: string;
  confidence: number;
  duration_seconds: number;
  model: string;
  session_id: string;
}

export interface SynthesisResponse {
  audio_path: string;
  filename: string;
  text: string;
  language: string;
  voice_style: string;
  emotion: string;
  duration_seconds: number;
  sample_rate: number;
  model: string;
  encrypted: boolean;
  session_id: string;
}

export interface TranslationResponse {
  translated_text: string;
  source_language: string;
  target_language: string;
  original_text: string;
  model: string;
  confidence: number;
  session_id?: string;
}

export interface VoiceCloneResponse {
  clone_id: string;
  name: string;
  status: string;
  embedding_path: string;
  embedding_dimensions: number;
  sample_path: string;
}

export interface VoiceSynthesisResponse {
  audio_path: string;
  clone_id: string;
  text: string;
  language: string;
  duration: number;
  sample_rate: number;
}

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = `${API_BASE_URL}${API_PREFIX}`;
  }

  // Speech-to-Text endpoints
  async transcribeAudio(
    file: File,
    language?: string,
    task: string = 'transcribe'
  ): Promise<TranscriptionResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (language) formData.append('language', language);
    formData.append('task', task);

    const response = await fetch(`${this.baseURL}/stt/transcribe`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Transcription failed: ${response.statusText}`);
    }

    return response.json();
  }

  async transcribeWithTimestamps(
    file: File,
    language?: string
  ): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    if (language) formData.append('language', language);

    const response = await fetch(`${this.baseURL}/stt/transcribe-with-timestamps`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Timestamped transcription failed: ${response.statusText}`);
    }

    return response.json();
  }

  async detectAudioLanguage(file: File): Promise<{detected_language: string}> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseURL}/stt/detect-language`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Language detection failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Text-to-Speech endpoints
  async synthesizeSpeech(
    text: string,
    language: string = 'en',
    voiceStyle: string = 'neutral',
    emotion: string = 'neutral',
    speed: number = 1.0,
    pitch: number = 1.0
  ): Promise<SynthesisResponse> {
    const response = await fetch(`${this.baseURL}/tts/synthesize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        language,
        voice_style: voiceStyle,
        emotion,
        speed,
        pitch,
      }),
    });

    if (!response.ok) {
      throw new Error(`Speech synthesis failed: ${response.statusText}`);
    }

    return response.json();
  }

  getAudioFile(filename: string): string {
    return `${this.baseURL}/tts/audio/${filename}`;
  }

  async getAvailableVoices(): Promise<{
    voice_styles: string[];
    emotions: string[];
    languages: string[];
  }> {
    const response = await fetch(`${this.baseURL}/tts/voices`);

    if (!response.ok) {
      throw new Error(`Failed to get available voices: ${response.statusText}`);
    }

    return response.json();
  }

  // Translation endpoints
  async translateText(
    text: string,
    sourceLanguage: string,
    targetLanguage: string,
    modelType: string = 'nllb'
  ): Promise<TranslationResponse> {
    const response = await fetch(`${this.baseURL}/translate/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        source_language: sourceLanguage,
        target_language: targetLanguage,
        model_type: modelType,
      }),
    });

    if (!response.ok) {
      throw new Error(`Translation failed: ${response.statusText}`);
    }

    return response.json();
  }

  async detectTextLanguage(text: string): Promise<{
    detected_language: string;
    text: string;
  }> {
    const response = await fetch(`${this.baseURL}/translate/detect-language`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`Language detection failed: ${response.statusText}`);
    }

    return response.json();
  }

  async getSupportedLanguages(): Promise<{
    nllb: string[];
    m2m: string[];
    aya: string[];
  }> {
    const response = await fetch(`${this.baseURL}/translate/supported-languages`);

    if (!response.ok) {
      throw new Error(`Failed to get supported languages: ${response.statusText}`);
    }

    return response.json();
  }

  // Voice Cloning endpoints
  async createVoiceClone(
    name: string,
    file: File,
    userId?: string
  ): Promise<VoiceCloneResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    if (userId) formData.append('user_id', userId);

    const response = await fetch(`${this.baseURL}/voice/create-clone`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Voice clone creation failed: ${response.statusText}`);
    }

    return response.json();
  }

  async synthesizeWithClonedVoice(
    text: string,
    cloneId: string,
    language: string = 'en'
  ): Promise<VoiceSynthesisResponse> {
    const response = await fetch(`${this.baseURL}/voice/synthesize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        clone_id: cloneId,
        language,
      }),
    });

    if (!response.ok) {
      throw new Error(`Cloned voice synthesis failed: ${response.statusText}`);
    }

    return response.json();
  }

  async listVoiceClones(userId?: string): Promise<{
    voice_clones: any[];
    total: number;
  }> {
    const url = new URL(`${this.baseURL}/voice/list`);
    if (userId) url.searchParams.append('user_id', userId);

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`Failed to list voice clones: ${response.statusText}`);
    }

    return response.json();
  }

  async deleteVoiceClone(cloneId: string): Promise<{message: string}> {
    const response = await fetch(`${this.baseURL}/voice/${cloneId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete voice clone: ${response.statusText}`);
    }

    return response.json();
  }

  // General endpoints
  async getHealthStatus(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/health`);

    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }

    return response.json();
  }

  async getApiStatus(): Promise<any> {
    const response = await fetch(`${this.baseURL}/status`);

    if (!response.ok) {
      throw new Error(`API status check failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Session management
  async getSession(sessionId: string, endpoint: 'stt' | 'tts' | 'translate'): Promise<any> {
    const response = await fetch(`${this.baseURL}/${endpoint}/session/${sessionId}`);

    if (!response.ok) {
      throw new Error(`Failed to get session: ${response.statusText}`);
    }

    return response.json();
  }
}

export const apiClient = new ApiClient();
export default apiClient;