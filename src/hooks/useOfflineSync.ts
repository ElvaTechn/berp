/**
 * ================================================================
 * USE OFFLINE SYNC - BIZCONTROL 360 ERP v2.0.0
 * ================================================================
 * Hook para sincronização automática de dados offline
 * 
 * FUNCIONALIDADES:
 * - Detecta mudança de status (online/offline)
 * - Sincroniza vendas pendentes automaticamente
 * - Gerencia conflitos e erros
 * - Atualiza lease de subscrição
 * 
 * AUTOR: PWA Team
 * DATA: 18 Dezembro 2025
 * ================================================================
 */

"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import {
  getPendingSales,
  markSaleAsSynced,
  deletePendingSale,
  getCacheStats,
} from "@/lib/pwa/indexedDB";
import { updateLease, updateLastSync } from "@/lib/pwa/subscription-check";

// ================================================================
// TYPES
// ================================================================

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSync: Date | null;
  syncError: string | null;
}

// ================================================================
// HOOK
// ================================================================

export function useOfflineSync() {
  const [status, setStatus] = useState<SyncStatus>({
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    isSyncing: false,
    pendingCount: 0,
    lastSync: null,
    syncError: null,
  });

  const syncInProgress = useRef(false);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================================
  // UPDATE PENDING COUNT
  // ============================================================

  const updatePendingCount = useCallback(async () => {
    try {
      const stats = await getCacheStats();
      setStatus((prev) => ({
        ...prev,
        pendingCount: stats.pending_sales,
      }));
    } catch (error) {
      console.error("Failed to update pending count:", error);
    }
  }, []);

  // ============================================================
  // SYNC FUNCTION
  // ============================================================

  const syncPendingSales = useCallback(async () => {
    // Evitar múltiplas sincronizações simultâneas
    if (syncInProgress.current) {
      console.log("Sync already in progress, skipping...");
      return;
    }

    syncInProgress.current = true;

    setStatus((prev) => ({
      ...prev,
      isSyncing: true,
      syncError: null,
    }));

    try {
      console.log("🔄 Starting offline sync...");

      // 1. Buscar vendas pendentes
      const pendingSales = await getPendingSales();

      if (pendingSales.length === 0) {
        console.log("✅ No pending sales to sync");
        setStatus((prev) => ({
          ...prev,
          isSyncing: false,
          lastSync: new Date(),
        }));
        syncInProgress.current = false;
        return;
      }

      console.log(`📦 Found ${pendingSales.length} pending sales`);

      let successCount = 0;
      let errorCount = 0;

      // 2. Sincronizar cada venda
      for (const sale of pendingSales) {
        try {
          // Enviar para API
          const response = await fetch("/api/sales", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              items: sale.items,
              payment_method: sale.payment_method,
              discount_code: sale.discount_code,
            }),
          });

          if (response.ok) {
            // Sucesso: Marcar como sincronizada ou deletar
            await deletePendingSale(sale.id);
            successCount++;
            console.log(`✅ Sale ${sale.id} synced successfully`);
          } else {
            // Erro da API
            const error = await response.json();
            console.error(`❌ Failed to sync sale ${sale.id}:`, error);
            
            // Se erro for de produto não encontrado, deletar venda local
            if (response.status === 404 || response.status === 400) {
              await deletePendingSale(sale.id);
              console.log(`🗑️ Deleted invalid sale ${sale.id}`);
            }
            
            errorCount++;
          }
        } catch (error) {
          console.error(`❌ Error syncing sale ${sale.id}:`, error);
          errorCount++;
        }
      }

      // 3. Atualizar timestamp de sincronização
      await updateLastSync();

      // 4. Atualizar contagem
      await updatePendingCount();

      // 5. Feedback
      if (successCount > 0) {
        toast.success(`${successCount} venda(s) sincronizada(s)!`);
      }

      if (errorCount > 0) {
        toast.error(`${errorCount} venda(s) falharam ao sincronizar`);
      }

      setStatus((prev) => ({
        ...prev,
        isSyncing: false,
        lastSync: new Date(),
        syncError: errorCount > 0 ? `${errorCount} vendas falharam` : null,
      }));

      console.log(`✅ Sync completed: ${successCount} success, ${errorCount} errors`);
    } catch (error) {
      console.error("Sync failed:", error);
      
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      
      setStatus((prev) => ({
        ...prev,
        isSyncing: false,
        syncError: errorMessage,
      }));

      toast.error("Erro ao sincronizar vendas");
    } finally {
      syncInProgress.current = false;
    }
  }, [updatePendingCount]);

  // ============================================================
  // NETWORK STATUS LISTENERS
  // ============================================================

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = async () => {
      console.log("🌐 Connection restored");
      
      setStatus((prev) => ({
        ...prev,
        isOnline: true,
      }));

      toast.success("Conexão restaurada!");

      // Aguardar um pouco antes de sincronizar (para estabilizar conexão)
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }

      syncTimeoutRef.current = setTimeout(() => {
        syncPendingSales();
      }, 2000); // 2 segundos
    };

    const handleOffline = () => {
      console.log("📵 Connection lost");
      
      setStatus((prev) => ({
        ...prev,
        isOnline: false,
      }));

      toast.warning("Você está offline. As vendas serão sincronizadas quando a conexão voltar.");

      // Cancelar sync pendente
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };

    // Adicionar listeners
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Verificar estado inicial
    setStatus((prev) => ({
      ...prev,
      isOnline: navigator.onLine,
    }));

    // Atualizar contagem inicial
    updatePendingCount();

    // Cleanup
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [syncPendingSales, updatePendingCount]);

  // ============================================================
  // PERIODIC SYNC (quando online)
  // ============================================================

  useEffect(() => {
    if (!status.isOnline || typeof window === "undefined") return;

    // Sincronizar periodicamente (a cada 5 minutos)
    const interval = setInterval(() => {
      if (navigator.onLine) {
        syncPendingSales();
      }
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, [status.isOnline, syncPendingSales]);

  // ============================================================
  // MANUAL SYNC
  // ============================================================

  const manualSync = useCallback(() => {
    if (!status.isOnline) {
      toast.error("Você está offline. Conecte-se à internet para sincronizar.");
      return;
    }

    syncPendingSales();
  }, [status.isOnline, syncPendingSales]);

  // ============================================================
  // RETURN
  // ============================================================

  return {
    ...status,
    sync: manualSync,
    refreshPendingCount: updatePendingCount,
  };
}
