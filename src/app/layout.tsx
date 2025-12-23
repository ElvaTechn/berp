// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter, Crimson_Pro } from 'next/font/google';

// Adult Minimalist Typography System
const sans = Inter({ 
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap'
});

const serif = Crimson_Pro({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-serif',
  display: 'swap'
});
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
  title: 'BIZ360 | Enterprise ERP',
  description: 'Corporate Management System for High-Performance Teams',
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
    <html lang="pt-MZ" suppressHydrationWarning className={`${sans.variable} ${serif.variable}`}>
      <body className="font-sans bg-white dark:bg-black text-slate-900 dark:text-white antialiased">
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
