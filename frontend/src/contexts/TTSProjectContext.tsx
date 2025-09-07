import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';

export interface Voice {
  id: string;
  name: string;
  gender: string;
  language: string;
  avatar: string;
  isPremium: boolean;
  provider?: string;
  style?: string;
}

export interface TextBlock {
  id: string;
  content: string;
  voice: Voice;
  isPlaying: boolean;
  duration: number;
  audioUrl?: string;
  waveformData?: number[];
  order: number;
}

export interface AudioSettings {
  pitch: number;
  speed: number;
  pause: number;
  volume: number;
}

export interface ProjectMetadata {
  id: string;
  title: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  totalDuration: number;
  wordCount: number;
}

export interface TTSProjectState {
  metadata: ProjectMetadata;
  textBlocks: TextBlock[];
  selectedVoice: Voice;
  audioSettings: AudioSettings;
  selectedBlockId?: string;
  isGenerating: boolean;
  generationProgress: number;
  error?: string;
  voiceLibrary: {
    aiVoices: Voice[];
    myVoices: Voice[];
    favoriteVoices: Voice[];
  };
  exportSettings: {
    format: 'mp3' | 'wav' | 'aac' | 'flac';
    quality: 'high' | 'medium' | 'low';
    includeTimestamps: boolean;
  };
}

type TTSProjectAction =
  | { type: 'SET_PROJECT_TITLE'; payload: string }
  | { type: 'ADD_TEXT_BLOCK'; payload: Partial<TextBlock> }
  | { type: 'UPDATE_TEXT_BLOCK'; payload: { id: string; updates: Partial<TextBlock> } }
  | { type: 'REMOVE_TEXT_BLOCK'; payload: string }
  | { type: 'REORDER_TEXT_BLOCKS'; payload: TextBlock[] }
  | { type: 'SELECT_VOICE'; payload: Voice }
  | { type: 'SELECT_BLOCK'; payload: string }
  | { type: 'UPDATE_AUDIO_SETTINGS'; payload: Partial<AudioSettings> }
  | { type: 'SET_GENERATION_STATE'; payload: { isGenerating: boolean; progress: number } }
  | { type: 'SET_BLOCK_AUDIO'; payload: { blockId: string; audioUrl: string; waveformData: number[] } }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_VOICE_LIBRARY'; payload: Partial<TTSProjectState['voiceLibrary']> }
  | { type: 'UPDATE_EXPORT_SETTINGS'; payload: Partial<TTSProjectState['exportSettings']> }
  | { type: 'LOAD_PROJECT'; payload: TTSProjectState }
  | { type: 'RESET_PROJECT' };

const defaultVoice: Voice = {
  id: '1',
  name: 'Olivia',
  gender: 'F',
  language: 'English',
  avatar: '/api/placeholder/48/48',
  isPremium: false,
  provider: 'default',
  style: 'Natural'
};

const initialState: TTSProjectState = {
  metadata: {
    id: '',
    title: 'New TTS Project',
    createdAt: new Date(),
    updatedAt: new Date(),
    totalDuration: 0,
    wordCount: 0
  },
  textBlocks: [
    {
      id: '1',
      content: 'Enter your text here...',
      voice: defaultVoice,
      isPlaying: false,
      duration: 0,
      order: 0
    }
  ],
  selectedVoice: defaultVoice,
  audioSettings: {
    pitch: 0,
    speed: 0,
    pause: 0,
    volume: 0.8
  },
  isGenerating: false,
  generationProgress: 0,
  voiceLibrary: {
    aiVoices: [
      defaultVoice,
      {
        id: '2',
        name: 'Marcus',
        gender: 'M',
        language: 'English',
        avatar: '/api/placeholder/48/48',
        isPremium: true,
        provider: 'default',
        style: 'Professional'
      },
      {
        id: '3',
        name: 'Luna',
        gender: 'F',
        language: 'Spanish',
        avatar: '/api/placeholder/48/48',
        isPremium: false,
        provider: 'default',
        style: 'Friendly'
      }
    ],
    myVoices: [
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
    favoriteVoices: [defaultVoice]
  },
  exportSettings: {
    format: 'mp3',
    quality: 'high',
    includeTimestamps: false
  }
};

function ttsProjectReducer(state: TTSProjectState, action: TTSProjectAction): TTSProjectState {
  switch (action.type) {
    case 'SET_PROJECT_TITLE':
      return {
        ...state,
        metadata: {
          ...state.metadata,
          title: action.payload,
          updatedAt: new Date()
        }
      };

    case 'ADD_TEXT_BLOCK':
      const newBlock: TextBlock = {
        id: Date.now().toString(),
        content: action.payload.content || 'Enter your text here...',
        voice: action.payload.voice || state.selectedVoice,
        isPlaying: false,
        duration: 0,
        order: state.textBlocks.length,
        ...action.payload
      };
      return {
        ...state,
        textBlocks: [...state.textBlocks, newBlock],
        metadata: {
          ...state.metadata,
          updatedAt: new Date()
        }
      };

    case 'UPDATE_TEXT_BLOCK':
      return {
        ...state,
        textBlocks: state.textBlocks.map(block =>
          block.id === action.payload.id
            ? { ...block, ...action.payload.updates }
            : block
        ),
        metadata: {
          ...state.metadata,
          updatedAt: new Date()
        }
      };

    case 'REMOVE_TEXT_BLOCK':
      if (state.textBlocks.length <= 1) return state;
      return {
        ...state,
        textBlocks: state.textBlocks.filter(block => block.id !== action.payload),
        selectedBlockId: state.selectedBlockId === action.payload ? undefined : state.selectedBlockId,
        metadata: {
          ...state.metadata,
          updatedAt: new Date()
        }
      };

    case 'REORDER_TEXT_BLOCKS':
      return {
        ...state,
        textBlocks: action.payload.map((block, index) => ({
          ...block,
          order: index
        })),
        metadata: {
          ...state.metadata,
          updatedAt: new Date()
        }
      };

    case 'SELECT_VOICE':
      return {
        ...state,
        selectedVoice: action.payload,
        metadata: {
          ...state.metadata,
          updatedAt: new Date()
        }
      };

    case 'SELECT_BLOCK':
      return {
        ...state,
        selectedBlockId: action.payload
      };

    case 'UPDATE_AUDIO_SETTINGS':
      return {
        ...state,
        audioSettings: {
          ...state.audioSettings,
          ...action.payload
        },
        metadata: {
          ...state.metadata,
          updatedAt: new Date()
        }
      };

    case 'SET_GENERATION_STATE':
      return {
        ...state,
        isGenerating: action.payload.isGenerating,
        generationProgress: action.payload.progress,
        error: action.payload.isGenerating ? undefined : state.error
      };

    case 'SET_BLOCK_AUDIO':
      return {
        ...state,
        textBlocks: state.textBlocks.map(block =>
          block.id === action.payload.blockId
            ? {
                ...block,
                audioUrl: action.payload.audioUrl,
                waveformData: action.payload.waveformData,
                duration: action.payload.waveformData.length / 44100 // Approximate duration
              }
            : block
        ),
        metadata: {
          ...state.metadata,
          updatedAt: new Date(),
          totalDuration: state.textBlocks.reduce((total, block) => 
            total + (block.id === action.payload.blockId 
              ? action.payload.waveformData.length / 44100 
              : block.duration), 0)
        }
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isGenerating: false
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: undefined
      };

    case 'UPDATE_VOICE_LIBRARY':
      return {
        ...state,
        voiceLibrary: {
          ...state.voiceLibrary,
          ...action.payload
        }
      };

    case 'UPDATE_EXPORT_SETTINGS':
      return {
        ...state,
        exportSettings: {
          ...state.exportSettings,
          ...action.payload
        }
      };

    case 'LOAD_PROJECT':
      return {
        ...action.payload,
        metadata: {
          ...action.payload.metadata,
          updatedAt: new Date()
        }
      };

    case 'RESET_PROJECT':
      return {
        ...initialState,
        metadata: {
          ...initialState.metadata,
          id: Date.now().toString(),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      };

    default:
      return state;
  }
}

interface TTSProjectContextType {
  state: TTSProjectState;
  dispatch: React.Dispatch<TTSProjectAction>;
  
  // Convenience methods
  setProjectTitle: (title: string) => void;
  addTextBlock: (block?: Partial<TextBlock>) => void;
  updateTextBlock: (id: string, updates: Partial<TextBlock>) => void;
  removeTextBlock: (id: string) => void;
  reorderTextBlocks: (blocks: TextBlock[]) => void;
  selectVoice: (voice: Voice) => void;
  selectBlock: (blockId: string) => void;
  updateAudioSettings: (settings: Partial<AudioSettings>) => void;
  generateAudioForBlock: (blockId: string) => Promise<void>;
  generateAudioForAllBlocks: () => Promise<void>;
  exportProject: () => Promise<void>;
  saveProject: () => Promise<void>;
  loadProject: (projectId: string) => Promise<void>;
  resetProject: () => void;
}

const TTSProjectContext = createContext<TTSProjectContextType | undefined>(undefined);

export function useTTSProject() {
  const context = useContext(TTSProjectContext);
  if (context === undefined) {
    throw new Error('useTTSProject must be used within a TTSProjectProvider');
  }
  return context;
}

interface TTSProjectProviderProps {
  children: React.ReactNode;
  initialProjectId?: string;
}

export function TTSProjectProvider({ children, initialProjectId }: TTSProjectProviderProps) {
  const [state, dispatch] = useReducer(ttsProjectReducer, initialState);

  // Auto-save functionality
  useEffect(() => {
    const autoSave = () => {
      if (state.metadata.id && state.metadata.title !== 'New TTS Project') {
        localStorage.setItem(`tts-project-${state.metadata.id}`, JSON.stringify(state));
      }
    };

    const timeoutId = setTimeout(autoSave, 2000);
    return () => clearTimeout(timeoutId);
  }, [state]);

  // Load initial project
  useEffect(() => {
    if (initialProjectId) {
      loadProject(initialProjectId);
    }
  }, [initialProjectId, loadProject]);

  // Convenience methods
  const setProjectTitle = useCallback((title: string) => {
    dispatch({ type: 'SET_PROJECT_TITLE', payload: title });
  }, []);

  const addTextBlock = useCallback((block?: Partial<TextBlock>) => {
    dispatch({ type: 'ADD_TEXT_BLOCK', payload: block || {} });
  }, []);

  const updateTextBlock = useCallback((id: string, updates: Partial<TextBlock>) => {
    dispatch({ type: 'UPDATE_TEXT_BLOCK', payload: { id, updates } });
  }, []);

  const removeTextBlock = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_TEXT_BLOCK', payload: id });
  }, []);

  const reorderTextBlocks = useCallback((blocks: TextBlock[]) => {
    dispatch({ type: 'REORDER_TEXT_BLOCKS', payload: blocks });
  }, []);

  const selectVoice = useCallback((voice: Voice) => {
    dispatch({ type: 'SELECT_VOICE', payload: voice });
  }, []);

  const selectBlock = useCallback((blockId: string) => {
    dispatch({ type: 'SELECT_BLOCK', payload: blockId });
  }, []);

  const updateAudioSettings = useCallback((settings: Partial<AudioSettings>) => {
    dispatch({ type: 'UPDATE_AUDIO_SETTINGS', payload: settings });
  }, []);

  const generateAudioForBlock = useCallback(async (blockId: string) => {
    const block = state.textBlocks.find(b => b.id === blockId);
    if (!block) return;

    dispatch({ type: 'SET_GENERATION_STATE', payload: { isGenerating: true, progress: 0 } });
    
    try {
      // Mock TTS API call - replace with actual implementation
      const response = await mockTTSGeneration(block.content, block.voice, state.audioSettings);
      
      dispatch({
        type: 'SET_BLOCK_AUDIO',
        payload: {
          blockId,
          audioUrl: response.audioUrl,
          waveformData: response.waveformData
        }
      });
      
      dispatch({ type: 'SET_GENERATION_STATE', payload: { isGenerating: false, progress: 100 } });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Generation failed' });
    }
  }, [state.textBlocks, state.audioSettings]);

  const generateAudioForAllBlocks = useCallback(async () => {
    dispatch({ type: 'SET_GENERATION_STATE', payload: { isGenerating: true, progress: 0 } });
    
    try {
      for (let i = 0; i < state.textBlocks.length; i++) {
        const block = state.textBlocks[i];
        const progress = (i / state.textBlocks.length) * 100;
        
        dispatch({ type: 'SET_GENERATION_STATE', payload: { isGenerating: true, progress } });
        
        const response = await mockTTSGeneration(block.content, block.voice, state.audioSettings);
        
        dispatch({
          type: 'SET_BLOCK_AUDIO',
          payload: {
            blockId: block.id,
            audioUrl: response.audioUrl,
            waveformData: response.waveformData
          }
        });
      }
      
      dispatch({ type: 'SET_GENERATION_STATE', payload: { isGenerating: false, progress: 100 } });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Generation failed' });
    }
  }, [state.textBlocks, state.audioSettings]);

  const exportProject = useCallback(async () => {
    // Implementation for project export
    console.log('Exporting project:', state.exportSettings);
  }, [state.exportSettings]);

  const saveProject = useCallback(async () => {
    const projectData = JSON.stringify(state);
    localStorage.setItem(`tts-project-${state.metadata.id}`, projectData);
    
    // Could also save to backend API
    console.log('Project saved:', state.metadata.title);
  }, [state]);

  const loadProject = useCallback(async (projectId: string) => {
    try {
      const savedData = localStorage.getItem(`tts-project-${projectId}`);
      if (savedData) {
        const projectState = JSON.parse(savedData);
        dispatch({ type: 'LOAD_PROJECT', payload: projectState });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load project' });
    }
  }, []);

  const resetProject = useCallback(() => {
    dispatch({ type: 'RESET_PROJECT' });
  }, []);

  const value: TTSProjectContextType = {
    state,
    dispatch,
    setProjectTitle,
    addTextBlock,
    updateTextBlock,
    removeTextBlock,
    reorderTextBlocks,
    selectVoice,
    selectBlock,
    updateAudioSettings,
    generateAudioForBlock,
    generateAudioForAllBlocks,
    exportProject,
    saveProject,
    loadProject,
    resetProject
  };

  return (
    <TTSProjectContext.Provider value={value}>
      {children}
    </TTSProjectContext.Provider>
  );
}

// Mock TTS generation function - replace with actual API integration
async function mockTTSGeneration(
  text: string, 
  voice: Voice, 
  settings: AudioSettings
): Promise<{ audioUrl: string; waveformData: number[] }> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Generate mock waveform data
  const waveformData = Array.from({ length: 1000 }, () => Math.random() * 2 - 1);
  
  return {
    audioUrl: `/api/tts/audio/${Date.now()}.mp3`,
    waveformData
  };
}