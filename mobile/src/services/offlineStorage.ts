import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

// Storage keys
const STORAGE_KEYS = {
  USER_DATA: 'user_data',
  PROJECTS: 'projects',
  VOICES: 'voices',
  AUDIO_FILES: 'audio_files',
  SETTINGS: 'settings',
  CACHE_TIMESTAMP: 'cache_timestamp',
  OFFLINE_QUEUE: 'offline_queue',
};

// Cache expiration times (in milliseconds)
const CACHE_EXPIRY = {
  USER_DATA: 24 * 60 * 60 * 1000, // 24 hours
  PROJECTS: 60 * 60 * 1000, // 1 hour
  VOICES: 6 * 60 * 60 * 1000, // 6 hours
  AUDIO_FILES: 7 * 24 * 60 * 60 * 1000, // 7 days
  SETTINGS: 24 * 60 * 60 * 1000, // 24 hours
};

// Offline Storage Service
class OfflineStorageService {
  // Generic storage methods
  async setItem(key: string, value: any): Promise<void> {
    try {
      const data = JSON.stringify(value);
      await AsyncStorage.setItem(key, data);
    } catch (error) {
      console.error(`Error storing ${key}:`, error);
      throw error;
    }
  }

  async getItem<T>(key: string): Promise<T | null> {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Error retrieving ${key}:`, error);
      return null;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
      throw error;
    }
  }

  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }

  // Cache management
  async setCacheTimestamp(key: string): Promise<void> {
    const timestamp = Date.now();
    await this.setItem(`${STORAGE_KEYS.CACHE_TIMESTAMP}_${key}`, timestamp);
  }

  async getCacheTimestamp(key: string): Promise<number | null> {
    return await this.getItem<number>(`${STORAGE_KEYS.CACHE_TIMESTAMP}_${key}`);
  }

  async isCacheExpired(key: string, expiryTime: number): Promise<boolean> {
    const timestamp = await this.getCacheTimestamp(key);
    if (!timestamp) return true;

    return Date.now() - timestamp > expiryTime;
  }

  // User data management
  async saveUserData(userData: any): Promise<void> {
    await this.setItem(STORAGE_KEYS.USER_DATA, userData);
    await this.setCacheTimestamp(STORAGE_KEYS.USER_DATA);
  }

  async getUserData(): Promise<any | null> {
    const isExpired = await this.isCacheExpired(STORAGE_KEYS.USER_DATA, CACHE_EXPIRY.USER_DATA);
    if (isExpired) {
      await this.removeItem(STORAGE_KEYS.USER_DATA);
      return null;
    }
    return await this.getItem(STORAGE_KEYS.USER_DATA);
  }

  // Projects management
  async saveProjects(projects: any[]): Promise<void> {
    await this.setItem(STORAGE_KEYS.PROJECTS, projects);
    await this.setCacheTimestamp(STORAGE_KEYS.PROJECTS);
  }

  async getProjects(): Promise<any[] | null> {
    const isExpired = await this.isCacheExpired(STORAGE_KEYS.PROJECTS, CACHE_EXPIRY.PROJECTS);
    if (isExpired) {
      await this.removeItem(STORAGE_KEYS.PROJECTS);
      return null;
    }
    return await this.getItem<any[]>(STORAGE_KEYS.PROJECTS) || [];
  }

  async addProject(project: any): Promise<void> {
    const projects = await this.getProjects() || [];
    projects.unshift(project);
    await this.saveProjects(projects);
  }

  async updateProject(projectId: string, updatedProject: any): Promise<void> {
    const projects = await this.getProjects() || [];
    const index = projects.findIndex(p => p.id === projectId);
    if (index !== -1) {
      projects[index] = { ...projects[index], ...updatedProject };
      await this.saveProjects(projects);
    }
  }

  async deleteProject(projectId: string): Promise<void> {
    const projects = await this.getProjects() || [];
    const filteredProjects = projects.filter(p => p.id !== projectId);
    await this.saveProjects(filteredProjects);
  }

  // Voices management
  async saveVoices(voices: any[]): Promise<void> {
    await this.setItem(STORAGE_KEYS.VOICES, voices);
    await this.setCacheTimestamp(STORAGE_KEYS.VOICES);
  }

  async getVoices(): Promise<any[] | null> {
    const isExpired = await this.isCacheExpired(STORAGE_KEYS.VOICES, CACHE_EXPIRY.VOICES);
    if (isExpired) {
      await this.removeItem(STORAGE_KEYS.VOICES);
      return null;
    }
    return await this.getItem<any[]>(STORAGE_KEYS.VOICES) || [];
  }

  async addVoiceToFavorites(voiceId: string): Promise<void> {
    const voices = await this.getVoices() || [];
    const voiceIndex = voices.findIndex(v => v.id === voiceId);
    if (voiceIndex !== -1) {
      voices[voiceIndex].isFavorite = true;
      await this.saveVoices(voices);
    }
  }

  async removeVoiceFromFavorites(voiceId: string): Promise<void> {
    const voices = await this.getVoices() || [];
    const voiceIndex = voices.findIndex(v => v.id === voiceId);
    if (voiceIndex !== -1) {
      voices[voiceIndex].isFavorite = false;
      await this.saveVoices(voices);
    }
  }

  // Audio files management
  async saveAudioFile(fileUri: string, metadata: any): Promise<void> {
    const audioFiles = await this.getItem<any[]>(STORAGE_KEYS.AUDIO_FILES) || [];
    const fileData = {
      id: Date.now().toString(),
      uri: fileUri,
      ...metadata,
      createdAt: new Date().toISOString(),
    };

    audioFiles.unshift(fileData);
    await this.setItem(STORAGE_KEYS.AUDIO_FILES, audioFiles);
    await this.setCacheTimestamp(STORAGE_KEYS.AUDIO_FILES);
  }

  async getAudioFiles(): Promise<any[] | null> {
    const isExpired = await this.isCacheExpired(STORAGE_KEYS.AUDIO_FILES, CACHE_EXPIRY.AUDIO_FILES);
    if (isExpired) {
      await this.removeItem(STORAGE_KEYS.AUDIO_FILES);
      return null;
    }
    return await this.getItem<any[]>(STORAGE_KEYS.AUDIO_FILES) || [];
  }

  async deleteAudioFile(fileId: string): Promise<void> {
    const audioFiles = await this.getAudioFiles() || [];
    const filteredFiles = audioFiles.filter(f => f.id !== fileId);

    // Also delete from file system if it exists
    const fileToDelete = audioFiles.find(f => f.id === fileId);
    if (fileToDelete?.uri) {
      try {
        await FileSystem.deleteAsync(fileToDelete.uri, { idempotent: true });
      } catch (error) {
        console.error('Error deleting audio file:', error);
      }
    }

    await this.setItem(STORAGE_KEYS.AUDIO_FILES, filteredFiles);
  }

  // Settings management
  async saveSettings(settings: any): Promise<void> {
    await this.setItem(STORAGE_KEYS.SETTINGS, settings);
    await this.setCacheTimestamp(STORAGE_KEYS.SETTINGS);
  }

  async getSettings(): Promise<any | null> {
    const isExpired = await this.isCacheExpired(STORAGE_KEYS.SETTINGS, CACHE_EXPIRY.SETTINGS);
    if (isExpired) {
      await this.removeItem(STORAGE_KEYS.SETTINGS);
      return null;
    }
    return await this.getItem(STORAGE_KEYS.SETTINGS);
  }

  // Offline queue management
  async addToOfflineQueue(action: any): Promise<void> {
    const queue = await this.getItem<any[]>(STORAGE_KEYS.OFFLINE_QUEUE) || [];
    queue.push({
      id: Date.now().toString(),
      ...action,
      timestamp: new Date().toISOString(),
    });
    await this.setItem(STORAGE_KEYS.OFFLINE_QUEUE, queue);
  }

  async getOfflineQueue(): Promise<any[] | null> {
    return await this.getItem<any[]>(STORAGE_KEYS.OFFLINE_QUEUE) || [];
  }

  async removeFromOfflineQueue(actionId: string): Promise<void> {
    const queue = await this.getOfflineQueue() || [];
    const filteredQueue = queue.filter(action => action.id !== actionId);
    await this.setItem(STORAGE_KEYS.OFFLINE_QUEUE, filteredQueue);
  }

  async clearOfflineQueue(): Promise<void> {
    await this.removeItem(STORAGE_KEYS.OFFLINE_QUEUE);
  }

  // Storage info
  async getStorageInfo(): Promise<any> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const stores = await Promise.all(
        keys.map(async (key) => {
          const value = await AsyncStorage.getItem(key);
          return {
            key,
            size: value ? new Blob([value]).size : 0,
          };
        })
      );

      const totalSize = stores.reduce((sum, store) => sum + store.size, 0);

      return {
        totalItems: keys.length,
        totalSize,
        stores,
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return { totalItems: 0, totalSize: 0, stores: [] };
    }
  }

  // Clear expired cache
  async clearExpiredCache(): Promise<void> {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith(STORAGE_KEYS.CACHE_TIMESTAMP));

    for (const cacheKey of cacheKeys) {
      const dataKey = cacheKey.replace(`${STORAGE_KEYS.CACHE_TIMESTAMP}_`, '');
      const expiryTime = this.getExpiryTime(dataKey);

      if (await this.isCacheExpired(dataKey, expiryTime)) {
        await this.removeItem(dataKey);
        await this.removeItem(cacheKey);
      }
    }
  }

  private getExpiryTime(key: string): number {
    switch (key) {
      case STORAGE_KEYS.USER_DATA:
        return CACHE_EXPIRY.USER_DATA;
      case STORAGE_KEYS.PROJECTS:
        return CACHE_EXPIRY.PROJECTS;
      case STORAGE_KEYS.VOICES:
        return CACHE_EXPIRY.VOICES;
      case STORAGE_KEYS.AUDIO_FILES:
        return CACHE_EXPIRY.AUDIO_FILES;
      case STORAGE_KEYS.SETTINGS:
        return CACHE_EXPIRY.SETTINGS;
      default:
        return CACHE_EXPIRY.USER_DATA;
    }
  }
}

// Export singleton instance
export default new OfflineStorageService();
