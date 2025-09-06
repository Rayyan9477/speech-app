import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';

export interface CustomVoice {
  id: string;
  name: string;
  gender: 'Male' | 'Female' | 'Other';
  ageGroup: 'Young' | 'Middle-Aged' | 'Senior';
  language: string;
  languageCode: string;
  avatar?: string;
  audioUrl?: string;
  waveformData?: number[];
  isProcessed: boolean;
  createdAt: Date;
  updatedAt: Date;
  status: 'processing' | 'ready' | 'failed';
  processingProgress: number;
  sampleDuration?: number;
  fileSize?: number;
  tags: string[];
  isPremium: boolean;
  usageCount: number;
}

export interface VoiceCreationStep {
  step: 'method' | 'upload' | 'record' | 'processing' | 'identity' | 'completed';
  method?: 'upload' | 'record';
  uploadedFile?: File;
  recordedAudio?: Blob;
  processingProgress: number;
  voiceData?: {
    name: string;
    gender: 'Male' | 'Female' | 'Other';
    language: string;
    ageGroup: 'Young' | 'Middle-Aged' | 'Senior';
  };
}

export interface VoiceManagementState {
  voices: CustomVoice[];
  filteredVoices: CustomVoice[];
  searchQuery: string;
  selectedVoice: CustomVoice | null;
  showVoiceOptions: boolean;
  showDeleteConfirmation: boolean;
  showAddVoiceDialog: boolean;
  voiceCreation: VoiceCreationStep;
  isRecording: boolean;
  recordingTime: number;
  isProcessing: boolean;
  isLoading: boolean;
  error: string | null;
}

type VoiceManagementAction =
  | { type: 'SET_VOICES'; payload: CustomVoice[] }
  | { type: 'ADD_VOICE'; payload: CustomVoice }
  | { type: 'UPDATE_VOICE'; payload: { id: string; updates: Partial<CustomVoice> } }
  | { type: 'DELETE_VOICE'; payload: string }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_SELECTED_VOICE'; payload: CustomVoice | null }
  | { type: 'SHOW_VOICE_OPTIONS'; payload: CustomVoice }
  | { type: 'HIDE_VOICE_OPTIONS' }
  | { type: 'SHOW_DELETE_CONFIRMATION'; payload: CustomVoice }
  | { type: 'HIDE_DELETE_CONFIRMATION' }
  | { type: 'SHOW_ADD_VOICE_DIALOG' }
  | { type: 'HIDE_ADD_VOICE_DIALOG' }
  | { type: 'SET_CREATION_STEP'; payload: VoiceCreationStep['step'] }
  | { type: 'SET_CREATION_METHOD'; payload: 'upload' | 'record' }
  | { type: 'SET_UPLOADED_FILE'; payload: File }
  | { type: 'SET_RECORDED_AUDIO'; payload: Blob }
  | { type: 'SET_PROCESSING_PROGRESS'; payload: number }
  | { type: 'SET_VOICE_DATA'; payload: VoiceCreationStep['voiceData'] }
  | { type: 'SET_IS_RECORDING'; payload: boolean }
  | { type: 'SET_RECORDING_TIME'; payload: number }
  | { type: 'SET_IS_PROCESSING'; payload: boolean }
  | { type: 'SET_IS_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_CREATION' }
  | { type: 'FILTER_VOICES' };

const initialState: VoiceManagementState = {
  voices: [],
  filteredVoices: [],
  searchQuery: '',
  selectedVoice: null,
  showVoiceOptions: false,
  showDeleteConfirmation: false,
  showAddVoiceDialog: false,
  voiceCreation: {
    step: 'method',
    processingProgress: 0
  },
  isRecording: false,
  recordingTime: 0,
  isProcessing: false,
  isLoading: false,
  error: null
};

// Mock data for development
const mockVoices: CustomVoice[] = [
  {
    id: '1',
    name: 'Eleanor',
    gender: 'Female',
    ageGroup: 'Young',
    language: 'English - US',
    languageCode: 'en-US',
    avatar: '/avatars/eleanor.jpg',
    audioUrl: '/audio/eleanor-sample.mp3',
    waveformData: Array.from({ length: 40 }, () => Math.random() * 100),
    isProcessed: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    status: 'ready',
    processingProgress: 100,
    sampleDuration: 45,
    fileSize: 2048000,
    tags: ['personal', 'professional'],
    isPremium: false,
    usageCount: 23
  },
  {
    id: '2',
    name: 'Clara',
    gender: 'Female',
    ageGroup: 'Young',
    language: 'English - UK',
    languageCode: 'en-GB',
    avatar: '/avatars/clara.jpg',
    audioUrl: '/audio/clara-sample.mp3',
    waveformData: Array.from({ length: 40 }, () => Math.random() * 100),
    isProcessed: true,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
    status: 'ready',
    processingProgress: 100,
    sampleDuration: 38,
    fileSize: 1856000,
    tags: ['casual', 'friendly'],
    isPremium: true,
    usageCount: 15
  },
  {
    id: '3',
    name: 'Eugene',
    gender: 'Male',
    ageGroup: 'Middle-Aged',
    language: 'English - US',
    languageCode: 'en-US',
    avatar: '/avatars/eugene.jpg',
    audioUrl: '/audio/eugene-sample.mp3',
    waveformData: Array.from({ length: 40 }, () => Math.random() * 100),
    isProcessed: true,
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-08'),
    status: 'ready',
    processingProgress: 100,
    sampleDuration: 52,
    fileSize: 2304000,
    tags: ['business', 'authoritative'],
    isPremium: false,
    usageCount: 31
  },
  {
    id: '4',
    name: 'Walter',
    gender: 'Male',
    ageGroup: 'Middle-Aged',
    language: 'German',
    languageCode: 'de-DE',
    avatar: '/avatars/walter.jpg',
    audioUrl: '/audio/walter-sample.mp3',
    waveformData: Array.from({ length: 40 }, () => Math.random() * 100),
    isProcessed: true,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05'),
    status: 'ready',
    processingProgress: 100,
    sampleDuration: 47,
    fileSize: 2176000,
    tags: ['multilingual', 'professional'],
    isPremium: true,
    usageCount: 18
  },
  {
    id: '5',
    name: 'Dorothy',
    gender: 'Female',
    ageGroup: 'Young',
    language: 'Spanish',
    languageCode: 'es-ES',
    avatar: '/avatars/dorothy.jpg',
    audioUrl: '/audio/dorothy-sample.mp3',
    waveformData: Array.from({ length: 40 }, () => Math.random() * 100),
    isProcessed: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    status: 'ready',
    processingProgress: 100,
    sampleDuration: 41,
    fileSize: 1920000,
    tags: ['energetic', 'youthful'],
    isPremium: false,
    usageCount: 27
  },
  {
    id: '6',
    name: 'Clifford',
    gender: 'Male',
    ageGroup: 'Young',
    language: 'French',
    languageCode: 'fr-FR',
    avatar: '/avatars/clifford.jpg',
    audioUrl: '/audio/clifford-sample.mp3',
    waveformData: Array.from({ length: 40 }, () => Math.random() * 100),
    isProcessed: false,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
    status: 'processing',
    processingProgress: 73,
    sampleDuration: 0,
    fileSize: 0,
    tags: ['processing'],
    isPremium: false,
    usageCount: 0
  }
];

function voiceManagementReducer(
  state: VoiceManagementState,
  action: VoiceManagementAction
): VoiceManagementState {
  switch (action.type) {
    case 'SET_VOICES':
      return {
        ...state,
        voices: action.payload,
        filteredVoices: filterVoices(action.payload, state.searchQuery)
      };

    case 'ADD_VOICE':
      const newVoices = [action.payload, ...state.voices];
      return {
        ...state,
        voices: newVoices,
        filteredVoices: filterVoices(newVoices, state.searchQuery)
      };

    case 'UPDATE_VOICE':
      const updatedVoices = state.voices.map(voice =>
        voice.id === action.payload.id
          ? { ...voice, ...action.payload.updates, updatedAt: new Date() }
          : voice
      );
      return {
        ...state,
        voices: updatedVoices,
        filteredVoices: filterVoices(updatedVoices, state.searchQuery)
      };

    case 'DELETE_VOICE':
      const remainingVoices = state.voices.filter(voice => voice.id !== action.payload);
      return {
        ...state,
        voices: remainingVoices,
        filteredVoices: filterVoices(remainingVoices, state.searchQuery),
        showDeleteConfirmation: false,
        selectedVoice: null
      };

    case 'SET_SEARCH_QUERY':
      return {
        ...state,
        searchQuery: action.payload,
        filteredVoices: filterVoices(state.voices, action.payload)
      };

    case 'SET_SELECTED_VOICE':
      return {
        ...state,
        selectedVoice: action.payload
      };

    case 'SHOW_VOICE_OPTIONS':
      return {
        ...state,
        showVoiceOptions: true,
        selectedVoice: action.payload
      };

    case 'HIDE_VOICE_OPTIONS':
      return {
        ...state,
        showVoiceOptions: false,
        selectedVoice: null
      };

    case 'SHOW_DELETE_CONFIRMATION':
      return {
        ...state,
        showDeleteConfirmation: true,
        selectedVoice: action.payload,
        showVoiceOptions: false
      };

    case 'HIDE_DELETE_CONFIRMATION':
      return {
        ...state,
        showDeleteConfirmation: false,
        selectedVoice: null
      };

    case 'SHOW_ADD_VOICE_DIALOG':
      return {
        ...state,
        showAddVoiceDialog: true
      };

    case 'HIDE_ADD_VOICE_DIALOG':
      return {
        ...state,
        showAddVoiceDialog: false,
        voiceCreation: {
          step: 'method',
          processingProgress: 0
        }
      };

    case 'SET_CREATION_STEP':
      return {
        ...state,
        voiceCreation: {
          ...state.voiceCreation,
          step: action.payload
        }
      };

    case 'SET_CREATION_METHOD':
      return {
        ...state,
        voiceCreation: {
          ...state.voiceCreation,
          method: action.payload
        }
      };

    case 'SET_UPLOADED_FILE':
      return {
        ...state,
        voiceCreation: {
          ...state.voiceCreation,
          uploadedFile: action.payload
        }
      };

    case 'SET_RECORDED_AUDIO':
      return {
        ...state,
        voiceCreation: {
          ...state.voiceCreation,
          recordedAudio: action.payload
        }
      };

    case 'SET_PROCESSING_PROGRESS':
      return {
        ...state,
        voiceCreation: {
          ...state.voiceCreation,
          processingProgress: action.payload
        }
      };

    case 'SET_VOICE_DATA':
      return {
        ...state,
        voiceCreation: {
          ...state.voiceCreation,
          voiceData: action.payload
        }
      };

    case 'SET_IS_RECORDING':
      return {
        ...state,
        isRecording: action.payload
      };

    case 'SET_RECORDING_TIME':
      return {
        ...state,
        recordingTime: action.payload
      };

    case 'SET_IS_PROCESSING':
      return {
        ...state,
        isProcessing: action.payload
      };

    case 'SET_IS_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload
      };

    case 'RESET_CREATION':
      return {
        ...state,
        voiceCreation: {
          step: 'method',
          processingProgress: 0
        },
        isRecording: false,
        recordingTime: 0,
        isProcessing: false
      };

    case 'FILTER_VOICES':
      return {
        ...state,
        filteredVoices: filterVoices(state.voices, state.searchQuery)
      };

    default:
      return state;
  }
}

function filterVoices(voices: CustomVoice[], searchQuery: string): CustomVoice[] {
  if (!searchQuery.trim()) {
    return voices;
  }

  const query = searchQuery.toLowerCase().trim();
  return voices.filter(voice =>
    voice.name.toLowerCase().includes(query) ||
    voice.language.toLowerCase().includes(query) ||
    voice.gender.toLowerCase().includes(query) ||
    voice.ageGroup.toLowerCase().includes(query) ||
    voice.tags.some(tag => tag.toLowerCase().includes(query))
  );
}

interface VoiceManagementContextType {
  state: VoiceManagementState;
  dispatch: React.Dispatch<VoiceManagementAction>;
  // Action helpers
  setSearchQuery: (query: string) => void;
  selectVoice: (voice: CustomVoice) => void;
  showVoiceOptions: (voice: CustomVoice) => void;
  hideVoiceOptions: () => void;
  showDeleteConfirmation: (voice: CustomVoice) => void;
  hideDeleteConfirmation: () => void;
  showAddVoiceDialog: () => void;
  hideAddVoiceDialog: () => void;
  deleteVoice: (voiceId: string) => void;
  updateVoice: (voiceId: string, updates: Partial<CustomVoice>) => void;
  createVoice: (voiceData: VoiceCreationStep['voiceData'], audioSource: File | Blob) => Promise<void>;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  playVoice: (voice: CustomVoice) => Promise<void>;
  duplicateVoice: (voice: CustomVoice) => void;
  shareVoice: (voice: CustomVoice) => Promise<void>;
  exportVoice: (voice: CustomVoice) => Promise<void>;
}

const VoiceManagementContext = createContext<VoiceManagementContextType | undefined>(undefined);

interface VoiceManagementProviderProps {
  children: ReactNode;
}

export const VoiceManagementProvider: React.FC<VoiceManagementProviderProps> = ({
  children
}) => {
  const [state, dispatch] = useReducer(voiceManagementReducer, initialState);

  // Initialize with mock data
  useEffect(() => {
    dispatch({ type: 'SET_VOICES', payload: mockVoices });
  }, []);

  // Action helpers
  const setSearchQuery = (query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  };

  const selectVoice = (voice: CustomVoice) => {
    dispatch({ type: 'SET_SELECTED_VOICE', payload: voice });
  };

  const showVoiceOptions = (voice: CustomVoice) => {
    dispatch({ type: 'SHOW_VOICE_OPTIONS', payload: voice });
  };

  const hideVoiceOptions = () => {
    dispatch({ type: 'HIDE_VOICE_OPTIONS' });
  };

  const showDeleteConfirmation = (voice: CustomVoice) => {
    dispatch({ type: 'SHOW_DELETE_CONFIRMATION', payload: voice });
  };

  const hideDeleteConfirmation = () => {
    dispatch({ type: 'HIDE_DELETE_CONFIRMATION' });
  };

  const showAddVoiceDialog = () => {
    dispatch({ type: 'SHOW_ADD_VOICE_DIALOG' });
  };

  const hideAddVoiceDialog = () => {
    dispatch({ type: 'HIDE_ADD_VOICE_DIALOG' });
  };

  const deleteVoice = (voiceId: string) => {
    dispatch({ type: 'DELETE_VOICE', payload: voiceId });
  };

  const updateVoice = (voiceId: string, updates: Partial<CustomVoice>) => {
    dispatch({ type: 'UPDATE_VOICE', payload: { id: voiceId, updates } });
  };

  const createVoice = async (
    voiceData: VoiceCreationStep['voiceData'],
    audioSource: File | Blob
  ): Promise<void> => {
    if (!voiceData) return;

    dispatch({ type: 'SET_IS_PROCESSING', payload: true });
    dispatch({ type: 'SET_CREATION_STEP', payload: 'processing' });

    try {
      // Simulate voice processing
      for (let progress = 0; progress <= 100; progress += 5) {
        dispatch({ type: 'SET_PROCESSING_PROGRESS', payload: progress });
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Create new voice
      const newVoice: CustomVoice = {
        id: `voice_${Date.now()}`,
        name: voiceData.name,
        gender: voiceData.gender,
        ageGroup: voiceData.ageGroup,
        language: voiceData.language,
        languageCode: 'en-US', // Default for now
        audioUrl: URL.createObjectURL(audioSource),
        waveformData: Array.from({ length: 40 }, () => Math.random() * 100),
        isProcessed: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'ready',
        processingProgress: 100,
        sampleDuration: 45,
        fileSize: audioSource.size,
        tags: ['custom'],
        isPremium: false,
        usageCount: 0
      };

      dispatch({ type: 'ADD_VOICE', payload: newVoice });
      dispatch({ type: 'SET_IS_PROCESSING', payload: false });
      dispatch({ type: 'SET_CREATION_STEP', payload: 'completed' });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create voice. Please try again.' });
      dispatch({ type: 'SET_IS_PROCESSING', payload: false });
    }
  };

  const startRecording = async (): Promise<void> => {
    // Implement recording logic
    dispatch({ type: 'SET_IS_RECORDING', payload: true });
  };

  const stopRecording = () => {
    dispatch({ type: 'SET_IS_RECORDING', payload: false });
  };

  const playVoice = async (voice: CustomVoice): Promise<void> => {
    console.log('Playing voice:', voice.name);
    // Implement voice playback logic
  };

  const duplicateVoice = (voice: CustomVoice) => {
    const duplicatedVoice: CustomVoice = {
      ...voice,
      id: `${voice.id}_copy_${Date.now()}`,
      name: `${voice.name} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
      usageCount: 0
    };
    dispatch({ type: 'ADD_VOICE', payload: duplicatedVoice });
  };

  const shareVoice = async (voice: CustomVoice): Promise<void> => {
    console.log('Sharing voice:', voice.name);
    // Implement sharing logic
  };

  const exportVoice = async (voice: CustomVoice): Promise<void> => {
    console.log('Exporting voice:', voice.name);
    // Implement export logic
  };

  const value: VoiceManagementContextType = {
    state,
    dispatch,
    setSearchQuery,
    selectVoice,
    showVoiceOptions,
    hideVoiceOptions,
    showDeleteConfirmation,
    hideDeleteConfirmation,
    showAddVoiceDialog,
    hideAddVoiceDialog,
    deleteVoice,
    updateVoice,
    createVoice,
    startRecording,
    stopRecording,
    playVoice,
    duplicateVoice,
    shareVoice,
    exportVoice
  };

  return (
    <VoiceManagementContext.Provider value={value}>
      {children}
    </VoiceManagementContext.Provider>
  );
};

export const useVoiceManagement = (): VoiceManagementContextType => {
  const context = useContext(VoiceManagementContext);
  if (!context) {
    throw new Error('useVoiceManagement must be used within a VoiceManagementProvider');
  }
  return context;
};