/**
 * ================================================================
 * AÇÕES RÁPIDAS - BIZCONTROL 360 ERP v2.1.0 (NEUMORPHIC)
 * ================================================================
 * Botões de ação rápida para o vendedor - Design neumorphic
 * ================================================================
 */

"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { NeuButton } from '@/components/ui/neu-button';
import { NeuBadge } from '@/components/ui/neu-badge';
import { ShoppingCart, Package, Users, Calendar } from 'lucide-react';

interface AcaoRapida {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: number;
  variant: 'success' | 'info' | 'warning' | 'error';
}

export function AcoesRapidas() {
  const acoes: AcaoRapida[] = [
    {
      icon: ShoppingCart,
      label: 'Nova Venda',
      href: '/sales/pos',
      variant: 'success',
    },
    {
      icon: Package,
      label: 'Produtos',
      href: '/products',
      variant: 'info',
    },
    {
      icon: Users,
      label: 'Clientes',
      href: '/customers',
      variant: 'warning',
    },
    {
      icon: Calendar,
      label: 'Reservas',
      href: '/reservations',
      badge: 2,
      variant: 'error',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {acoes.map((acao, index) => (
        <motion.div
          key={acao.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1, type: 'spring' }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Link href={acao.href}>
            <NeuButton
              variant="convex"
              className="w-full h-full min-h-[100px] flex-col gap-3 relative group"
            >
              {/* Icon Container Neumorphic */}
              <div className="w-12 h-12 rounded-xl neu-surface neu-concave-md flex items-center justify-center 
                            group-hover:neu-concave-lg transition-all">
                <acao.icon className="w-6 h-6 text-[var(--neu-accent)]" />
              </div>
              
              {/* Label */}
              <span className="neu-text-body font-semibold text-center">
                {acao.label}
              </span>

              {/* Badge (se existir) */}
              {acao.badge && (
                <div className="absolute -top-2 -right-2">
                  <NeuBadge status={acao.variant} className="animate-pulse">
                    {acao.badge}
                  </NeuBadge>
                </div>
              )}
            </NeuButton>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
