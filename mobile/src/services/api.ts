import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import offlineStorage from './offlineStorage';
import networkService from './networkService';

// API Configuration
const API_BASE_URL = 'http://localhost:8000'; // Update with your backend URL

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      await AsyncStorage.removeItem('authToken');
      // TODO: Navigate to login screen
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  signup: async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  refreshToken: async () => {
    const response = await api.post('/auth/refresh');
    return response.data;
  },
};

// TTS API
export const ttsAPI = {
  generateSpeech: async (data: {
    text: string;
    voice: string;
    speed: number;
    pitch: number;
  }) => {
    const response = await api.post('/tts/generate', data);
    return response.data;
  },

  getVoices: async () => {
    const response = await api.get('/tts/voices');
    return response.data;
  },
};

// Voice Changer API
export const voiceChangerAPI = {
  processAudio: async (formData: FormData) => {
    const response = await api.post('/voice-changer/process', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getVoiceEffects: async () => {
    const response = await api.get('/voice-changer/effects');
    return response.data;
  },
};

// Voice Translate API
export const voiceTranslateAPI = {
  translateAudio: async (formData: FormData) => {
    const response = await api.post('/voice-translate/translate', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getLanguages: async () => {
    const response = await api.get('/voice-translate/languages');
    return response.data;
  },
};

// Voice Library API
export const voiceLibraryAPI = {
  getMyVoices: async () => {
    const response = await api.get('/voice-library/my-voices');
    return response.data;
  },

  getAIVoices: async () => {
    const response = await api.get('/voice-library/ai-voices');
    return response.data;
  },

  addToFavorites: async (voiceId: string) => {
    const response = await api.post(`/voice-library/favorites/${voiceId}`);
    return response.data;
  },

  removeFromFavorites: async (voiceId: string) => {
    const response = await api.delete(`/voice-library/favorites/${voiceId}`);
    return response.data;
  },

  deleteVoice: async (voiceId: string) => {
    const response = await api.delete(`/voice-library/voices/${voiceId}`);
    return response.data;
  },
};

// Projects API
export const projectsAPI = {
  getProjects: async () => {
    // Try to get from cache first
    const cachedProjects = await offlineStorage.getProjects();
    if (cachedProjects) {
      // Return cached data and sync in background
      networkService.processOfflineQueue();
      return cachedProjects;
    }

    // If no cache or expired, fetch from API
    if (!networkService.isDeviceOnline()) {
      throw new Error('No internet connection and no cached data available');
    }

    const response = await api.get('/projects');
    // Cache the response
    await offlineStorage.saveProjects(response.data);
    return response.data;
  },

  createProject: async (projectData: {
    name: string;
    description?: string;
    type: string;
  }) => {
    if (!networkService.isDeviceOnline()) {
      // Add to offline queue
      await networkService.addToOfflineQueue('CREATE_PROJECT', projectData);
      // Save locally
      const localProject = {
        ...projectData,
        id: `local_${Date.now()}`,
        status: 'draft',
        createdAt: new Date().toISOString(),
      };
      await offlineStorage.addProject(localProject);
      return localProject;
    }

    const response = await api.post('/projects', projectData);
    // Update local cache
    await offlineStorage.addProject(response.data);
    return response.data;
  },

  updateProject: async (projectId: string, projectData: any) => {
    if (!networkService.isDeviceOnline()) {
      // Add to offline queue
      await networkService.addToOfflineQueue('UPDATE_PROJECT', { projectId, ...projectData });
      // Update locally
      await offlineStorage.updateProject(projectId, projectData);
      return { success: true, offline: true };
    }

    const response = await api.put(`/projects/${projectId}`, projectData);
    // Update local cache
    await offlineStorage.updateProject(projectId, response.data);
    return response.data;
  },

  deleteProject: async (projectId: string) => {
    if (!networkService.isDeviceOnline()) {
      // Add to offline queue
      await networkService.addToOfflineQueue('DELETE_PROJECT', { projectId });
      // Delete locally
      await offlineStorage.deleteProject(projectId);
      return { success: true, offline: true };
    }

    const response = await api.delete(`/projects/${projectId}`);
    // Update local cache
    await offlineStorage.deleteProject(projectId);
    return response.data;
  },
};

// Settings API
export const settingsAPI = {
  getProfile: async () => {
    const response = await api.get('/settings/profile');
    return response.data;
  },

  updateProfile: async (profileData: any) => {
    const response = await api.put('/settings/profile', profileData);
    return response.data;
  },

  getBillingInfo: async () => {
    const response = await api.get('/settings/billing');
    return response.data;
  },

  updateBillingInfo: async (billingData: any) => {
    const response = await api.put('/settings/billing', billingData);
    return response.data;
  },
};

// File Upload Helper
export const uploadFile = async (fileUri: string, fileName: string) => {
  const formData = new FormData();

  // For React Native, we need to handle file upload differently
  // This is a placeholder - actual implementation would depend on the file picker used
  formData.append('file', {
    uri: fileUri,
    name: fileName,
    type: 'audio/*',
  } as any);

  return formData;
};

// Error Handler
export const handleAPIError = (error: any) => {
  if (error.response) {
    // Server responded with error status
    const message = error.response.data?.message || 'An error occurred';
    return { error: true, message, status: error.response.status };
  } else if (error.request) {
    // Network error
    return { error: true, message: 'Network error. Please check your connection.' };
  } else {
    // Other error
    return { error: true, message: error.message || 'An unexpected error occurred.' };
  }
};

export default api;
