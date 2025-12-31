/**
 * ================================================================
 * OFFLINE DATABASE - BIZCONTROL 360 ERP v2.1.0
 * ================================================================
 * IndexedDB manager para armazenar dados offline e sincronizar
 * quando a conexão voltar
 * 
 * FEATURES:
 * - Armazenamento de vendas offline
 * - Queue de sincronização
 * - Retry automático
 * - Conflict resolution
 * ================================================================
 */

"use client";

const DB_NAME = 'bizcontrol_offline';
const DB_VERSION = 1;

// Stores
const STORES = {
  SALES_QUEUE: 'sales_queue',
  SYNC_STATUS: 'sync_status',
  CACHED_DATA: 'cached_data',
};

export interface QueuedSale {
  id: string;
  timestamp: number;
  data: {
    items: Array<{
      product_id: string;
      product_name: string;
      quantity: number;
      price: number;
      total: number;
    }>;
    total: number;
    payment_method: string;
    customer_name?: string;
    notes?: string;
  };
  status: 'pending' | 'syncing' | 'synced' | 'error';
  retryCount: number;
  lastError?: string;
}

export interface SyncStatus {
  id: string;
  lastSync: number;
  pendingCount: number;
  failedCount: number;
}

/**
 * Abre conexão com IndexedDB
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('[IndexedDB] Erro ao abrir database');
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Store para vendas pendentes
      if (!db.objectStoreNames.contains(STORES.SALES_QUEUE)) {
        const salesStore = db.createObjectStore(STORES.SALES_QUEUE, { keyPath: 'id' });
        salesStore.createIndex('status', 'status', { unique: false });
        salesStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      // Store para status de sync
      if (!db.objectStoreNames.contains(STORES.SYNC_STATUS)) {
        db.createObjectStore(STORES.SYNC_STATUS, { keyPath: 'id' });
      }

      // Store para dados cacheados
      if (!db.objectStoreNames.contains(STORES.CACHED_DATA)) {
        const cacheStore = db.createObjectStore(STORES.CACHED_DATA, { keyPath: 'id' });
        cacheStore.createIndex('type', 'type', { unique: false });
      }

      console.log('[IndexedDB] Database criada/atualizada com sucesso');
    };
  });
}

/**
 * Adiciona venda à queue offline
 */
export async function addSaleToQueue(saleData: QueuedSale['data']): Promise<string> {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORES.SALES_QUEUE], 'readwrite');
    const store = transaction.objectStore(STORES.SALES_QUEUE);

    const queuedSale: QueuedSale = {
      id: generateId(),
      timestamp: Date.now(),
      data: saleData,
      status: 'pending',
      retryCount: 0,
    };

    await new Promise<void>((resolve, reject) => {
      const request = store.add(queuedSale);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    console.log('[OfflineDB] Venda adicionada à queue:', queuedSale.id);

    // Atualizar status de sync
    await updateSyncStatus();

    // Registrar sync se tiver service worker
    if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
      const registration = await navigator.serviceWorker.ready;
      (registration as any).sync.register('sync-sales');
      console.log('[OfflineDB] Background sync registrado');
    }

    return queuedSale.id;
  } catch (error) {
    console.error('[OfflineDB] Erro ao adicionar venda à queue:', error);
    throw error;
  }
}

/**
 * Obtém todas as vendas pendentes
 */
export async function getPendingSales(): Promise<QueuedSale[]> {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORES.SALES_QUEUE], 'readonly');
    const store = transaction.objectStore(STORES.SALES_QUEUE);
    const index = store.index('status');

    return new Promise((resolve, reject) => {
      const request = index.getAll('pending');
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('[OfflineDB] Erro ao obter vendas pendentes:', error);
    return [];
  }
}

/**
 * Atualiza status de uma venda na queue
 */
export async function updateSaleStatus(
  id: string,
  status: QueuedSale['status'],
  error?: string
): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORES.SALES_QUEUE], 'readwrite');
    const store = transaction.objectStore(STORES.SALES_QUEUE);

    const sale = await new Promise<QueuedSale>((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    if (!sale) {
      throw new Error(`Venda ${id} não encontrada`);
    }

    sale.status = status;
    if (error) {
      sale.lastError = error;
      sale.retryCount += 1;
    }

    await new Promise<void>((resolve, reject) => {
      const request = store.put(sale);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    console.log(`[OfflineDB] Venda ${id} atualizada para status: ${status}`);

    // Atualizar status de sync
    await updateSyncStatus();
  } catch (error) {
    console.error('[OfflineDB] Erro ao atualizar status:', error);
    throw error;
  }
}

/**
 * Remove venda da queue (após sync bem-sucedido)
 */
export async function removeSaleFromQueue(id: string): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORES.SALES_QUEUE], 'readwrite');
    const store = transaction.objectStore(STORES.SALES_QUEUE);

    await new Promise<void>((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    console.log(`[OfflineDB] Venda ${id} removida da queue`);

    // Atualizar status de sync
    await updateSyncStatus();
  } catch (error) {
    console.error('[OfflineDB] Erro ao remover venda:', error);
    throw error;
  }
}

/**
 * Obtém status de sincronização
 */
export async function getSyncStatus(): Promise<SyncStatus> {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORES.SALES_QUEUE, STORES.SYNC_STATUS], 'readonly');
    
    // Contar vendas pendentes
    const salesStore = transaction.objectStore(STORES.SALES_QUEUE);
    const allSales = await new Promise<QueuedSale[]>((resolve, reject) => {
      const request = salesStore.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });

    const pendingCount = allSales.filter(s => s.status === 'pending').length;
    const failedCount = allSales.filter(s => s.status === 'error').length;

    // Buscar último sync
    const statusStore = transaction.objectStore(STORES.SYNC_STATUS);
    const lastStatus = await new Promise<SyncStatus | null>((resolve, reject) => {
      const request = statusStore.get('main');
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });

    return {
      id: 'main',
      lastSync: lastStatus?.lastSync || 0,
      pendingCount,
      failedCount,
    };
  } catch (error) {
    console.error('[OfflineDB] Erro ao obter status de sync:', error);
    return {
      id: 'main',
      lastSync: 0,
      pendingCount: 0,
      failedCount: 0,
    };
  }
}

/**
 * Atualiza status de sincronização
 */
async function updateSyncStatus(): Promise<void> {
  try {
    const status = await getSyncStatus();
    const db = await openDB();
    const transaction = db.transaction([STORES.SYNC_STATUS], 'readwrite');
    const store = transaction.objectStore(STORES.SYNC_STATUS);

    await new Promise<void>((resolve, reject) => {
      const request = store.put(status);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('[OfflineDB] Erro ao atualizar status de sync:', error);
  }
}

/**
 * Limpa todas as vendas sincronizadas
 */
export async function clearSyncedSales(): Promise<number> {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORES.SALES_QUEUE], 'readwrite');
    const store = transaction.objectStore(STORES.SALES_QUEUE);
    const index = store.index('status');

    const syncedSales = await new Promise<QueuedSale[]>((resolve, reject) => {
      const request = index.getAll('synced');
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });

    for (const sale of syncedSales) {
      await store.delete(sale.id);
    }

    console.log(`[OfflineDB] ${syncedSales.length} vendas sincronizadas removidas`);

    await updateSyncStatus();

    return syncedSales.length;
  } catch (error) {
    console.error('[OfflineDB] Erro ao limpar vendas sincronizadas:', error);
    return 0;
  }
}

/**
 * Gera ID único
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Verifica se está offline
 */
export function isOffline(): boolean {
  return !navigator.onLine;
}

/**
 * Event listeners para online/offline
 */
let onlineListeners: Array<() => void> = [];
let offlineListeners: Array<() => void> = [];

export function onOnline(callback: () => void): () => void {
  onlineListeners.push(callback);
  return () => {
    onlineListeners = onlineListeners.filter(cb => cb !== callback);
  };
}

export function onOffline(callback: () => void): () => void {
  offlineListeners.push(callback);
  return () => {
    offlineListeners = offlineListeners.filter(cb => cb !== callback);
  };
}

// Setup global listeners
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('[OfflineDB] Voltou online');
    onlineListeners.forEach(cb => cb());
  });

  window.addEventListener('offline', () => {
    console.log('[OfflineDB] Ficou offline');
    offlineListeners.forEach(cb => cb());
  });
}
