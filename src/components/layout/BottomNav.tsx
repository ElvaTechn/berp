/**
 * ================================================================
 * BOTTOM NAVIGATION BAR - BIZCONTROL 360 ERP v2.1.0
 * ================================================================
 * Navegação inferior para mobile (estilo Instagram/Spotify)
 * Resolve problema: Menu hambúrguer requer 3 toques
 * ================================================================
 */

"use client";

import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  MoreHorizontal,
  CalendarClock,
  Warehouse,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: number;
}

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  // Principais navegações (max 5 por recomendação HIG)
  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="h-6 w-6" />,
      href: '/dashboard',
    },
    {
      id: 'sales',
      label: 'Vendas',
      icon: <ShoppingCart className="h-6 w-6" />,
      href: '/pos',
    },
    {
      id: 'products',
      label: 'Produtos',
      icon: <Package className="h-6 w-6" />,
      href: '/products',
    },
    {
      id: 'reservations',
      label: 'Reservas',
      icon: <CalendarClock className="h-6 w-6" />,
      href: '/reservations',
    },
    {
      id: 'more',
      label: 'Mais',
      icon: <MoreHorizontal className="h-6 w-6" />,
      href: '/more', // Página com outras opções
    },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/' || pathname === '/dashboard';
    }
    return pathname?.startsWith(href);
  };

  const handleNavigation = (item: NavItem) => {
    // Vibração feedback (se disponível)
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
    
    router.push(item.href);
  };

  return (
    <>
      {/* Spacer para evitar que conteúdo fique escondido atrás do nav */}
      <div className="h-20 lg:hidden" />

      {/* Bottom Navigation */}
      <nav
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50",
          "lg:hidden", // Esconder em desktop
          "bg-white dark:bg-[#0A0A0A]",
          "border-t border-slate-200 dark:border-white/10",
          "shadow-2xl"
        )}
        style={{
          // iOS safe area
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <div className="flex items-center justify-around px-2 pt-2 pb-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item)}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-1",
                  "min-w-[64px] py-2 px-3", // Touch target adequado
                  "rounded-xl transition-all duration-200",
                  "active:scale-95",
                  "touch-manipulation",
                  active && "bg-blue-50 dark:bg-blue-900/20"
                )}
              >
                {/* Icon */}
                <div className="relative">
                  <div
                    className={cn(
                      "transition-colors duration-200",
                      active 
                        ? "text-blue-600 dark:text-blue-400" 
                        : "text-slate-600 dark:text-slate-400"
                    )}
                  >
                    {item.icon}
                  </div>
                  
                  {/* Badge (se houver) */}
                  {item.badge && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                    >
                      {item.badge > 9 ? '9+' : item.badge}
                    </motion.div>
                  )}
                </div>

                {/* Label */}
                <span
                  className={cn(
                    "text-[11px] font-medium transition-colors duration-200",
                    active 
                      ? "text-blue-600 dark:text-blue-400" 
                      : "text-slate-600 dark:text-slate-400"
                  )}
                >
                  {item.label}
                </span>

                {/* Active indicator */}
                {active && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-10 h-1 bg-blue-600 dark:bg-blue-400 rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}

/**
 * Página "Mais" - Menu completo em grid
 */
export function MoreMenuPage() {
  const router = useRouter();

  const menuItems = [
    {
      icon: <Users className="h-6 w-6" />,
      label: 'Clientes',
      href: '/customers',
      color: 'text-purple-600 dark:text-purple-400',
    },
    {
      icon: <Warehouse className="h-6 w-6" />,
      label: 'Estoque',
      href: '/inventory',
      color: 'text-orange-600 dark:text-orange-400',
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      label: 'Relatórios',
      href: '/reports',
      color: 'text-green-600 dark:text-green-400',
    },
    {
      icon: <Package className="h-6 w-6" />,
      label: 'Categorias',
      href: '/categories',
      color: 'text-blue-600 dark:text-blue-400',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
        Mais Opções
      </h1>

      <div className="grid grid-cols-2 gap-4">
        {menuItems.map((item) => (
          <button
            key={item.href}
            onClick={() => router.push(item.href)}
            className={cn(
              "flex flex-col items-center justify-center gap-3",
              "p-6 rounded-2xl",
              "bg-white dark:bg-[#0A0A0A]",
              "border border-slate-200 dark:border-white/10",
              "hover:border-slate-300 dark:hover:border-white/20",
              "active:scale-95 transition-all",
              "touch-manipulation"
            )}
          >
            <div className={cn("p-3 rounded-xl bg-slate-50 dark:bg-white/5", item.color)}>
              {item.icon}
            </div>
            <span className="text-sm font-medium text-slate-900 dark:text-white">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
