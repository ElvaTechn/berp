/**
 * ================================================================
 * PWA INDEX - BIZCONTROL 360 ERP v2.0.0
 * ================================================================
 * Exportações unificadas do sistema PWA seguindo padrões agent-os:
 * - Single Responsibility
 * - Clear Interface
 * - Performance Considerations
 * ================================================================ */

// IndexedDB Storage Enhanced
export {
  initDB,
  addPendingSale,
  getPendingSales,
  markSaleAsSynced,
  deletePendingSale,
  cacheProducts,
  getCachedProducts,
  getCachedProduct,
  cacheEmployees,
  getCachedEmployees,
  getCachedEmployee,
  addToSyncQueue,
  getSyncQueue,
  removeFromSyncQueue,
  clearSyncQueue,
  getCacheStats,
  forceCleanup,
  clearAll,
  pwaStorage,
} from './index.exposed';

export type {
  PendingSale,
  CachedProduct,
  CachedEmployee,
  SyncQueueItem,
  StorageStats,
  CleanupResult,
} from './indexedDB.enhanced';

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

// Offline Reports
export {
  useOfflineReports,
} from './offlineReports';

export type {
  ReportType,
  ReportFormat,
  ReportOptions,
  ReportData,
  ReportSummary,
  ProductSale,
  DailySale,
  ChartData,
} from './offlineReports';

// Conflict Resolution
export {
  conflictResolution,
  autoResolveConflict,
  manualResolveConflict,
  getConflictStats,
} from './conflictResolution';

export type {
  ConflictType,
  ConflictStrategy,
  Conflict,
  ConflictResolutionResult,
  MergeOptions,
} from './conflictResolution';

// P2P Sync
export {
  p2pSync,
  useP2PSync,
  P2PConnectionState,
  P2PRole,
} from './p2pSync';

export type {
  P2PPeer,
  SyncData,
  P2PSyncResult,
} from './p2pSync';

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
