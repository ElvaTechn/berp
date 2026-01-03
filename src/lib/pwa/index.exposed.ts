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
export { pwaStorage } from './indexedDB.enhanced';

// Re-export methods from pwaStorage singleton
// These are wrapper functions for convenience
import { pwaStorage as storage } from './indexedDB.enhanced';

export const initDB = () => storage.init();
export const addPendingSale = (sale: any) => storage.addPendingSale(sale);
export const getPendingSales = () => storage.getPendingSales();
export const markSaleAsSynced = (id: string) => storage.markSaleAsSynced(id);
export const deletePendingSale = (id: string) => storage.deletePendingSale(id);
export const cacheProducts = (products: any[]) => storage.cacheProducts(products);
export const getCachedProducts = () => storage.getCachedProducts();
export const getCachedProduct = (id: string) => storage.getCachedProduct(id);
export const cacheEmployees = (employees: any[]) => storage.cacheEmployees(employees);
export const getCachedEmployees = () => storage.getCachedEmployees();
export const getCachedEmployee = (id: string) => storage.getCachedEmployee(id);
export const addToSyncQueue = (item: any) => storage.addToSyncQueue(item);
export const getSyncQueue = () => storage.getSyncQueue();
export const removeFromSyncQueue = (id: string) => storage.removeFromSyncQueue(id);
export const clearSyncQueue = () => storage.clearSyncQueue();
export const getCacheStats = () => storage.getCacheStats();
export const forceCleanup = () => storage.forceCleanup();
export const clearAll = () => storage.clearAll();

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
export type {
  PWAInstallPrompt as PWAInstallPromptType,
} from '../../types/pwa';
