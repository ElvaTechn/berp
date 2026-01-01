/**
 * ================================================================
 * DASHBOARD VENDEDOR - BIZCONTROL 360 ERP v2.1.0 (NEUMORPHIC)
 * ================================================================
 * Página principal do dashboard do vendedor com design neumorphic
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
import { NeuCard, NeuCardContent } from '@/components/ui/neu-card';
import { NeuButton } from '@/components/ui/neu-button';
import { motion } from 'framer-motion';
import { RefreshCw, Wifi, WifiOff } from 'lucide-react';

export default function VendedorDashboardPage() {
  const { data, loading, error, refresh, refreshing } = useVendedorDashboard();
  const { isOffline, pendingSales } = useOfflineSales();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--neu-base)] flex items-center justify-center">
        <NeuCard variant="flat" className="w-64 text-center">
          <NeuCardContent>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full neu-surface neu-concave-lg flex items-center justify-center">
              <RefreshCw className="w-8 h-8 text-[var(--neu-accent)] animate-spin" />
            </div>
            <p className="neu-text-body text-[var(--neu-text-muted)]">Carregando dashboard...</p>
          </NeuCardContent>
        </NeuCard>
      </div>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <div className="min-h-screen bg-[var(--neu-base)] flex items-center justify-center p-4">
        <NeuCard variant="flat" className="max-w-md text-center">
          <NeuCardContent>
            <div className="w-20 h-20 mx-auto mb-4 rounded-full neu-surface neu-concave-lg flex items-center justify-center">
              <span className="text-4xl">⚠️</span>
            </div>
            <h2 className="neu-text-h2 mb-2">Erro ao Carregar Dashboard</h2>
            <p className="neu-text-body text-[var(--neu-text-muted)] mb-6">
              {error || 'Não foi possível carregar os dados'}
            </p>
            <NeuButton variant="accent" onClick={refresh}>
              Tentar Novamente
            </NeuButton>
          </NeuCardContent>
        </NeuCard>
      </div>
    );
  }

  const { metrics, ranking, ultimas_vendas, produtos_destaque } = data;

  return (
    <div className="min-h-screen bg-[var(--neu-base)] p-4 md:p-6 lg:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="neu-text-h1 mb-1">
              👋 Olá, {metrics.vendedor_nome}
            </h1>
            <p className="neu-text-body text-[var(--neu-text-muted)]">
              {new Date().toLocaleDateString('pt-MZ', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          
          {/* Refresh Button Neumorphic */}
          <NeuButton
            variant="convex"
            onClick={refresh}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </NeuButton>
        </div>

        {/* Offline Alert Neumorphic */}
        {isOffline && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            <NeuCard variant="concave" className="bg-[var(--neu-warning)]/10 border-[var(--neu-warning)]/20">
              <NeuCardContent className="flex items-center gap-3 p-4">
                <div className="w-12 h-12 rounded-xl neu-surface neu-concave-md flex items-center justify-center">
                  <WifiOff className="w-6 h-6 text-[var(--neu-warning)]" />
                </div>
                <div className="flex-1">
                  <p className="neu-text-body font-bold text-[var(--neu-warning)]">
                    Modo Offline
                  </p>
                  <p className="neu-text-caption text-[var(--neu-text-muted)]">
                    {pendingSales.length > 0 
                      ? `${pendingSales.length} ${pendingSales.length === 1 ? 'venda aguardando' : 'vendas aguardando'} sincronização`
                      : 'Vendas serão salvas localmente'}
                  </p>
                </div>
              </NeuCardContent>
            </NeuCard>
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
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          <MetasPessoais metrics={metrics} />
          <Comissoes metrics={metrics} />
        </motion.div>

        {/* Coluna 2 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <DesempenhoHoje metrics={metrics} />
          <Ranking ranking={ranking} />
        </motion.div>

        {/* Coluna 3 */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <UltimasVendas vendas={ultimas_vendas} />
          <ProdutosDestaque produtos={produtos_destaque} />
        </motion.div>
      </div>

      {/* Footer Stats Neumorphic */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-8"
      >
        <NeuCard variant="convex" size="lg">
          <NeuCardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {/* Ranking */}
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-2xl neu-surface neu-concave-md flex items-center justify-center">
                  <span className="neu-text-h2 text-[var(--neu-accent)]">
                    {metrics.ranking_posicao}º
                  </span>
                </div>
                <p className="neu-text-caption text-[var(--neu-text-muted)]">
                  Posição Ranking
                </p>
              </div>

              {/* Vendas */}
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-2xl neu-surface neu-concave-md flex items-center justify-center">
                  <span className="neu-text-h2 text-[var(--neu-success)]">
                    {metrics.vendas_realizadas}
                  </span>
                </div>
                <p className="neu-text-caption text-[var(--neu-text-muted)]">
                  Vendas no Mês
                </p>
              </div>

              {/* Meta */}
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-2xl neu-surface neu-concave-md flex items-center justify-center">
                  <span className={`neu-text-h2 ${
                    metrics.percentual_meta >= 100 
                      ? 'text-[var(--neu-success)]' 
                      : metrics.percentual_meta >= 80 
                      ? 'text-[var(--neu-warning)]' 
                      : 'text-[var(--neu-error)]'
                  }`}>
                    {metrics.percentual_meta.toFixed(0)}%
                  </span>
                </div>
                <p className="neu-text-caption text-[var(--neu-text-muted)]">
                  Da Meta
                </p>
              </div>

              {/* Ticket Médio */}
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-2xl neu-surface neu-concave-md flex items-center justify-center">
                  <span className="neu-text-h3 text-[var(--neu-accent)]">
                    {(metrics.ticket_medio / 1000).toFixed(1)}K
                  </span>
                </div>
                <p className="neu-text-caption text-[var(--neu-text-muted)]">
                  Ticket Médio
                </p>
              </div>
            </div>
          </NeuCardContent>
        </NeuCard>
      </motion.div>
    </div>
  );
}
