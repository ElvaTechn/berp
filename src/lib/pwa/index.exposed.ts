/**
 * ================================================================
 * PWA EXPORTS - BIZCONTROL 360 ERP v2.1.0
 * ================================================================
 * Exportações unificadas do sistema PWA melhorado
 * 
 * O que foi melhorado:
 * - IndexedDB com Storage Limits e limpeza automática
 * - Conflict Resolution para sincronização
 * - Code Splitting para reduzir bundle
 * - Testes automatizados
 * ================================================================
 */

// IndexedDB Enhanced (RECOMENDADO - substitui indexedDB.ts)
export {
  pwaStorage,
  initDB,
  addPendingSale,
  getPendingSales,
  getPendingSale,
  markSaleAsSynced,
  incrementSyncAttempts,
  deletePendingSale,
  cacheProducts,
  getCachedProducts,
  getCachedProduct,
  deleteCachedProduct,
  cacheEmployees,
  getCachedEmployees,
  getCachedEmployee,
  addToSyncQueue,
  getSyncQueue,
  getSyncQueueItem,
  incrementSyncRetries,
  removeFromSyncQueue,
  clearSyncQueue,
  getCacheStats,
  getStorageStats,
  canStore,
  clearAll,
  forceCleanup,
  close,
} from './indexedDB.enhanced';

export type {
  PendingSale,
  CachedProduct,
  CachedEmployee,
  SyncQueueItem,
  StorageStats,
  CleanupResult,
} from './indexedDB.enhanced';

// Conflict Resolution (NOVO)
export {
  conflictResolution,
  autoResolveConflict,
  manualResolveConflict,
  getConflictStats,
} from './conflictResolution';

export type {
  Conflict,
  ConflictType,
  ConflictStrategy,
  ConflictResolutionResult,
} from './conflictResolution';

// Offline Sync (existente)
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

// Lazy Loading Utils (NOVO)
export {
  PWAInstallPrompt,
  PWAOfflineBanner,
  PWASyncButton,
  PWAServiceWorkerProvider,
  PWALayoutWrapper,
  ConditionalPWAFeature,
  createUseOfflineSync,
  createUseOfflineGate,
  createStorageMonitor,
  createConflictMonitor,
  OfflineIndicator,
  SyncStatus,
} from './lazy';

// Hooks (existentes)
export {
  useOfflineSync,
  useOfflineStatus,
  useCacheActions,
} from '../../hooks/useOfflineSync';

export {
  useOfflineGate,
} from '../../hooks/useOfflineGate';

// Service Worker (existente)
export {
  register,
  skipWaiting,
  unregister,
  isServiceWorkerActive,
  getServiceWorkerInfo,
  clearAllCaches,
} from '../../utils/serviceWorkerRegistration';

export type {
  ServiceWorkerConfig,
} from '../../utils/serviceWorkerRegistration';

// Types (existente)
export {
  PWAInstallPrompt as PWAInstallPromptType,
} from '../../types/pwa';
