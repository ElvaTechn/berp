/**
 * ================================================================
 * COMISSÕES - BIZCONTROL 360 ERP v2.1.0 (NEUMORPHIC)
 * ================================================================
 * Card de comissões do vendedor - Design neumorphic
 * ================================================================
 */

"use client";

import { motion } from 'framer-motion';
import { NeuCard, NeuCardContent } from '@/components/ui/neu-card';
import { Briefcase, TrendingUp, DollarSign } from 'lucide-react';
import type { VendedorMetrics } from '@/types/vendedor';

interface Props {
  metrics: VendedorMetrics;
}

export function Comissoes({ metrics }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <NeuCard variant="convex" className="bg-gradient-to-br from-[var(--neu-success)]/10 to-[var(--neu-success)]/5">
        <NeuCardContent>
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl neu-surface neu-concave-md flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-[var(--neu-success)]" />
            </div>
            <h3 className="neu-text-h3 text-[var(--neu-success)]">Comissões</h3>
          </div>

          {/* Main Value */}
          <div className="mb-6">
            <p className="neu-text-caption text-[var(--neu-text-muted)] mb-2">
              Acumulado Este Mês
            </p>
            <div className="p-4 rounded-2xl neu-surface neu-concave-md">
              <p className="neu-text-h1 text-[var(--neu-success)]">
                {metrics.comissao_acumulada.toLocaleString('pt-MZ', {
                  style: 'currency',
                  currency: 'MZN',
                  minimumFractionDigits: 0,
                })}
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Projeção */}
            <div className="p-4 rounded-xl neu-surface neu-convex-sm">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-[var(--neu-success)]" />
                <p className="neu-text-caption text-[var(--neu-text-muted)]">
                  Projeção
                </p>
              </div>
              <p className="neu-text-h4 text-[var(--neu-success)]">
                {metrics.comissao_projetada.toLocaleString('pt-MZ', {
                  style: 'currency',
                  currency: 'MZN',
                  minimumFractionDigits: 0,
                })}
              </p>
            </div>

            {/* Última Paga */}
            <div className="p-4 rounded-xl neu-surface neu-convex-sm">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-[var(--neu-text-muted)]" />
                <p className="neu-text-caption text-[var(--neu-text-muted)]">
                  Última Paga
                </p>
              </div>
              <p className="neu-text-h4">
                {metrics.ultima_comissao_paga.toLocaleString('pt-MZ', {
                  style: 'currency',
                  currency: 'MZN',
                  minimumFractionDigits: 0,
                })}
              </p>
            </div>
          </div>

          {/* Date */}
          <p className="neu-text-caption text-[var(--neu-text-muted)] mt-4 text-center">
            Último pagamento: {new Date(metrics.data_ultimo_pagamento).toLocaleDateString('pt-MZ')}
          </p>
        </NeuCardContent>
      </NeuCard>
    </motion.div>
  );
}
