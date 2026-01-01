/**
 * ================================================================
 * PWA INDEXEDDB ENHANCED - BIZCONTROL 360 ERP v2.1.0
 * ================================================================
 * Versão melhorada com:
 * - Storage Limits e monitoramento
 * - Limpeza automática inteligente
 * - Integragão com Conflict Resolution
 * - Otimizações de performance (batching, indexes)
 * - Storage quota management
 * 
 * AUTOR: PWA Team Enhanced
 * DATA: 01 Janeiro 2026
 * ================================================================
 */

"use client";

import { conflictResolution, autoResolveConflict } from './conflictResolution';

// ================================================================
// TYPES
// ================================================================

export interface PendingSale {
  id: string;
  items: Array<{
    product_id: string;
    quantity: number;
    price: number;  // preço no momento da venda
  }>;
  total: number;
  payment_method: string;
  discount_code?: string;
  discount_amount?: number;
  timestamp: number;
  synced: boolean;
  sync_attempts: number;
  last_sync_attempt?: number;
  local_user_id?: string;
}

export interface CachedProduct {
  id: string;
  name: string;
  code?: string;
  price: number;
  cost_price: number | null;
  quantity: number;
  is_active: boolean;
  category_id?: string;
  cached_at: number;
  version: number;  // Para conflict tracking
  last_modified?: string;
}

export interface CachedEmployee {
  id: string;
  full_name: string;
  email: string;
  role: string;
  company_id: string;
  cached_at: number;
  version: number;
  last_modified?: string;
}

export interface SyncQueueItem {
  id: string;
  type: "sale" | "product" | "employee" | "company";
  action: "create" | "update" | "delete";
  data: any;
  conflict_resolution?: any;
  timestamp: number;
  retries: number;
  error?: string;
  priority: 'high' | 'medium' | 'low';
}

export interface StorageStats {
  totalSize: number;  // Em bytes
  stores: {
    pending_sales: { count: number; size: number };
    cached_products: { count: number; size: number };
    cached_employees: { count: number; size: number };
    sync_queue: { count: number; size: number };
  };
  usagePercentage: number;  // 0-100
  isNearLimit: boolean;
  quotaAvailable?: number;
}

export interface CleanupResult {
  deletedCount: number;
  freedBytes: number;
  storesCleaned: string[];
}

// ================================================================
// CONFIGURAÇÃO
// ================================================================

const DB_CONFIG = {
  NAME: "BizControl360_v2",
  VERSION: 2,
  
  // Storage limits
  STORAGE_QUOTA: {
    MAX_BYTES: 100 * 1024 * 1024,  // 100MB max
    WARNING_THRESHOLD: 0.8,         // 80%
    CLEANUP_THRESHOLD: 0.9,         // 90% - limpeza automática
  },
  
  // Retention policies (em dias)
  RETENTION: {
    PENDING_SALES: 30,      // 30 dias
    CACHED_PRODUCTS: 7,     // 7 dias
    CACHED_EMPLOYEES: 7,
    SYNC_QUEUE: 1,          // 1 dia
  },
  
  // Cache size limits
  CACHE_LIMITS: {
    MAX_PRODUCTS: 1000,     // No máximo 1000 produtos cacheados
    MAX_EMPLOYEES: 100,
    MAX_PENDING_SALES: 500,
  },
  
  // Performance tuning
  PERFORMANCE: {
    BATCH_SIZE: 100,        // Operações em batch
    INDEXED_QUERY_LIMIT: 500,
    CLEANUP_INTERVAL: 3600000,  // 1 hora em ms
  },
} as const;

// ================================================================
// DATABASE MANAGER
// ================================================================

class EnhancedIndexedDB {
  private db: IDBDatabase | null = null;
  private dbPromise: Promise<IDBDatabase> | null = null;
  private cleanupTimer: NodeJS.Timeout | null = null;
  private sizeCache: Map<string, number> = new Map();
  private lastCleanup = 0;

  /**
   * Inicializa o IndexedDB com version 2
   */
  async init(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db;
    }

    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === "undefined") {
        reject(new Error("IndexedDB only works in browser"));
        return;
      }

      const request = indexedDB.open(DB_CONFIG.NAME, DB_CONFIG.VERSION);

      request.onerror = () => {
        reject(new Error(`Failed to open IndexedDB: ${request.error}`));
        this.dbPromise = null;
      };

      request.onsuccess = () => {
        this.db = request.result;
        
        // Setup erro handler
        this.db.onerror = (event) => {
          console.error('[IndexedDB] Error:', (event.target as IDBRequest).error);
        };
        
        // Iniciar limpeza automática
        this.startAutoCleanup();
        
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const oldVersion = event.oldVersion;

        console.log(`[IndexedDB] Upgrading from ${oldVersion} to ${DB_CONFIG.VERSION}`);

        // Store: Pending Sales
        if (!db.objectStoreNames.contains("pending_sales")) {
          const salesStore = db.createObjectStore("pending_sales", { keyPath: "id" });
          salesStore.createIndex("timestamp", "timestamp", { unique: false });
          salesStore.createIndex("synced", "synced", { unique: false });
          salesStore.createIndex("local_user_id", "local_user_id", { unique: false });
        } else if (oldVersion < 2) {
          // Adicionar novo índice
          const salesStore = (event.target as IDBTransaction).objectStore("pending_sales");
          if (!salesStore.indexNames.contains("local_user_id")) {
            salesStore.createIndex("local_user_id", "local_user_id", { unique: false });
          }
        }

        // Store: Cached Products
        if (!db.objectStoreNames.contains("cached_products")) {
          const productsStore = db.createObjectStore("cached_products", { keyPath: "id" });
          productsStore.createIndex("cached_at", "cached_at", { unique: false });
          productsStore.createIndex("is_active", "is_active", { unique: false });
          productsStore.createIndex("version", "version", { unique: false });
        }

        // Store: Cached Employees
        if (!db.objectStoreNames.contains("cached_employees")) {
          const employeesStore = db.createObjectStore("cached_employees", { keyPath: "id" });
          employeesStore.createIndex("company_id", "company_id", { unique: false });
          employeesStore.createIndex("cached_at", "cached_at", { unique: false });
          employeesStore.createIndex("version", "version", { unique: false });
        }

        // Store: Sync Queue
        if (!db.objectStoreNames.contains("sync_queue")) {
          const queueStore = db.createObjectStore("sync_queue", { keyPath: "id" });
          queueStore.createIndex("timestamp", "timestamp", { unique: false });
          queueStore.createIndex("type", "type", { unique: false });
          queueStore.createIndex("priority", "priority", { unique: false });
          queueStore.createIndex("retries", "retries", { unique: false });
        }
      };
    });

    return this.dbPromise;
  }

  /**
   * Inicia limpeza automática periódica
   */
  private startAutoCleanup(): void {
    // Limpar a cada hora
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    
    this.cleanupTimer = setInterval(() => {
      this.performMaintenance().catch(console.error);
    }, DB_CONFIG.PERFORMANCE.CLEANUP_INTERVAL);
    
    // Primeira limpeza após 1 minuto
    setTimeout(() => {
      this.performMaintenance().catch(console.error);
    }, 60000);
  }

  /**
   * Para limpeza automática
   */
  private stopAutoCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  /**
   * Executa manutenção (cleanup, checks, etc)
   */
  private async performMaintenance(): Promise<void> {
    try {
      console.log('[IndexedDB] Running maintenance...');
      
      const stats = await this.getStorageStats();
      
      // Limpeza automática se próximo do limite
      if (stats.isNearLimit) {
        console.warn('[IndexedDB] Storage near limit, auto-cleaning...');
        await this.performAutoCleanup(stats);
      }
      
      // Limpar conflitos antigos
      const conflictsCleaned = conflictResolution.cleanupOldConflicts();
      if (conflictsCleaned > 0) {
        console.log(`[IndexedDB] Cleaned ${conflictsCleaned} old conflicts`);
      }
      
      this.lastCleanup = Date.now();
      console.log('[IndexedDB] Maintenance complete');
      
    } catch (error) {
      console.error('[IndexedDB] Maintenance failed:', error);
    }
  }

  /**
   * Limpeza automática baseada em thresholds
   */
  private async performAutoCleanup(stats: StorageStats): Promise<CleanupResult> {
    const result: CleanupResult = {
      deletedCount: 0,
      freedBytes: 0,
      storesCleaned: [],
    };

    try {
      const db = await this.init();
      const now = Date.now();

      // 1. Limpar cache de produtos antigos
      if (stats.stores.cached_products.count > DB_CONFIG.CACHE_LIMITS.MAX_PRODUCTS) {
        const productsDeleted = await this.deleteOldProducts(
          db,
          now - DB_CONFIG.RETENTION.CACHED_PRODUCTS * 24 * 60 * 60 * 1000,
          DB_CONFIG.CACHE_LIMITS.MAX_PRODUCTS
        );
        if (productsDeleted > 0) {
          result.deletedCount += productsDeleted;
          result.storesCleaned.push('cached_products');
        }
      }

      // 2. Limpar cache de funcionários antigos
      if (stats.stores.cached_employees.count > DB_CONFIG.CACHE_LIMITS.MAX_EMPLOYEES) {
        const employeesDeleted = await this.deleteOldEmployees(
          db,
          now - DB_CONFIG.RETENTION.CACHED_EMPLOYEES * 24 * 60 * 60 * 1000
        );
        if (employeesDeleted > 0) {
          result.deletedCount += employeesDeleted;
          result.storesCleaned.push('cached_employees');
        }
      }

      // 3. Limpar vendas muito antigas (não sincronizadas há muito tempo)
      const salesDeleted = await this.deleteOldPendingSales(
        db,
        now - DB_CONFIG.RETENTION.PENDING_SALES * 24 * 60 * 60 * 1000
      );
      if (salesDeleted > 0) {
        result.deletedCount += salesDeleted;
        result.storesCleaned.push('pending_sales');
      }

      // 4. Limpar sync queue antiga
      const syncDeleted = await this.deleteOldSyncQueue(
        db,
        now - DB_CONFIG.RETENTION.SYNC_QUEUE * 24 * 60 * 60 * 1000
      );
      if (syncDeleted > 0) {
        result.deletedCount += syncDeleted;
        result.storesCleaned.push('sync_queue');
      }

      // Recalcular tamanho limpo
      const newStats = await this.getStorageStats();
      result.freedBytes = stats.totalSize - newStats.totalSize;

      console.log('[IndexedDB] Auto-cleanup complete:', result);
      return result;

    } catch (error) {
      console.error('[IndexedDB] Auto-cleanup failed:', error);
      throw error;
    }
  }

  /**
   * Exclui produtos antigos
   */
  private async deleteOldProducts(
    db: IDBDatabase,
    beforeTimestamp: number,
    keepLimit?: number
  ): Promise<number> {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["cached_products"], "readwrite");
      const store = transaction.objectStore("cached_products");
      const index = store.index("cached_at");
      
      let deleted = 0;
      
      const request = index.openCursor(IDBKeyRange.upperBound(beforeTimestamp));
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        
        if (!cursor) {
          resolve(deleted);
          return;
        }
        
        // Se há limite, verificar
        if (keepLimit && deleted >= keepLimit) {
          cursor.continue();
          return;
        }
        
        const deleteRequest = cursor.delete();
        deleteRequest.onsuccess = () => {
          deleted++;
          this.sizeCache.delete('cached_products');
          cursor.continue();
        };
        deleteRequest.onerror = () => reject(deleteRequest.error);
      };
    });
  }

  /**
   * Exclui funcionários antigos
   */
  private async deleteOldEmployees(
    db: IDBDatabase,
    beforeTimestamp: number
  ): Promise<number> {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["cached_employees"], "readwrite");
      const store = transaction.objectStore("cached_employees");
      const index = store.index("cached_at");
      
      let deleted = 0;
      
      const request = index.openCursor(IDBKeyRange.upperBound(beforeTimestamp));
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        
        if (!cursor) {
          resolve(deleted);
          return;
        }
        
        const deleteRequest = cursor.delete();
        deleteRequest.onsuccess = () => {
          deleted++;
          this.sizeCache.delete('cached_employees');
          cursor.continue();
        };
        deleteRequest.onerror = () => reject(deleteRequest.error);
      };
    });
  }

  /**
   * Exclui vendas pendentes antigas
   */
  private async deleteOldPendingSales(
    db: IDBDatabase,
    beforeTimestamp: number
  ): Promise<number> {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["pending_sales"], "readwrite");
      const store = transaction.objectStore("pending_sales");
      const index = store.index("timestamp");
      
      let deleted = 0;
      
      const request = index.openCursor(IDBKeyRange.upperBound(beforeTimestamp));
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        
        if (!cursor) {
          resolve(deleted);
          return;
        }
        
        const deleteRequest = cursor.delete();
        deleteRequest.onsuccess = () => {
          deleted++;
          this.sizeCache.delete('pending_sales');
          cursor.continue();
        };
        deleteRequest.onerror = () => reject(deleteRequest.error);
      };
    });
  }

  /**
   * Exclui itens antigos da sync queue
   */
  private async deleteOldSyncQueue(
    db: IDBDatabase,
    beforeTimestamp: number
  ): Promise<number> {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["sync_queue"], "readwrite");
      const store = transaction.objectStore("sync_queue");
      const index = store.index("timestamp");
      
      let deleted = 0;
      
      const request = index.openCursor(IDBKeyRange.upperBound(beforeTimestamp));
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        
        if (!cursor) {
          resolve(deleted);
          return;
        }
        
        const deleteRequest = cursor.delete();
        deleteRequest.onsuccess = () => {
          deleted++;
          this.sizeCache.delete('sync_queue');
          cursor.continue();
        };
        deleteRequest.onerror = () => reject(deleteRequest.error);
      };
    });
  }

  /**
   * Calcula estatísticas de storage
   */
  async getStorageStats(): Promise<StorageStats> {
    try {
      // Tentar usar Storage API se disponível
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        
        const quotaAvailable = estimate.quota ? estimate.quota - (estimate.usage || 0) : undefined;
        const usagePercentage = estimate.quota ? (estimate.usage || 0) / estimate.quota * 100 : 0;
        
        // Obter contagem por store
        const db = await this.init();
        const storeCounts = await this.getStoreCounts(db);
        
        const result: StorageStats = {
          totalSize: estimate.usage || 0,
          stores: {
            pending_sales: { count: storeCounts.pending_sales, size: this.estimateStoreSize(storeCounts.pending_sales) },
            cached_products: { count: storeCounts.cached_products, size: this.estimateStoreSize(storeCounts.cached_products) },
            cached_employees: { count: storeCounts.cached_employees, size: this.estimateStoreSize(storeCounts.cached_employees) },
            sync_queue: { count: storeCounts.sync_queue, size: this.estimateStoreSize(storeCounts.sync_queue) },
          },
          usagePercentage,
          isNearLimit: usagePercentage >= (DB_CONFIG.STORAGE_QUOTA.WARNING_THRESHOLD * 100),
          quotaAvailable,
        };
        
        return result;
      }
      
      // Fallback: estimar baseado em contagens
      return this.estimateStorageStats();
      
    } catch (error) {
      console.error('[IndexedDB] Failed to get storage stats:', error);
      return this.estimateStorageStats();
    }
  }

  /**
   * Obtém contagem de itens por store
   */
  private async getStoreCounts(db: IDBDatabase): Promise<Record<string, number>> {
    const stores = ['pending_sales', 'cached_products', 'cached_employees', 'sync_queue'];
    const counts: Record<string, number> = {};
    
    for (const storeName of stores) {
      try {
        const count = await this.countStore(db, storeName);
        counts[storeName] = count;
      } catch (error) {
        console.error(`[IndexedDB] Failed to count ${storeName}:`, error);
        counts[storeName] = 0;
      }
    }
    
    return counts;
  }

  /**
   * Conta itens em uma store
   */
  private async countStore(db: IDBDatabase, storeName: string): Promise<number> {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.count();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Estima tamanho de uma store baseado em contagem
   */
  private estimateStoreSize(count: number): number {
    // Estimativa: ~500 bytes por item
    return count * 500;
  }

  /**
   * Estima storage stats quando API não disponível
   */
  private async estimateStorageStats(): Promise<StorageStats> {
    const db = await this.init();
    const storeCounts = await this.getStoreCounts(db);
    
    const totalEstimated = storeCounts.pending_sales * 500 + 
                          storeCounts.cached_products * 600 +
                          storeCounts.cached_employees * 400 +
                          storeCounts.sync_queue * 300;
    
    return {
      totalSize: totalEstimated,
      stores: {
        pending_sales: { count: storeCounts.pending_sales, size: storeCounts.pending_sales * 500 },
        cached_products: { count: storeCounts.cached_products, size: storeCounts.cached_products * 600 },
        cached_employees: { count: storeCounts.cached_employees, size: storeCounts.cached_employees * 400 },
        sync_queue: { count: storeCounts.sync_queue, size: storeCounts.sync_queue * 300 },
      },
      usagePercentage: (totalEstimated / DB_CONFIG.STORAGE_QUOTA.MAX_BYTES) * 100,
      isNearLimit: totalEstimated >= (DB_CONFIG.STORAGE_QUOTA.MAX_BYTES * DB_CONFIG.STORAGE_QUOTA.WARNING_THRESHOLD),
    };
  }

  /**
   * Verifica se pode adicionar novos dados
   */
  async canStore(estimatedSize: number): Promise<boolean> {
    const stats = await this.getStorageStats();
    const newSize = stats.totalSize + estimatedSize;
    
    return newSize < (DB_CONFIG.STORAGE_QUOTA.MAX_BYTES * DB_CONFIG.STORAGE_QUOTA.CLEANUP_THRESHOLD);
  }

  /**
   * Limpa todo o banco de dados
   */
  async clearAll(): Promise<void> {
    try {
      const db = await this.init();
      
      const storeNames = Array.from(db.objectStoreNames);
      
      for (const storeName of storeNames) {
        await new Promise<void>((resolve, reject) => {
          const transaction = db.transaction([storeName], "readwrite");
          const store = transaction.objectStore(storeName);
          const request = store.clear();
          
          request.onsuccess = () => {
            this.sizeCache.delete(storeName);
            resolve();
          };
          request.onerror = () => reject(request.error);
        });
      }
      
      this.sizeCache.clear();
      console.log('[IndexedDB] All data cleared');
      
    } catch (error) {
      console.error('[IndexedDB] Failed to clear all:', error);
      throw error;
    }
  }

  /**
   * Fecha a conexão com o banco
   */
  close(): void {
    this.stopAutoCleanup();
    if (this.db) {
      this.db.close();
      this.db = null;
      this.dbPromise = null;
    }
  }

  // ================================================================
  // OPERAÇÕES DE PENDING SALES
  // ================================================================

  async addPendingSale(sale: Omit<PendingSale, "id" | "timestamp" | "synced" | "sync_attempts">): Promise<string> {
    const db = await this.init();
    
    // Verificar storage
    const estimatedSize = JSON.stringify(sale).length * 2;
    if (!(await this.canStore(estimatedSize))) {
      throw new Error('Storage limit reached. Cannot add pending sale.');
    }
    
    const id = `pending_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const pendingSale: PendingSale = {
      ...sale,
      id,
      timestamp: Date.now(),
      synced: false,
      sync_attempts: 0,
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["pending_sales"], "readwrite");
      const store = transaction.objectStore("pending_sales");
      const request = store.add(pendingSale);

      request.onsuccess = () => {
        this.sizeCache.delete('pending_sales');
        resolve(id);
      };
      request.onerror = () => reject(new Error("Failed to add pending sale"));
    });
  }

  async getPendingSales(options?: { synced?: boolean; limit?: number }): Promise<PendingSale[]> {
    const db = await this.init();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["pending_sales"], "readonly");
      const store = transaction.objectStore("pending_sales");
      
      let request: IDBRequest;
      
      if (options?.synced !== undefined) {
        const index = store.index("synced");
        request = index.getAll(IDBKeyRange.only(options.synced));
      } else {
        request = store.getAll();
      }
      
      request.onsuccess = () => {
        let results = request.result;
        
        // Aplicar limit
        if (options?.limit) {
          results = results.slice(0, options.limit);
        }
        
        // Ordenar por timestamp (recentes primeiro)
        results.sort((a, b) => b.timestamp - a.timestamp);
        
        resolve(results);
      };
      request.onerror = () => reject(new Error("Failed to get pending sales"));
    });
  }

  async getPendingSale(id: string): Promise<PendingSale | null> {
    const db = await this.init();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["pending_sales"], "readonly");
      const store = transaction.objectStore("pending_sales");
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(new Error("Failed to get pending sale"));
    });
  }

  async markSaleAsSynced(id: string): Promise<void> {
    const db = await this.init();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["pending_sales"], "readwrite");
      const store = transaction.objectStore("pending_sales");
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const sale = getRequest.result;
        if (sale) {
          sale.synced = true;
          sale.last_sync_attempt = Date.now();
          const updateRequest = store.put(sale);
          updateRequest.onsuccess = () => {
            this.sizeCache.delete('pending_sales');
            resolve();
          };
          updateRequest.onerror = () => reject(new Error("Failed to update sale"));
        } else {
          resolve(); // Já deletado
        }
      };

      getRequest.onerror = () => reject(new Error("Failed to mark sale as synced"));
    });
  }

  async incrementSyncAttempts(id: string): Promise<void> {
    const db = await this.init();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["pending_sales"], "readwrite");
      const store = transaction.objectStore("pending_sales");
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const sale = getRequest.result;
        if (sale) {
          sale.sync_attempts++;
          sale.last_sync_attempt = Date.now();
          const updateRequest = store.put(sale);
          updateRequest.onsuccess = () => {
            this.sizeCache.delete('pending_sales');
            resolve();
          };
          updateRequest.onerror = () => reject(new Error("Failed to increment sync attempts"));
        } else {
          resolve();
        }
      };

      getRequest.onerror = () => reject(new Error("Failed to increment sync attempts"));
    });
  }

  async deletePendingSale(id: string): Promise<void> {
    const db = await this.init();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["pending_sales"], "readwrite");
      const store = transaction.objectStore("pending_sales");
      const request = store.delete(id);

      request.onsuccess = () => {
        this.sizeCache.delete('pending_sales');
        resolve();
      };
      request.onerror = () => reject(new Error("Failed to delete pending sale"));
    });
  }

  // ================================================================
  // OPERAÇÕES DE CACHED PRODUCTS (com Conflict Resolution)
  // ================================================================

  async cacheProducts(products: Array<Omit<CachedProduct, "cached_at" | "version">>, userId?: string): Promise<void> {
    const db = await this.init();
    
    // Verificar storage
    const estimatedSize = JSON.stringify(products).length * 2;
    if (!(await this.canStore(estimatedSize))) {
      // Limpar cache antigo primeiro
      await this.performAutoCleanup(await this.getStorageStats());
      
      // Tentar novamente
      if (!(await this.canStore(estimatedSize))) {
        throw new Error('Storage limit reached. Cannot cache products.');
      }
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["cached_products"], "readwrite");
      const store = transaction.objectStore("cached_products");
      
      let completed = 0;
      const total = products.length;
      const errors: Error[] = [];

      for (const product of products) {
        // Verificar por conflitos
        this.checkProductConflict(db, product, userId).then(async (hasConflict) => {
          const cachedProduct: CachedProduct = {
            ...product,
            cached_at: Date.now(),
            version: hasConflict ? (product.version || 0) + 1 : (product.version || 0),
          };

          const request = store.put(cachedProduct);

          request.onsuccess = () => {
            completed++;
            this.sizeCache.delete('cached_products'); // Invalidate cache
            
            if (completed === total) {
              if (errors.length > 0) {
                reject(new Error(`Failed to cache ${errors.length} products`));
              } else {
                resolve();
              }
            }
          };
          
          request.onerror = () => {
            errors.push(new Error(`Failed to cache product ${product.id}`));
            completed++;
            
            if (completed === total) {
              if (errors.length > 0) {
                reject(new Error(`Failed to cache ${errors.length} products`));
              } else {
                resolve();
              }
            }
          };
        }).catch((error) => {
          errors.push(error);
          completed++;
          
          if (completed === total) {
            if (errors.length > 0) {
              reject(new Error(`Failed to cache ${errors.length} products`));
            } else {
              resolve();
            }
          }
        });
      }
    });
  }

  /**
   * Verifica por conflitos em produto existente
   */
  private async checkProductConflict(
    db: IDBDatabase,
    product: Omit<CachedProduct, "cached_at" | "version">,
    userId?: string
  ): Promise<boolean> {
    try {
      const existing = await new Promise<CachedProduct | null>((resolve, reject) => {
        const transaction = db.transaction(["cached_products"], "readonly");
        const store = transaction.objectStore("cached_products");
        const request = store.get(product.id);
        
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });

      if (!existing) {
        return false;
      }

      // Detectar conflito
      const conflict = conflictResolution.detectConflict(
        'product',
        product.id,
        'CachedProduct',
        existing,
        product,
        {
          localTimestamp: existing.cached_at,
          remoteTimestamp: Date.now(),
          localUserId: undefined,
          remoteUserId: userId,
        }
      );

      return conflict !== null;
    } catch (error) {
      console.error('[IndexedDB] Failed to check product conflict:', error);
      return false;
    }
  }

  async getCachedProducts(options?: { is_active?: boolean; limit?: number }): Promise<CachedProduct[]> {
    const db = await this.init();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["cached_products"], "readonly");
      const store = transaction.objectStore("cached_products");
      
      let request: IDBRequest;
      
      if (options?.is_active !== undefined) {
        try {
          const index = store.index("is_active");
          request = index.getAll(IDBKeyRange.only(options.is_active));
        } catch (error) {
          // Índice pode não existir em versões antigas
          request = store.getAll();
        }
      } else {
        request = store.getAll();
      }
      
      request.onsuccess = () => {
        let results = request.result;
        
        // Aplicar limit
        if (options?.limit) {
          results = results.slice(0, options.limit);
        }
        
        resolve(results);
      };
      request.onerror = () => reject(new Error("Failed to get cached products"));
    });
  }

  async getCachedProduct(id: string): Promise<CachedProduct | null> {
    const db = await this.init();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["cached_products"], "readonly");
      const store = transaction.objectStore("cached_products");
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(new Error("Failed to get cached product"));
    });
  }

  async deleteCachedProduct(id: string): Promise<void> {
    const db = await this.init();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["cached_products"], "readwrite");
      const store = transaction.objectStore("cached_products");
      const request = store.delete(id);

      request.onsuccess = () => {
        this.sizeCache.delete('cached_products');
        resolve();
      };
      request.onerror = () => reject(new Error("Failed to delete cached product"));
    });
  }

  // ================================================================
  // OPERAÇÕES DE CACHED EMPLOYEES
  // ================================================================

  async cacheEmployees(employees: Array<Omit<CachedEmployee, "cached_at" | "version">>, userId?: string): Promise<void> {
    const db = await this.init();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["cached_employees"], "readwrite");
      const store = transaction.objectStore("cached_employees");
      
      let completed = 0;
      const total = employees.length;
      const errors: Error[] = [];

      for (const employee of employees) {
        const cachedEmployee: CachedEmployee = {
          ...employee,
          cached_at: Date.now(),
          version: employee.version || 0,
        };

        const request = store.put(cachedEmployee);

        request.onsuccess = () => {
          completed++;
          this.sizeCache.delete('cached_employees');
          
          if (completed === total) {
            if (errors.length > 0) {
              reject(new Error(`Failed to cache ${errors.length} employees`));
            } else {
              resolve();
            }
          }
        };
        
        request.onerror = () => {
          errors.push(new Error(`Failed to cache employee ${employee.id}`));
          completed++;
          
          if (completed === total) {
            if (errors.length > 0) {
              reject(new Error(`Failed to cache ${errors.length} employees`));
            } else {
              resolve();
            }
          }
        };
      }
    });
  }

  async getCachedEmployees(options?: { company_id?: string; limit?: number }): Promise<CachedEmployee[]> {
    const db = await this.init();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["cached_employees"], "readonly");
      const store = transaction.objectStore("cached_employees");
      
      let request: IDBRequest;
      
      if (options?.company_id) {
        try {
          const index = store.index("company_id");
          request = index.getAll(IDBKeyRange.only(options.company_id));
        } catch (error) {
          request = store.getAll();
        }
      } else {
        request = store.getAll();
      }
      
      request.onsuccess = () => {
        let results = request.result;
        
        if (options?.limit) {
          results = results.slice(0, options.limit);
        }
        
        resolve(results);
      };
      request.onerror = () => reject(new Error("Failed to get cached employees"));
    });
  }

  async getCachedEmployee(id: string): Promise<CachedEmployee | null> {
    const db = await this.init();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["cached_employees"], "readonly");
      const store = transaction.objectStore("cached_employees");
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(new Error("Failed to get cached employee"));
    });
  }

  // ================================================================
  // OPERAÇÕES DE SYNC QUEUE
  // ================================================================

  async addToSyncQueue(item: Omit<SyncQueueItem, "id" | "timestamp" | "retries">): Promise<string> {
    const db = await this.init();
    
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

      request.onsuccess = () => {
        this.sizeCache.delete('sync_queue');
        resolve(id);
      };
      request.onerror = () => reject(new Error("Failed to add to sync queue"));
    });
  }

  async getSyncQueue(options?: { type?: SyncQueueItem['type']; priority?: SyncQueueItem['priority']; limit?: number }): Promise<SyncQueueItem[]> {
    const db = await this.init();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["sync_queue"], "readonly");
      const store = transaction.objectStore("sync_queue");
      
      let request: IDBRequest;
      
      if (options?.priority) {
        try {
          const index = store.index("priority");
          request = index.getAll(IDBKeyRange.only(options.priority));
        } catch (error) {
          request = store.getAll();
        }
      } else if (options?.type) {
        try {
          const index = store.index("type");
          request = index.getAll(IDBKeyRange.only(options.type));
        } catch (error) {
          request = store.getAll();
        }
      } else {
        request = store.getAll();
      }
      
      request.onsuccess = () => {
        let results = request.result;
        
        // Ordenar por prioridade (high > medium > low) e timestamp
        const priorityWeight = { high: 3, medium: 2, low: 1 };
        results.sort((a, b) => {
          const priorityDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
          if (priorityDiff !== 0) return priorityDiff;
          return a.timestamp - b.timestamp;
        });
        
        if (options?.limit) {
          results = results.slice(0, options.limit);
        }
        
        resolve(results);
      };
      request.onerror = () => reject(new Error("Failed to get sync queue"));
    });
  }

  async getSyncQueueItem(id: string): Promise<SyncQueueItem | null> {
    const db = await this.init();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["sync_queue"], "readonly");
      const store = transaction.objectStore("sync_queue");
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(new Error("Failed to get sync queue item"));
    });
  }

  async incrementSyncRetries(id: string, error?: string): Promise<void> {
    const db = await this.init();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["sync_queue"], "readwrite");
      const store = transaction.objectStore("sync_queue");
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const item = getRequest.result;
        if (item) {
          item.retries++;
          item.error = error || item.error;
          const updateRequest = store.put(item);
          updateRequest.onsuccess = () => {
            this.sizeCache.delete('sync_queue');
            resolve();
          };
          updateRequest.onerror = () => reject(new Error("Failed to increment retries"));
        } else {
          resolve();
        }
      };

      getRequest.onerror = () => reject(new Error("Failed to increment retries"));
    });
  }

  async removeFromSyncQueue(id: string): Promise<void> {
    const db = await this.init();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["sync_queue"], "readwrite");
      const store = transaction.objectStore("sync_queue");
      const request = store.delete(id);

      request.onsuccess = () => {
        this.sizeCache.delete('sync_queue');
        resolve();
      };
      request.onerror = () => reject(new Error("Failed to remove from sync queue"));
    });
  }

  async clearSyncQueue(type?: SyncQueueItem['type']): Promise<number> {
    const db = await this.init();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["sync_queue"], "readwrite");
      const store = transaction.objectStore("sync_queue");
      
      let deleted = 0;
      
      if (type) {
        try {
          const index = store.index("type");
          const request = index.openCursor(IDBKeyRange.only(type));
          
          request.onsuccess = (event) => {
            const cursor = (event.target as IDBRequest).result;
            if (cursor) {
              cursor.delete();
              deleted++;
              cursor.continue();
            } else {
              this.sizeCache.delete('sync_queue');
              resolve(deleted);
            }
          };
          
          request.onerror = () => reject(request.error);
        } catch (error) {
          // Fallback
          request.onerror = () => reject(request.error);
        }
      } else {
        const request = store.clear();
        
        request.onsuccess = () => {
          this.sizeCache.delete('sync_queue');
          resolve(deleted);
        };
        
        request.onerror = () => reject(request.error);
      }
    });
  }

  // ================================================================
  // UTILITY METHODS
  // ================================================================

  async getCacheStats() {
    const stats = await this.getStorageStats();
    
    return {
      pending_sales: stats.stores.pending_sales.count,
      cached_products: stats.stores.cached_products.count,
      cached_employees: stats.stores.cached_employees.count,
      sync_queue: stats.stores.sync_queue.count,
      totalSize: stats.totalSize,
      usagePercentage: stats.usagePercentage,
      isNearLimit: stats.isNearLimit,
    };
  }

  async forceCleanup(): Promise<CleanupResult> {
    const stats = await this.getStorageStats();
    return this.performAutoCleanup(stats);
  }

}

// ================================================================
// EXPORT SINGLETON
// ================================================================

export const pwaStorage = new EnhancedIndexedDB();

// ================================================================
// EXPORT ALL TYPES AND FUNCTIONS
// ================================================================

export type {
  PendingSale,
  CachedProduct,
  CachedEmployee,
  SyncQueueItem,
  StorageStats,
  CleanupResult,
};
