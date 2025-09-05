import NetInfo from '@react-native-community/netinfo';
import offlineStorage from './offlineStorage';

// Network status types
export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string;
}

// Offline sync queue item
export interface SyncQueueItem {
  id: string;
  action: string;
  data: any;
  timestamp: string;
  retryCount: number;
  maxRetries: number;
}

// Network Service Class
class NetworkService {
  private isOnline: boolean = true;
  private networkStatus: NetworkStatus | null = null;
  private syncInProgress: boolean = false;

  constructor() {
    this.initializeNetworkListener();
  }

  // Initialize network state listener
  private initializeNetworkListener() {
    NetInfo.addEventListener(state => {
      this.networkStatus = {
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
      };
      this.isOnline = this.networkStatus.isConnected && this.networkStatus.isInternetReachable !== false;
    });

    // Get initial network state
    NetInfo.fetch().then(state => {
      this.networkStatus = {
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
      };
      this.isOnline = this.networkStatus.isConnected && this.networkStatus.isInternetReachable !== false;
    });
  }

  // Get current network status
  getNetworkStatus(): NetworkStatus | null {
    return this.networkStatus;
  }

  // Check if device is online
  isDeviceOnline(): boolean {
    return this.isOnline;
  }

  // Check if device has internet connectivity
  async checkInternetConnectivity(): Promise<boolean> {
    try {
      const state = await NetInfo.fetch();
      return state.isConnected && state.isInternetReachable !== false;
    } catch (error) {
      console.error('Error checking internet connectivity:', error);
      return false;
    }
  }

  // Add action to offline queue
  async addToOfflineQueue(action: string, data: any, maxRetries: number = 3): Promise<void> {
    const queueItem: SyncQueueItem = {
      id: Date.now().toString(),
      action,
      data,
      timestamp: new Date().toISOString(),
      retryCount: 0,
      maxRetries,
    };

    await offlineStorage.addToOfflineQueue(queueItem);
  }

  // Process offline queue when online
  async processOfflineQueue(): Promise<void> {
    if (this.syncInProgress || !this.isDeviceOnline()) {
      return;
    }

    this.syncInProgress = true;

    try {
      const queue = await offlineStorage.getOfflineQueue();
      if (!queue || queue.length === 0) {
        this.syncInProgress = false;
        return;
      }

      console.log(`Processing ${queue.length} offline actions...`);

      for (const item of queue) {
        try {
          await this.processQueueItem(item);
          await offlineStorage.removeFromOfflineQueue(item.id);
        } catch (error) {
          console.error(`Failed to process queue item ${item.id}:`, error);

          // Increment retry count
          item.retryCount++;

          if (item.retryCount >= item.maxRetries) {
            // Remove from queue after max retries
            await offlineStorage.removeFromOfflineQueue(item.id);
            console.log(`Removed failed item ${item.id} after ${item.maxRetries} retries`);
          } else {
            // Update retry count
            await offlineStorage.addToOfflineQueue(item);
          }
        }
      }

      console.log('Offline queue processing completed');
    } catch (error) {
      console.error('Error processing offline queue:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  // Process individual queue item
  private async processQueueItem(item: SyncQueueItem): Promise<void> {
    switch (item.action) {
      case 'CREATE_PROJECT':
        // TODO: Call API to create project
        break;
      case 'UPDATE_PROJECT':
        // TODO: Call API to update project
        break;
      case 'DELETE_PROJECT':
        // TODO: Call API to delete project
        break;
      case 'ADD_VOICE_TO_FAVORITES':
        // TODO: Call API to add voice to favorites
        break;
      case 'REMOVE_VOICE_FROM_FAVORITES':
        // TODO: Call API to remove voice from favorites
        break;
      case 'UPLOAD_AUDIO':
        // TODO: Call API to upload audio file
        break;
      default:
        console.warn(`Unknown action: ${item.action}`);
    }
  }

  // Retry failed sync operations
  async retryFailedSyncs(): Promise<void> {
    if (!this.isDeviceOnline()) {
      throw new Error('No internet connection');
    }

    await this.processOfflineQueue();
  }

  // Get sync status
  getSyncStatus(): { inProgress: boolean; queueLength: number } {
    return {
      inProgress: this.syncInProgress,
      queueLength: 0, // This would be fetched from storage
    };
  }

  // Force sync all data
  async forceSync(): Promise<void> {
    if (!this.isDeviceOnline()) {
      throw new Error('No internet connection available');
    }

    // TODO: Implement force sync logic
    // This would sync all local data with the server
    console.log('Force sync initiated');
  }

  // Network status change callback
  onNetworkStatusChange(callback: (status: NetworkStatus) => void): void {
    NetInfo.addEventListener(state => {
      const status: NetworkStatus = {
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
      };
      callback(status);
    });
  }

  // Cleanup
  cleanup(): void {
    // Remove network listeners if needed
    NetInfo.unsubscribe;
  }
}

// Export singleton instance
export default new NetworkService();
