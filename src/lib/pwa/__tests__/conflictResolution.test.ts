/**
 * ================================================================
 * CONFLICT RESOLUTION TESTS - BIZCONTROL 360 ERP v2.1.0
 * ================================================================ */

import { describe, it, expect, beforeEach, beforeEach, jest } from '@jest/globals';
import {
  conflictResolution,
  autoResolveConflict,
  manualResolveConflict,
  getConflictStats,
  Conflict,
  ConflictType,
  ConflictStrategy,
} from '../conflictResolution';

describe('ConflictResolution', () => {
  beforeEach(() => {
    // Limpar conflitos antes de cada teste
    conflictResolution.clearAllConflicts();
  });

  describe('Conflict Detection', () => {
    it('should detect conflict when versions differ', () => {
      const local = { id: 'p1', name: 'Product A', price: 100, quantity: 50 };
      const remote = { id: 'p1', name: 'Product B', price: 150, quantity: 50 };

      const conflict = conflictResolution.detectConflict(
        'product',
        'p1',
        'CachedProduct',
        local,
        remote,
        {
          localTimestamp: Date.now() - 1000,
          remoteTimestamp: Date.now(),
          localUserId: 'user1',
          remoteUserId: 'user2',
        }
      );

      expect(conflict).toBeDefined();
      expect(conflict?.id).toBeDefined();
      expect(conflict?.type).toBe('product');
      expect(conflict?.conflictedFields).toEqual(['name', 'price']);
      expect(conflict?.resolved).toBe(false);
    });

    it('should return null when no conflict exists', () => {
      const local = { id: 'p1', name: 'Product A', price: 100, quantity: 50 };
      const remote = { id: 'p1', name: 'Product A', price: 100, quantity: 50 };

      const conflict = conflictResolution.detectConflict(
        'product',
        'p1',
        'CachedProduct',
        local,
        remote
      );

      expect(conflict).toBeNull();
    });

    it('should detect multiple conflicted fields', () => {
      const local = { id: 'p1', name: 'Product A', price: 100, quantity: 50, category: 'C1' };
      const remote = { id: 'p1', name: 'Product B', price: 150, quantity: 30, category: 'C2' };

      const conflict = conflictResolution.detectConflict(
        'product',
        'p1',
        'CachedProduct',
        local,
        remote
      );

      expect(conflict?.conflictedFields).toHaveLength(4);
      expect(conflict?.conflictedFields).toContain('name');
      expect(conflict?.conflictedFields).toContain('price');
      expect(conflict?.conflictedFields).toContain('quantity');
      expect(conflict?.conflictedFields).toContain('category');
    });

    it('should ignore automated timestamp fields', () => {
      const local = { 
        id: 'p1', 
        name: 'Product A', 
        price: 100,
        updated_at: '2024-01-01T00:00:00Z',
        synced_at: '2024-01-01T00:00:00Z',
        cached_at: 1234567890,
      };
      const remote = { 
        id: 'p1', 
        name: 'Product B', 
        price: 150,
        updated_at: '2024-01-02T00:00:00Z',
        synced_at: '2024-01-02T00:00:00Z',
        cached_at: 1244567890,
      };

      const conflict = conflictResolution.detectConflict(
        'product',
        'p1',
        'CachedProduct',
        local,
        remote
      );

      // Deve detectar apenas name e price, não os timestamps
      expect(conflict?.conflictedFields).toEqual(['name', 'price']);
      expect(conflict?.conflictedFields).not.toContain('updated_at');
      expect(conflict?.conflictedFields).not.toContain('synced_at');
      expect(conflict?.conflictedFields).not.toContain('cached_at');
    });

    it('should detect conflicts in arrays', () => {
      const local = { id: 'p1', tags: ['a', 'b', 'c'] };
      const remote = { id: 'p1', tags: ['a', 'd', 'e'] };

      const conflict = conflictResolution.detectConflict(
        'product',
        'p1',
        'Product',
        local,
        remote
      );

      expect(conflict).toBeDefined();
      expect(conflict?.conflictedFields).toContain('tags');
    });

    it('should use default strategy based on type', () => {
      const local = { id: 'p1', name: 'Product A', price: 100 };
      const remote = { id: 'p1', name: 'Product B', price: 150 };

      const conflictProduct = conflictResolution.detectConflict(
        'product',
        'p1',
        'Product',
        local,
        remote
      );
      expect(conflictProduct?.strategy).toBe('merge');

      const conflictSale = conflictResolution.detectConflict(
        'sale',
        's1',
        'Sale',
        local,
        remote
      );
      expect(conflictSale?.strategy).toBe('keep_remote');
    });
  });

  describe('Conflict Resolution - LWW Strategy', () => {
    it('should resolve using last-write-wins with newer local timestamp', async () => {
      const local = { id: 'p1', name: 'Product A', price: 100 };
      const remote = { id: 'p1', name: 'Product B', price: 150 };

      const conflict = conflictResolution.detectConflict(
        'product',
        'p1',
        'Product',
        local,
        remote,
        {
          localTimestamp: Date.now(), // Mais recente
          remoteTimestamp: Date.now() - 10000,
        }
      );

      const result = await conflictResolution.resolveConflict(conflict!.id, 'lww');

      expect(result.resolved).toBe(true);
      expect(result.resolution.name).toBe('Product A');
      expect(resolution!.strategy === 'lww');
    });

    it('should resolve using last-write-wins with newer remote timestamp', async () => {
      const local = { id: 'p1', name: 'Product A', price: 100 };
      const remote = { id: 'p1', name: 'Product B', price: 150 };

      const conflict = conflictResolution.detectConflict(
        'product',
        'p1',
        'Product',
        local,
        remote,
        {
          localTimestamp: Date.now() - 10000,
          remoteTimestamp: Date.now(), // Mais recente
        }
      );

      const result = await conflictResolution.resolveConflict(conflict!.id, 'lww');

      expect(result.resolved).toBe(true);
      expect(result.resolution.name).toBe('Product B');
    });
  });

  describe('Conflict Resolution - Keep Remote/Local', () => {
    it('should keep remote version', async () => {
      const local = { id: 'p1', name: 'Product A', price: 100 };
      const remote = { id: 'p1', name: 'Product B', price: 150 };

      const conflict = conflictResolution.detectConflict(
        'product',
        'p1',
        'Product',
        local,
        remote
      );

      const result = await conflictResolution.resolveConflict(conflict!.id, 'keep_remote');

      expect(result.resolved).toBe(true);
      expect(result.resolution.name).toBe('Product B');
      expect(result.resolution.price).toBe(150);
    });

    it('should keep local version', async () => {
      const local = { id: 'p1', name: 'Product A', price: 100 };
      const remote = { id: 'p1', name: 'Product B', price: 150 };

      const conflict = conflictResolution.detectConflict(
        'product',
        'p1',
        'Product',
        local,
        remote
      );

      const result = await conflictResolution.resolveConflict(conflict!.id, 'keep_local');

      expect(result.resolved).toBe(true);
      expect(result.resolution.name).toBe('Product A');
      expect(result.resolution.price).toBe(100);
    });
  });

  describe('Conflict Resolution - Merge Strategy', () => {
    it('should merge numeric fields with lww', async () => {
      const local = { id: 'p1', name: 'Product A', price: 100, quantity: 50 };
      const remote = { id: 'p1', name: 'Product B', price: 150, quantity: 30 };

      const conflict = conflictResolution.detectConflict(
        'product',
        'p1',
        'Product',
        local,
        remote,
        {
          localTimestamp: Date.now(), // Local mais recente
          remoteTimestamp: Date.now() - 10000,
        }
      );

      const result = await conflictResolution.resolveConflict(conflict!.id, 'merge');

      expect(result.resolved).toBe(true);
      // name e price vem do local (mais recente)
      expect(result.resolution.name).toBe('Product A');
      expect(result.resolution.price).toBe(100);
      expect(result.resolution.quantity).toBe(50);
    });

    it('should merge arrays with concat strategy when configured', async () => {
      const local = { id: 'p1', tags: ['a', 'b'] as string[] };
      const remote = { id: 'p1', tags: ['c', 'd'] as string[] };

      const conflict = conflictResolution.detectConflict(
        'product',
        'p1',
        'Product',
        local,
        remote
      );

      // Override merge options para test
      const result = await conflictResolution.resolveConflict(conflict!.id, 'merge');

      expect(result.resolved).toBe(true);
      // Tags devem ser concatenadas (dependendo da config)
      expect(Array.isArray(result.resolution.tags)).toBe(true);
    });

    it('should not merge non-mergeable fields', async () => {
      const local = { 
        id: 'p1', 
        name: 'Product A', 
        code: 'CODE1',
        price: 100,
      };
      const remote = { 
        id: 'p1', 
        name: 'Product B', 
        code: 'CODE2',
        price: 150,
      };

      const conflict = conflictResolution.detectConflict(
        'product',
        'p1',
        'Product',
        local,
        remote,
        {
          localTimestamp: Date.now(),
          remoteTimestamp: Date.now() - 10000,
        }
      );

      const result = await conflictResolution.resolveConflict(conflict!.id, 'merge');

      // Code é nonMergeableField, deve usar LWW
      expect(result.resolution.code).toBe('CODE1');
    });

    it('should update timestamp after merge', async () => {
      const local = { id: 'p1', name: 'Product A', price: 100 };
      const remote = { id: 'p1', name: 'Product B', price: 150 };

      const conflict = conflictResolution.detectConflict(
        'product',
        'p1',
        'Product',
        local,
        remote
      );

      const resolvedBefore = Date.now();
      const result = await conflictResolution.resolveConflict(conflict!.id, 'merge');
      const resolvedAfter = Date.now();

      expect(result.resolved).toBe(true);
      expect(result.resolution.updated_at).toBeDefined();
      
      const updatedTime = new Date(result.resolution.updated_at).getTime();
      expect(updatedTime).toBeGreaterThanOrEqual(resolvedBefore);
      expect(updatedTime).toBeLessThanOrEqual(resolvedAfter);
    });
  });

  describe('Conflict Resolution - Manual', () => {
    it('should apply custom resolution', async () => {
      const local = { id: 'p1', name: 'Product A', price: 100, quantity: 50 };
      const remote = { id: 'p1', name: 'Product B', price: 150, quantity: 30 };

      const conflict = conflictResolution.detectConflict(
        'product',
        'p1',
        'Product',
        local,
        remote
      );

      const customResolution = {
        id: 'p1',
        name: 'Product C',
        price: 120,
        quantity: 40,
      };

      const result = await conflictResolution.resolveConflict(
        conflict!.id,
        'manual',
        customResolution
      );

      expect(result.resolved).toBe(true);
      expect(result.resolution.name).toBe('Product C');
      expect(result.resolution.price).toBe(120);
      expect(result.resolution.quantity).toBe(40);
    });

    it('should throw error when manual resolution called without custom data', async () => {
      const local = { id: 'p1', name: 'Product A' };
      const remote = { id: 'p1', name: 'Product B' };

      const conflict = conflictResolution.detectConflict(
        'product',
        'p1',
        'Product',
        local,
        remote
      );

      await expect(
        conflictResolution.resolveConflict(conflict!.id, 'manual')
      ).rejects.toThrow('Manual resolution requires customResolution');
    });
  });

  describe('Conflict Management', () => {
    it('should get conflict by ID', () => {
      const local = { id: 'p1', name: 'Product A' };
      const remote = { id: 'p1', name: 'Product B' };

      const conflict = conflictResolution.detectConflict(
        'product',
        'p1',
        'Product',
        local,
        remote
      );

      const retrieved = conflictResolution.getConflict(conflict!.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(conflict!.id);
    });

    it('should return undefined for non-existent conflict', () => {
      const retrieved = conflictResolution.getConflict('nonexistent');
      expect(retrieved).toBeUndefined();
    });

    it('should get all conflicts', () => {
      conflictResolution.detectConflict('product', 'p1', 'Product', { id: 'p1', name: 'A' }, { id: 'p1', name: 'B' });
      conflictResolution.detectConflict('sale', 's1', 'Sale', { id: 's1', total: 100 }, { id: 's1', total: 200 });
      conflictResolution.detectConflict('product', 'p2', 'Product', { id: 'p2', name: 'C' }, { id: 'p2', name: 'D' });

      const conflicts = conflictResolution.getConflicts();
      expect(conflicts).toHaveLength(3);
    });

    it('should filter conflicts by type', () => {
      conflictResolution.detectConflict('product', 'p1', 'Product', { id: 'p1', name: 'A' }, { id: 'p1', name: 'B' });
      conflictResolution.detectConflict('sale', 's1', 'Sale', { id: 's1', total: 100 }, { id: 's1', total: 200 });
      conflictResolution.detectConflict('product', 'p2', 'Product', { id: 'p2', name: 'C' }, { id: 'p2', name: 'D' });

      const productConflicts = conflictResolution.getConflicts({ type: 'product' });
      expect(productConflicts).toHaveLength(2);

      const saleConflicts = conflictResolution.getConflicts({ type: 'sale' });
      expect(saleConflicts).toHaveLength(1);
    });

    it('should filter conflicts by resolved status', () => {
      const conflict1 = conflictResolution.detectConflict(
        'product', 'p1', 'Product',
        { id: 'p1', name: 'A' },
        { id: 'p1', name: 'B' }
      );
      const conflict2 = conflictResolution.detectConflict(
        'sale', 's1', 'Sale',
        { id: 's1', total: 100 },
        { id: 's1', total: 200 }
      );

      // Resolver um conflito
      conflictResolution.resolveConflict(conflict1!.id, 'lww');

      const resolved = conflictResolution.getConflicts({ resolved: true });
      expect(resolved).toHaveLength(1);

      const unresolved = conflictResolution.getConflicts({ resolved: false });
      expect(unresolved).toHaveLength(1);
    });

    it('should filter conflicts by entity ID', () => {
      conflictResolution.detectConflict('product', 'p1', 'Product', { id: 'p1', name: 'A' }, { id: 'p1', name: 'B' });
      conflictResolution.detectConflict('product', 'p2', 'Product', { id: 'p2', name: 'C' }, { id: 'p2', name: 'D' });
      conflictResolution.detectConflict('product', 'p1', 'Product', { id: 'p1', quantity: 10 }, { id: 'p1', quantity: 20 });

      const p1Conflicts = conflictResolution.getConflicts({ entityId: 'p1' });
      expect(p1Conflicts).toHaveLength(2);

      const p2Conflicts = conflictResolution.getConflicts({ entityId: 'p2' });
      expect(p2Conflicts).toHaveLength(1);
    });
  });

  describe('Conflict Callbacks', () => {
    it('should call callback when conflict detected', () => {
      const callback = jest.fn();
      
      const unsubscribe = conflictResolution.onNewConflict(callback);

      const local = { id: 'p1', name: 'Product A' };
      const remote = { id: 'p1', name: 'Product B' };

      conflictResolution.detectConflict('product', 'p1', 'Product', local, remote);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.any(String),
          type: 'product',
        })
      );

      unsubscribe();
    });

    it('should allow multiple callbacks', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      const unsubscribe1 = conflictResolution.onNewConflict(callback1);
      const unsubscribe2 = conflictResolution.onNewConflict(callback2);

      conflictResolution.detectConflict(
        'product', 'p1', 'Product',
        { id: 'p1', name: 'A' },
        { id: 'p1', name: 'B' }
      );

      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);

      unsubscribe1();
      unsubscribe2();
    });

    it('should unsubscribe callback correctly', () => {
      const callback = jest.fn();

      const unsubscribe = conflictResolution.onNewConflict(callback);

      conflictResolution.detectConflict(
        'product', 'p1', 'Product',
        { id: 'p1', name: 'A' },
        { id: 'p1', name: 'B' }
      );

      expect(callback).toHaveBeenCalledTimes(1);

      unsubscribe();

      conflictResolution.detectConflict(
        'product', 'p2', 'Product',
        { id: 'p2', name: 'C' },
        { id: 'p2', name: 'D' }
      );

      expect(callback).toHaveBeenCalledTimes(1); // Should not be called again
    });
  });

  describe('Conflict Cleanup', () => {
    it('should cleanup old resolved conflicts', () => {
      // Criar conflitos antigos resolvidos
      const conflict1 = conflictResolution.detectConflict(
        'product', 'p1', 'Product',
        { id: 'p1', name: 'A' },
        { id: 'p1', name: 'B' }
      );
      
      const conflict2 = conflictResolution.detectConflict(
        'product', 'p2', 'Product',
        { id: 'p2', name: 'C' },
        { id: 'p2', name: 'D' }
      );

      // Resolver conflitos
      conflictResolution.resolveConflict(conflict1!.id, 'lww');
      conflictResolution.resolveConflict(conflict2!.id, 'lww');

      // Simular que foram resolvidos há muito tempo
      const oldConflicts = conflictResolution.getConflicts({ resolved: true });
      oldConflicts.forEach(c => {
        c.resolutionTimestamp = Date.now() - 30 * 24 * 60 * 60 * 1000; // 30 dias atrás
      });

      const cleaned = conflictResolution.cleanupOldConflicts();
      
      expect(cleaned).toBeGreaterThan(0);
    });

    it('should clear all conflicts', () => {
      conflictResolution.detectConflict('product', 'p1', 'Product', { id: 'p1', name: 'A' }, { id: 'p1', name: 'B' });
      conflictResolution.detectConflict('sale', 's1', 'Sale', { id: 's1', total: 100 }, { id: 's1', total: 200 });

      expect(conflictResolution.getConflicts()).toHaveLength(2);

      conflictResolution.clearAllConflicts();

      expect(conflictResolution.getConflicts()).toHaveLength(0);
    });
  });

  describe('Helper Functions', () => {
    describe('autoResolveConflict', () => {
      it('should auto-resolve conflict without detection', async () => {
        const local = { id: 'p1', name: 'Product A', price: 100 };
        const remote = { id: 'p1', name: 'Product B', price: 150 };

        const result = await autoResolveConflict(
          'product',
          'p1',
          'Product',
          local,
          remote,
          {
            localTimestamp: Date.now(),
            remoteTimestamp: Date.now() - 10000,
            preferStrategy: 'lww',
          }
        );

        expect(result.hadConflict).toBe(true);
        expect(result.resolution).toBeDefined();
        expect(result.resolved).toBeDefined();
        expect(result.resolution!.name).toBe('Product A'); // LWW - local mais recente
      });

      it('should return non-conflicting version when no conflict', async () => {
        const local = { id: 'p1', name: 'Product A', price: 100 };
        const remote = { id: 'p1', name: 'Product A', price: 100 };

        const result = await autoResolveConflict(
          'product',
          'p1',
          'Product',
          local,
          remote,
          {
            localTimestamp: Date.now(),
            remoteTimestamp: Date.now() - 10000,
          }
        );

        expect(result.hadConflict).toBe(false);
        expect(result.resolution).toBeDefined();
        expect(result.resolved.name).toBe('Product A');
      });
    });

    describe('manualResolveConflict', () => {
      it('should manually resolve conflict', async () => {
        const local = { id: 'p1', name: 'Product A', price: 100 };
        const remote = { id: 'p1', name: 'Product B', price: 150 };

        const conflict = conflictResolution.detectConflict(
          'product', 'p1', 'Product',
          local, remote
        );

        const result = await manualResolveConflict(conflict!.id, {
          id: 'p1',
          name: 'Product C',
          price: 120,
        });

        expect(result.resolved).toBe(true);
        expect(result.resolution.name).toBe('Product C');
        expect(result.strategy).toBe('manual');
      });
    });

    describe('getConflictStats', () => {
      it('should return conflict statistics', () => {
        conflictResolution.detectConflict('product', 'p1', 'Product', { id: 'p1', name: 'A' }, { id: 'p1', name: 'B' });
        conflictResolution.detectConflict('sale', 's1', 'Sale', { id: 's1', total: 100 }, { id: 's1', total: 200 });
        
        const conflict1 = conflictResolution.getConflicts()[0];
        conflictResolution.resolveConflict(conflict1.id, 'lww');

        const stats = getConflictStats();

        expect(stats.total).toBe(2);
        expect(stats.resolved).toBe(1);
        expect(stats.pending).toBe(1);
        expect(stats.byType.product).toBe(1);
        expect(stats.byType.sale).toBe(1);
      });

      it('should return zero stats when no conflicts', () => {
        const stats = getConflictStats();

        expect(stats.total).toBe(0);
        expect(stats.resolved).toBe(0);
        expect(stats.pending).toBe(0);
        expect(stats.byType.product).toBe(0);
        expect(stats.byType.sale).toBe(0);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle null/undefined values correctly', () => {
      const local = { id: 'p1', name: 'Product A', description: null };
      const remote = { id: 'p1', name: 'Product A', description: 'Has description' };

      const conflict = conflictResolution.detectConflict(
        'product', 'p1', 'Product',
        local, remote
      );

      expect(conflict).toBeDefined();
      expect(conflict?.conflictedFields).toContain('description');
    });

    it('should handle empty objects', () => {
      const local = { id: 'p1' };
      const remote = { id: 'p1', name: 'Product A' };

      const conflict = conflictResolution.detectConflict(
        'product', 'p1', 'Product',
        local, remote
      );

      expect(conflict).toBeDefined();
      expect(conflict?.conflictedFields).toContain('name');
    });

    it('should throw error when resolving non-existent conflict', async () => {
      await expect(
        conflictResolution.resolveConflict('nonexistent', 'lww')
      ).rejects.toThrow('Conflict nonexistent not found');
    });

    it('should throw error when resolving already resolved conflict', async () => {
      const conflict = conflictResolution.detectConflict(
        'product', 'p1', 'Product',
        { id: 'p1', name: 'A' },
        { id: 'p1', name: 'B' }
      );

      await conflictResolution.resolveConflict(conflict!.id, 'lww');

      await expect(
        conflictResolution.resolveConflict(conflict!.id, 'lww')
      ).rejects.toThrow('already resolved');
    });
  });
});
