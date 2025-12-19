/**
 * ================================================================
 * PWA INDEXEDDB - BIZCONTROL 360 ERP v2.0.0
 * ================================================================
 * Armazenamento local para modo offline
 * 
 * ESTRUTURA:
 * - pending_sales: Vendas offline aguardando sync
 * - cached_products: Produtos cacheados
 * - cached_employees: Funcionários cacheados
 * - sync_queue: Fila de sincronização
 * 
 * AUTOR: PWA Team
 * DATA: 18 Dezembro 2025
 * ================================================================
 */

"use client";

const DB_NAME = "BizControl360_v2";
const DB_VERSION = 1;

// ================================================================
// TYPES
// ================================================================

export interface PendingSale {
  id: string;
  items: Array<{
    product_id: string;
    quantity: number;
  }>;
  payment_method: string;
  discount_code?: string;
  timestamp: number;
  synced: boolean;
}

export interface CachedProduct {
  id: string;
  name: string;
  price: number;
  cost_price: number | null;
  quantity: number;
  is_active: boolean;
  cached_at: number;
}

export interface CachedEmployee {
  id: string;
  full_name: string;
  role: string;
  company_id: string;
  cached_at: number;
}

export interface SyncQueueItem {
  id: string;
  type: "sale" | "product" | "employee";
  action: "create" | "update" | "delete";
  data: any;
  timestamp: number;
  retries: number;
  error?: string;
}

// ================================================================
// DATABASE INITIALIZATION
// ================================================================

/**
 * Inicializa o IndexedDB
 */
export function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("IndexedDB only works in browser"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error("Failed to open IndexedDB"));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Store: Pending Sales
      if (!db.objectStoreNames.contains("pending_sales")) {
        const salesStore = db.createObjectStore("pending_sales", { keyPath: "id" });
        salesStore.createIndex("timestamp", "timestamp", { unique: false });
        salesStore.createIndex("synced", "synced", { unique: false });
      }

      // Store: Cached Products
      if (!db.objectStoreNames.contains("cached_products")) {
        const productsStore = db.createObjectStore("cached_products", { keyPath: "id" });
        productsStore.createIndex("cached_at", "cached_at", { unique: false });
      }

      // Store: Cached Employees
      if (!db.objectStoreNames.contains("cached_employees")) {
        const employeesStore = db.createObjectStore("cached_employees", { keyPath: "id" });
        employeesStore.createIndex("company_id", "company_id", { unique: false });
      }

      // Store: Sync Queue
      if (!db.objectStoreNames.contains("sync_queue")) {
        const queueStore = db.createObjectStore("sync_queue", { keyPath: "id" });
        queueStore.createIndex("timestamp", "timestamp", { unique: false });
        queueStore.createIndex("type", "type", { unique: false });
      }
    };
  });
}

// ================================================================
// PENDING SALES
// ================================================================

/**
 * Adiciona venda pendente (offline)
 */
export async function addPendingSale(sale: Omit<PendingSale, "id" | "timestamp" | "synced">): Promise<string> {
  const db = await initDB();
  
  const id = `pending_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const pendingSale: PendingSale = {
    ...sale,
    id,
    timestamp: Date.now(),
    synced: false,
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["pending_sales"], "readwrite");
    const store = transaction.objectStore("pending_sales");
    const request = store.add(pendingSale);

    request.onsuccess = () => resolve(id);
    request.onerror = () => reject(new Error("Failed to add pending sale"));
  });
}

/**
 * Busca vendas pendentes
 */
export async function getPendingSales(): Promise<PendingSale[]> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["pending_sales"], "readonly");
    const store = transaction.objectStore("pending_sales");
    const index = store.index("synced");
    const request = index.getAll(IDBKeyRange.only(false));

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error("Failed to get pending sales"));
  });
}

/**
 * Marca venda como sincronizada
 */
export async function markSaleAsSynced(id: string): Promise<void> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["pending_sales"], "readwrite");
    const store = transaction.objectStore("pending_sales");
    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      const sale = getRequest.result;
      if (sale) {
        sale.synced = true;
        const updateRequest = store.put(sale);
        updateRequest.onsuccess = () => resolve();
        updateRequest.onerror = () => reject(new Error("Failed to update sale"));
      } else {
        resolve(); // Already deleted
      }
    };

    getRequest.onerror = () => reject(new Error("Failed to mark sale as synced"));
  });
}

/**
 * Remove venda pendente
 */
export async function deletePendingSale(id: string): Promise<void> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["pending_sales"], "readwrite");
    const store = transaction.objectStore("pending_sales");
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error("Failed to delete pending sale"));
  });
}

// ================================================================
// CACHED PRODUCTS
// ================================================================

/**
 * Cachea produtos para uso offline
 */
export async function cacheProducts(products: any[]): Promise<void> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["cached_products"], "readwrite");
    const store = transaction.objectStore("cached_products");

    // Clear old cache
    store.clear();

    // Add new products
    const cached_at = Date.now();
    products.forEach((product) => {
      store.add({
        id: product.id,
        name: product.name,
        price: product.price,
        cost_price: product.cost_price,
        quantity: product.quantity,
        is_active: product.is_active,
        cached_at,
      });
    });

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(new Error("Failed to cache products"));
  });
}

/**
 * Busca produtos cacheados
 */
export async function getCachedProducts(): Promise<CachedProduct[]> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["cached_products"], "readonly");
    const store = transaction.objectStore("cached_products");
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error("Failed to get cached products"));
  });
}

/**
 * Busca produto cacheado por ID
 */
export async function getCachedProduct(id: string): Promise<CachedProduct | null> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["cached_products"], "readonly");
    const store = transaction.objectStore("cached_products");
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(new Error("Failed to get cached product"));
  });
}

// ================================================================
// SYNC QUEUE
// ================================================================

/**
 * Adiciona item à fila de sincronização
 */
export async function addToSyncQueue(item: Omit<SyncQueueItem, "id" | "timestamp" | "retries">): Promise<string> {
  const db = await initDB();

  const id = `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const queueItem: SyncQueueItem = {
    ...item,
    id,
    timestamp: Date.now(),
    retries: 0,
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["sync_queue"], "readwrite");
    const store = transaction.objectStore("sync_queue");
    const request = store.add(queueItem);

    request.onsuccess = () => resolve(id);
    request.onerror = () => reject(new Error("Failed to add to sync queue"));
  });
}

/**
 * Busca itens da fila de sincronização
 */
export async function getSyncQueue(): Promise<SyncQueueItem[]> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["sync_queue"], "readonly");
    const store = transaction.objectStore("sync_queue");
    const request = store.getAll();

    request.onsuccess = () => {
      const items = request.result;
      // Ordenar por timestamp (mais antigo primeiro)
      items.sort((a, b) => a.timestamp - b.timestamp);
      resolve(items);
    };
    request.onerror = () => reject(new Error("Failed to get sync queue"));
  });
}

/**
 * Remove item da fila de sincronização
 */
export async function removeFromSyncQueue(id: string): Promise<void> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["sync_queue"], "readwrite");
    const store = transaction.objectStore("sync_queue");
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error("Failed to remove from sync queue"));
  });
}

/**
 * Limpa toda a fila de sincronização
 */
export async function clearSyncQueue(): Promise<void> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["sync_queue"], "readwrite");
    const store = transaction.objectStore("sync_queue");
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error("Failed to clear sync queue"));
  });
}

// ================================================================
// UTILITIES
// ================================================================

/**
 * Limpa todo o cache (útil para logout)
 */
export async function clearAllCache(): Promise<void> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      ["pending_sales", "cached_products", "cached_employees", "sync_queue"],
      "readwrite"
    );

    transaction.objectStore("pending_sales").clear();
    transaction.objectStore("cached_products").clear();
    transaction.objectStore("cached_employees").clear();
    transaction.objectStore("sync_queue").clear();

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(new Error("Failed to clear cache"));
  });
}

/**
 * Estatísticas do cache
 */
export async function getCacheStats(): Promise<{
  pending_sales: number;
  cached_products: number;
  cached_employees: number;
  sync_queue: number;
}> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      ["pending_sales", "cached_products", "cached_employees", "sync_queue"],
      "readonly"
    );

    const counts = {
      pending_sales: 0,
      cached_products: 0,
      cached_employees: 0,
      sync_queue: 0,
    };

    let completed = 0;
    const checkComplete = () => {
      completed++;
      if (completed === 4) {
        resolve(counts);
      }
    };

    transaction.objectStore("pending_sales").count().onsuccess = (e) => {
      counts.pending_sales = (e.target as IDBRequest).result;
      checkComplete();
    };

    transaction.objectStore("cached_products").count().onsuccess = (e) => {
      counts.cached_products = (e.target as IDBRequest).result;
      checkComplete();
    };

    transaction.objectStore("cached_employees").count().onsuccess = (e) => {
      counts.cached_employees = (e.target as IDBRequest).result;
      checkComplete();
    };

    transaction.objectStore("sync_queue").count().onsuccess = (e) => {
      counts.sync_queue = (e.target as IDBRequest).result;
      checkComplete();
    };

    transaction.onerror = () => reject(new Error("Failed to get cache stats"));
  });
}

// ================================================================
// EXPORT DEFAULT OBJECT (For convenience)
// ================================================================
export const pwaStorage = {
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
  getCacheStats
};
