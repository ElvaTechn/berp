/**
 * ================================================================
 * DASHBOARD VENDEDOR - BIZCONTROL 360 ERP v2.1.0
 * ================================================================
 * Página principal do dashboard do vendedor
 * ================================================================
 */

"use client";

import { useVendedorDashboard } from '@/hooks/useVendedorDashboard';
import { useOfflineSales } from '@/hooks/useOfflineSales';
import { AcoesRapidas } from '@/components/vendedor/AcoesRapidas';
import { MetasPessoais } from '@/components/vendedor/MetasPessoais';
import { DesempenhoHoje } from '@/components/vendedor/DesempenhoHoje';
import { Comissoes } from '@/components/vendedor/Comissoes';
import { Ranking } from '@/components/vendedor/Ranking';
import { UltimasVendas } from '@/components/vendedor/UltimasVendas';
import { ProdutosDestaque } from '@/components/vendedor/ProdutosDestaque';
import { motion } from 'framer-motion';

export default function VendedorDashboardPage() {
  const { data, loading, error, refresh, refreshing } = useVendedorDashboard();
  const { isOffline, pendingSales } = useOfflineSales();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <span className="text-6xl mb-4 block">⚠️</span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Erro ao Carregar Dashboard
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            {error || 'Não foi possível carregar os dados'}
          </p>
          <button
            onClick={refresh}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  const { metrics, ranking, ultimas_vendas, produtos_destaque } = data;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black p-4 md:p-6 lg:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
              👋 Olá, {metrics.vendedor_nome}
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              {new Date().toLocaleDateString('pt-MZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          
          {/* Refresh Button */}
          <button
            onClick={refresh}
            disabled={refreshing}
            className="px-4 py-2 bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 rounded-xl 
                     hover:bg-slate-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <svg 
              className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="text-sm font-medium">Atualizar</span>
          </button>
        </div>

        {/* Offline Alert */}
        {isOffline && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-500/30 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">📡</span>
              <div>
                <p className="font-semibold text-yellow-900 dark:text-yellow-400">Modo Offline</p>
                <p className="text-sm text-yellow-700 dark:text-yellow-500">
                  {pendingSales.length > 0 
                    ? `${pendingSales.length} ${pendingSales.length === 1 ? 'venda aguardando' : 'vendas aguardando'} sincronização`
                    : 'Vendas serão salvas localmente'}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Ações Rápidas */}
      <div className="mb-6">
        <AcoesRapidas />
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna 1 */}
        <div className="space-y-6">
          <MetasPessoais metrics={metrics} />
          <Comissoes metrics={metrics} />
        </div>

        {/* Coluna 2 */}
        <div className="space-y-6">
          <DesempenhoHoje metrics={metrics} />
          <Ranking ranking={ranking} />
        </div>

        {/* Coluna 3 */}
        <div className="space-y-6">
          <UltimasVendas vendas={ultimas_vendas} />
          <ProdutosDestaque produtos={produtos_destaque} />
        </div>
      </div>

      {/* Footer Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold">{metrics.ranking_posicao}º</p>
            <p className="text-sm opacity-90">Posição Ranking</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">{metrics.vendas_realizadas}</p>
            <p className="text-sm opacity-90">Vendas no Mês</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">{metrics.percentual_meta.toFixed(0)}%</p>
            <p className="text-sm opacity-90">Da Meta</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">{metrics.ticket_medio.toLocaleString('pt-MZ', { maximumFractionDigits: 0 })}</p>
            <p className="text-sm opacity-90">Ticket Médio</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
