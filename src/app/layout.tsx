// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
import './globals.css';
import { getSession } from '@/lib/auth-server';
import { db } from '@/lib/server-api';
import { AuthProvider } from '@/contexts/auth-context';
import { ToastProvider, ToastInitializer } from '@/components/ui/toast';
import ClientLayout from '@/components/layout/ClientLayout';
import AccessibilityHelper from '@/components/accessibility/AccessibilityHelper';
import { OfflineIndicator } from '@/components/offline/OfflineIndicator';
import { ThemeProvider } from '@/components/theme-provider';

export const metadata: Metadata = {
  title: 'BIZ360 | ERP Enterprise',
  description: 'Sistema de Gestão de Alta Performance',
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
      <body className={`${inter.className} bg-white dark:bg-[#050505] text-slate-900 dark:text-white antialiased`}>
        <ThemeProvider>
          <AuthProvider initialUser={initialUser}>
            <ToastProvider>
              <ToastInitializer />
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