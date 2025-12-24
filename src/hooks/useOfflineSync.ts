/**
 * ================================================================
 * OFFLINE HOOK - BIZCONTROL 360 ERP v2.0.0
 * ================================================================
 * Hook React para gestão offline seguindo padrões agent-os:
 * - Single Responsibility
 * - Reusability
 * - Clear Interface
 * - Performance Considerations
 * ================================================================ */

"use client";

import { useState, useEffect, useCallback } from 'react';
import { 
  offlineSync, 
  syncOffline, 
  cancelSync, 
  setSyncProgressCallback,
  SyncResult 
} from '@/lib/pwa/offlineSync';
import { pwaStorage } from '@/lib/pwa/indexedDB';
import { ERPNotifications } from '@/lib/notifications/notificationService';

export interface UseOfflineSyncReturn {
  // Status
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncTime: Date | null;
  
  // Actions
  sync: () => Promise<SyncResult>;
  cancel: () => void;
  
  // Progress
  progress: {
    current: number;
    total: number;
    currentItem: string;
    status: 'syncing' | 'completed' | 'failed' | 'paused';
  } | null;
}

export function useOfflineSync(): UseOfflineSyncReturn {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [progress, setProgress] = useState<UseOfflineSyncReturn['progress']>(null);

  // Atualizar contagem pendente
  const updatePendingCount = useCallback(async () => {
    try {
      const queue = await pwaStorage.getSyncQueue();
      setPendingCount(queue.length);
      
      // Atualizar progress se estiver atualizando
      if (progress?.status === 'syncing') {
        const total = queue.length;
        const synced = total - queue.filter(item => item.timestamp < (Date.now() - 60000)).length;
        setProgress(prev => prev ? { ...prev, current: synced, total } : null);
      }
    } catch (error) {
      console.error('Error updating pending count:', error);
    }
  }, [progress?.status]);

  // Sincronização
  const handleSync = useCallback(async (): Promise<SyncResult> => {
    if (!isOnline) {
      throw new Error('Dispositivo offline');
    }

    setIsSyncing(true);
    setProgress({
      current: 0,
      total: pendingCount,
      currentItem: 'Iniciando...',
      status: 'syncing',
    });

    try {
      const result = await syncOffline();
      
      // Notificar resultado
      if (result.success) {
        if (result.syncedItems > 0) {
          ERPNotifications.sincronizacaoSucesso(result.syncedItems);
        }
      } else {
        ERPNotifications.erroSincronizacao(`${result.failedItems} itens falharam`);
      }

      return result;

    } catch (error) {
      ERPNotifications.erroSincronizacao(
        error instanceof Error ? error.message : 'Erro desconhecido'
      );
      throw error;

    } finally {
      setIsSyncing(false);
      setProgress(null);
      await updatePendingCount();
    }
  }, [isOnline, pendingCount, updatePendingCount]);

  // Cancelar sincronização
  const handleCancel = useCallback(() => {
    cancelSync();
    setIsSyncing(false);
    setProgress(null);
  }, []);

  // Listener de status online/offline
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Auto-sync se houver itens pendentes
      if (pendingCount > 0) {
        setTimeout(() => {
          handleSync().catch(console.error);
        }, 2000);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      if (isSyncing) {
        handleCancel();
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Status inicial
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [pendingCount, isSyncing, handleSync, handleCancel]);

  // Atualizar contagem inicial e periodicamente
  useEffect(() => {
    updatePendingCount();

    const interval = setInterval(updatePendingCount, 30000); // A cada 30s
    return () => clearInterval(interval);
  }, [updatePendingCount]);

  // Configurar callback de progresso
  useEffect(() => {
    setSyncProgressCallback((newProgress) => {
      setProgress(newProgress);
    });
  }, []);

  // Carregar última sincronização
  useEffect(() => {
    const lastSync = localStorage.getItem('lastSyncTime');
    if (lastSync) {
      setLastSyncTime(new Date(lastSync));
    }
  }, []);

  return {
    isOnline,
    isSyncing,
    pendingCount,
    lastSyncTime,
    sync: handleSync,
    cancel: handleCancel,
    progress,
  };
}

// ================================================================
// OFFLINE STATUS HOOK
// ================================================================

export interface UseOfflineStatusReturn {
  isOnline: boolean;
  connectionType?: string;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

export function useOfflineStatus(): UseOfflineStatusReturn {
  const [status, setStatus] = useState<UseOfflineStatusReturn>({
    isOnline: navigator.onLine,
  });

  useEffect(() => {
    const updateStatus = () => {
      const connection = (navigator as any).connection || 
                        (navigator as any).mozConnection || 
                        (navigator as any).webkitConnection;

      setStatus({
        isOnline: navigator.onLine,
        connectionType: connection?.type,
        effectiveType: connection?.effectiveType,
        downlink: connection?.downlink,
        rtt: connection?.rtt,
        saveData: connection?.saveData,
      });
    };

    const handleOnline = () => updateStatus();
    const handleOffline = () => updateStatus();
    const handleConnectionChange = () => updateStatus();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    if ('connection' in navigator) {
      (navigator as any).connection.addEventListener('change', handleConnectionChange);
    }

    updateStatus();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if ('connection' in navigator) {
        (navigator as any).connection.removeEventListener('change', handleConnectionChange);
      }
    };
  }, []);

  return status;
}

// ================================================================
// CACHE ACTIONS HOOK
// ================================================================

export interface UseCacheActionsReturn {
  clear: () => Promise<void>;
  getStats: () => Promise<{
    pending_sales: number;
    cached_products: number;
    cached_employees: number;
    sync_queue: number;
  }>;
  cacheProducts: (products: any[]) => Promise<void>;
  getCachedProducts: () => Promise<any[]>;
}

export function useCacheActions(): UseCacheActionsReturn {
  const clearCache = useCallback(async () => {
    await pwaStorage.clearAllCache();
  }, []);

  const getCacheStats = useCallback(async () => {
    return await pwaStorage.getCacheStats();
  }, []);

  const cacheProducts = useCallback(async (products: any[]) => {
    await pwaStorage.cacheProducts(products);
  }, []);

  const getCachedProducts = useCallback(async () => {
    return await pwaStorage.getCachedProducts();
  }, []);

  return {
    clear: clearCache,
    getStats: getCacheStats,
    cacheProducts,
    getCachedProducts,
  };
}
