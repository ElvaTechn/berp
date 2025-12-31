/**
 * ================================================================
 * VENDEDOR DASHBOARD HOOK - BIZCONTROL 360 ERP v2.1.0
 * ================================================================
 * Hook React para gerenciar dados do dashboard do vendedor
 * ================================================================
 */

"use client";

import { useState, useEffect, useCallback } from 'react';
import type { VendedorDashboardResponse } from '@/types/vendedor';
import { getSyncStatus } from '@/utils/offline-db';

export function useVendedorDashboard() {
  const [data, setData] = useState<VendedorDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  /**
   * Busca dados do dashboard
   */
  const fetchDashboard = useCallback(async () => {
    try {
      setError(null);
      
      const response = await fetch('/api/vendedor/dashboard', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar dados do dashboard');
      }

      const dashboardData: VendedorDashboardResponse = await response.json();
      
      // Adicionar vendas offline pendentes
      const syncStatus = await getSyncStatus();
      dashboardData.metrics.vendas_offline_pendentes = syncStatus.pendingCount;
      
      setData(dashboardData);
    } catch (err) {
      console.error('[useVendedorDashboard] Erro:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  /**
   * Refresh manual
   */
  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDashboard();
  }, [fetchDashboard]);

  /**
   * Setup - Buscar dados iniciais
   */
  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  /**
   * Setup - Auto-refresh a cada 5 minutos
   */
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboard();
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, [fetchDashboard]);

  return {
    data,
    loading,
    error,
    refreshing,
    refresh,
  };
}
