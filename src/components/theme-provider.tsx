'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';

/**
 * Theme Provider para BizControl 360
 * Suporta Light High-Tech e Dark Maximalist
 * 
 * Features:
 * - Transições suaves sem "flash" branco
 * - Persistência em localStorage
 * - Detecção de preferência do sistema
 * - SSR-safe
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange={false}
      storageKey="bizcontrol-theme"
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
