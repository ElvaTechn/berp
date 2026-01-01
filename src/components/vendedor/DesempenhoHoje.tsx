/**
 * ================================================================
 * DESEMPENHO HOJE - BIZCONTROL 360 ERP v2.1.0 (NEUMORPHIC)
 * ================================================================
 * Métricas de desempenho do dia - Design neumorphic
 * ================================================================
 */

"use client";

import { motion } from 'framer-motion';
import { NeuCard, NeuCardContent } from '@/components/ui/neu-card';
import { BarChart3, DollarSign, Users, Receipt } from 'lucide-react';
import type { VendedorMetrics } from '@/types/vendedor';

interface Props {
  metrics: VendedorMetrics;
}

export function DesempenhoHoje({ metrics }: Props) {
  const stats = [
    {
      label: 'Vendas Hoje',
      value: metrics.vendas_hoje,
      icon: BarChart3,
      color: 'text-[var(--neu-success)]',
    },
    {
      label: 'Valor Hoje',
      value: metrics.valor_hoje.toLocaleString('pt-MZ', {
        style: 'currency',
        currency: 'MZN',
        minimumFractionDigits: 0,
      }),
      icon: DollarSign,
      color: 'text-[var(--neu-accent)]',
    },
    {
      label: 'Clientes',
      value: metrics.clientes_atendidos_hoje,
      icon: Users,
      color: 'text-[var(--neu-warning)]',
    },
    {
      label: 'Ticket Médio',
      value: metrics.ticket_medio_hoje.toLocaleString('pt-MZ', {
        style: 'currency',
        currency: 'MZN',
        minimumFractionDigits: 0,
      }),
      icon: Receipt,
      color: 'text-[var(--neu-error)]',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <NeuCard variant="convex">
        <NeuCardContent>
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl neu-surface neu-concave-md flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-[var(--neu-accent)]" />
            </div>
            <h3 className="neu-text-h3">Desempenho Hoje</h3>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.1, type: 'spring' }}
              >
                <div className="p-4 rounded-xl neu-surface neu-convex-sm hover:neu-convex-md transition-all">
                  {/* Icon + Label */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg neu-surface neu-concave-sm flex items-center justify-center">
                      <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                    <p className="neu-text-caption text-[var(--neu-text-muted)]">
                      {stat.label}
                    </p>
                  </div>
                  
                  {/* Value */}
                  <p className={`neu-text-h3 ${stat.color}`}>
                    {stat.value}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </NeuCardContent>
      </NeuCard>
    </motion.div>
  );
}
