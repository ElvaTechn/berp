/**
 * ================================================================
 * MORE PAGE - BIZCONTROL 360 ERP v2.1.0
 * ================================================================
 * Página "Mais" acessível via Bottom Navigation
 * Menu completo com todas as opções secundárias
 * ================================================================
 */

"use client";

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Users,
  Package,
  TrendingUp,
  Settings,
  FileText,
  Calendar,
  Warehouse,
  BarChart3,
  User,
  Building2,
  Bell,
  HelpCircle,
  LogOut,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { NeuCard, NeuCardContent } from '@/components/ui/neu-card';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  color: string;
  bgColor: string;
  description?: string;
  requiresRole?: string[];
}

export default function MorePage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const menuItems: MenuItem[] = [
    {
      icon: <Users className="h-6 w-6" />,
      label: 'Funcionários',
      href: '/funcionarios',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      description: 'Gerir equipa',
    },
    {
      icon: <Warehouse className="h-6 w-6" />,
      label: 'Inventário',
      href: '/inventory',
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      description: 'Estoque completo',
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      label: 'Relatórios',
      href: '/reports',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      description: 'Análises e dados',
    },
    {
      icon: <Package className="h-6 w-6" />,
      label: 'Categorias',
      href: '/categories',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      description: 'Organizar produtos',
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      label: 'Analytics',
      href: '/analytics',
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      description: 'Desempenho',
    },
    {
      icon: <FileText className="h-6 w-6" />,
      label: 'Documentos',
      href: '/documents',
      color: 'text-cyan-600 dark:text-cyan-400',
      bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
      description: 'Faturas e recibos',
    },
    {
      icon: <Settings className="h-6 w-6" />,
      label: 'Definições',
      href: '/settings',
      color: 'text-slate-600 dark:text-slate-400',
      bgColor: 'bg-slate-50 dark:bg-slate-900/20',
      description: 'Configurações',
    },
    {
      icon: <User className="h-6 w-6" />,
      label: 'Perfil',
      href: '/profile',
      color: 'text-pink-600 dark:text-pink-400',
      bgColor: 'bg-pink-50 dark:bg-pink-900/20',
      description: 'Minha conta',
    },
  ];

  // Admin-only items
  const adminItems: MenuItem[] = [
    {
      icon: <Building2 className="h-6 w-6" />,
      label: 'Empresas',
      href: '/admin/companies',
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      description: 'Admin',
      requiresRole: ['ADMIN'],
    },
    {
      icon: <Shield className="h-6 w-6" />,
      label: 'Auditoria',
      href: '/admin/audit',
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      description: 'Admin',
      requiresRole: ['ADMIN'],
    },
  ];

  const handleNavigation = (href: string) => {
    // Vibração feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
    router.push(href);
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Sessão encerrada com sucesso!');
      router.push('/login');
    } catch (error) {
      toast.error('Erro ao encerrar sessão');
    }
  };

  const allItems = user?.role === 'ADMIN' ? [...menuItems, ...adminItems] : menuItems;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="neu-text-h1">Mais Opções</h1>
        <p className="neu-text-caption text-[var(--neu-text-muted)] mt-1">
          Todas as funcionalidades do sistema
        </p>
      </motion.div>

      {/* User Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <NeuCard variant="convex" size="md">
          <NeuCardContent className="flex items-center gap-4 p-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--neu-accent)] text-white font-bold text-2xl neu-convex-md">
              {user?.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h3 className="neu-text-body font-bold">{user?.full_name}</h3>
              <p className="neu-text-caption text-[var(--neu-text-muted)]">{user?.email}</p>
              <span
                className={cn(
                  'inline-block mt-1 px-3 py-1 rounded-lg neu-convex-xs text-xs font-bold',
                  user?.role === 'ADMIN'
                    ? 'bg-[var(--neu-error-light)] text-[var(--neu-error)]'
                    : user?.role === 'GESTOR'
                    ? 'bg-[var(--neu-accent-hover)] text-[var(--neu-accent)]'
                    : 'bg-[var(--neu-warning-light)] text-[var(--neu-warning)]'
                )}
              >
                {user?.role}
              </span>
            </div>
          </NeuCardContent>
        </NeuCard>
      </motion.div>

      {/* Menu Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 sm:grid-cols-3 gap-3"
      >
        {allItems.map((item, index) => (
          <motion.button
            key={item.href}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05 * index }}
            onClick={() => handleNavigation(item.href)}
            className={cn(
              'flex flex-col items-center justify-center gap-3',
              'p-4 rounded-2xl',
              'neu-surface neu-convex-md',
              'hover:neu-convex-lg',
              'active:scale-95 transition-all',
              'touch-manipulation'
            )}
          >
            <div className={cn('p-3 rounded-xl', item.bgColor, item.color)}>
              {item.icon}
            </div>
            <div className="text-center">
              <span className="neu-text-label font-semibold block">{item.label}</span>
              {item.description && (
                <span className="neu-text-caption text-[var(--neu-text-muted)] text-xs">
                  {item.description}
                </span>
              )}
            </div>
          </motion.button>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-3"
      >
        <h3 className="neu-text-body font-bold">Ações Rápidas</h3>
        
        <button
          onClick={() => router.push('/help')}
          className={cn(
            'w-full flex items-center gap-3 p-4 rounded-2xl',
            'neu-surface neu-concave-sm',
            'hover:neu-concave-md',
            'active:scale-98 transition-all',
            'touch-manipulation'
          )}
        >
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
            <HelpCircle className="h-5 w-5" />
          </div>
          <div className="flex-1 text-left">
            <span className="neu-text-label font-semibold block">Ajuda e Suporte</span>
            <span className="neu-text-caption text-[var(--neu-text-muted)] text-xs">
              Precisa de ajuda?
            </span>
          </div>
        </button>

        <button
          onClick={handleLogout}
          className={cn(
            'w-full flex items-center gap-3 p-4 rounded-2xl',
            'bg-[var(--neu-error-light)] text-[var(--neu-error)]',
            'neu-convex-sm hover:neu-convex-md',
            'active:scale-98 transition-all',
            'touch-manipulation',
            'font-semibold'
          )}
        >
          <LogOut className="h-5 w-5" />
          <span>Terminar Sessão</span>
        </button>
      </motion.div>
    </div>
  );
}
