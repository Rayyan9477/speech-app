import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  type: 'AI Text to Speech' | 'AI Voice Changer' | 'AI Voice Translate';
  duration: string;
  createdAt: string;
  updatedAt: string;
  voice?: string;
  status: 'completed' | 'processing' | 'draft' | 'failed';
  isFavorite: boolean;
  tags: string[];
  audioUrl?: string;
  waveformData?: number[];
  fileSize?: number;
  format?: string;
}

export interface ProjectManagementState {
  projects: ProjectItem[];
  filteredProjects: ProjectItem[];
  searchQuery: string;
  recentSearches: string[];
  selectedFilter: 'All' | 'AI Text to Speech' | 'AI Voice Changer' | 'AI Voice Translate';
  isSearchFocused: boolean;
  showDeleteConfirmation: boolean;
  showRenameDialog: boolean;
  showContextMenu: boolean;
  selectedProject: ProjectItem | null;
  contextMenuPosition: { x: number; y: number };
  isLoading: boolean;
  error: string | null;
}

type ProjectManagementAction =
  | { type: 'SET_PROJECTS'; payload: ProjectItem[] }
  | { type: 'ADD_PROJECT'; payload: ProjectItem }
  | { type: 'UPDATE_PROJECT'; payload: { id: string; updates: Partial<ProjectItem> } }
  | { type: 'DELETE_PROJECT'; payload: string }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'ADD_RECENT_SEARCH'; payload: string }
  | { type: 'CLEAR_RECENT_SEARCHES' }
  | { type: 'SET_FILTER'; payload: ProjectManagementState['selectedFilter'] }
  | { type: 'SET_SEARCH_FOCUSED'; payload: boolean }
  | { type: 'SHOW_DELETE_CONFIRMATION'; payload: ProjectItem }
  | { type: 'HIDE_DELETE_CONFIRMATION' }
  | { type: 'SHOW_RENAME_DIALOG'; payload: ProjectItem }
  | { type: 'HIDE_RENAME_DIALOG' }
  | { type: 'SHOW_CONTEXT_MENU'; payload: { project: ProjectItem; x: number; y: number } }
  | { type: 'HIDE_CONTEXT_MENU' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'FILTER_PROJECTS' };

const initialState: ProjectManagementState = {
  projects: [],
  filteredProjects: [],
  searchQuery: '',
  recentSearches: [],
  selectedFilter: 'All',
  isSearchFocused: false,
  showDeleteConfirmation: false,
  showRenameDialog: false,
  showContextMenu: false,
  selectedProject: null,
  contextMenuPosition: { x: 0, y: 0 },
  isLoading: false,
  error: null,
};

// Mock data for development
const mockProjects: ProjectItem[] = [
  {
    id: '1',
    title: 'Nikka Shoes Promotions Audio',
    description: 'Marketing promotion for shoe collection',
    type: 'AI Text to Speech',
    duration: '00:44',
    createdAt: 'Today',
    updatedAt: new Date().toISOString(),
    voice: 'Emma',
    status: 'completed',
    isFavorite: false,
    tags: ['Marketing', 'Promotion', 'Shoes'],
    audioUrl: '/audio/sample1.mp3',
    fileSize: 1024000,
    format: 'mp3'
  },
  {
    id: '2',
    title: 'Words of Motivation',
    description: 'Motivational speech transformation',
    type: 'AI Voice Changer',
    duration: '03:25',
    createdAt: 'Today',
    updatedAt: new Date().toISOString(),
    voice: 'Marcus',
    status: 'completed',
    isFavorite: true,
    tags: ['Motivation', 'Speech', 'Personal'],
    audioUrl: '/audio/sample2.mp3',
    fileSize: 2048000,
    format: 'mp3'
  },
  {
    id: '3',
    title: 'Public Speaking Audio',
    description: 'Professional presentation translation',
    type: 'AI Voice Translate',
    duration: '05:46',
    createdAt: 'Today',
    updatedAt: new Date().toISOString(),
    voice: 'Sofia',
    status: 'processing',
    isFavorite: false,
    tags: ['Professional', 'Presentation', 'Translation'],
    audioUrl: '/audio/sample3.mp3',
    fileSize: 3072000,
    format: 'mp3'
  },
  {
    id: '4',
    title: 'Social Media Trends',
    description: 'Content creation for social platforms',
    type: 'AI Text to Speech',
    duration: '02:29',
    createdAt: 'Yesterday',
    updatedAt: new Date().toISOString(),
    voice: 'Luna',
    status: 'completed',
    isFavorite: false,
    tags: ['Social Media', 'Content', 'Trends'],
    audioUrl: '/audio/sample4.mp3',
    fileSize: 1536000,
    format: 'mp3'
  },
  {
    id: '5',
    title: 'English Conversation',
    description: 'Language practice conversation',
    type: 'AI Voice Changer',
    duration: '01:08',
    createdAt: 'Yesterday',
    updatedAt: new Date().toISOString(),
    voice: 'James',
    status: 'completed',
    isFavorite: true,
    tags: ['Education', 'Language', 'Practice'],
    audioUrl: '/audio/sample5.mp3',
    fileSize: 768000,
    format: 'mp3'
  },
  {
    id: '6',
    title: 'Music & Podcast Intro',
    description: 'Intro audio for podcast episodes',
    type: 'AI Voice Translate',
    duration: '05:54',
    createdAt: 'Dec 20, 2023',
    updatedAt: new Date().toISOString(),
    voice: 'Alex',
    status: 'completed',
    isFavorite: false,
    tags: ['Podcast', 'Music', 'Intro'],
    audioUrl: '/audio/sample6.mp3',
    fileSize: 4096000,
    format: 'mp3'
  }
];

function projectManagementReducer(
  state: ProjectManagementState,
  action: ProjectManagementAction
): ProjectManagementState {
  switch (action.type) {
    case 'SET_PROJECTS':
      return {
        ...state,
        projects: action.payload,
        filteredProjects: filterProjects(action.payload, state.searchQuery, state.selectedFilter)
      };

    case 'ADD_PROJECT':
      const newProjects = [action.payload, ...state.projects];
      return {
        ...state,
        projects: newProjects,
        filteredProjects: filterProjects(newProjects, state.searchQuery, state.selectedFilter)
      };

    case 'UPDATE_PROJECT':
      const updatedProjects = state.projects.map(project =>
        project.id === action.payload.id
          ? { ...project, ...action.payload.updates, updatedAt: new Date().toISOString() }
          : project
      );
      return {
        ...state,
        projects: updatedProjects,
        filteredProjects: filterProjects(updatedProjects, state.searchQuery, state.selectedFilter)
      };

    case 'DELETE_PROJECT':
      const remainingProjects = state.projects.filter(project => project.id !== action.payload);
      return {
        ...state,
        projects: remainingProjects,
        filteredProjects: filterProjects(remainingProjects, state.searchQuery, state.selectedFilter),
        showDeleteConfirmation: false,
        selectedProject: null
      };

    case 'SET_SEARCH_QUERY':
      return {
        ...state,
        searchQuery: action.payload,
        filteredProjects: filterProjects(state.projects, action.payload, state.selectedFilter)
      };

    case 'ADD_RECENT_SEARCH':
      const trimmedQuery = action.payload.trim();
      if (!trimmedQuery || state.recentSearches.includes(trimmedQuery)) {
        return state;
      }
      const newRecentSearches = [trimmedQuery, ...state.recentSearches.slice(0, 6)];
      return {
        ...state,
        recentSearches: newRecentSearches
      };

    case 'CLEAR_RECENT_SEARCHES':
      return {
        ...state,
        recentSearches: []
      };

    case 'SET_FILTER':
      return {
        ...state,
        selectedFilter: action.payload,
        filteredProjects: filterProjects(state.projects, state.searchQuery, action.payload)
      };

    case 'SET_SEARCH_FOCUSED':
      return {
        ...state,
        isSearchFocused: action.payload
      };

    case 'SHOW_DELETE_CONFIRMATION':
      return {
        ...state,
        showDeleteConfirmation: true,
        selectedProject: action.payload,
        showContextMenu: false
      };

    case 'HIDE_DELETE_CONFIRMATION':
      return {
        ...state,
        showDeleteConfirmation: false,
        selectedProject: null
      };

    case 'SHOW_RENAME_DIALOG':
      return {
        ...state,
        showRenameDialog: true,
        selectedProject: action.payload,
        showContextMenu: false
      };

    case 'HIDE_RENAME_DIALOG':
      return {
        ...state,
        showRenameDialog: false,
        selectedProject: null
      };

    case 'SHOW_CONTEXT_MENU':
      return {
        ...state,
        showContextMenu: true,
        selectedProject: action.payload.project,
        contextMenuPosition: { x: action.payload.x, y: action.payload.y }
      };

    case 'HIDE_CONTEXT_MENU':
      return {
        ...state,
        showContextMenu: false,
        selectedProject: null,
        contextMenuPosition: { x: 0, y: 0 }
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload
      };

    case 'FILTER_PROJECTS':
      return {
        ...state,
        filteredProjects: filterProjects(state.projects, state.searchQuery, state.selectedFilter)
      };

    default:
      return state;
  }
}

function filterProjects(
  projects: ProjectItem[],
  searchQuery: string,
  filter: ProjectManagementState['selectedFilter']
): ProjectItem[] {
  let filtered = projects;

  // Apply type filter
  if (filter !== 'All') {
    filtered = filtered.filter(project => project.type === filter);
  }

  // Apply search filter
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(project =>
      project.title.toLowerCase().includes(query) ||
      project.description.toLowerCase().includes(query) ||
      project.voice?.toLowerCase().includes(query) ||
      project.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }

  return filtered;
}

interface ProjectManagementContextType {
  state: ProjectManagementState;
  dispatch: React.Dispatch<ProjectManagementAction>;
  // Action helpers
  setSearchQuery: (query: string) => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  setFilter: (filter: ProjectManagementState['selectedFilter']) => void;
  showDeleteConfirmation: (project: ProjectItem) => void;
  hideDeleteConfirmation: () => void;
  showRenameDialog: (project: ProjectItem) => void;
  hideRenameDialog: () => void;
  showContextMenu: (project: ProjectItem, x: number, y: number) => void;
  hideContextMenu: () => void;
  deleteProject: (projectId: string) => void;
  updateProject: (projectId: string, updates: Partial<ProjectItem>) => void;
  duplicateProject: (project: ProjectItem) => void;
  playProject: (project: ProjectItem) => Promise<void>;
  editProject: (project: ProjectItem) => void;
  shareProject: (project: ProjectItem) => Promise<void>;
  exportProject: (project: ProjectItem) => Promise<void>;
  downloadProject: (project: ProjectItem) => Promise<void>;
}

const ProjectManagementContext = createContext<ProjectManagementContextType | undefined>(undefined);

interface ProjectManagementProviderProps {
  children: ReactNode;
}

export const ProjectManagementProvider: React.FC<ProjectManagementProviderProps> = ({
  children
}) => {
  const [state, dispatch] = useReducer(projectManagementReducer, initialState);

  // Initialize with mock data
  useEffect(() => {
    dispatch({ type: 'SET_PROJECTS', payload: mockProjects });
  }, []);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (state.showContextMenu) {
        dispatch({ type: 'HIDE_CONTEXT_MENU' });
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [state.showContextMenu]);

  // Action helpers
  const setSearchQuery = (query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  };

  const addRecentSearch = (query: string) => {
    dispatch({ type: 'ADD_RECENT_SEARCH', payload: query });
  };

  const clearRecentSearches = () => {
    dispatch({ type: 'CLEAR_RECENT_SEARCHES' });
  };

  const setFilter = (filter: ProjectManagementState['selectedFilter']) => {
    dispatch({ type: 'SET_FILTER', payload: filter });
  };

  const showDeleteConfirmation = (project: ProjectItem) => {
    dispatch({ type: 'SHOW_DELETE_CONFIRMATION', payload: project });
  };

  const hideDeleteConfirmation = () => {
    dispatch({ type: 'HIDE_DELETE_CONFIRMATION' });
  };

  const showRenameDialog = (project: ProjectItem) => {
    dispatch({ type: 'SHOW_RENAME_DIALOG', payload: project });
  };

  const hideRenameDialog = () => {
    dispatch({ type: 'HIDE_RENAME_DIALOG' });
  };

  const showContextMenu = (project: ProjectItem, x: number, y: number) => {
    dispatch({ type: 'SHOW_CONTEXT_MENU', payload: { project, x, y } });
  };

  const hideContextMenu = () => {
    dispatch({ type: 'HIDE_CONTEXT_MENU' });
  };

  const deleteProject = (projectId: string) => {
    dispatch({ type: 'DELETE_PROJECT', payload: projectId });
  };

  const updateProject = (projectId: string, updates: Partial<ProjectItem>) => {
    dispatch({ type: 'UPDATE_PROJECT', payload: { id: projectId, updates } });
  };

  const duplicateProject = (project: ProjectItem) => {
    const duplicatedProject: ProjectItem = {
      ...project,
      id: `${project.id}_copy_${Date.now()}`,
      title: `${project.title} (Copy)`,
      createdAt: 'Now',
      updatedAt: new Date().toISOString()
    };
    dispatch({ type: 'ADD_PROJECT', payload: duplicatedProject });
  };

  const playProject = async (project: ProjectItem) => {
    console.log('Playing project:', project.title);
    // Implement audio playback logic
  };

  const editProject = (project: ProjectItem) => {
    console.log('Editing project:', project.title);
    // Navigate to appropriate editor based on project type
  };

  const shareProject = async (project: ProjectItem) => {
    console.log('Sharing project:', project.title);
    // Implement sharing logic
  };

  const exportProject = async (project: ProjectItem) => {
    console.log('Exporting project:', project.title);
    // Implement export logic
  };

  const downloadProject = async (project: ProjectItem) => {
    console.log('Downloading project:', project.title);
    // Implement download logic
  };

  const value: ProjectManagementContextType = {
    state,
    dispatch,
    setSearchQuery,
    addRecentSearch,
    clearRecentSearches,
    setFilter,
    showDeleteConfirmation,
    hideDeleteConfirmation,
    showRenameDialog,
    hideRenameDialog,
    showContextMenu,
    hideContextMenu,
    deleteProject,
    updateProject,
    duplicateProject,
    playProject,
    editProject,
    shareProject,
    exportProject,
    downloadProject
  };

  return (
    <ProjectManagementContext.Provider value={value}>
      {children}
    </ProjectManagementContext.Provider>
  );
};

export const useProjectManagement = (): ProjectManagementContextType => {
  const context = useContext(ProjectManagementContext);
  if (!context) {
    throw new Error('useProjectManagement must be used within a ProjectManagementProvider');
  }
  return context;
};