/**
 * ================================================================
 * METAS PESSOAIS - BIZCONTROL 360 ERP v2.1.0 (NEUMORPHIC)
 * ================================================================
 * Componente de progresso de metas do vendedor - Design neumorphic
 * ================================================================
 */

"use client";

import { motion } from 'framer-motion';
import { NeuCard, NeuCardContent } from '@/components/ui/neu-card';
import { Target, TrendingUp, Calendar } from 'lucide-react';
import type { VendedorMetrics } from '@/types/vendedor';

interface Props {
  metrics: VendedorMetrics;
}

export function MetasPessoais({ metrics }: Props) {
  const {
    meta_vendas_quantidade,
    vendas_realizadas,
    meta_vendas_valor,
    valor_total_vendido,
    percentual_meta,
    dias_uteis_restantes,
  } = metrics;

  const faltamVendas = meta_vendas_quantidade - vendas_realizadas;
  const faltaValor = meta_vendas_valor - valor_total_vendido;
  const percentualValor = (valor_total_vendido / meta_vendas_valor) * 100;
  
  // Cores baseadas no percentual
  const getColor = (percent: number) => {
    if (percent >= 100) return 'text-[var(--neu-success)]';
    if (percent >= 80) return 'text-[var(--neu-warning)]';
    return 'text-[var(--neu-error)]';
  };

  const getGradient = (percent: number) => {
    if (percent >= 100) return 'from-[var(--neu-success)] to-emerald-500';
    if (percent >= 80) return 'from-[var(--neu-warning)] to-yellow-500';
    return 'from-[var(--neu-error)] to-red-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <NeuCard variant="convex">
        <NeuCardContent>
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl neu-surface neu-concave-md flex items-center justify-center">
              <Target className="w-6 h-6 text-[var(--neu-accent)]" />
            </div>
            <h3 className="neu-text-h3">Minhas Metas</h3>
          </div>

          {/* Vendas Progress */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <span className="neu-text-body text-[var(--neu-text-muted)]">
                Vendas Realizadas
              </span>
              <span className={`neu-text-h4 ${getColor(percentual_meta)}`}>
                {vendas_realizadas} / {meta_vendas_quantidade}
              </span>
            </div>
            
            {/* Progress Bar Neumorphic */}
            <div className="h-4 rounded-full neu-surface neu-concave-sm overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(percentual_meta, 100)}%` }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                className={`h-full bg-gradient-to-r ${getGradient(percentual_meta)} rounded-full shadow-lg`}
              />
            </div>
            
            <div className="flex justify-between mt-2">
              <p className="neu-text-caption text-[var(--neu-text-muted)]">
                {percentual_meta.toFixed(1)}% da meta
              </p>
              <p className="neu-text-caption text-[var(--neu-text-muted)]">
                Faltam {faltamVendas} vendas
              </p>
            </div>
          </div>

          {/* Valor Progress */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <span className="neu-text-body text-[var(--neu-text-muted)]">
                Valor Total
              </span>
              <span className={`neu-text-h4 ${getColor(percentualValor)}`}>
                {valor_total_vendido.toLocaleString('pt-MZ', {
                  style: 'currency',
                  currency: 'MZN',
                  minimumFractionDigits: 0,
                })}
              </span>
            </div>
            
            {/* Progress Bar Neumorphic */}
            <div className="h-4 rounded-full neu-surface neu-concave-sm overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(percentualValor, 100)}%` }}
                transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
                className={`h-full bg-gradient-to-r ${getGradient(percentualValor)} rounded-full shadow-lg`}
              />
            </div>
            
            <div className="flex justify-between mt-2">
              <p className="neu-text-caption text-[var(--neu-text-muted)]">
                Meta: {meta_vendas_valor.toLocaleString('pt-MZ', {
                  style: 'currency',
                  currency: 'MZN',
                  minimumFractionDigits: 0,
                })}
              </p>
              <p className="neu-text-caption text-[var(--neu-text-muted)]">
                Faltam {faltaValor.toLocaleString('pt-MZ', {
                  style: 'currency',
                  currency: 'MZN',
                  minimumFractionDigits: 0,
                })}
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl neu-surface neu-convex-sm">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-[var(--neu-accent)]" />
                <p className="neu-text-caption text-[var(--neu-text-muted)]">
                  Dias Restantes
                </p>
              </div>
              <p className="neu-text-h2 text-[var(--neu-accent)]">
                {dias_uteis_restantes}
              </p>
            </div>
            
            <div className="p-4 rounded-xl neu-surface neu-convex-sm">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-[var(--neu-success)]" />
                <p className="neu-text-caption text-[var(--neu-text-muted)]">
                  Por Dia
                </p>
              </div>
              <p className="neu-text-h2 text-[var(--neu-success)]">
                {Math.ceil(faltamVendas / Math.max(dias_uteis_restantes, 1))}
              </p>
            </div>
          </div>

          {/* Achievement Badge */}
          {percentual_meta >= 100 && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', delay: 0.8 }}
              className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-[var(--neu-success)] to-emerald-600 text-white text-center"
            >
              <p className="neu-text-h4 font-bold">🏆 Meta Atingida!</p>
              <p className="neu-text-caption opacity-90">
                Parabéns pelo excelente desempenho!
              </p>
            </motion.div>
          )}
        </NeuCardContent>
      </NeuCard>
    </motion.div>
  );
}
