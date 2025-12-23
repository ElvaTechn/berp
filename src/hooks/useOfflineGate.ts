/**
 * ================================================================
 * USE OFFLINE GATE - BIZCONTROL 360 ERP v2.0.0
 * ================================================================
 * "Portão Offline" - Blindagem de ações críticas
 * 
 * FUNÇÃO:
 * - Verifica conectividade antes de ações administrativas
 * - Bloqueia ações que exigem base de dados central
 * - Exibe Toast elegante para feedback ao usuário
 * 
 * USO:
 * const { requireOnline } = useOfflineGate();
 * 
 * // Em ações críticas:
 * const handleCreateCompany = async () => {
 *   await requireOnline(async () => {
 *     await api.companies.create(data);
 *   });
 * };
 * 
 * AUTOR: PWA Team
 * DATA: 21 Dezembro 2025
 * ================================================================
 */

"use client";

import { toast } from "sonner";
import { useOfflineSync } from "./useOfflineSync";

interface OfflineGateOptions {
  actionName?: string;
  errorMessage?: string;
}

export function useOfflineGate() {
  const { isOnline } = useOfflineSync();

  /**
   * Executa uma ação apenas se online
   * Caso offline, mostra Toast e rejeita a promise
   */
  const requireOnline = async <T>(
    action: () => Promise<T>,
    options: OfflineGateOptions = {}
  ): Promise<T> => {
    const {
      actionName = "esta ação",
      errorMessage = "Conexão necessária para esta ação administrativa"
    } = options;

    if (!isOnline) {
      // Toast elegante com ícone de aviso
      toast.error(errorMessage, {
        description: `Você está offline. Conecte-se à internet para ${actionName}.`,
        action: {
          label: "Entendi",
          onClick: () => toast.dismiss()
        },
        duration: 5000
      });

      // Rejeita para evitar tentativas falhas
      return Promise.reject(new Error("OFFLINE_GATE_BLOCKED"));
    }

    try {
      return await action();
    } catch (error) {
      // Se for erro de autenticação, não trata aqui (deixa para o handler global)
      throw error;
    }
  };

  /**
   * Verifica se pode executar ação e retorna booleano
   * Útil para habilitar/desabilitar botões
   */
  const canExecute = (): boolean => {
    return isOnline;
  };

  /**
   * Executa ação com fallback offline
   * Útil para ações não críticas que podem ser adiadas
   */
  const executeOrQueue = async <T>(
    action: () => Promise<T>,
    queueAction: () => Promise<void>,
    options: OfflineGateOptions = {}
  ): Promise<T | null> => {
    const { actionName = "esta ação" } = options;

    if (!isOnline) {
      toast.warning("Ação adiada", {
        description: `Você está offline. A ${actionName} será sincronizada quando a conexão voltar.`,
        duration: 3000
      });

      await queueAction();
      return null;
    }

    return await action();
  };

  return {
    requireOnline,
    canExecute,
    executeOrQueue,
    isOnline
  };
}
