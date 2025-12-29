"use client";

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Building2,
  Settings,
  Shield,
  Database,
  Server,
  LogOut,
  Menu,
  X,
  FileText,
} from 'lucide-react';
import { ThemeToggleSimple } from '@/components/theme-toggle';

interface CompanyData {
  name: string;
  nuit: string | null;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user: contextUser, loading: authLoading, logout } = useAuth();

  const [company, setCompany] = useState<CompanyData | null>(null);
  const [isLoadingCompany, setIsLoadingCompany] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Hydration guard
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Se não está hidratado ou está carregando auth
  if (!isHydrated || authLoading) {
    return (
      <div className="min-h-screen bg-[var(--neu-base)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[var(--neu-accent)] animate-spin mx-auto mb-4" />
          <p className="neu-text-body text-[var(--neu-text-muted)] font-medium">
            A carregar...
          </p>
        </div>
      </div>
    );
  }

  // Se não tem utilizador ou não é admin, redireciona
  if (!contextUser || contextUser.role.toUpperCase() !== 'ADMIN') {
    router.push('/login');
    return (
      <div className="min-h-screen bg-[var(--neu-base)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[var(--neu-accent)] animate-spin mx-auto mb-4" />
          <p className="neu-text-body text-[var(--neu-text-muted)] font-medium">
            A redirecionar...
          </p>
        </div>
      </div>
    );
  }

  const NavLink = ({ href, icon: Icon, label }: { href: string; icon: any; label: string }) => {
    const isActive = pathname === href;

    return (
      <Link href={href} onClick={() => setIsOpen(false)} className="relative block">
        <motion.div
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
          className={`
            relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
            ${
              isActive
                ? 'neu-concave-sm text-[var(--neu-accent)] font-bold'
                : 'text-[var(--neu-text-secondary)] hover:text-[var(--neu-text-primary)] hover:bg-[var(--neu-surface-hover)]'
            }
          `}
        >
          {/* Active Indicator */}
          {isActive && (
            <motion.div
              layoutId="adminActiveIndicator"
              className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--neu-accent)] rounded-r-full neu-convex-sm"
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}

          <Icon className="w-5 h-5 flex-shrink-0" />
          <span className={`font-medium tracking-tight ${isActive ? 'font-bold' : ''}`}>
            {label}
          </span>
        </motion.div>
      </Link>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header - Logo */}
      <div className="p-6 border-b border-[var(--neu-border)]">
        <Link href="/admin/dashboard" onClick={() => setIsOpen(false)}>
          <motion.div whileHover={{ scale: 1.02 }} className="cursor-pointer">
            <h1 className="neu-text-h2 tracking-tight italic">
              ADMIN<span className="text-[var(--neu-accent)]">360</span>
            </h1>
            <p className="neu-text-caption text-[var(--neu-accent)]">Torre de Controlo</p>
          </motion.div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <NavLink href="/admin/dashboard" icon={LayoutDashboard} label="Dashboard" />
        <NavLink href="/admin/companies" icon={Building2} label="Empresas" />
        <NavLink href="/admin/audit" icon={FileText} label="Auditoria" />
        <NavLink href="/admin/system" icon={Server} label="Sistema" />
        <NavLink href="/admin/settings" icon={Settings} label="Configurações" />
        <NavLink href="/admin/subscriptions" icon={Shield} label="Subscrições" />
        <NavLink href="/admin/backup" icon={Database} label="Backup" />
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-[var(--neu-border)]">
        {/* User Info Card */}
        <div className="mb-3 p-3 rounded-xl neu-convex-sm">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--neu-accent)] text-white font-bold text-sm neu-convex-sm">
              {contextUser.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="neu-text-body font-bold text-[var(--neu-text-primary)] truncate">
                {contextUser.full_name}
              </p>
              <p className="neu-text-caption text-[var(--neu-accent)] truncate">Super Admin</p>
            </div>
          </div>
        </div>

        {/* Theme Toggle */}
        <div className="mb-3 flex items-center justify-between px-2 py-2 rounded-xl neu-convex-sm">
          <span className="neu-text-label font-bold text-[var(--neu-text-muted)] uppercase tracking-wide">
            Tema
          </span>
          <ThemeToggleSimple />
        </div>

        {/* Logout Button */}
        <motion.button
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={async () => {
            await logout();
            setIsOpen(false);
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl neu-surface neu-convex-sm hover:neu-convex-md transition-all duration-200 font-bold text-[var(--neu-error)]"
        >
          <LogOut className="w-4 h-4" />
          <span>Sair</span>
        </motion.button>
      </div>
    </div>
  );

  // Layout completo com sidebar
  return (
    <div className="flex h-screen bg-[var(--neu-base)] overflow-hidden">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[var(--neu-base)]/90 backdrop-blur-xl border-b border-[var(--neu-border)] px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl neu-surface neu-convex-md flex items-center justify-center">
            <span className="text-[var(--neu-accent)] font-black text-xs">A</span>
          </div>
          <span className="neu-text-body font-bold">
            Admin<span className="text-[var(--neu-accent)]">360</span>
          </span>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-xl neu-surface neu-convex-sm text-[var(--neu-accent)] hover:neu-convex-md transition-all"
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
                <X className="w-5 h-5" />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Menu className="w-5 h-5" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

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
              className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />

            {/* Sidebar */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="lg:hidden fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-[var(--neu-base)] border-r border-[var(--neu-border)] z-50 flex flex-col"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 h-screen bg-[var(--neu-base)] border-r border-[var(--neu-border)] fixed left-0 top-0 z-40">
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <main
        id="main-content"
        role="main"
        className="flex-1 flex flex-col lg:ml-72 overflow-hidden pt-16 lg:pt-0"
      >
        {/* Content with independent scroll */}
        <div className="flex-1 overflow-y-auto bg-[var(--neu-base)]">
          <div className="w-full max-w-none p-4 lg:p-6 pt-20 lg:pt-6">{children}</div>
        </div>
      </main>
    </div>
  );
}
