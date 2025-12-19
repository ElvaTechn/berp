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
  // NOTA: ADMIN usa /admin/layout.tsx com sidebar própria, não esta
  const isVendedor = user.role === 'VENDEDOR';

  const navItems: NavItem[] = isVendedor
    ? [
        {
          icon: ShoppingCart,
          label: 'Ponto de Venda',
          href: '/sales/pos',
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
            relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
            ${
              isActive
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
            }
          `}
        >
          {/* Barra lateral esquerda no item ativo */}
          {isActive && (
            <motion.div
              layoutId="activeIndicator"
              className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}

          <Icon className="w-5 h-5 flex-shrink-0" />
          <span
            className={`font-bold tracking-tight ${
              isActive ? 'italic' : ''
            }`}
          >
            {item.label}
          </span>

          {/* Badge (se houver) */}
          {item.badge && (
            <span className="ml-auto bg-red-500 text-white text-xs font-black px-2 py-0.5 rounded-full">
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
      <div className="p-6 border-b border-slate-200 dark:border-white/5">
        <Link href="/dashboard" onClick={() => setIsOpen(false)}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-lg shadow-blue-500/30">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight italic truncate">
                BIZ<span className="text-blue-500">360</span>
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium truncate">
                {company.name}
              </p>
            </div>
          </motion.div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {/* Menu para GESTOR e VENDEDOR - ADMIN usa sidebar própria em /admin */}
        {navItems.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-200 dark:border-white/5">
        <div className="mb-3 p-3 rounded-xl bg-slate-100 dark:bg-white/5 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white font-black text-sm">
              {user.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {user.full_name}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
          
          {/* Role Badge */}
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-px bg-slate-300 dark:bg-white/5" />
            <span
              className={`
                text-[10px] font-black uppercase px-2 py-1 rounded-md
                ${
                  user.role === 'ADMIN'
                    ? 'bg-red-500/20 text-red-400'
                    : user.role === 'GESTOR'
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'bg-green-500/20 text-green-400'
                }
              `}
            >
              {user.role}
            </span>
            <div className="flex-1 h-px bg-slate-300 dark:bg-white/5" />
          </div>
        </div>

        {/* Theme Toggle */}
        <div className="mb-3 flex items-center justify-between px-2">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-500 uppercase tracking-wide">
            Tema
          </span>
          <ThemeToggleSimple />
        </div>

        {/* Logout Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-600/10 hover:bg-red-600/20 text-red-400 hover:text-red-300 transition-all duration-300 font-bold border border-red-600/20"
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
        className="lg:hidden fixed top-4 left-4 z-50 flex items-center justify-center w-12 h-12 rounded-2xl bg-white dark:bg-[#050505] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white shadow-2xl"
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
      <aside className="hidden lg:flex flex-col w-72 h-screen bg-white dark:bg-[#050505] border-r border-slate-200 dark:border-white/5 fixed left-0 top-0 z-40 shadow-xl">
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
              className="lg:hidden fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white dark:bg-[#050505] border-r border-slate-200 dark:border-white/5 z-50 flex flex-col"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
