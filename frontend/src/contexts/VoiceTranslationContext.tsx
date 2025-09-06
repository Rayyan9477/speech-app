import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export interface Language {
  id: string;
  name: string;
  nativeName: string;
  code: string;
  flag: string;
  region?: string;
}

export interface TranslationVoice {
  id: string;
  name: string;
  gender: string;
  language: string;
  languageCode: string;
  sampleUrl: string;
  isPremium: boolean;
  avatar: string;
}

export interface AudioFile {
  id: string;
  name: string;
  url: string;
  size: number;
  duration: number;
  format: string;
  waveformData?: number[];
}

export interface TranslationJob {
  id: string;
  sourceAudio: AudioFile;
  sourceLanguage?: string;
  targetLanguage: Language;
  selectedVoice: TranslationVoice;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  result?: {
    audioUrl: string;
    duration: number;
    translatedText?: string;
    waveformData?: number[];
    format: string;
  };
  createdAt: Date;
  completedAt?: Date;
  error?: string;
}

export interface VoiceTranslationState {
  currentStep: 'upload' | 'language' | 'voice' | 'processing' | 'results';
  uploadedFile: AudioFile | null;
  selectedLanguage: Language | null;
  selectedVoice: TranslationVoice | null;
  currentJob: TranslationJob | null;
  uploadProgress: number;
  processingProgress: number;
  isUploading: boolean;
  isProcessing: boolean;
  error: string | null;
  availableLanguages: Language[];
  availableVoices: TranslationVoice[];
}

type VoiceTranslationAction =
  | { type: 'SET_STEP'; payload: VoiceTranslationState['currentStep'] }
  | { type: 'SET_UPLOADED_FILE'; payload: AudioFile }
  | { type: 'SET_SELECTED_LANGUAGE'; payload: Language }
  | { type: 'SET_SELECTED_VOICE'; payload: TranslationVoice }
  | { type: 'SET_CURRENT_JOB'; payload: TranslationJob }
  | { type: 'SET_UPLOAD_PROGRESS'; payload: number }
  | { type: 'SET_PROCESSING_PROGRESS'; payload: number }
  | { type: 'SET_IS_UPLOADING'; payload: boolean }
  | { type: 'SET_IS_PROCESSING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_JOB_STATUS'; payload: { status: TranslationJob['status']; result?: TranslationJob['result'] } }
  | { type: 'RESET_WORKFLOW' }
  | { type: 'NEXT_STEP' }
  | { type: 'PREVIOUS_STEP' };

// Mock data
const mockLanguages: Language[] = [
  {
    id: '1',
    name: 'English - US',
    nativeName: 'English (United States)',
    code: 'en-US',
    flag: '🇺🇸',
    region: 'North America'
  },
  {
    id: '2',
    name: 'English - UK',
    nativeName: 'English (United Kingdom)',
    code: 'en-GB',
    flag: '🇬🇧',
    region: 'Europe'
  },
  {
    id: '3',
    name: 'French',
    nativeName: 'Français',
    code: 'fr-FR',
    flag: '🇫🇷',
    region: 'Europe'
  },
  {
    id: '4',
    name: 'German',
    nativeName: 'Deutsch',
    code: 'de-DE',
    flag: '🇩🇪',
    region: 'Europe'
  },
  {
    id: '5',
    name: 'Spanish',
    nativeName: 'Español',
    code: 'es-ES',
    flag: '🇪🇸',
    region: 'Europe'
  },
  {
    id: '6',
    name: 'Italian',
    nativeName: 'Italiano',
    code: 'it-IT',
    flag: '🇮🇹',
    region: 'Europe'
  },
  {
    id: '7',
    name: 'Chinese',
    nativeName: '中文',
    code: 'zh-CN',
    flag: '🇨🇳',
    region: 'Asia'
  },
  {
    id: '8',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    code: 'hi-IN',
    flag: '🇮🇳',
    region: 'Asia'
  },
  {
    id: '9',
    name: 'Japanese',
    nativeName: '日本語',
    code: 'ja-JP',
    flag: '🇯🇵',
    region: 'Asia'
  },
  {
    id: '10',
    name: 'Portuguese',
    nativeName: 'Português',
    code: 'pt-BR',
    flag: '🇧🇷',
    region: 'South America'
  }
];

const mockVoices: TranslationVoice[] = [
  {
    id: '1',
    name: 'Emma',
    gender: 'Female',
    language: 'English - US',
    languageCode: 'en-US',
    sampleUrl: '/audio/voice-emma.mp3',
    isPremium: false,
    avatar: '/avatars/emma.jpg'
  },
  {
    id: '2',
    name: 'James',
    gender: 'Male',
    language: 'English - US',
    languageCode: 'en-US',
    sampleUrl: '/audio/voice-james.mp3',
    isPremium: true,
    avatar: '/avatars/james.jpg'
  },
  {
    id: '3',
    name: 'Sophie',
    gender: 'Female',
    language: 'French',
    languageCode: 'fr-FR',
    sampleUrl: '/audio/voice-sophie.mp3',
    isPremium: false,
    avatar: '/avatars/sophie.jpg'
  },
  {
    id: '4',
    name: 'Hans',
    gender: 'Male',
    language: 'German',
    languageCode: 'de-DE',
    sampleUrl: '/audio/voice-hans.mp3',
    isPremium: true,
    avatar: '/avatars/hans.jpg'
  },
  {
    id: '5',
    name: 'Isabella',
    gender: 'Female',
    language: 'Spanish',
    languageCode: 'es-ES',
    sampleUrl: '/audio/voice-isabella.mp3',
    isPremium: false,
    avatar: '/avatars/isabella.jpg'
  }
];

const initialState: VoiceTranslationState = {
  currentStep: 'upload',
  uploadedFile: null,
  selectedLanguage: null,
  selectedVoice: null,
  currentJob: null,
  uploadProgress: 0,
  processingProgress: 0,
  isUploading: false,
  isProcessing: false,
  error: null,
  availableLanguages: mockLanguages,
  availableVoices: mockVoices
};

const stepOrder: VoiceTranslationState['currentStep'][] = ['upload', 'language', 'voice', 'processing', 'results'];

function voiceTranslationReducer(
  state: VoiceTranslationState,
  action: VoiceTranslationAction
): VoiceTranslationState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };

    case 'SET_UPLOADED_FILE':
      return { ...state, uploadedFile: action.payload };

    case 'SET_SELECTED_LANGUAGE':
      return { 
        ...state, 
        selectedLanguage: action.payload,
        availableVoices: mockVoices.filter(voice => voice.languageCode === action.payload.code)
      };

    case 'SET_SELECTED_VOICE':
      return { ...state, selectedVoice: action.payload };

    case 'SET_CURRENT_JOB':
      return { ...state, currentJob: action.payload };

    case 'SET_UPLOAD_PROGRESS':
      return { ...state, uploadProgress: action.payload };

    case 'SET_PROCESSING_PROGRESS':
      return { ...state, processingProgress: action.payload };

    case 'SET_IS_UPLOADING':
      return { ...state, isUploading: action.payload };

    case 'SET_IS_PROCESSING':
      return { ...state, isProcessing: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'UPDATE_JOB_STATUS':
      return {
        ...state,
        currentJob: state.currentJob ? {
          ...state.currentJob,
          status: action.payload.status,
          ...(action.payload.result && { result: action.payload.result }),
          ...(action.payload.status === 'completed' && { completedAt: new Date() })
        } : null
      };

    case 'RESET_WORKFLOW':
      return {
        ...initialState,
        availableLanguages: state.availableLanguages,
        availableVoices: mockVoices
      };

    case 'NEXT_STEP':
      const currentIndex = stepOrder.indexOf(state.currentStep);
      const nextStep = currentIndex < stepOrder.length - 1 ? stepOrder[currentIndex + 1] : state.currentStep;
      return { ...state, currentStep: nextStep };

    case 'PREVIOUS_STEP':
      const currentIdx = stepOrder.indexOf(state.currentStep);
      const prevStep = currentIdx > 0 ? stepOrder[currentIdx - 1] : state.currentStep;
      return { ...state, currentStep: prevStep };

    default:
      return state;
  }
}

interface VoiceTranslationContextType {
  state: VoiceTranslationState;
  dispatch: React.Dispatch<VoiceTranslationAction>;
  // Helper functions
  uploadFile: (file: File) => Promise<void>;
  selectLanguage: (language: Language) => void;
  selectVoice: (voice: TranslationVoice) => void;
  startTranslation: () => Promise<void>;
  nextStep: () => void;
  previousStep: () => void;
  resetWorkflow: () => void;
  canProceedToNext: () => boolean;
}

const VoiceTranslationContext = createContext<VoiceTranslationContextType | undefined>(undefined);

interface VoiceTranslationProviderProps {
  children: ReactNode;
}

export const VoiceTranslationProvider: React.FC<VoiceTranslationProviderProps> = ({
  children
}) => {
  const [state, dispatch] = useReducer(voiceTranslationReducer, initialState);

  const uploadFile = async (file: File): Promise<void> => {
    dispatch({ type: 'SET_IS_UPLOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // Simulate file upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        dispatch({ type: 'SET_UPLOAD_PROGRESS', payload: progress });
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Create audio file object
      const audioFile: AudioFile = {
        id: `upload_${Date.now()}`,
        name: file.name,
        url: URL.createObjectURL(file),
        size: file.size,
        duration: 120, // Mock duration
        format: file.type,
        waveformData: Array.from({ length: 50 }, () => Math.random() * 100)
      };

      dispatch({ type: 'SET_UPLOADED_FILE', payload: audioFile });
      dispatch({ type: 'SET_IS_UPLOADING', payload: false });
      dispatch({ type: 'SET_STEP', payload: 'language' });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to upload file. Please try again.' });
      dispatch({ type: 'SET_IS_UPLOADING', payload: false });
    }
  };

  const selectLanguage = (language: Language) => {
    dispatch({ type: 'SET_SELECTED_LANGUAGE', payload: language });
  };

  const selectVoice = (voice: TranslationVoice) => {
    dispatch({ type: 'SET_SELECTED_VOICE', payload: voice });
  };

  const startTranslation = async (): Promise<void> => {
    if (!state.uploadedFile || !state.selectedLanguage || !state.selectedVoice) {
      return;
    }

    dispatch({ type: 'SET_IS_PROCESSING', payload: true });
    dispatch({ type: 'SET_STEP', payload: 'processing' });

    // Create translation job
    const job: TranslationJob = {
      id: `job_${Date.now()}`,
      sourceAudio: state.uploadedFile,
      targetLanguage: state.selectedLanguage,
      selectedVoice: state.selectedVoice,
      status: 'processing',
      progress: 0,
      createdAt: new Date()
    };

    dispatch({ type: 'SET_CURRENT_JOB', payload: job });

    try {
      // Simulate translation progress
      for (let progress = 0; progress <= 100; progress += 5) {
        dispatch({ type: 'SET_PROCESSING_PROGRESS', payload: progress });
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Mock translation result
      const result = {
        audioUrl: '/audio/translated-result.mp3',
        duration: 125,
        translatedText: 'This is the translated text...',
        waveformData: Array.from({ length: 60 }, () => Math.random() * 100),
        format: 'audio/mp3'
      };

      dispatch({ type: 'UPDATE_JOB_STATUS', payload: { status: 'completed', result } });
      dispatch({ type: 'SET_IS_PROCESSING', payload: false });
      dispatch({ type: 'SET_STEP', payload: 'results' });
    } catch (error) {
      dispatch({ type: 'UPDATE_JOB_STATUS', payload: { status: 'failed' } });
      dispatch({ type: 'SET_IS_PROCESSING', payload: false });
      dispatch({ type: 'SET_ERROR', payload: 'Translation failed. Please try again.' });
    }
  };

  const nextStep = () => {
    dispatch({ type: 'NEXT_STEP' });
  };

  const previousStep = () => {
    dispatch({ type: 'PREVIOUS_STEP' });
  };

  const resetWorkflow = () => {
    dispatch({ type: 'RESET_WORKFLOW' });
  };

  const canProceedToNext = (): boolean => {
    switch (state.currentStep) {
      case 'upload':
        return !!state.uploadedFile && !state.isUploading;
      case 'language':
        return !!state.selectedLanguage;
      case 'voice':
        return !!state.selectedVoice;
      case 'processing':
        return state.currentJob?.status === 'completed';
      case 'results':
        return false;
      default:
        return false;
    }
  };

  const value: VoiceTranslationContextType = {
    state,
    dispatch,
    uploadFile,
    selectLanguage,
    selectVoice,
    startTranslation,
    nextStep,
    previousStep,
    resetWorkflow,
    canProceedToNext
  };

  return (
    <VoiceTranslationContext.Provider value={value}>
      {children}
    </VoiceTranslationContext.Provider>
  );
};

export const useVoiceTranslation = (): VoiceTranslationContextType => {
  const context = useContext(VoiceTranslationContext);
  if (!context) {
    throw new Error('useVoiceTranslation must be used within a VoiceTranslationProvider');
  }
  return context;
};