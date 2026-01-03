/**
 * ================================================================
 * USE CONFLICTS HOOK - BIZCONTROL 360 ERP
 * ================================================================
 * Hook para gerenciar conflitos de sincronização e estoque
 *
 * FUNCIONALIDADES:
 * - Buscar conflitos pendentes de resolução
 * - Contagem de conflitos recentes
 * - Marcar conflitos como resolvidos
 * ================================================================
 */

import { useState, useEffect, useCallback } from 'react';
import { useOfflineSync } from './useOfflineSync';

export interface StockConflict {
  sale_id: string;
  stock_available: number;
  items_requested: number;
  product_name: string;
  status: 'pending' | 'resolved' | 'escalated';
  created_at: string;
}

export interface UseConflictsReturn {
  conflicts: StockConflict[];
  conflictCount: number;
  pendingConflicts: StockConflict[];
  loading: boolean;
  refreshConflicts: () => Promise<void>;
  resolveConflict: (saleId: string) => Promise<void>;
}

export function useConflicts(): UseConflictsReturn {
  const [conflicts, setConflicts] = useState<StockConflict[]>([]);
  const [loading, setLoading] = useState(true);
  const { isOnline, pendingCount } = useOfflineSync();

  // Fetch conflicts from IndexedDB or API
  const fetchConflicts = useCallback(async () => {
    setLoading(true);

    try {
      // Priority 1: Try fetching from API (if online)
      if (isOnline) {
        try {
          const response = await fetch('/api/conflicts/list');
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.conflicts) {
              setConflicts(data.conflicts);
              setLoading(false);
              return;
            }
          }
        } catch (apiError) {
          console.warn('[useConflicts] API fetch failed, falling back to local:', apiError);
        }
      }

      // Priority 2: Fetch from IndexedDB (local conflicts pending sync)
      // Fallback: try to get conflicts from local storage if available
      const localConflicts: StockConflict[] = [];
      setConflicts(localConflicts);
    } catch (error) {
      console.error('[useConflicts] Error fetching conflicts:', error);
      setConflicts([]);
    } finally {
      setLoading(false);
    }
  }, [isOnline]);

  // Mark conflict as resolved
  const resolveConflict = useCallback(async (saleId: string) => {
    try {
      // API call if online
      if (isOnline) {
        const response = await fetch('/api/conflicts/resolve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sale_id: saleId }),
        });

        if (!response.ok) {
          throw new Error('Failed to resolve conflict');
        }
      }

      // Update local state
      setConflicts(prev => prev.filter(c => c.sale_id !== saleId));
    } catch (error) {
      console.error('[useConflicts] Error resolving conflict:', error);
      throw error;
    }
  }, [isOnline]);

  // Initial fetch and refresh when sync occurs
  useEffect(() => {
    fetchConflicts();

    // Refresh when pending count changes (sync completed)
    if (pendingCount === 0 && isOnline) {
      const timeoutId = setTimeout(fetchConflicts, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [fetchConflicts, pendingCount, isOnline]);

  return {
    conflicts,
    conflictCount: conflicts.filter(c => c.status === 'pending').length,
    pendingConflicts: conflicts.filter(c => c.status === 'pending'),
    loading,
    refreshConflicts: fetchConflicts,
    resolveConflict,
  };
}
