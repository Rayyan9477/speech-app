import React, { createContext, useContext, useReducer, useCallback } from 'react';

export interface AudioFile {
  id: string;
  file: File;
  name: string;
  url: string;
  duration: number;
  size: number;
  format: string;
  waveformData?: number[];
}

export interface ProcessingJob {
  id: string;
  type: 'voice-change' | 'voice-translate' | 'voice-clone';
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'failed';
  progress: number;
  sourceAudio: AudioFile;
  targetVoice?: string;
  sourceLanguage?: string;
  targetLanguage?: string;
  result?: {
    audioUrl: string;
    waveformData: number[];
    duration: number;
    format: string;
  };
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface VoiceProcessingState {
  currentJob?: ProcessingJob;
  recentJobs: ProcessingJob[];
  uploadProgress: number;
  processingProgress: number;
  availableVoices: {
    id: string;
    name: string;
    language: string;
    gender: string;
    avatar: string;
    sampleUrl: string;
    isPremium: boolean;
  }[];
  selectedVoice?: string;
  isUploading: boolean;
  isProcessing: boolean;
  error?: string;
}

type VoiceProcessingAction =
  | { type: 'START_UPLOAD'; payload: { file: File; jobType: 'voice-change' | 'voice-translate' | 'voice-clone' } }
  | { type: 'UPDATE_UPLOAD_PROGRESS'; payload: number }
  | { type: 'UPLOAD_COMPLETED'; payload: AudioFile }
  | { type: 'UPLOAD_FAILED'; payload: string }
  | { type: 'SELECT_VOICE'; payload: string }
  | { type: 'START_PROCESSING'; payload: ProcessingJob }
  | { type: 'UPDATE_PROCESSING_PROGRESS'; payload: number }
  | { type: 'PROCESSING_COMPLETED'; payload: ProcessingJob['result'] }
  | { type: 'PROCESSING_FAILED'; payload: string }
  | { type: 'SET_AVAILABLE_VOICES'; payload: VoiceProcessingState['availableVoices'] }
  | { type: 'CLEAR_CURRENT_JOB' }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'ADD_TO_RECENT_JOBS'; payload: ProcessingJob };

const initialState: VoiceProcessingState = {
  recentJobs: [],
  uploadProgress: 0,
  processingProgress: 0,
  availableVoices: [],
  isUploading: false,
  isProcessing: false
};

function voiceProcessingReducer(state: VoiceProcessingState, action: VoiceProcessingAction): VoiceProcessingState {
  switch (action.type) {
    case 'START_UPLOAD':
      const newJob: ProcessingJob = {
        id: Date.now().toString(),
        type: action.payload.jobType,
        status: 'uploading',
        progress: 0,
        sourceAudio: {
          id: Date.now().toString(),
          file: action.payload.file,
          name: action.payload.file.name,
          url: URL.createObjectURL(action.payload.file),
          duration: 0,
          size: action.payload.file.size,
          format: action.payload.file.type
        },
        createdAt: new Date()
      };

      return {
        ...state,
        currentJob: newJob,
        isUploading: true,
        uploadProgress: 0,
        error: undefined
      };

    case 'UPDATE_UPLOAD_PROGRESS':
      return {
        ...state,
        uploadProgress: action.payload,
        currentJob: state.currentJob ? {
          ...state.currentJob,
          progress: action.payload
        } : state.currentJob
      };

    case 'UPLOAD_COMPLETED':
      return {
        ...state,
        isUploading: false,
        uploadProgress: 100,
        currentJob: state.currentJob ? {
          ...state.currentJob,
          status: 'idle',
          sourceAudio: action.payload,
          progress: 100
        } : state.currentJob
      };

    case 'UPLOAD_FAILED':
      return {
        ...state,
        isUploading: false,
        uploadProgress: 0,
        currentJob: state.currentJob ? {
          ...state.currentJob,
          status: 'failed',
          error: action.payload
        } : state.currentJob,
        error: action.payload
      };

    case 'SELECT_VOICE':
      return {
        ...state,
        selectedVoice: action.payload,
        currentJob: state.currentJob ? {
          ...state.currentJob,
          targetVoice: action.payload
        } : state.currentJob
      };

    case 'START_PROCESSING':
      return {
        ...state,
        currentJob: action.payload,
        isProcessing: true,
        processingProgress: 0,
        error: undefined
      };

    case 'UPDATE_PROCESSING_PROGRESS':
      return {
        ...state,
        processingProgress: action.payload,
        currentJob: state.currentJob ? {
          ...state.currentJob,
          progress: action.payload
        } : state.currentJob
      };

    case 'PROCESSING_COMPLETED':
      const completedJob = state.currentJob ? {
        ...state.currentJob,
        status: 'completed' as const,
        result: action.payload,
        progress: 100,
        completedAt: new Date()
      } : undefined;

      return {
        ...state,
        isProcessing: false,
        processingProgress: 100,
        currentJob: completedJob,
        recentJobs: completedJob ? [completedJob, ...state.recentJobs.slice(0, 9)] : state.recentJobs
      };

    case 'PROCESSING_FAILED':
      const failedJob = state.currentJob ? {
        ...state.currentJob,
        status: 'failed' as const,
        error: action.payload,
        completedAt: new Date()
      } : undefined;

      return {
        ...state,
        isProcessing: false,
        processingProgress: 0,
        currentJob: failedJob,
        error: action.payload,
        recentJobs: failedJob ? [failedJob, ...state.recentJobs.slice(0, 9)] : state.recentJobs
      };

    case 'SET_AVAILABLE_VOICES':
      return {
        ...state,
        availableVoices: action.payload
      };

    case 'CLEAR_CURRENT_JOB':
      return {
        ...state,
        currentJob: undefined,
        selectedVoice: undefined,
        uploadProgress: 0,
        processingProgress: 0,
        isUploading: false,
        isProcessing: false,
        error: undefined
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isUploading: false,
        isProcessing: false
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: undefined
      };

    case 'ADD_TO_RECENT_JOBS':
      return {
        ...state,
        recentJobs: [action.payload, ...state.recentJobs.slice(0, 9)]
      };

    default:
      return state;
  }
}

interface VoiceProcessingContextType {
  state: VoiceProcessingState;
  dispatch: React.Dispatch<VoiceProcessingAction>;
  
  // Upload methods
  startUpload: (file: File, jobType: 'voice-change' | 'voice-translate' | 'voice-clone') => Promise<void>;
  
  // Voice processing methods
  selectVoice: (voiceId: string) => void;
  startVoiceChange: (audioFile: AudioFile, targetVoiceId: string) => Promise<void>;
  startVoiceTranslation: (audioFile: AudioFile, targetLanguage: string, targetVoiceId: string) => Promise<void>;
  startVoiceCloning: (audioFiles: AudioFile[], voiceName: string) => Promise<void>;
  
  // Utility methods
  loadAvailableVoices: () => Promise<void>;
  clearCurrentJob: () => void;
  clearError: () => void;
  downloadResult: (jobId: string) => Promise<void>;
  shareResult: (jobId: string) => Promise<void>;
}

const VoiceProcessingContext = createContext<VoiceProcessingContextType | undefined>(undefined);

export function useVoiceProcessing() {
  const context = useContext(VoiceProcessingContext);
  if (context === undefined) {
    throw new Error('useVoiceProcessing must be used within a VoiceProcessingProvider');
  }
  return context;
}

interface VoiceProcessingProviderProps {
  children: React.ReactNode;
}

export function VoiceProcessingProvider({ children }: VoiceProcessingProviderProps) {
  const [state, dispatch] = useReducer(voiceProcessingReducer, initialState);

  const startUpload = useCallback(async (file: File, jobType: 'voice-change' | 'voice-translate' | 'voice-clone') => {
    dispatch({ type: 'START_UPLOAD', payload: { file, jobType } });
    
    try {
      // Simulate file upload with progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        dispatch({ type: 'UPDATE_UPLOAD_PROGRESS', payload: progress });
      }

      // Extract audio metadata (mock)
      const audioFile: AudioFile = {
        id: Date.now().toString(),
        file,
        name: file.name,
        url: URL.createObjectURL(file),
        duration: 120, // Mock duration
        size: file.size,
        format: file.type,
        waveformData: generateMockWaveform()
      };

      dispatch({ type: 'UPLOAD_COMPLETED', payload: audioFile });
    } catch (error) {
      dispatch({ type: 'UPLOAD_FAILED', payload: error instanceof Error ? error.message : 'Upload failed' });
    }
  }, []);

  const selectVoice = useCallback((voiceId: string) => {
    dispatch({ type: 'SELECT_VOICE', payload: voiceId });
  }, []);

  const startVoiceChange = useCallback(async (audioFile: AudioFile, targetVoiceId: string) => {
    if (!state.currentJob) return;

    const processingJob: ProcessingJob = {
      ...state.currentJob,
      status: 'processing',
      targetVoice: targetVoiceId,
      progress: 0
    };

    dispatch({ type: 'START_PROCESSING', payload: processingJob });

    try {
      // Simulate processing with progress
      for (let progress = 0; progress <= 90; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 500));
        dispatch({ type: 'UPDATE_PROCESSING_PROGRESS', payload: progress });
      }

      // Final processing step
      await new Promise(resolve => setTimeout(resolve, 1000));

      const result = {
        audioUrl: `/mock-results/${Date.now()}.mp3`,
        waveformData: generateMockWaveform(),
        duration: audioFile.duration,
        format: 'audio/mp3'
      };

      dispatch({ type: 'PROCESSING_COMPLETED', payload: result });
    } catch (error) {
      dispatch({ type: 'PROCESSING_FAILED', payload: error instanceof Error ? error.message : 'Processing failed' });
    }
  }, [state.currentJob]);

  const startVoiceTranslation = useCallback(async (audioFile: AudioFile, targetLanguage: string, targetVoiceId: string) => {
    if (!state.currentJob) return;

    const processingJob: ProcessingJob = {
      ...state.currentJob,
      status: 'processing',
      targetLanguage,
      targetVoice: targetVoiceId,
      progress: 0
    };

    dispatch({ type: 'START_PROCESSING', payload: processingJob });

    try {
      // Simulate processing (translation takes longer)
      for (let progress = 0; progress <= 85; progress += 5) {
        await new Promise(resolve => setTimeout(resolve, 700));
        dispatch({ type: 'UPDATE_PROCESSING_PROGRESS', payload: progress });
      }

      await new Promise(resolve => setTimeout(resolve, 1500));

      const result = {
        audioUrl: `/mock-results/translated-${Date.now()}.mp3`,
        waveformData: generateMockWaveform(),
        duration: audioFile.duration * 1.2, // Translation might be slightly longer
        format: 'audio/mp3'
      };

      dispatch({ type: 'PROCESSING_COMPLETED', payload: result });
    } catch (error) {
      dispatch({ type: 'PROCESSING_FAILED', payload: error instanceof Error ? error.message : 'Translation failed' });
    }
  }, [state.currentJob]);

  const startVoiceCloning = useCallback(async (audioFiles: AudioFile[], voiceName: string) => {
    // Voice cloning implementation would be different
    console.log('Voice cloning not implemented in this context');
  }, []);

  const loadAvailableVoices = useCallback(async () => {
    try {
      // Mock data - replace with actual API call
      const voices = await generateMockVoices();
      dispatch({ type: 'SET_AVAILABLE_VOICES', payload: voices });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load voices' });
    }
  }, []);

  const clearCurrentJob = useCallback(() => {
    dispatch({ type: 'CLEAR_CURRENT_JOB' });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const downloadResult = useCallback(async (jobId: string) => {
    const job = state.recentJobs.find(j => j.id === jobId) || state.currentJob;
    if (job?.result) {
      // Mock download
      const link = document.createElement('a');
      link.href = job.result.audioUrl;
      link.download = `${job.type}-result-${jobId}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [state.recentJobs, state.currentJob]);

  const shareResult = useCallback(async (jobId: string) => {
    const job = state.recentJobs.find(j => j.id === jobId) || state.currentJob;
    if (job?.result && navigator.share) {
      try {
        await navigator.share({
          title: `My ${job.type} result`,
          text: `Check out this ${job.type} I created!`,
          url: job.result.audioUrl
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    }
  }, [state.recentJobs, state.currentJob]);

  const value: VoiceProcessingContextType = {
    state,
    dispatch,
    startUpload,
    selectVoice,
    startVoiceChange,
    startVoiceTranslation,
    startVoiceCloning,
    loadAvailableVoices,
    clearCurrentJob,
    clearError,
    downloadResult,
    shareResult
  };

  return (
    <VoiceProcessingContext.Provider value={value}>
      {children}
    </VoiceProcessingContext.Provider>
  );
}

// Mock data generators
function generateMockWaveform(): number[] {
  return Array.from({ length: 1000 }, () => (Math.random() - 0.5) * 2);
}

async function generateMockVoices() {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return [
    {
      id: 'voice-1',
      name: 'Emma Thompson',
      language: 'English (US)',
      gender: 'Female',
      avatar: '/api/placeholder/48/48',
      sampleUrl: '/mock-samples/emma.mp3',
      isPremium: false
    },
    {
      id: 'voice-2',
      name: 'Marcus Johnson',
      language: 'English (US)',
      gender: 'Male',
      avatar: '/api/placeholder/48/48',
      sampleUrl: '/mock-samples/marcus.mp3',
      isPremium: true
    },
    {
      id: 'voice-3',
      name: 'Sofia Rodriguez',
      language: 'Spanish',
      gender: 'Female',
      avatar: '/api/placeholder/48/48',
      sampleUrl: '/mock-samples/sofia.mp3',
      isPremium: false
    },
    {
      id: 'voice-4',
      name: 'Antoine Dubois',
      language: 'French',
      gender: 'Male',
      avatar: '/api/placeholder/48/48',
      sampleUrl: '/mock-samples/antoine.mp3',
      isPremium: true
    }
  ];
}