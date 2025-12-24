/**
 * ================================================================
 * PWA INDEX - BIZCONTROL 360 ERP v2.0.0
 * ================================================================
 * Exportações unificadas do sistema PWA seguindo padrões agent-os:
 * - Single Responsibility
 * - Clear Interface
 * - Performance Considerations
 * ================================================================ */

// IndexedDB Storage
export {
  initDB,
  addPendingSale,
  getPendingSales,
  markSaleAsSynced,
  deletePendingSale,
  cacheProducts,
  getCachedProducts,
  getCachedProduct,
  addToSyncQueue,
  getSyncQueue,
  removeFromSyncQueue,
  clearSyncQueue,
  clearAllCache,
  getCacheStats,
  pwaStorage,
} from './indexedDB';

export type {
  PendingSale,
  CachedProduct,
  CachedEmployee,
  SyncQueueItem,
} from './indexedDB';

// Offline Sync
export {
  offlineSync,
  syncOffline,
  cancelSync,
  setSyncProgressCallback,
} from './offlineSync';

export type {
  SyncResult,
  SyncProgress,
  SyncProgressCallback,
} from './offlineSync';

// Hook exports
export {
  useOfflineSync,
  useOfflineStatus,
  useCacheActions,
} from '../../hooks/useOfflineSync';

export {
  useNotifications,
  useNotificationManager,
  useDesktopNotifications,
  useNotificationPermission,
} from '../../hooks/useNotifications';
