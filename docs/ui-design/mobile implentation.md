Prompt para Implementação de Design Responsivo Mobile e Tablet
Aqui está o prompt completo para tornar o ERP BizControl 360 completamente responsivo e usável em dispositivos móveis:

Prompt:

Analise e implemente um design responsivo completo para o ERP BizControl 360, garantindo que o aplicativo funcione perfeitamente em smartphones e tablets de várias dimensões.

OBJETIVO:
Transformar o BizControl 360 em um Progressive Web App (PWA) completamente responsivo, otimizado para uso em dispositivos móveis e tablets, com layouts adaptativos, touch targets adequados e performance otimizada.

PASSOS A EXECUTAR:

## 1. Análise da Estrutura Atual

### 1.1 Inventário de Componentes Responsivos
Execute o seguinte para identificar a estrutura atual:

```bash
# Listar todos os arquivos de componentes
find src/components -name "*.tsx" -o -name "*.ts" | head -30

# Verificar breakpoints atuais no Tailwind config
cat tailwind.config.* 2>/dev/null | grep -A 20 "screens"

# Verificar CSS global
cat src/app/globals.css | grep -E "(@media|breakpoint|px|rem|em)" | head -20

# Verificar layout atual
cat src/app/layout.tsx
1.2 Identificar Problemas de Responsividade
Analise os seguintes arquivos para identificar problemas:

bash
# Listar páginas principais
ls -la src/app/*/

# Verificar componentes de navegação
cat src/components/layout/Sidebar.tsx 2>/dev/null || echo "Sidebar não encontrado"
cat src/components/layout/Header.tsx 2>/dev/null || echo "Header não encontrado"

# Verificar se existe hook de viewport
grep -r "useMediaQuery\|useBreakpoint\|useWindowSize" src/ 2>/dev/null || echo "Hooks de media query não encontrados"
Documente os problemas encontrados:

Sidebar fixa que não funciona em mobile
Tabelas que transbordam a tela
Cards com width fixo
Touch targets muito pequenos
Fontes muito pequenas para leitura mobile
Modal/Dialog que sai da tela
2. Implementação de Hook Responsivo
2.1 Criar Hook de Detecção de Viewport
Crie o arquivo src/hooks/useViewport.ts:

typescript
import { useState, useEffect } from 'react';

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export function useViewport() {
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('xl');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setWidth(w);
      setHeight(h);

      if (w < 640) setBreakpoint('xs');
      else if (w < 768) setBreakpoint('sm');
      else if (w < 1024) setBreakpoint('md');
      else if (w < 1280) setBreakpoint('lg');
      else if (w < 1536) setBreakpoint('xl');
      else setBreakpoint('2xl');
    };

    // Set initial values
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { width, height, breakpoint, isMobile: breakpoint === 'xs' || breakpoint === 'sm', isTablet: breakpoint === 'md', isDesktop: breakpoint === 'lg' || breakpoint === 'xl' || breakpoint === '2xl' };
}
2.2 Criar Hook de Orientação
Crie o arquivo src/hooks/useOrientation.ts:

typescript
import { useState, useEffect } from 'react';

type Orientation = 'portrait' | 'landscape' | 'unknown';

export function useOrientation() {
  const [orientation, setOrientation] = useState<Orientation>('unknown');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(orientation: portrait)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setOrientation(e.matches ? 'portrait' : 'landscape');
    };

    // Initial check
    setOrientation(mediaQuery.matches ? 'portrait' : 'landscape');

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return orientation;
}
3. Sidebar Responsiva com Menu Hambúrguer
3.1 Criar Componente MobileSidebar
Crie o arquivo src/components/layout/MobileSidebar.tsx:

typescript
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useViewport } from '@/hooks/useViewport';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <DashboardIcon /> },
  { label: 'Estoque', href: '/inventory', icon: <InventoryIcon /> },
  { label: 'PDV', href: '/pos', icon: <POSIcon /> },
  { label: 'Relatórios', href: '/reports', icon: <ReportsIcon /> },
  { label: 'Configurações', href: '/settings', icon: <SettingsIcon /> },
];

export function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { isMobile } = useViewport();

  // Close sidebar when changing routes on mobile
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [pathname, isMobile]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Don't render on desktop
  if (!isMobile) return null;

  return (
    <>
      {/* Mobile Header with Hamburger */}
      <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-16 bg-neu-base border-b border-neu-shadow/20 lg:hidden">
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 rounded-lg neu-convex-sm active:neu-pressed"
          aria-label="Abrir menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        <h1 className="text-lg font-bold text-neu-text">BizControl 360</h1>
        
        {/* User avatar placeholder */}
        <div className="w-10 h-10 rounded-full neu-convex-sm flex items-center justify-center">
          <span className="text-sm font-semibold">JD</span>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Sidebar Panel */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-72 z-50 bg-neu-base lg:hidden flex flex-col"
            >
              {/* Sidebar Header */}
              <div className="flex items-center justify-between p-4 border-b border-neu-shadow/20">
                <h2 className="text-xl font-bold text-neu-text">Menu</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg neu-convex-sm active:neu-pressed"
                  aria-label="Fechar menu"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {navItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'neu-pressed text-neu-accent'
                          : 'neu-convex-sm hover:neu-pressed'
                      }`}
                    >
                      <span className="w-6 h-6 flex items-center justify-center">
                        {item.icon}
                      </span>
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Sidebar Footer */}
              <div className="p-4 border-t border-neu-shadow/20">
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl neu-convex-sm hover:neu-pressed text-red-500">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="font-medium">Sair</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// Icon components (simplified)
function DashboardIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
    </svg>
  );
}

function InventoryIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}

function POSIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  );
}

function ReportsIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
3.2 Criar Componente TabletSidebar (Sidebar Adaptativa)
Crie o arquivo src/components/layout/TabletSidebar.tsx:

typescript
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useViewport } from '@/hooks/useViewport';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <DashboardIcon /> },
  { label: 'Estoque', href: '/inventory', icon: <InventoryIcon /> },
  { label: 'PDV', href: '/pos', icon: <POSIcon /> },
  { label: 'Relatórios', href: '/reports', icon: <ReportsIcon /> },
  { label: 'Configurações', href: '/settings', icon: <SettingsIcon /> },
];

export function TabletSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { breakpoint } = useViewport();

  // Only render on tablet (md) and above, but not on mobile (xs, sm)
  if (breakpoint === 'xs' || breakpoint === 'sm') return null;

  const width = isCollapsed ? 'w-20' : 'w-64';

  return (
    <motion.aside
      initial={false}
      animate={{ width }}
      transition={{ duration: 0.2 }}
      className={`hidden lg:flex flex-col h-screen sticky top-0 bg-neu-base border-r border-neu-shadow/20 ${width}`}
    >
      {/* Logo Section */}
      <div className={`flex items-center ${isCollapsed ? 'justify-center p-4' : 'p-4 gap-3'}`}>
        <div className="w-10 h-10 rounded-xl neu-convex-md flex items-center justify-center flex-shrink-0">
          <span className="text-lg font-bold text-neu-accent">B</span>
        </div>
        {!isCollapsed && (
          <h1 className="text-lg font-bold text-neu-text truncate">BizControl 360</h1>
        )}
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="mx-auto mb-4 p-2 rounded-lg neu-convex-sm active:neu-pressed"
        aria-label={isCollapsed ? 'Expandir menu' : 'Contrair menu'}
      >
        <svg
          className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
        </svg>
      </button>

      {/* Navigation */}
      <nav className="flex-1 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'neu-pressed text-neu-accent'
                  : 'neu-convex-sm hover:neu-pressed'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <span className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
                {item.icon}
              </span>
              {!isCollapsed && <span className="font-medium truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-neu-shadow/20">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="w-10 h-10 rounded-full neu-convex-sm flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-semibold">JD</span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neu-text truncate">João Silva</p>
              <p className="text-xs text-neu-text/60 truncate">Administrador</p>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
}

// Icons (same as MobileSidebar)
function DashboardIcon() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>; }
function InventoryIcon() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>; }
function POSIcon() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>; }
function ReportsIcon() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>; }
function SettingsIcon() { return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>; }
4. Layout Responsivo Principal
4.1 Atualizar layout.tsx
Edite src/app/layout.tsx para integrar os componentes responsivos:

typescript
import { MobileSidebar } from '@/components/layout/MobileSidebar';
import { TabletSidebar } from '@/components/layout/TabletSidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-neu-base">
      {/* Desktop/Tablet Sidebar */}
      <TabletSidebar />
      
      {/* Mobile Sidebar */}
      <MobileSidebar />
      
      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {/* Mobile header spacer */}
        <div className="h-16 lg:hidden" />
        
        {/* Page Content */}
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
5. Componentes Responsivos
5.1 Criar Card Responsivo
Crie src/components/ui/ResponsiveCard.tsx:

typescript
import { ReactNode } from 'react';

interface ResponsiveCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function ResponsiveCard({ children, className = '', onClick }: ResponsiveCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        neu-convex-md rounded-2xl p-4 sm:p-6
        transition-all duration-200
        ${onClick ? 'cursor-pointer active:neu-pressed' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
5.2 Criar Grid Responsivo
Crie src/components/ui/ResponsiveGrid.tsx:

typescript
import { ReactNode } from 'react';

interface ResponsiveGridProps {
  children: ReactNode;
  className?: string;
}

export function ResponsiveGrid({ children, className = '' }: ResponsiveGridProps) {
  return (
    <div
      className={`
        grid
        grid-cols-1        /* Mobile: 1 coluna */
        sm:grid-cols-2     /* Tablets pequenos: 2 colunas */
        md:grid-cols-3     /* Tablets grandes: 3 colunas */
        lg:grid-cols-4     /* Desktop: 4 colunas */
        gap-3 sm:gap-4 lg:gap-6
        ${className}
      `}
    >
      {children}
    </div>
  );
}
5.3 Criar Tabela Responsiva com Scroll Horizontal
Crie src/components/ui/ResponsiveTable.tsx:

typescript
interface TableColumn<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface ResponsiveTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
}

export function ResponsiveTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'Nenhum registro encontrado',
}: ResponsiveTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-neu-text/60">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <div className="min-w-full inline-block align-middle">
        <div className="overflow-hidden rounded-xl neu-convex-md">
          <table className="min-w-full divide-y divide-neu-shadow/20">
            <thead className="bg-neu-shadow/10">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`px-4 py-3 text-left text-xs sm:text-sm font-semibold text-neu-text/70 uppercase tracking-wider ${col.className || ''}`}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neu-shadow/10">
              {data.map((item) => (
                <tr key={keyExtractor(item)} className="hover:bg-neu-shadow/5 transition-colors">
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 py-3 text-xs sm:text-sm text-neu-text ${col.className || ''}`}
                    >
                      {col.render ? col.render(item) : (item as Record<string, unknown>)[col.key]?.toString()}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
5.4 Criar Botões com Touch Targets Adequados
Atualize ou crie src/components/ui/ResponsiveButton.tsx:

typescript
import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ResponsiveButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export function ResponsiveButton({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  ...props
}: ResponsiveButtonProps) {
  const variants = {
    primary: 'neu-pressed text-neu-accent',
    secondary: 'neu-convex-sm hover:neu-pressed',
    danger: 'neu-convex-sm hover:neu-pressed text-red-500',
    ghost: 'hover:bg-neu-shadow/10',
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm min-h-[36px]',
    md: 'px-4 py-3 text-base min-h-[44px]', // 44px = mínimo WCAG para touch
    lg: 'px-6 py-4 text-lg min-h-[52px]',
  };

  return (
    <button
      className={`
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        rounded-xl font-medium
        transition-all duration-200
        active:scale-[0.98]
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
5.5 Criar Input Responsivo
Crie src/components/ui/ResponsiveInput.tsx:

typescript
import { InputHTMLAttributes, forwardRef } from 'react';

interface ResponsiveInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const ResponsiveInput = forwardRef<HTMLInputElement, ResponsiveInputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-neu-text/70 mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-4 py-3
            text-base
            bg-neu-base
            rounded-xl
            neu-convex-sm
            focus:neu-pressed
            transition-all duration-200
            placeholder:text-neu-text/40
            ${error ? 'text-red-500 border border-red-500' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

ResponsiveInput.displayName = 'ResponsiveInput';
6. Páginas Responsivas
6.1 Dashboard Responsivo
Atualize src/app/dashboard/page.tsx para usar grid responsivo:

typescript
'use client';

import { ResponsiveGrid } from '@/components/ui/ResponsiveGrid';
import { ResponsiveCard } from '@/components/ui/ResponsiveCard';
import { useViewport } from '@/hooks/useViewport';

export default function DashboardPage() {
  const { width, breakpoint } = useViewport();

  // Ajustar KPIs baseado no tamanho da tela
  const getKPIColspan = () => {
    if (width < 640) return 'span-1';      // Mobile: full width
    if (width < 1024) return 'span-6';     // Tablet: 2 por linha
    return 'span-3';                        // Desktop: 4 por linha
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-neu-text">Dashboard</h1>
        <div className="flex gap-2">
          <span className="text-sm text-neu-text/60">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        </div>
      </div>

      {/* KPIs Grid */}
      <ResponsiveGrid>
        <div className={`${getKPIColspan()} min-w-0`}>
          <ResponsiveCard>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-neu-text/60">Vendas Hoje</p>
                <p className="text-2xl sm:text-3xl font-bold text-neu-text mt-1">R$ 2.847,00</p>
                <p className="text-sm text-green-500 mt-1">+12,5% vs ontem</p>
              </div>
              <div className="w-12 h-12 rounded-xl neu-convex-sm flex items-center justify-center">
                <svg className="w-6 h-6 text-neu-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </ResponsiveCard>
        </div>

        {/* Adicione mais KPIs seguindo o mesmo padrão */}
      </ResponsiveGrid>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <ResponsiveCard>
          <h3 className="text-lg font-semibold text-neu-text mb-4">Vendas da Semana</h3>
          <div className="h-48 sm:h-64">
            {/* Gráfico aqui */}
          </div>
        </ResponsiveCard>

        <ResponsiveCard>
          <h3 className="text-lg font-semibold text-neu-text mb-4">Produtos Mais Vendidos</h3>
          <div className="h-48 sm:h-64">
            {/* Gráfico aqui */}
          </div>
        </ResponsiveCard>
      </div>
    </div>
  );
}
6.2 Tabela de Inventário Responsiva
Atualize src/app/inventory/page.tsx para usar tabela responsiva:

typescript
'use client';

import { useState } from 'react';
import { ResponsiveTable } from '@/components/ui/ResponsiveTable';
import { ResponsiveButton } from '@/components/ui/ResponsiveButton';
import { ResponsiveInput } from '@/components/ui/ResponsiveInput';
import { useViewport } from '@/hooks/useViewport';

interface Product {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  category: string;
}

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { isMobile } = useViewport();

  const columns = [
    { key: 'name', header: 'Produto', className: 'min-w-[150px]' },
    { key: 'sku', header: 'SKU', className: isMobile ? 'hidden' : '' },
    { key: 'quantity', header: 'Estoque', render: (item: Product) => (
      <span className={item.quantity < 10 ? 'text-red-500 font-semibold' : ''}>
        {item.quantity}
      </span>
    )},
    { key: 'price', header: 'Preço', render: (item: Product) => `R$ ${item.price.toFixed(2)}` },
    { key: 'actions', header: 'Ações', className: 'w-20', render: () => (
      <div className="flex gap-2">
        <button className="p-2 rounded-lg neu-convex-sm active:neu-pressed text-neu-accent">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button className="p-2 rounded-lg neu-convex-sm active:neu-pressed text-red-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-neu-text">Estoque</h1>
        <ResponsiveButton variant="primary">
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Novo Produto
          </span>
        </ResponsiveButton>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <ResponsiveInput
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select className="px-4 py-3 rounded-xl neu-convex-sm bg-neu-base text-neu-text">
          <option value="">Todas as categorias</option>
          <option value="electronics">Eletrônicos</option>
          <option value="clothing">Roupas</option>
          <option value="food">Alimentos</option>
        </select>
      </div>

      {/* Table */}
      <ResponsiveTable<Product>
        columns={columns}
        data={products} // Sua lista de produtos
        keyExtractor={(item) => item.id}
        emptyMessage="Nenhum produto encontrado"
      />
    </div>
  );
}
7. Utilitários CSS para Responsividade
7.1 Adicionar utilitários ao globals.css
Adicione ao src/app/globals.css:

css
@layer utilities {
  /* Scrollbar oculta para tabelas horizontais */
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }

  /* Touch action utilities */
  .touch-action-manipulation {
    touch-action: manipulation;
  }
  
  .touch-action-pan-x {
    touch-action: pan-x;
  }
  
  .touch-action-pan-y {
    touch-action: pan-y;
  }

  /* Safe area insets para notched phones */
  .safe-area-top {
    padding-top: env(safe-area-inset-top);
  }
  
  .safe-area-bottom {
    padding-bottom: env(safe-area-inset-bottom);
  }

  /* Hover fix para touch devices */
  @media (hover: none) {
    .hover\:neu-pressed:hover {
      box-shadow: inset 4px 4px 8px var(--neu-shadow-inset), 
                  inset -4px -4px 8px var(--neu-shadow-light);
    }
  }

  /* Text truncation utilities */
  .truncate-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .truncate-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

/* Hide content but keep accessible for screen readers */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
8. Testes de Responsividade
8.1 Script de Teste
Crie um script de verificação:

bash
#!/bin/bash
# test-responsive.sh

echo "=== Teste de Responsividade ==="
echo ""

echo "1. Verificando hooks responsivos..."
ls -la src/hooks/useViewport.ts 2>/dev/null && echo "   ✓ useViewport.ts encontrado" || echo "   ✗ useViewport.ts não encontrado"
ls -la src/hooks/useOrientation.ts 2>/dev/null && echo "   ✓ useOrientation.ts encontrado" || echo "   ✗ useOrientation.ts não encontrado"

echo ""
echo "2. Verificando componentes responsivos..."
ls -la src/components/layout/MobileSidebar.tsx 2>/dev/null && echo "   ✓ MobileSidebar encontrado" || echo "   ✗ MobileSidebar não encontrado"
ls -la src/components/layout/TabletSidebar.tsx 2>/dev/null && echo "   ✓ TabletSidebar encontrado" || echo "   ✗ TabletSidebar não encontrado"
ls -la src/components/ui/ResponsiveGrid.tsx 2>/dev/null && echo "   ✓ ResponsiveGrid encontrado" || echo "   ✗ ResponsiveGrid não encontrado"
ls -la src/components/ui/ResponsiveTable.tsx 2>/dev/null && echo "   ✓ ResponsiveTable encontrado" || echo "   ✗ ResponsiveTable não encontrado"

echo ""
echo "3. Verificando uso em páginas..."
grep -l "ResponsiveGrid\|ResponsiveTable\|ResponsiveCard" src/app/*/page.tsx 2>/dev/null && echo "   ✓ Componentes usados nas páginas" || echo "   ✗ Componentes não integrados"

echo ""
echo "4. Verificando globals.css..."
grep -E "scrollbar-hide|touch-action|safe-area" src/app/globals.css 2>/dev/null && echo "   ✓ Utilitários CSS encontrados" || echo "   ✗ Utilitários CSS não encontrados"

echo ""
echo "5. Build do projeto..."
npm run build 2>&1 | tail -5

echo ""
echo "=== Teste Completo ==="
9. Checklist de Validação Manual
Execute os seguintes testes manuais após a implementação:

9.1 Teste em Mobile (iPhone/Android)
✓ iPhone SE (375x667) - Portrait
✓ iPhone 14 Pro (393x852) - Portrait  
✓ iPhone 14 Pro Max (430x932) - Portrait
✓ Android (360x800) - Portrait

Verificar:
[ ] Sidebar é substituída por menu hambúrguer
[ ] Header fixo com botões acessíveis
[ ] Grid de KPIs mostra 1 coluna
[ ] Tabelas têm scroll horizontal
[ ] Touch targets são ≥44px
[ ] Fontes são legíveis (≥16px)
[ ] Inputs têm padding adequado
[ ] Modo landscape funciona
9.2 Teste em Tablet
✓ iPad Mini (768x1024) - Portrait
✓ iPad Pro (1024x1366) - Landscape
✓ Android Tablet (800x1280) - Portrait

Verificar:
[ ] Sidebar pode ser expandida/contrída
[ ] Grid mostra 2-3 colunas
[ ] Charts são responsivos
[ ] Tables mostram mais colunas
[ ] Space é utilizado eficientemente
9.3 Teste de Performance Mobile
✓ Lighthouse Mobile Score ≥90
✓ First Contentful Paint <2s
✓ Largest Contentful Paint <2.5s
✓ Time to Interactive <3.5s
✓ Cumulative Layout Shift <0.1
RELATÓRIO DE ENTREGA
Forneça um relatório detalhado com:

1.
Hooks Implementados
useViewport.ts - Detecção de breakpoint
useOrientation.ts - Detecção de orientação
2.
Componentes Responsivos Criados
MobileSidebar.tsx - Menu para mobile com animação
TabletSidebar.tsx - Sidebar colapsável para tablet
ResponsiveGrid.tsx - Grid com breakpoints
ResponsiveTable.tsx - Tabela com scroll horizontal
ResponsiveCard.tsx - Cards adaptativos
ResponsiveButton.tsx - Botões com touch targets
ResponsiveInput.tsx - Inputs acessíveis
3.
Arquivos Modificados
src/app/layout.tsx - Integração dos sidebars
src/app/globals.css - Utilitários CSS
Páginas atualizadas com componentes responsivos
4.
Breakpoints Implementados
Mobile: <640px (1 coluna)
Tablet Small: 640-767px (2 colunas)
Tablet: 768-1023px (3 colunas)
Desktop: ≥1024px (4+ colunas)
5.
Testes Realizados
Script de verificação executado
Build sucesso
Checklist manual validado
6.
Métricas Lighthouse Mobile
Performance Score
Accessibility Score
Best Practices Score
SEO Score
Execute todas as etapas e forneça o relatório completo.


---

Este prompt implementa um sistema completo de design responsivo com:

- **Hooks de detecção de viewport e orientação**
- **Sidebars responsivas** (mobile com menu hambúrguer, tablet com sidebar colapsável)
- **Componentes adaptativos** (Grid, Table, Card, Button, Input)
- **Breakpoints otimizados** para todas as dimensões
- **Touch targets adequados** (mínimo 44px conforme WCAG)
- **Utilitários CSS** para scrollhide, safe areas e mais
- **Scripts de teste e validação**
