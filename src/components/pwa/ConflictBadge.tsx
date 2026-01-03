/**
 * ================================================================
 * CONFLICT BADGE - BIZCONTROL 360 ERP
 * ================================================================
 * Badge indicador de conflitos de estoque com popup
 *
 * CONTEXTO:
 * Posição no dashboard: badge de contador de conflitos no header
 * Posição no POS: badge ao lado dos status cards
 * Clicável: abre ConflictPanel com detalhes
 *
 * USO:
 * Posição 1: Header badge
 *   <ConflictBadge count={conflictCount} />
 *
 * Botoão 2: Action badge
 *   <button onClick={() => setShowConflictPanel(true)}>
 *     <ConflictBadge count={conflictCount} />
 *   </button>
 *
 *   POS: Badge clicável abrindo modal
 *   <ConflictPanel
 *     open={showConflictPanel}
 *     onClose={() => setShowConflictPanel(false)}
 * />
 *
 * UI:
 * - Badge pequeno com contador circular em destaque do badge
 * - Quando > 0: badge vermelho com pulse animation
 * - Quando = 0: badge cinza "Sem conflitos"
 * - Tooltip mostrando "Ver conflitos"
 * >
 * <span className={`text-xs px-2 py-1 rounded-full font-medium ${
 *   conflictCount > 0 ? 'bg-yellow-100 border-yellow-200 text-yellow-800 font-bold' : 'bg-green-100 border-green-200 text-green-800'
 * }`}>
 *   {conflictCount}
 * </span>
 *
 * ================================================================
 */

"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  X,
  Info,
} from 'lucide-react';
import { useConflicts } from '@/hooks/useConflicts';

interface ConflictBadgeProps {
  count: number;
  onClick?: () => void;
  showLabel?: boolean;
  variant?: 'default' | 'small' | 'large';
  disabled?: boolean;
  showIcon?: boolean;
}

export function ConflictBadge({
  count,
  onClick,
  showLabel = true,
  variant = 'default',
  disabled = false,
  showIcon = true,
}: ConflictBadgeProps) {
  const { conflictCount } = useConflicts();

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  if (conflictCount === 0 || !showLabel) {
    return null;
  }

  const baseClasses = {
    'default': 'flex items-center gap-2 px-3 py-1 rounded-full text-sm transition-all duration-200',
    'small': 'flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs transition-all duration-200',
    'large': 'flex items-center gap-3 px-4 py-1.5 rounded-lg text-sm transition-all duration-200',
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={disabled || conflictCount === 0}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`
        ${disabled || conflictCount === 0 ? 'opacity-40 cursor-not-allowed grayscale' : ''}
        ${baseClasses[variant]}
      `}
    >
      {showIcon && (
        <div className="relative flex items-center justify-center w-4 h-4">
          <AlertTriangle className="w-3 h-3 text-yellow-600" />
        </div>
      )}

      {/* Contador com pulse animation quando > 0 */}
      {conflictCount > 0 && (
        <span className="relative flex h-full w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" />
          <span className="absolute -top-1 left-1/2 w-3 h-3 bg-yellow-500 rounded-full opacity-75" />
        </span>
      )}

      {/* Badge circular */}
      <span
        className={`
          flex items-center justify-center w-5 h-5 rounded-full text-sm font-bold ${
          disabled || conflictCount === 0 ? 'text-slate-500' : 'text-yellow-800'
          }
        `}
      >
        {conflictCount > 9 ? '9+' : conflictCount}
      </span>
    </motion.button>
  );
}
