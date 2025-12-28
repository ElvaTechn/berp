'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Theme Toggle - Neumorphic Design
 * Alterna entre Light, Dark e System
 * 
 * Design: Botão Neumorphic com dropdown animado
 */
export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Previne hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-xl neu-surface neu-skeleton" />
    );
  }

  // resolvedTheme é o tema efetivo (resolve 'system' para 'light' ou 'dark')
  const currentTheme = resolvedTheme;

  const themes = [
    {
      value: 'light',
      label: 'Light',
      icon: Sun,
      description: 'Modo Claro',
    },
    {
      value: 'dark',
      label: 'Dark',
      icon: Moon,
      description: 'Modo Escuro',
    },
    {
      value: 'system',
      label: 'System',
      icon: Monitor,
      description: 'Automático',
    },
  ];

  const CurrentIcon = currentTheme === 'dark' ? Moon : Sun;

  return (
    <div className="relative">
      {/* Botão Principal */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowMenu(!showMenu)}
        className="
          relative w-10 h-10 rounded-xl overflow-hidden
          neu-surface neu-convex-md
          hover:neu-convex-lg
          transition-all duration-200
          flex items-center justify-center
          group
        "
        aria-label="Toggle theme"
      >
        <CurrentIcon className="w-5 h-5 text-[var(--neu-accent)]" />
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {showMenu && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowMenu(false)}
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="
                absolute right-0 top-12 z-50
                w-56 p-2 rounded-xl
                neu-surface
                neu-convex-lg
                border border-[var(--neu-border)]
              "
            >
              {themes.map((themeOption) => {
                const Icon = themeOption.icon;
                const isActive = theme === themeOption.value;

                return (
                  <motion.button
                    key={themeOption.value}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setTheme(themeOption.value);
                      setShowMenu(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                      transition-all duration-200
                      ${
                        isActive
                          ? 'bg-[var(--neu-accent)] text-white neu-convex-sm'
                          : 'text-[var(--neu-text-secondary)] hover:bg-[var(--neu-surface-hover)]'
                      }
                    `}
                  >
                    <div className={`
                      p-1.5 rounded-md
                      ${isActive ? 'bg-white/20' : 'neu-convex-sm'}
                    `}>
                      <Icon className="w-4 h-4" />
                    </div>
                    
                    <div className="flex-1 text-left">
                      <div className={`neu-text-body font-semibold ${isActive ? 'text-white' : ''}`}>
                        {themeOption.label}
                      </div>
                      <div className={`neu-text-caption ${isActive ? 'text-white/80' : ''}`}>
                        {themeOption.description}
                      </div>
                    </div>

                    {isActive && (
                      <motion.div
                        layoutId="active-indicator-theme"
                        className="w-2 h-2 rounded-full bg-white"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                  </motion.button>
                );
              })}

              {/* Current Theme Indicator */}
              <div className="mt-2 pt-2 border-t border-[var(--neu-border-light)]">
                <div className="px-3 py-2 neu-text-caption flex items-center justify-between">
                  <span>Tema Atual:</span>
                  <span className="font-semibold text-[var(--neu-text-primary)] capitalize">
                    {currentTheme === 'light' ? '☀️ Claro' : '🌙 Escuro'}
                  </span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Theme Toggle Simples - Apenas Light/Dark
 * Versão compacta para Sidebar
 */
export function ThemeToggleSimple() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-16 h-8 rounded-full neu-surface neu-skeleton" />;
  }

  // Usa resolvedTheme para verificar o tema EFETIVO (resolve 'system')
  const isDark = resolvedTheme === 'dark';

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="
        relative w-16 h-8 rounded-full
        neu-surface
        neu-convex-sm
        transition-all duration-200
        flex items-center
        px-1
        group
      "
      aria-label={isDark ? 'Mudar para Light Mode' : 'Mudar para Dark Mode'}
    >
      {/* Slider */}
      <motion.div
        animate={{ x: isDark ? 32 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="
          w-6 h-6 rounded-full
          bg-[var(--neu-accent)]
          neu-convex-sm
          flex items-center justify-center
        "
      >
        {isDark ? (
          <Moon className="w-3.5 h-3.5 text-white" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-white" />
        )}
      </motion.div>

      {/* Background Icons */}
      <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
        <Sun className="w-4 h-4 text-[var(--neu-text-muted)]" />
        <Moon className="w-4 h-4 text-[var(--neu-text-muted)]" />
      </div>
    </motion.button>
  );
}
