"use client";

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Calendar,
  Settings,
  LogOut,
  Menu,
  Building2,
  Shield,
  X,
  Store,
} from 'lucide-react';
import { toast } from 'sonner';
import { ThemeToggleSimple } from '@/components/theme-toggle';

interface SidebarProps {
  user: {
    full_name: string;
    email: string;
    role: string;
  };
  company: {
    name: string;
  };
}

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: number;
}

export default function Sidebar({ user, company }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Links de navegação baseados na role
  const isVendedor = user.role === 'VENDEDOR';
  const isAdmin = user.role === 'ADMIN';

  const navItems: NavItem[] = isAdmin
    ? [
        {
          icon: LayoutDashboard,
          label: 'Administração',
          href: '/admin',
        },
        {
          icon: Building2,
          label: 'Empresas',
          href: '/admin/companies',
        },
        {
          icon: Users,
          label: 'Usuários',
          href: '/admin/users',
        },
        {
          icon: Shield,
          label: 'Auditoria',
          href: '/admin/audit',
        },
        {
          icon: Settings,
          label: 'Sistema',
          href: '/admin/settings',
        },
      ]
    : isVendedor
    ? [
        {
          icon: ShoppingCart,
          label: 'Ponto de Venda',
          href: '/sales/pos',
        },
        {
          icon: Calendar,
          label: 'Reservas',
          href: '/reservations',
        },
      ]
    : [
        {
          icon: LayoutDashboard,
          label: 'Dashboard',
          href: '/dashboard',
        },
        {
          icon: Package,
          label: 'Inventário',
          href: '/inventory',
        },
        {
          icon: ShoppingCart,
          label: 'Vendas',
          href: '/sales',
        },
        {
          icon: Users,
          label: 'Funcionários',
          href: '/funcionarios',
        },
        {
          icon: Calendar,
          label: 'Reservas',
          href: '/reservations',
        },
        {
          icon: Settings,
          label: 'Definições',
          href: '/settings',
        },
      ];

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (res.ok) {
        toast.success('Sessão encerrada com sucesso!');
        router.push('/login');
      } else {
        throw new Error('Erro ao fazer logout');
      }
    } catch (error) {
      toast.error('Erro ao encerrar sessão');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const NavLink = ({ item }: { item: NavItem }) => {
    const isActive = pathname === item.href;
    const Icon = item.icon;

    return (
      <Link
        href={item.href}
        onClick={() => setIsOpen(false)}
        className="relative block"
      >
        <motion.div
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
          className={`
            relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
            ${
              isActive
                ? 'neu-concave-sm text-[var(--neu-accent)] font-semibold'
                : 'text-[var(--neu-text-secondary)] hover:text-[var(--neu-text-primary)] hover:bg-[var(--neu-surface-hover)]'
            }
          `}
        >
          {/* Active Indicator */}
          {isActive && (
            <motion.div
              layoutId="activeIndicator"
              className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--neu-accent)] rounded-r-full neu-convex-sm"
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}

          <Icon className="w-5 h-5 flex-shrink-0" />
          <span className={`font-medium tracking-tight ${isActive ? 'font-semibold' : ''}`}>
            {item.label}
          </span>

          {/* Badge (se houver) */}
          {item.badge && (
            <span className="ml-auto bg-[var(--neu-accent)] text-white text-xs font-bold px-2 py-0.5 rounded-full neu-convex-sm">
              {item.badge}
            </span>
          )}
        </motion.div>
      </Link>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header - Logo e Empresa */}
      <div className="p-6 border-b border-[var(--neu-border)]">
        <Link href="/dashboard" onClick={() => setIsOpen(false)}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-[var(--neu-accent)] neu-convex-md">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="neu-text-h2 text-[var(--neu-text-primary)] tracking-tight font-bold whitespace-nowrap">
                BIZ<span className="text-[var(--neu-accent)]">360</span>
              </h2>
              <p className="neu-text-caption truncate">
                {company.name}
              </p>
            </div>
          </motion.div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-[var(--neu-border)]">
        {/* User Info Card */}
        <div className="mb-3 p-3 rounded-xl neu-convex-sm">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--neu-accent)] text-white font-bold text-sm neu-convex-sm">
              {user.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="neu-text-body font-semibold text-[var(--neu-text-primary)] truncate">
                {user.full_name}
              </p>
              <p className="neu-text-caption truncate">{user.email}</p>
            </div>
          </div>
          
          {/* Role Badge */}
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-px bg-[var(--neu-border-light)]" />
            <span
              className={`
                neu-text-label font-bold px-2 py-1 rounded-md neu-convex-sm
                ${
                  user.role === 'ADMIN'
                    ? 'bg-[var(--neu-error-light)] text-[var(--neu-error)]'
                    : user.role === 'GESTOR'
                    ? 'bg-[var(--neu-accent-hover)] text-[var(--neu-accent)]'
                    : 'bg-[var(--neu-warning-light)] text-[var(--neu-warning)]'
                }
              `}
            >
              {user.role}
            </span>
            <div className="flex-1 h-px bg-[var(--neu-border-light)]" />
          </div>
        </div>

        {/* Theme Toggle */}
        <div className="mb-3 flex items-center justify-between px-2">
          <span className="neu-text-label font-semibold text-[var(--neu-text-muted)]">
            Tema
          </span>
          <ThemeToggleSimple />
        </div>

        {/* Logout Button */}
        <motion.button
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[var(--neu-error-light)] text-[var(--neu-error)] transition-all duration-200 font-semibold neu-convex-sm hover:neu-convex-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoggingOut ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <LogOut className="w-4 h-4" />
              </motion.div>
              <span>A sair...</span>
            </>
          ) : (
            <>
              <LogOut className="w-4 h-4" />
              <span>Terminar Sessão</span>
            </>
          )}
        </motion.button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Hamburger Button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 flex items-center justify-center w-12 h-12 rounded-2xl neu-surface neu-convex-md text-[var(--neu-text-primary)]"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Menu className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 h-screen bg-[var(--neu-base)] border-r border-[var(--neu-border)] fixed left-0 top-0 z-40">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />

            {/* Sidebar */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-[var(--neu-base)] border-r border-[var(--neu-border)] z-50 flex flex-col"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
