/**
 * ================================================================
 * OFFLINE SALES HOOK - BIZCONTROL 360 ERP v2.1.0
 * ================================================================
 * Hook React para gerenciar vendas offline
 * 
 * USO:
 * const { addSale, pendingSales, syncStatus, isOffline } = useOfflineSales();
 * 
 * // Adicionar venda offline
 * await addSale({ items, total, payment_method });
 * 
 * // Verificar status
 * console.log(syncStatus.pendingCount); // vendas pendentes
 * ================================================================
 */

"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  addSaleToQueue,
  getPendingSales,
  getSyncStatus,
  isOffline,
  onOnline,
  onOffline,
  QueuedSale,
  SyncStatus,
} from '@/utils/offline-db';
import { toast } from 'sonner';

export interface UseOfflineSalesReturn {
  // Estado
  isOffline: boolean;
  isSyncing: boolean;
  pendingSales: QueuedSale[];
  syncStatus: SyncStatus;
  
  // Ações
  addSale: (saleData: QueuedSale['data']) => Promise<string>;
  refreshStatus: () => Promise<void>;
}

export function useOfflineSales(): UseOfflineSalesReturn {
  const [offline, setOffline] = useState(isOffline());
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingSales, setPendingSales] = useState<QueuedSale[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    id: 'main',
    lastSync: 0,
    pendingCount: 0,
    failedCount: 0,
  });

  /**
   * Adiciona venda à queue offline
   */
  const addSale = useCallback(async (saleData: QueuedSale['data']): Promise<string> => {
    try {
      // Sempre adiciona à queue (mesmo online, para garantir persistência)
      const id = await addSaleToQueue(saleData);
      
      // Atualizar lista
      await refreshStatus();
      
      // Mostrar toast
      if (offline) {
        toast.success('Venda salva offline', {
          description: 'Será sincronizada quando voltar online',
          icon: '💾',
        });
      } else {
        toast.info('Venda em processamento', {
          description: 'Sincronizando com o servidor...',
          icon: '⏳',
        });
      }
      
      return id;
    } catch (error) {
      console.error('[useOfflineSales] Erro ao adicionar venda:', error);
      toast.error('Erro ao salvar venda', {
        description: 'Não foi possível salvar offline',
      });
      throw error;
    }
  }, [offline]);

  /**
   * Atualiza status e vendas pendentes
   */
  const refreshStatus = useCallback(async () => {
    try {
      const [status, sales] = await Promise.all([
        getSyncStatus(),
        getPendingSales(),
      ]);
      
      setSyncStatus(status);
      setPendingSales(sales);
    } catch (error) {
      console.error('[useOfflineSales] Erro ao atualizar status:', error);
    }
  }, []);

  /**
   * Setup - Atualizar status inicial
   */
  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  /**
   * Setup - Listeners de online/offline
   */
  useEffect(() => {
    const unsubOnline = onOnline(() => {
      setOffline(false);
      refreshStatus();
      toast.success('Conexão restabelecida', {
        description: 'Sincronizando vendas pendentes...',
        icon: '🌐',
      });
    });

    const unsubOffline = onOffline(() => {
      setOffline(true);
      toast.warning('Modo offline', {
        description: 'Vendas serão salvas localmente',
        icon: '📡',
      });
    });

    return () => {
      unsubOnline();
      unsubOffline();
    };
  }, [refreshStatus]);

  /**
   * Setup - Listener para mensagens do Service Worker
   */
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === 'SYNC_COMPLETE') {
          setIsSyncing(false);
          refreshStatus();
          
          const { success, failed } = event.data;
          
          if (success > 0) {
            toast.success('Vendas sincronizadas', {
              description: `${success} ${success === 1 ? 'venda enviada' : 'vendas enviadas'} com sucesso!`,
              icon: '✅',
            });
          }
          
          if (failed > 0) {
            toast.error('Erro na sincronização', {
              description: `${failed} ${failed === 1 ? 'venda falhou' : 'vendas falharam'}`,
              icon: '⚠️',
            });
          }
        }
        
        if (event.data.type === 'SYNC_START') {
          setIsSyncing(true);
        }
      };

      navigator.serviceWorker.addEventListener('message', handleMessage);

      return () => {
        navigator.serviceWorker.removeEventListener('message', handleMessage);
      };
    }
  }, [refreshStatus]);

  /**
   * Setup - Polling para atualizar status (a cada 10s)
   */
  useEffect(() => {
    const interval = setInterval(() => {
      refreshStatus();
    }, 10000); // 10 segundos

    return () => clearInterval(interval);
  }, [refreshStatus]);

  return {
    isOffline: offline,
    isSyncing,
    pendingSales,
    syncStatus,
    addSale,
    refreshStatus,
  };
}

/**
 * Hook simplificado para apenas verificar status offline
 */
export function useOfflineStatus() {
  const [offline, setOffline] = useState(isOffline());

  useEffect(() => {
    const unsubOnline = onOnline(() => setOffline(false));
    const unsubOffline = onOffline(() => setOffline(true));

    return () => {
      unsubOnline();
      unsubOffline();
    };
  }, []);

  return offline;
}
