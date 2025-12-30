// src/app/layout.tsx
import type { Metadata } from 'next';

// Simplificando para sistema de fonts locale
// Removendo fontes Google que estão falhando
import './globals.css';
import './glassmorphism.css';
import { getSession } from '@/lib/auth-server';
import { db } from '@/lib/server-api';
import { AuthProvider } from '@/contexts/auth-context';
import { ToastProvider, ToastInitializer } from '@/components/ui/toast';
import ClientLayout from '@/components/layout/ClientLayout';
import AccessibilityHelper from '@/components/accessibility/AccessibilityHelper';
import { OfflineIndicator } from '@/components/offline/OfflineIndicator';
import { ThemeProvider } from '@/components/theme-provider';
import { ToastContainer } from '@/components/notifications/toast-container';
import { NeuToaster } from '@/components/ui/neu-toast';
import { ServiceWorkerProvider } from '@/components/pwa/ServiceWorkerProvider';

export const metadata: Metadata = {
  title: 'BIZ360 | Enterprise ERP',
  description: 'Corporate Management System for High-Performance Teams',
  manifest: '/manifest.json',
  themeColor: '#000000',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'BizControl 360',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/favicon.svg',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'BizControl 360',
    // Content Security Policy (permissive for PWA functionality)
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https://*",
      "worker-src 'self' blob:",
      "manifest-src 'self'",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Busca sessão - lightweight operation
  const session = await getSession();
  let user = null;

  if (session) {
    user = await db.user.findById(session.userId);
  }

  // Mapear para o formato do Contexto
  const initialUser = user ? {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    role: user.role
  } : null;

  return (
    <html lang="pt-MZ" suppressHydrationWarning>
      <body className="font-sans bg-white dark:bg-black text-slate-900 dark:text-white antialiased" suppressHydrationWarning>
        <ThemeProvider>
          <AuthProvider initialUser={initialUser}>
            <ToastProvider>
              <ServiceWorkerProvider />
              <ToastInitializer />
              <ToastContainer />
              <NeuToaster />
              <AccessibilityHelper>
                <></>
              </AccessibilityHelper>
              <OfflineIndicator />
              <ClientLayout user={initialUser}>
                {children}
              </ClientLayout>
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
