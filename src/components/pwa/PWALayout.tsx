"use client";

import { useState, useEffect } from 'react';
import PWAInstallPrompt from '@/components/pwa/InstallPrompt';
import OfflineBanner from '@/components/pwa/OfflineBanner';
import { useOfflineSync } from '@/hooks/useOfflineSync';

interface PWALayoutProps {
  children: React.ReactNode;
}

export default function PWALayout({ children }: PWALayoutProps) {
  const { isOnline, pendingCount } = useOfflineSync();

  useEffect(() => {
    // Initialize PWA features
    console.log('PWA Layout initialized');
  }, []);

  return (
    <div className="relative min-h-screen">
      {/* Offline Banner - Always visible when needed */}
      <OfflineBanner />

      {/* Main Content */}
      <main className="w-full">
        {children}
      </main>

      {/* Install Prompt - Bottom right corner */}
      <PWAInstallPrompt />

      {/* Debug info - development only */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 bg-black/80 text-white p-2 rounded text-xs">
          <div>Status: {isOnline ? 'Online' : 'Offline'}</div>
          <div>Pending: {pendingCount}</div>
        </div>
      )}
    </div>
  );
}
