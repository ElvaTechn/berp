/**
 * ================================================================
 * ÚLTIMAS VENDAS - BIZCONTROL 360 ERP v2.1.0 (NEUMORPHIC)
 * ================================================================
 * Lista de últimas vendas - Design neumorphic
 * ================================================================
 */

"use client";

import { motion } from 'framer-motion';
import { NeuCard, NeuCardContent } from '@/components/ui/neu-card';
import { TrendingUp, CheckCircle, Clock, WifiOff, AlertCircle } from 'lucide-react';
import type { UltimaVenda } from '@/types/vendedor';

interface Props {
  vendas: UltimaVenda[];
}

export function UltimasVendas({ vendas }: Props) {
  const getStatusIcon = (status: UltimaVenda['status']) => {
    switch (status) {
      case 'synced':
        return <CheckCircle className="w-4 h-4 text-[var(--neu-success)]" />;
      case 'syncing':
        return <Clock className="w-4 h-4 text-[var(--neu-accent)] animate-spin" />;
      case 'pending':
        return <WifiOff className="w-4 h-4 text-[var(--neu-warning)]" />;
      default:
        return <AlertCircle className="w-4 h-4 text-[var(--neu-error)]" />;
    }
  };

  const getStatusColor = (status: UltimaVenda['status']) => {
    switch (status) {
      case 'synced':
        return 'text-[var(--neu-success)]';
      case 'syncing':
        return 'text-[var(--neu-accent)]';
      case 'pending':
        return 'text-[var(--neu-warning)]';
      default:
        return 'text-[var(--neu-error)]';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <NeuCard variant="convex">
        <NeuCardContent>
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl neu-surface neu-concave-md flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-[var(--neu-accent)]" />
            </div>
            <h3 className="neu-text-h3">Últimas Vendas</h3>
          </div>

          {/* Vendas List */}
          <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
            {vendas.slice(0, 8).map((venda, i) => (
              <motion.div
                key={venda.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.05 }}
              >
                <div className="p-4 rounded-xl neu-surface neu-convex-sm hover:neu-convex-md transition-all">
                  <div className="flex items-start justify-between gap-3">
                    {/* Left: Info */}
                    <div className="flex-1 min-w-0">
                      <p className="neu-text-body font-semibold truncate">
                        {venda.cliente_nome}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="neu-text-caption text-[var(--neu-text-muted)]">
                          {venda.items_count} {venda.items_count === 1 ? 'item' : 'itens'}
                        </p>
                        <span className="neu-text-caption text-[var(--neu-text-muted)]">•</span>
                        <p className="neu-text-caption text-[var(--neu-text-muted)]">
                          {new Date(venda.data).toLocaleString('pt-MZ', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Right: Value + Status */}
                    <div className="text-right">
                      <p className="neu-text-body font-bold">
                        {venda.valor.toLocaleString('pt-MZ', {
                          style: 'currency',
                          currency: 'MZN',
                          minimumFractionDigits: 0,
                        })}
                      </p>
                      <div className={`flex items-center justify-end gap-1 mt-1 ${getStatusColor(venda.status)}`}>
                        {getStatusIcon(venda.status)}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Empty State */}
            {vendas.length === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl neu-surface neu-concave-md flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-[var(--neu-text-muted)]" />
                </div>
                <p className="neu-text-body text-[var(--neu-text-muted)]">
                  Nenhuma venda ainda
                </p>
              </div>
            )}
          </div>
        </NeuCardContent>
      </NeuCard>
    </motion.div>
  );
}
