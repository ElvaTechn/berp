/**
 * ================================================================
 * METAS PESSOAIS - BIZCONTROL 360 ERP v2.1.0
 * ================================================================
 * Componente de progresso de metas do vendedor
 * ================================================================
 */

"use client";

import { motion } from 'framer-motion';
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
  
  // Cores baseadas no percentual
  const getColor = (percent: number) => {
    if (percent >= 100) return 'text-green-600 dark:text-green-400';
    if (percent >= 80) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getBarColor = (percent: number) => {
    if (percent >= 100) return 'bg-green-500';
    if (percent >= 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10
                 shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.1),inset_2px_2px_4px_rgba(0,0,0,0.1)]
                 dark:shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.02),inset_2px_2px_4px_rgba(0,0,0,0.3)]"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🎯</span>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Minhas Metas
        </h3>
      </div>

      {/* Vendas Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Vendas Realizadas
          </span>
          <span className={`text-sm font-bold ${getColor(percentual_meta)}`}>
            {vendas_realizadas} / {meta_vendas_quantidade}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(percentual_meta, 100)}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-full ${getBarColor(percentual_meta)} rounded-full`}
          />
        </div>
        
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {percentual_meta.toFixed(1)}% da meta • Faltam {faltamVendas} vendas
        </p>
      </div>

      {/* Valor Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Valor Total
          </span>
          <span className={`text-sm font-bold ${getColor((valor_total_vendido / meta_vendas_valor) * 100)}`}>
            {valor_total_vendido.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((valor_total_vendido / meta_vendas_valor) * 100, 100)}%` }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
            className={`h-full ${getBarColor((valor_total_vendido / meta_vendas_valor) * 100)} rounded-full`}
          />
        </div>
        
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Meta: {meta_vendas_valor.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })} • 
          Faltam {faltaValor.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-white dark:bg-black/30 border border-slate-200 dark:border-white/5">
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Dias Restantes</p>
          <p className="text-lg font-bold text-slate-900 dark:text-white">
            {dias_uteis_restantes}
          </p>
        </div>
        
        <div className="p-3 rounded-xl bg-white dark:bg-black/30 border border-slate-200 dark:border-white/5">
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Por Dia</p>
          <p className="text-lg font-bold text-slate-900 dark:text-white">
            {Math.ceil(faltamVendas / Math.max(dias_uteis_restantes, 1))}
          </p>
        </div>
      </div>

      {/* Achievement Badge (se atingiu meta) */}
      {percentual_meta >= 100 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.5 }}
          className="mt-4 p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white text-center"
        >
          <p className="font-bold">🏆 Meta Atingida!</p>
          <p className="text-xs opacity-90">Parabéns pelo excelente desempenho!</p>
        </motion.div>
      )}
    </motion.div>
  );
}
