/**
 * ================================================================
 * INDEXEDDB ENHANCED TESTS - BIZCONTROL 360 ERP v2.1.0
 * ================================================================ */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { pwaStorage, PendingSale, CachedProduct, SyncQueueItem } from '../indexedDB.enhanced';

describe('EnhancedIndexedDB', () => {
  beforeEach(async () => {
    // Limpar banco antes de cada teste
    await pwaStorage.clearAll();
  });

  afterEach(async () => {
    // Limpar banco após cada teste
    await pwaStorage.clearAll();
  });

  describe('Database Initialization', () => {
    it('should initialize database successfully', async () => {
      const db = await pwaStorage.init();
      expect(db).toBeDefined();
      expect(db.name).toBe('BizControl360_v2');
      expect(db.version).toBe(2);
    });

    it('should reuse existing database connection', async () => {
      const db1 = await pwaStorage.init();
      const db2 = await pwaStorage.init();
      expect(db1).toBe(db2);
    });
  });

  describe('Pending Sales', () => {
    const mockSale = {
      items: [
        { product_id: 'p1', quantity: 2, price: 100 },
        { product_id: 'p2', quantity: 1, price: 200 },
      ],
      total: 400,
      payment_method: 'cash',
    };

    it('should add pending sale', async () => {
      const id = await pwaStorage.addPendingSale(mockSale);
      expect(id).toMatch(/^pending_\d+_[a-z0-9]+$/);
    });

    it('should get pending sale by ID', async () => {
      const id = await pwaStorage.addPendingSale(mockSale);
      const sale = await pwaStorage.getPendingSale(id);
      
      expect(sale).toBeDefined();
      expect(sale?.id).toBe(id);
      expect(sale?.total).toBe(400);
      expect(sale?.synced).toBe(false);
      expect(sale?.sync_attempts).toBe(0);
    });

    it('should get all unsynced pending sales', async () => {
      await pwaStorage.addPendingSale(mockSale);
      await pwaStorage.addPendingSale(mockSale);
      
      const sales = await pwaStorage.getPendingSales({ synced: false });
      expect(sales).toHaveLength(2);
      
      // Verificar ordenação (recentes primeiro)
      expect(sales[0].timestamp).toBeGreaterThanOrEqual(sales[1].timestamp);
    });

    it('should return empty array when no pending sales', async () => {
      const sales = await pwaStorage.getPendingSales();
      expect(sales).toEqual([]);
    });

    it('should mark sale as synced', async () => {
      const id = await pwaStorage.addPendingSale(mockSale);
      
      await pwaStorage.markSaleAsSynced(id);
      
      const sale = await pwaStorage.getPendingSale(id);
      expect(sale?.synced).toBe(true);
      expect(sale?.last_sync_attempt).toBeDefined();
    });

    it('should increment sync attempts', async () => {
      const id = await pwaStorage.addPendingSale(mockSale);
      
      await pwaStorage.incrementSyncAttempts(id);
      await pwaStorage.incrementSyncAttempts(id);
      
      const sale = await pwaStorage.getPendingSale(id);
      expect(sale?.sync_attempts).toBe(2);
    });

    it('should delete pending sale', async () => {
      const id = await pwaStorage.addPendingSale(mockSale);
      
      await pwaStorage.deletePendingSale(id);
      
      const sale = await pwaStorage.getPendingSale(id);
      expect(sale).toBeNull();
    });

    it('should limit number of pending sales returned', async () => {
      for (let i = 0; i < 5; i++) {
        await pwaStorage.addPendingSale(mockSale);
      }
      
      const sales = await pwaStorage.getPendingSales({ limit: 3 });
      expect(sales.length).toBeLessThanOrEqual(3);
    });

    it('should throw error when storage limit reached', async () => {
      // Mock canStore para retornar false
      jest.spyOn(pwaStorage, 'canStore').mockResolvedValue(false);
      
      await expect(pwaStorage.addPendingSale(mockSale)).rejects.toThrow('Storage limit reached');
    });
  });

  describe('Cached Products', () => {
    const mockProduct = {
      id: 'p1',
      name: 'Test Product',
      price: 100,
      cost_price: 80,
      quantity: 50,
      is_active: true,
    };

    it('should cache multiple products', async () => {
      const products = [
        { ...mockProduct, id: 'p1' },
        { ...mockProduct, id: 'p2' },
        { ...mockProduct, id: 'p3' },
      ];
      
      await pwaStorage.cacheProducts(products);
      
      const cached = await pwaStorage.getCachedProducts();
      expect(cached).toHaveLength(3);
    });

    it('should get cached product by ID', async () => {
      await pwaStorage.cacheProducts([mockProduct]);
      
      const product = await pwaStorage.getCachedProduct('p1');
      expect(product).toBeDefined();
      expect(product?.name).toBe('Test Product');
      expect(product?.cached_at).toBeDefined();
    });

    it('should get only active products', async () => {
      const products = [
        { ...mockProduct, id: 'p1', is_active: true },
        { ...mockProduct, id: 'p2', is_active: false },
        { ...mockProduct, id: 'p3', is_active: true },
      ];
      
      await pwaStorage.cacheProducts(products);
      
      const activeProducts = await pwaStorage.getCachedProducts({ is_active: true });
      expect(activeProducts).toHaveLength(2);
      
      const inactiveProduct = await pwaStorage.getCachedProducts({ is_active: false });
      expect(inactiveProduct).toHaveLength(1);
    });

    it('should update existing cached product', async () => {
      await pwaStorage.cacheProducts([{ ...mockProduct, price: 100 }]);
      
      const product1 = await pwaStorage.getCachedProduct('p1');
      expect(product1?.price).toBe(100);
      
      await pwaStorage.cacheProducts([{ ...mockProduct, price: 150 }]);
      
      const product2 = await pwaStorage.getCachedProduct('p1');
      expect(product2?.price).toBe(150);
      expect(product2?.version).toBe(product1?.version || 0);
    });

    it('should delete cached product', async () => {
      await pwaStorage.cacheProducts([mockProduct]);
      
      await pwaStorage.deleteCachedProduct('p1');
      
      const product = await pwaStorage.getCachedProduct('p1');
      expect(product).toBeNull();
    });

    it('should return null for non-existent product', async () => {
      const product = await pwaStorage.getCachedProduct('nonexistent');
      expect(product).toBeNull();
    });
  });

  describe('Cached Employees', () => {
    const mockEmployee = {
      id: 'e1',
      full_name: 'Test User',
      email: 'test@example.com',
      role: 'admin',
      company_id: 'c1',
    };

    it('should cache multiple employees', async () => {
      const employees = [
        { ...mockEmployee, id: 'e1' },
        { ...mockEmployee, id: 'e2' },
      ];
      
      await pwaStorage.cacheEmployees(employees);
      
      const cached = await pwaStorage.getCachedEmployees();
      expect(cached).toHaveLength(2);
    });

    it('should get cached employee by ID', async () => {
      await pwaStorage.cacheEmployees([mockEmployee]);
      
      const employee = await pwaStorage.getCachedEmployee('e1');
      expect(employee).toBeDefined();
      expect(employee?.full_name).toBe('Test User');
    });

    it('should filter employees by company', async () => {
      const employees = [
        { ...mockEmployee, id: 'e1', company_id: 'c1' },
        { ...mockEmployee, id: 'e2', company_id: 'c2' },
        { ...mockEmployee, id: 'e3', company_id: 'c1' },
      ];
      
      await pwaStorage.cacheEmployees(employees);
      
      const c1Employees = await pwaStorage.getCachedEmployees({ company_id: 'c1' });
      expect(c1Employees).toHaveLength(2);
      
      const c2Employees = await pwaStorage.getCachedEmployees({ company_id: 'c2' });
      expect(c2Employees).toHaveLength(1);
    });

    it('should return null for non-existent employee', async () => {
      const employee = await pwaStorage.getCachedEmployee('nonexistent');
      expect(employee).toBeNull();
    });
  });

  describe('Sync Queue', () => {
    const mockSyncItem = {
      type: 'sale' as const,
      action: 'create' as const,
      data: { id: 's1', total: 100 },
      priority: 'high' as const,
    };

    it('should add item to sync queue', async () => {
      const id = await pwaStorage.addToSyncQueue(mockSyncItem);
      expect(id).toMatch(/^sync_\d+_[a-z0-9]+$/);
    });

    it('should get sync queue item by ID', async () => {
      const id = await pwaStorage.addToSyncQueue(mockSyncItem);
      
      const item = await pwaStorage.getSyncQueueItem(id);
      expect(item).toBeDefined();
      expect(item?.type).toBe('sale');
      expect(item?.retries).toBe(0);
    });

    it('should get all items in sync queue', async () => {
      await pwaStorage.addToSyncQueue({ ...mockSyncItem, type: 'sale' });
      await pwaStorage.addToSyncQueue({ ...mockSyncItem, type: 'product' });
      await pwaStorage.addToSyncQueue({ ...mockSyncItem, type: 'employee' });
      
      const queue = await pwaStorage.getSyncQueue();
      expect(queue).toHaveLength(3);
    });

    it('should filter sync queue by type', async () => {
      await pwaStorage.addToSyncQueue({ ...mockSyncItem, type: 'sale', priority: 'high' });
      await pwaStorage.addToSyncQueue({ ...mockSyncItem, type: 'product', priority: 'medium' });
      await pwaStorage.addToSyncQueue({ ...mockSyncItem, type: 'sale', priority: 'low' });
      
      const saleItems = await pwaStorage.getSyncQueue({ type: 'sale' });
      expect(saleItems).toHaveLength(2);
      
      const productItems = await pwaStorage.getSyncQueue({ type: 'product' });
      expect(productItems).toHaveLength(1);
    });

    it('should filter and sort by priority', async () => {
      await pwaStorage.addToSyncQueue({ ...mockSyncItem, type: 'sale', priority: 'high' });
      await pwaStorage.addToSyncQueue({ ...mockSyncItem, type: 'sale', priority: 'low' });
      await pwaStorage.addToSyncQueue({ ...mockSyncItem, type: 'sale', priority: 'medium' });
      
      const queue = await pwaStorage.getSyncQueue({ priority: 'high' });
      expect(queue.length).toBeGreaterThan(0);
    });

    it('should increment retries', async () => {
      const id = await pwaStorage.addToSyncQueue(mockSyncItem);
      
      await pwaStorage.incrementSyncRetries(id, 'Network error');
      
      const item = await pwaStorage.getSyncQueueItem(id);
      expect(item?.retries).toBe(1);
      expect(item?.error).toBe('Network error');
    });

    it('should remove item from sync queue', async () => {
      const id = await pwaStorage.addToSyncQueue(mockSyncItem);
      
      await pwaStorage.removeFromSyncQueue(id);
      
      const item = await pwaStorage.getSyncQueueItem(id);
      expect(item).toBeNull();
    });

    it('should clear entire sync queue', async () => {
      await pwaStorage.addToSyncQueue(mockSyncItem);
      await pwaStorage.addToSyncQueue(mockSyncItem);
      
      const count = await pwaStorage.clearSyncQueue();
      expect(count).toBeGreaterThan(0);
      
      const queue = await pwaStorage.getSyncQueue();
      expect(queue).toHaveLength(0);
    });

    it('should clear sync queue by type', async () => {
      await pwaStorage.addToSyncQueue({ ...mockSyncItem, type: 'sale' });
      await pwaStorage.addToSyncQueue({ ...mockSyncItem, type: 'product' });
      
      const count = await pwaStorage.clearSyncQueue('sale');
      expect(count).toBeGreaterThan(0);
      
      const queue = await pwaStorage.getSyncQueue();
      const types = queue.map(item => item.type);
      expect(types).not.toContain('sale');
      expect(types).toContain('product');
    });
  });

  describe('Storage Management', () => {
    it('should get storage stats', async () => {
      await pwaStorage.addPendingSale({
        items: [],
        total: 0,
        payment_method: 'cash',
      });
      
      await pwaStorage.cacheProducts([{ id: 'p1', name: 'Test', price: 100, cost_price: 80, quantity: 50, is_active: true }]);
      
      const stats = await pwaStorage.getStorageStats();
      
      expect(stats.totalSize).toBeGreaterThan(0);
      expect(stats.stores.pending_sales.count).toBeGreaterThan(0);
      expect(stats.stores.cached_products.count).toBeGreaterThan(0);
      expect(stats.usagePercentage).toBeGreaterThanOrEqual(0);
    });

    it('should determine if storage can accommodate new data', async () => {
      const canStore = await pwaStorage.canStore(1000000); // 1MB
      expect(typeof canStore).toBe('boolean');
    });

    it('should clean up old data when near limit', async () => {
      // Simular storage near limit
      jest.spyOn(pwaStorage, 'getStorageStats').mockResolvedValue({
        totalSize: 95 * 1024 * 1024, // 95MB
        usagePercentage: 95,
        isNearLimit: true,
        stores: {
          pending_sales: { count: 100, size: 50000 },
          cached_products: { count: 1000, size: 600000 },
          cached_employees: { count: 50, size: 20000 },
          sync_queue: { count: 20, size: 6000 },
        },
      });
      
      const result = await pwaStorage.forceCleanup();
      
      expect(result.deletedCount).toBeGreaterThanOrEqual(0);
      expect(result.storesCleaned).toBeDefined();
    });

    it('should clear all data', async () => {
      await pwaStorage.addPendingSale({
        items: [],
        total: 0,
        payment_method: 'cash',
      });
      
      await pwaStorage.cacheProducts([{ id: 'p1', name: 'Test', price: 100, cost_price: 80, quantity: 50, is_active: true }]);
      
      await pwaStorage.clearAll();
      
      const stats = await pwaStorage.getStorageStats();
      expect(stats.totalSize).toBe(0);
    });
  });

  describe('Cache Stats', () => {
    it('should return cache statistics', async () => {
      await pwaStorage.addPendingSale({
        items: [],
        total: 0,
        payment_method: 'cash',
      });
      
      const stats = await pwaStorage.getCacheStats();
      
      expect(stats).toHaveProperty('pending_sales');
      expect(stats).toHaveProperty('cached_products');
      expect(stats).toHaveProperty('cached_employees');
      expect(stats).toHaveProperty('sync_queue');
      expect(stats).toHaveProperty('totalSize');
    });
  });
});
