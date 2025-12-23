"use client";

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
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
  X
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

  // Admin não precisa de empresa específica
  // Remove o useEffect de fetchCompanyData

  // Se não está hidratado ou está carregando auth
  if (!isHydrated || authLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 font-medium">A carregar...</p>
        </div>
      </div>
    );
  }

  // Se não tem utilizador ou não é admin, redireciona
  if (!contextUser || contextUser.role.toUpperCase() !== 'ADMIN') {
    router.push('/login');
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 font-medium">A redirecionar...</p>
        </div>
      </div>
    );
  }

  const SidebarContent = () => (
    <>
      {/* Header */}
      <div className="p-6 border-b border-purple-200 dark:border-purple-500/20">
        <Link href="/admin/dashboard" onClick={() => setIsOpen(false)}>
          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight italic">
            ADMIN<span className="text-purple-500 dark:text-purple-400">360</span>
          </h1>
          <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
            Torre de Controlo
          </p>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-3">
        <Link 
          href="/admin/dashboard" 
          onClick={() => setIsOpen(false)}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
            pathname === '/admin/dashboard'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
              : 'text-slate-600 dark:text-slate-400 hover:bg-purple-500/10 hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          Dashboard
        </Link>

        <Link 
          href="/admin/companies" 
          onClick={() => setIsOpen(false)}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
            pathname === '/admin/companies'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
              : 'text-slate-600 dark:text-slate-400 hover:bg-purple-500/10 hover:text-white'
          }`}
        >
          <Building2 className="w-5 h-5" />
          Empresas
        </Link>

        <Link 
          href="/admin/system" 
          onClick={() => setIsOpen(false)}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
            pathname === '/admin/system'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
              : 'text-slate-600 dark:text-slate-400 hover:bg-purple-500/10 hover:text-white'
          }`}
        >
          <Server className="w-5 h-5" />
          Sistema
        </Link>

        <Link 
          href="/admin/settings" 
          onClick={() => setIsOpen(false)}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
            pathname === '/admin/settings'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
              : 'text-slate-600 dark:text-slate-400 hover:bg-purple-500/10 hover:text-white'
          }`}
        >
          <Settings className="w-5 h-5" />
          Configurações
        </Link>

        <Link 
          href="/admin/subscriptions" 
          onClick={() => setIsOpen(false)}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
            pathname === '/admin/subscriptions'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
              : 'text-slate-600 dark:text-slate-400 hover:bg-purple-500/10 hover:text-white'
          }`}
        >
          <Shield className="w-5 h-5" />
          Subscrições
        </Link>

        <Link 
          href="/admin/backup" 
          onClick={() => setIsOpen(false)}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
            pathname === '/admin/backup'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
              : 'text-slate-600 dark:text-slate-400 hover:bg-purple-500/10 hover:text-white'
          }`}
        >
          <Database className="w-5 h-5" />
          Backup
        </Link>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-purple-200 dark:border-purple-500/20">
        <div className="mb-3 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
              {contextUser.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-white">{contextUser.full_name}</p>
              <p className="text-xs text-purple-400">Super Admin</p>
            </div>
          </div>
        </div>

        <div className="mb-3 flex items-center justify-between px-2 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
          <span className="text-xs font-bold text-purple-400 uppercase tracking-wide">
            Tema
          </span>
          <ThemeToggleSimple />
        </div>

        <button
          onClick={async () => {
            await logout();
            setIsOpen(false);
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </>
  );

  // Layout completo com sidebar
  return (
    <div className="flex h-screen bg-white dark:bg-black overflow-hidden">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-[#050505]/90 backdrop-blur-xl border-b border-purple-200 dark:border-purple-500/20 px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
            <span className="text-white font-black text-xs">A</span>
          </div>
          <span className="text-sm font-bold text-slate-900 dark:text-white">
            Admin<span className="text-purple-500">360</span>
          </span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 transition-all"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      )}

      {/* Mobile Sidebar */}
      <div className={`lg:hidden fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-white dark:bg-[#0a0a0a] border-r border-purple-200 dark:border-purple-500/20 z-50 flex flex-col transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <SidebarContent />
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 h-screen bg-white dark:bg-[#0a0a0a] border-r border-purple-200 dark:border-purple-500/20 fixed left-0 top-0 z-40 shadow-xl dark:shadow-none">
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <main 
        id="main-content" 
        role="main"
        className="flex-1 flex flex-col lg:ml-72 overflow-hidden pt-16 lg:pt-0"
      >
        {/* Content with independent scroll */}
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-black">
          <div className="w-full max-w-none p-4 lg:p-6 pt-20 lg:pt-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
