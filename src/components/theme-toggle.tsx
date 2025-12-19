'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Theme Toggle - Interruptor de Luxo
 * Alterna entre Light, Dark e System
 * 
 * Design: Botão elegante com animações suaves
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
      <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-800 animate-pulse" />
    );
  }

  // resolvedTheme é o tema efetivo (resolve 'system' para 'light' ou 'dark')
  const currentTheme = resolvedTheme;

  const themes = [
    {
      value: 'light',
      label: 'Light',
      icon: Sun,
      description: 'Clean High-Tech',
    },
    {
      value: 'dark',
      label: 'Dark',
      icon: Moon,
      description: 'Nave Espacial',
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
          relative w-10 h-10 rounded-lg overflow-hidden
          bg-gradient-to-br from-blue-500 to-purple-600
          hover:from-blue-600 hover:to-purple-700
          shadow-lg hover:shadow-xl
          transition-all duration-300
          flex items-center justify-center
          group
        "
        aria-label="Toggle theme"
      >
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {/* Icon */}
        <CurrentIcon className="w-5 h-5 text-white relative z-10" />
        
        {/* Ripple on hover */}
        <motion.div
          className="absolute inset-0 bg-white/20 rounded-lg"
          initial={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 0.5 }}
        />
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
                bg-white dark:bg-[#0a0a0a]
                border border-slate-200 dark:border-white/10
                shadow-2xl
                backdrop-blur-xl
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
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                          : 'hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300'
                      }
                    `}
                  >
                    <div className={`
                      p-1.5 rounded-md
                      ${isActive ? 'bg-white/20' : 'bg-slate-200 dark:bg-white/10'}
                    `}>
                      <Icon className="w-4 h-4" />
                    </div>
                    
                    <div className="flex-1 text-left">
                      <div className={`text-sm font-semibold ${isActive ? 'text-white' : ''}`}>
                        {themeOption.label}
                      </div>
                      <div className={`text-xs ${isActive ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>
                        {themeOption.description}
                      </div>
                    </div>

                    {isActive && (
                      <motion.div
                        layoutId="active-indicator"
                        className="w-2 h-2 rounded-full bg-white"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                  </motion.button>
                );
              })}

              {/* Current Theme Indicator */}
              <div className="mt-2 pt-2 border-t border-slate-200 dark:border-white/10">
                <div className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span>Tema Atual:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 capitalize">
                    {currentTheme === 'light' ? '☀️ Light' : '🌙 Dark'}
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
 * Para uso em lugares com menos espaço
 */
export function ThemeToggleSimple() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-16 h-8 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />;
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
        bg-gradient-to-r from-blue-500 to-purple-600
        shadow-lg hover:shadow-xl
        transition-all duration-300
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
          bg-white
          shadow-md
          flex items-center justify-center
        "
      >
        {isDark ? (
          <Moon className="w-3.5 h-3.5 text-purple-600" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-orange-500" />
        )}
      </motion.div>

      {/* Background Icons */}
      <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
        <Sun className="w-4 h-4 text-white/50" />
        <Moon className="w-4 h-4 text-white/50" />
      </div>
    </motion.button>
  );
}
