/**
 * ================================================================
 * AÇÕES RÁPIDAS - BIZCONTROL 360 ERP v2.1.0
 * ================================================================
 * Botões de ação rápida para o vendedor
 * ================================================================
 */

"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';

interface AcaoRapida {
  icon: string;
  label: string;
  href: string;
  badge?: number;
  color: string;
}

export function AcoesRapidas() {
  const acoes: AcaoRapida[] = [
    {
      icon: '💰',
      label: 'Nova Venda',
      href: '/sales/nova',
      color: 'bg-green-500 dark:bg-green-600',
    },
    {
      icon: '📦',
      label: 'Produtos',
      href: '/products',
      color: 'bg-blue-500 dark:bg-blue-600',
    },
    {
      icon: '👥',
      label: 'Clientes',
      href: '/customers',
      color: 'bg-purple-500 dark:bg-purple-600',
    },
    {
      icon: '📋',
      label: 'Reservas',
      href: '/reservations',
      badge: 2,
      color: 'bg-orange-500 dark:bg-orange-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {acoes.map((acao, index) => (
        <motion.div
          key={acao.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Link href={acao.href}>
            <div className="relative group">
              {/* Neumorphic Card */}
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 
                            hover:shadow-lg transition-all duration-300 cursor-pointer
                            shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.1),inset_2px_2px_4px_rgba(0,0,0,0.1)]
                            dark:shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.02),inset_2px_2px_4px_rgba(0,0,0,0.3)]
                            active:shadow-[inset_-4px_-4px_8px_rgba(255,255,255,0.1),inset_4px_4px_8px_rgba(0,0,0,0.2)]">
                
                {/* Icon Container */}
                <div className="flex flex-col items-center gap-3">
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-xl ${acao.color} flex items-center justify-center
                                 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-3xl">{acao.icon}</span>
                  </div>
                  
                  {/* Label */}
                  <span className="text-sm font-semibold text-slate-900 dark:text-white text-center">
                    {acao.label}
                  </span>
                </div>

                {/* Badge (se existir) */}
                {acao.badge && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold 
                                rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    {acao.badge}
                  </div>
                )}
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
