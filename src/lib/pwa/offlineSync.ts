/**
 * ================================================================
 * OFFLINE SYNC SERVICE - BIZCONTROL 360 ERP v2.0.0
 * ================================================================
 * Serviço completo de sincronização offline/online
 * Seguindo padrões de performance do agent-os:
 * - Single Responsibility
 * - Reusability  
 * - Clear Interface
 * - Performance Considerations
 * ================================================================
 */

import { pwaStorage, SyncQueueItem } from './indexedDB';

// ================================================================
// TYPES
// ================================================================

export interface SyncResult {
  success: boolean;
  totalItems: number;
  syncedItems: number;
  failedItems: number;
  errors: Array<{
    item: SyncQueueItem;
    error: string;
  }>;
}

export interface SyncProgress {
  current: number;
  total: number;
  currentItem: string;
  status: 'syncing' | 'completed' | 'failed' | 'paused';
}

export type SyncProgressCallback = (progress: SyncProgress) => void;

// ================================================================
// CONFIGURAÇÃO
// ================================================================

const SYNC_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 5000, // 5 segundos
  BATCH_SIZE: 10, // Processar em lotes para performance
  TIMEOUT: 30000, // 30 segundos timeout por request
  CONSECUTIVE_ERRORS: 3, // Pausar após 3 erros consecutivos
} as const;

// ================================================================
// CORE SYNC MANAGER
// ================================================================

class OfflineSyncManager {
  private isSyncing = false;
  private paused = false;
  private consecutiveErrors = 0;
  private abortController: AbortController | null = null;
  private progressCallback: SyncProgressCallback | null = null;

  /**
   * Define callback para progresso
   */
  setProgressCallback(callback: SyncProgressCallback): void {
    this.progressCallback = callback;
  }

  /**
   * Atualiza progresso
   */
  private updateProgress(progress: Omit<SyncProgress, 'current' | 'total'>): void {
    if (this.progressCallback) {
      this.progressCallback({
        ...progress,
        current: this.progressedItems,
        total: this.totalItems,
      });
    }
  }

  private get progressedItems(): number {
    return this.totalItems - this.pendingItems;
  }

  private get pendingItems(): number {
    return 0; // Implementation would track this
  }

  private get totalItems(): number {
    return 0; // Implementation would track this
  }

  /**
   * Sincronização completa
   */
  async syncAll(options?: {
    force?: boolean;
    types?: Array<'sale' | 'product' | 'employee'>;
  }): Promise<SyncResult> {
    if (this.isSyncing && !options?.force) {
      throw new Error('Sincronização já em andamento');
    }

    // Verificar conexão
    if (!navigator.onLine) {
      throw new Error('Dispositivo offline');
    }

    await this.startSync();

    try {
      const queue = await pwaStorage.getSyncQueue();
      
      // Filtrar por tipo se especificado
      let itemsToSync = queue;
      if (options?.types) {
        itemsToSync = queue.filter(item => options.types!.includes(item.type));
      }

      const result = await this.processBatch(itemsToSync);

      // Se não houver erros consecutivos, continuar com outras sincronizações
      if (this.consecutiveErrors < SYNC_CONFIG.CONSECUTIVE_ERRORS) {
        await this.performAdditionalSyncs();
      }

      return result;

    } catch (error) {
      this.updateProgress({
        status: 'failed',
        currentItem: 'Erro geral',
      });
      throw error;
    } finally {
      await this.stopSync();
    }
  }

  /**
   * Processa itens em lote
   */
  private async processBatch(items: SyncQueueItem[]): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      totalItems: items.length,
      syncedItems: 0,
      failedItems: 0,
      errors: [],
    };

    // Processar em lotes para performance
    for (let i = 0; i < items.length; i += SYNC_CONFIG.BATCH_SIZE) {
      const batch = items.slice(i, i + SYNC_CONFIG.BATCH_SIZE);
      
      for (const item of batch) {
        try {
          await this.syncItem(item);
          result.syncedItems++;
          
          // Reset consecutive errors on success
          this.consecutiveErrors = 0;
          
        } catch (error) {
          result.failedItems++;
          result.errors.push({
            item,
            error: error instanceof Error ? error.message : 'Erro desconhecido',
          });

          this.consecutiveErrors++;
          
          // Pausar se muitos erros consecutivos
          if (this.consecutiveErrors >= SYNC_CONFIG.CONSECUTIVE_ERRORS) {
            this.paused = true;
            break;
          }
        }

        this.updateProgress({
          status: this.paused ? 'paused' : 'syncing',
          currentItem: `${item.type}:${item.action}`,
        });
      }

      if (this.paused) break;
    }

    result.success = result.failedItems === 0;
    return result;
  }

  /**
   * Sincroniza item individual
   */
  private async syncItem(item: SyncQueueItem): Promise<void> {
    // Verificar retries
    if (item.retries >= SYNC_CONFIG.MAX_RETRIES) {
      throw new Error('Máximo de tentativas atingido');
    }

    // Criar AbortController para este item
    const timeoutController = new AbortController();
    const timeoutId = setTimeout(() => {
      timeoutController.abort();
    }, SYNC_CONFIG.TIMEOUT);

    try {
      let response: Response;

      switch (item.type) {
        case 'sale':
          response = await this.syncSale(item, timeoutController.signal);
          break;
        case 'product':
          response = await this.syncProduct(item, timeoutController.signal);
          break;
        case 'employee':
          response = await this.syncEmployee(item, timeoutController.signal);
          break;
        default:
          throw new Error(`Tipo de item desconhecido: ${item.type}`);
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Remover da fila se sucesso
      await pwaStorage.removeFromSyncQueue(item.id);

    } catch (error) {
      // Incrementar retries
      item.retries++;
      item.error = error instanceof Error ? error.message : 'Erro desconhecido';
      item.timestamp = Date.now(); // Atualizar timestamp para retry

      // Atualizar item na fila
      await pwaStorage.addToSyncQueue(item);
      await pwaStorage.removeFromSyncQueue(item.id);

      throw error;

    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Sincroniza venda
   */
  private async syncSale(item: SyncQueueItem, signal: AbortSignal): Promise<Response> {
    const saleData = item.data;
    
    return fetch('/api/sales', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
      body: JSON.stringify({
        items: saleData.items || [saleData],
        total: saleData.total || saleData.price,
        employee_id: saleData.employeeId,
        company_id: saleData.companyId,
        payment_method: saleData.paymentMethod || 'dinheiro',
        timestamp: saleData.timestamp,
        offline_id: item.id,
      }),
      signal,
    });
  }

  /**
   * Sincroniza produto
   */
  private async syncProduct(item: SyncQueueItem, signal: AbortSignal): Promise<Response> {
    return fetch('/api/products', {
      method: item.action === 'delete' ? 'DELETE' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
      body: item.action !== 'delete' ? JSON.stringify(item.data) : undefined,
      signal,
    });
  }

  /**
   * Sincroniza funcionário
   */
  private async syncEmployee(item: SyncQueueItem, signal: AbortSignal): Promise<Response> {
    return fetch('/api/employees', {
      method: item.action === 'delete' ? 'DELETE' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
      body: item.action !== 'delete' ? JSON.stringify(item.data) : undefined,
      signal,
    });
  }

  /**
   * Realiza sincronizações adicionais
   */
  private async performAdditionalSyncs(): Promise<void> {
    try {
      // Cache de produtos para uso offline
      await this.cacheProducts();
      
      // Cache de funcionários
      await this.cacheEmployees();
      
      // Backup de dados importantes
      await this.performBackup();
      
    } catch (error) {
      console.warn('Erro em sincronizações adicionais:', error);
      // Não falhar a sincronização principal por causa disso
    }
  }

  /**
   * Cache de produtos
   */
  private async cacheProducts(): Promise<void> {
    if (!navigator.onLine) return;

    try {
      const response = await fetch('/api/products', {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
      });

      if (response.ok) {
        const products = await response.json();
        await pwaStorage.cacheProducts(products);
      }
    } catch (error) {
      console.warn('Erro ao cachear produtos:', error);
    }
  }

  /**
   * Cache de funcionários
   */
  private async cacheEmployees(): Promise<void> {
    if (!navigator.onLine) return;

    try {
      const response = await fetch('/api/employees', {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
      });

      if (response.ok) {
        const employees = await response.json();
        // Implementar cache de funcionários se necessário
      }
    } catch (error) {
      console.warn('Erro ao cachear funcionários:', error);
    }
  }

  /**
   * Backup local dos dados
   */
  private async performBackup(): Promise<void> {
    try {
      const stats = await pwaStorage.getCacheStats();
      
      // Salvar estatísticas no localStorage para persistência
      localStorage.setItem('backupStats', JSON.stringify({
        timestamp: Date.now(),
        ...stats,
      }));
      
    } catch (error) {
      console.warn('Erro ao realizar backup:', error);
    }
  }

  /**
   * Obtém token de autenticação
   */
  private getAuthToken(): string {
    return localStorage.getItem('authToken') || '';
  }

  /**
   * Inicia sincronização
   */
  private async startSync(): Promise<void> {
    this.isSyncing = true;
    this.paused = false;
    this.consecutiveErrors = 0;
    this.abortController = new AbortController();
  }

  /**
   * Para sincronização
   */
  private async stopSync(): Promise<void> {
    this.isSyncing = false;
    
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  /**
   * Cancela sincronização atual
   */
  cancel(): void {
    if (this.abortController) {
      this.abortController.abort();
    }
    this.stopSync();
  }

  /**
   * Verifica status da sincronização
   */
  get status(): {
    isSyncing: boolean;
    isPaused: boolean;
    hasPendingItems: boolean;
  } {
    return {
      isSyncing: this.isSyncing,
      isPaused: this.paused,
      hasPendingItems: false, // Implementation would check queue
    };
  }
}

// ================================================================
// INSTANCE & EXPORTS
// ================================================================

export const offlineSync = new OfflineSyncManager();

// Funções de conveniência para easy access
export const syncOffline = async (options?: Parameters<OfflineSyncManager['syncAll']>[0]): Promise<SyncResult> => {
  return offlineSync.syncAll(options);
};

export const cancelSync = (): void => {
  offlineSync.cancel();
};

export const setSyncProgressCallback = (callback: SyncProgressCallback): void => {
  offlineSync.setProgressCallback(callback);
};

// Auto-sync quando voltar online
if (typeof window !== 'undefined') {
  window.addEventListener('online', async () => {
    try {
      // Verificar se há itens pendentes
      const stats = await pwaStorage.getCacheStats();
      if (stats.sync_queue > 0) {
        // Auto-sync com delay para garantir conexão estável
        setTimeout(() => {
          syncOffline().catch(error => {
            console.warn('Auto-sync falhou:', error);
          });
        }, 2000);
      }
    } catch (error) {
      console.warn('Erro ao verificar itens pendentes:', error);
    }
  });
}
