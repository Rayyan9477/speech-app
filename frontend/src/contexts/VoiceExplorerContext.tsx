import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';

export interface Voice {
  id: string;
  name: string;
  gender: 'M' | 'F' | 'Other';
  language: string;
  languageCode: string;
  accent?: string;
  ageGroup: 'child' | 'teen' | 'adult' | 'senior';
  style: string;
  category: 'natural' | 'professional' | 'emotional' | 'character' | 'celebrity';
  avatar: string;
  isPremium: boolean;
  provider: string;
  sampleUrl?: string;
  description?: string;
  tags: string[];
  rating: number;
  usageCount: number;
  isNew?: boolean;
  isFavorite?: boolean;
}

export interface VoiceFilters {
  languages: string[];
  genders: string[];
  ageGroups: string[];
  styles: string[];
  categories: string[];
  providers: string[];
  isPremium?: boolean;
  rating?: number;
}

export interface VoiceExplorerState {
  voices: Voice[];
  filteredVoices: Voice[];
  favorites: Set<string>;
  searchQuery: string;
  filters: VoiceFilters;
  isFilterOpen: boolean;
  previewingVoice: string | null;
  viewMode: 'grid' | 'list';
  sortBy: 'name' | 'rating' | 'usage' | 'recent';
  sortOrder: 'asc' | 'desc';
  loading: boolean;
  error?: string;
  hasMore: boolean;
  page: number;
}

type VoiceExplorerAction =
  | { type: 'SET_VOICES'; payload: Voice[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'UPDATE_FILTERS'; payload: Partial<VoiceFilters> }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'TOGGLE_FILTER_PANEL'; payload?: boolean }
  | { type: 'TOGGLE_FAVORITE'; payload: string }
  | { type: 'SET_PREVIEWING_VOICE'; payload: string | null }
  | { type: 'SET_VIEW_MODE'; payload: 'grid' | 'list' }
  | { type: 'SET_SORT'; payload: { sortBy: string; sortOrder: 'asc' | 'desc' } }
  | { type: 'LOAD_MORE_VOICES'; payload: Voice[] }
  | { type: 'APPLY_FILTERS_AND_SEARCH' };

const initialFilters: VoiceFilters = {
  languages: [],
  genders: [],
  ageGroups: [],
  styles: [],
  categories: [],
  providers: []
};

const initialState: VoiceExplorerState = {
  voices: [],
  filteredVoices: [],
  favorites: new Set(),
  searchQuery: '',
  filters: initialFilters,
  isFilterOpen: false,
  previewingVoice: null,
  viewMode: 'grid',
  sortBy: 'rating',
  sortOrder: 'desc',
  loading: false,
  hasMore: true,
  page: 1
};

function voiceExplorerReducer(state: VoiceExplorerState, action: VoiceExplorerAction): VoiceExplorerState {
  switch (action.type) {
    case 'SET_VOICES':
      return {
        ...state,
        voices: action.payload,
        filteredVoices: action.payload,
        loading: false
      };

    case 'LOAD_MORE_VOICES':
      const newVoices = [...state.voices, ...action.payload];
      return {
        ...state,
        voices: newVoices,
        page: state.page + 1,
        hasMore: action.payload.length > 0,
        loading: false
      };

    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: undefined
      };

    case 'SET_SEARCH_QUERY':
      return {
        ...state,
        searchQuery: action.payload
      };

    case 'UPDATE_FILTERS':
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload
        }
      };

    case 'CLEAR_FILTERS':
      return {
        ...state,
        filters: initialFilters,
        searchQuery: ''
      };

    case 'TOGGLE_FILTER_PANEL':
      return {
        ...state,
        isFilterOpen: action.payload !== undefined ? action.payload : !state.isFilterOpen
      };

    case 'TOGGLE_FAVORITE':
      const newFavorites = new Set(state.favorites);
      if (newFavorites.has(action.payload)) {
        newFavorites.delete(action.payload);
      } else {
        newFavorites.add(action.payload);
      }
      
      return {
        ...state,
        favorites: newFavorites,
        voices: state.voices.map(voice => 
          voice.id === action.payload 
            ? { ...voice, isFavorite: newFavorites.has(voice.id) }
            : voice
        ),
        filteredVoices: state.filteredVoices.map(voice => 
          voice.id === action.payload 
            ? { ...voice, isFavorite: newFavorites.has(voice.id) }
            : voice
        )
      };

    case 'SET_PREVIEWING_VOICE':
      return {
        ...state,
        previewingVoice: action.payload
      };

    case 'SET_VIEW_MODE':
      return {
        ...state,
        viewMode: action.payload
      };

    case 'SET_SORT':
      return {
        ...state,
        sortBy: action.payload.sortBy as any,
        sortOrder: action.payload.sortOrder
      };

    case 'APPLY_FILTERS_AND_SEARCH':
      let filtered = [...state.voices];

      // Apply search query
      if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        filtered = filtered.filter(voice =>
          voice.name.toLowerCase().includes(query) ||
          voice.language.toLowerCase().includes(query) ||
          voice.style.toLowerCase().includes(query) ||
          voice.tags.some(tag => tag.toLowerCase().includes(query))
        );
      }

      // Apply filters
      if (state.filters.languages.length > 0) {
        filtered = filtered.filter(voice => 
          state.filters.languages.includes(voice.languageCode)
        );
      }

      if (state.filters.genders.length > 0) {
        filtered = filtered.filter(voice => 
          state.filters.genders.includes(voice.gender)
        );
      }

      if (state.filters.ageGroups.length > 0) {
        filtered = filtered.filter(voice => 
          state.filters.ageGroups.includes(voice.ageGroup)
        );
      }

      if (state.filters.categories.length > 0) {
        filtered = filtered.filter(voice => 
          state.filters.categories.includes(voice.category)
        );
      }

      if (state.filters.providers.length > 0) {
        filtered = filtered.filter(voice => 
          state.filters.providers.includes(voice.provider)
        );
      }

      if (state.filters.isPremium !== undefined) {
        filtered = filtered.filter(voice => voice.isPremium === state.filters.isPremium);
      }

      if (state.filters.rating) {
        filtered = filtered.filter(voice => voice.rating >= state.filters.rating!);
      }

      // Apply sorting
      filtered.sort((a, b) => {
        let comparison = 0;
        
        switch (state.sortBy) {
          case 'name':
            comparison = a.name.localeCompare(b.name);
            break;
          case 'rating':
            comparison = a.rating - b.rating;
            break;
          case 'usage':
            comparison = a.usageCount - b.usageCount;
            break;
          case 'recent':
            comparison = (a.isNew ? 1 : 0) - (b.isNew ? 1 : 0);
            break;
          default:
            comparison = 0;
        }

        return state.sortOrder === 'desc' ? -comparison : comparison;
      });

      return {
        ...state,
        filteredVoices: filtered
      };

    default:
      return state;
  }
}

interface VoiceExplorerContextType {
  state: VoiceExplorerState;
  dispatch: React.Dispatch<VoiceExplorerAction>;
  
  // Convenience methods
  loadVoices: () => Promise<void>;
  loadMoreVoices: () => Promise<void>;
  searchVoices: (query: string) => void;
  updateFilters: (filters: Partial<VoiceFilters>) => void;
  clearFilters: () => void;
  toggleFilterPanel: (open?: boolean) => void;
  toggleFavorite: (voiceId: string) => Promise<void>;
  previewVoice: (voiceId: string) => void;
  stopPreview: () => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  setSorting: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  getFilterOptions: () => {
    languages: Array<{code: string, name: string, count: number}>;
    genders: Array<{value: string, label: string, count: number}>;
    ageGroups: Array<{value: string, label: string, count: number}>;
    categories: Array<{value: string, label: string, count: number}>;
    providers: Array<{value: string, label: string, count: number}>;
  };
}

const VoiceExplorerContext = createContext<VoiceExplorerContextType | undefined>(undefined);

export function useVoiceExplorer() {
  const context = useContext(VoiceExplorerContext);
  if (context === undefined) {
    throw new Error('useVoiceExplorer must be used within a VoiceExplorerProvider');
  }
  return context;
}

interface VoiceExplorerProviderProps {
  children: React.ReactNode;
}

export function VoiceExplorerProvider({ children }: VoiceExplorerProviderProps) {
  const [state, dispatch] = useReducer(voiceExplorerReducer, initialState);

  // Load favorites from localStorage on mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('voice-favorites');
    if (savedFavorites) {
      try {
        const favorites = JSON.parse(savedFavorites);
        favorites.forEach((voiceId: string) => {
          dispatch({ type: 'TOGGLE_FAVORITE', payload: voiceId });
        });
      } catch (error) {
        console.error('Failed to load favorites:', error);
      }
    }
  }, []);

  // Save favorites to localStorage when they change
  useEffect(() => {
    localStorage.setItem('voice-favorites', JSON.stringify(Array.from(state.favorites)));
  }, [state.favorites]);

  // Apply filters and search when they change
  useEffect(() => {
    dispatch({ type: 'APPLY_FILTERS_AND_SEARCH' });
  }, [state.searchQuery, state.filters, state.voices, state.sortBy, state.sortOrder]);

  const loadVoices = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });
    
    try {
      // Mock data for development - replace with actual API call
      const mockVoices = await generateMockVoices();
      dispatch({ type: 'SET_VOICES', payload: mockVoices });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to load voices' });
    }
  }, []);

  const loadMoreVoices = useCallback(async () => {
    if (state.loading || !state.hasMore) return;
    
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Mock pagination - replace with actual API call
      const moreVoices = await generateMockVoices(state.page + 1);
      dispatch({ type: 'LOAD_MORE_VOICES', payload: moreVoices });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to load more voices' });
    }
  }, [state.loading, state.hasMore, state.page]);

  const searchVoices = useCallback((query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  }, []);

  const updateFilters = useCallback((filters: Partial<VoiceFilters>) => {
    dispatch({ type: 'UPDATE_FILTERS', payload: filters });
  }, []);

  const clearFilters = useCallback(() => {
    dispatch({ type: 'CLEAR_FILTERS' });
  }, []);

  const toggleFilterPanel = useCallback((open?: boolean) => {
    dispatch({ type: 'TOGGLE_FILTER_PANEL', payload: open });
  }, []);

  const toggleFavorite = useCallback(async (voiceId: string) => {
    try {
      // Mock API call - replace with actual endpoint
      await mockToggleFavorite(voiceId);
      dispatch({ type: 'TOGGLE_FAVORITE', payload: voiceId });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update favorite' });
    }
  }, []);

  const previewVoice = useCallback((voiceId: string) => {
    dispatch({ type: 'SET_PREVIEWING_VOICE', payload: voiceId });
  }, []);

  const stopPreview = useCallback(() => {
    dispatch({ type: 'SET_PREVIEWING_VOICE', payload: null });
  }, []);

  const setViewMode = useCallback((mode: 'grid' | 'list') => {
    dispatch({ type: 'SET_VIEW_MODE', payload: mode });
    localStorage.setItem('voice-explorer-view-mode', mode);
  }, []);

  const setSorting = useCallback((sortBy: string, sortOrder: 'asc' | 'desc') => {
    dispatch({ type: 'SET_SORT', payload: { sortBy, sortOrder } });
  }, []);

  const getFilterOptions = useCallback(() => {
    const voices = state.voices;
    
    return {
      languages: getUniqueValues(voices, 'languageCode').map(code => ({
        code,
        name: voices.find(v => v.languageCode === code)?.language || code,
        count: voices.filter(v => v.languageCode === code).length
      })),
      genders: getUniqueValues(voices, 'gender').map(value => ({
        value,
        label: value === 'M' ? 'Male' : value === 'F' ? 'Female' : 'Other',
        count: voices.filter(v => v.gender === value).length
      })),
      ageGroups: getUniqueValues(voices, 'ageGroup').map(value => ({
        value,
        label: value.charAt(0).toUpperCase() + value.slice(1),
        count: voices.filter(v => v.ageGroup === value).length
      })),
      categories: getUniqueValues(voices, 'category').map(value => ({
        value,
        label: value.charAt(0).toUpperCase() + value.slice(1),
        count: voices.filter(v => v.category === value).length
      })),
      providers: getUniqueValues(voices, 'provider').map(value => ({
        value,
        label: value,
        count: voices.filter(v => v.provider === value).length
      }))
    };
  }, [state.voices]);

  const value: VoiceExplorerContextType = {
    state,
    dispatch,
    loadVoices,
    loadMoreVoices,
    searchVoices,
    updateFilters,
    clearFilters,
    toggleFilterPanel,
    toggleFavorite,
    previewVoice,
    stopPreview,
    setViewMode,
    setSorting,
    getFilterOptions
  };

  return (
    <VoiceExplorerContext.Provider value={value}>
      {children}
    </VoiceExplorerContext.Provider>
  );
}

// Helper functions
function getUniqueValues<T, K extends keyof T>(array: T[], key: K): T[K][] {
  return Array.from(new Set(array.map(item => item[key])));
}

// Mock data generators - replace with actual API calls
async function generateMockVoices(page = 1): Promise<Voice[]> {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
  
  const languages = [
    { code: 'en-US', name: 'English (US)' },
    { code: 'en-GB', name: 'English (UK)' },
    { code: 'es-ES', name: 'Spanish (Spain)' },
    { code: 'fr-FR', name: 'French' },
    { code: 'de-DE', name: 'German' },
    { code: 'it-IT', name: 'Italian' },
    { code: 'pt-BR', name: 'Portuguese (Brazil)' },
    { code: 'ja-JP', name: 'Japanese' },
    { code: 'ko-KR', name: 'Korean' },
    { code: 'zh-CN', name: 'Chinese (Mandarin)' }
  ];

  const names = [
    'Emma', 'Olivia', 'Sophia', 'Isabella', 'Mia', 'Charlotte', 'Amelia', 'Harper', 'Evelyn',
    'Liam', 'Noah', 'William', 'James', 'Oliver', 'Benjamin', 'Elijah', 'Lucas', 'Mason', 'Logan'
  ];

  const styles = ['Natural', 'Professional', 'Warm', 'Energetic', 'Calm', 'Authoritative', 'Friendly', 'Dramatic'];
  const categories = ['natural', 'professional', 'emotional', 'character', 'celebrity'] as const;
  const providers = ['OpenAI', 'ElevenLabs', 'Google', 'Amazon', 'Microsoft', 'Synthesia'];

  return Array.from({ length: page === 1 ? 24 : 12 }, (_, i) => {
    const index = (page - 1) * 12 + i;
    const language = languages[index % languages.length];
    const name = names[index % names.length];
    const isNew = Math.random() > 0.8;
    
    return {
      id: `voice-${index}`,
      name: `${name}_${language.code}`,
      gender: Math.random() > 0.5 ? 'F' : 'M',
      language: language.name,
      languageCode: language.code,
      ageGroup: ['adult', 'teen', 'senior'][Math.floor(Math.random() * 3)] as any,
      style: styles[index % styles.length],
      category: categories[index % categories.length],
      avatar: `/api/placeholder/64/64?seed=${index}`,
      isPremium: Math.random() > 0.6,
      provider: providers[index % providers.length],
      sampleUrl: `/mock-samples/voice-${index}.mp3`,
      description: `A ${styles[index % styles.length].toLowerCase()} ${language.name} voice perfect for professional use.`,
      tags: [language.name, styles[index % styles.length], categories[index % categories.length]],
      rating: 3.5 + Math.random() * 1.5,
      usageCount: Math.floor(Math.random() * 10000),
      isNew,
      isFavorite: false
    };
  });
}

async function mockToggleFavorite(voiceId: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 300));
  // In real implementation, this would make an API call
}