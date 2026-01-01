/**
 * ================================================================
 * PWA LAZY LOADING UTILITIES - BIZCONTROL 360 ERP v2.0.0
 * ================================================================
 * Utilities para code splitting e lazy loading de features PWA
 * Reduz o bundle inicial carregando features sob demanda
 * ================================================================
 */

"use client";

import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

// ================================================================
// LAZY COMPONENTS
// ================================================================

/**
 * Carrega InstallPrompt apenas quando necessário
 */
export const PWAInstallPrompt = dynamic(
  () => import('@/components/pwa/InstallPrompt').then(mod => ({ default: mod.default })),
  {
    loading: () => null, // Não mostrar loading
    ssr: false,
  }
);

/**
 * Carrega OfflineBanner apenas quando offline ou há itens pendentes
 */
export const PWAOfflineBanner = dynamic(
  () => import('@/components/pwa/OfflineBanner').then(mod => ({ default: mod.default })),
  {
    loading: () => null,
    ssr: false,
  }
);

/**
 * Carrega SyncButton apenas quando necessário
 */
export const PWASyncButton = dynamic(
  () => import('@/components/pwa/SyncButton').then(mod => ({ default: mod.default })),
  {
    loading: () => null,
    ssr: false,
  }
);

/**
 * Carrega ServiceWorkerProvider apenas no client
 */
export const PWAServiceWorkerProvider = dynamic(
  () => import('@/components/pwa/ServiceWorkerProvider').then(mod => ({ default: mod.ServiceWorkerProvider })),
  {
    loading: () => null,
    ssr: false,
  }
) as ComponentType;

/**
 * Carrega PWALayout apenas quando necessário (offline mode)
 */
export const PWALayoutWrapper = dynamic(
  () => import('@/components/pwa/PWALayout').then(mod => ({ default: mod.default })),
  {
    loading: () => null,
    ssr: false,
  }
);

// ================================================================
// LAZY HOOKS
// ================================================================

/**
 * Carrega useOfflineSync apenas quando necessário
 */
export const createUseOfflineSync = () => {
  return dynamic(
    () => import('@/hooks/useOfflineSync').then(mod => ({ default: mod.useOfflineSync })),
    {
      ssr: false,
    }
  );
};

/**
 * Carrega useOfflineGate apenas em componentes específicos
 */
export const createUseOfflineGate = () => {
  return dynamic(
    () => import('@/hooks/useOfflineGate').then(mod => ({ default: mod.useOfflineGate })),
    {
      ssr: false,
    }
  );
};

// ================================================================
// CONDITIONAL LOADING HELPERS
// ================================================================

interface ConditionalLoadOptions {
  shouldLoad?: () => boolean | Promise<boolean>;
  timeout?: number;
}

/**
 * Componente wrapper que carrega filho apenas se condição for true
 */
export function ConditionalPWAFeature({
  children,
  shouldLoad = true,
  loading = null,
}: {
  children: React.ReactNode;
  shouldLoad?: boolean | (() => boolean | Promise<boolean>);
  loading?: React.ReactNode;
}) {
  const [canLoad, setCanLoad] = React.useState(false);
  const [checked, setChecked] = React.useState(false);

  React.useEffect(() => {
    const checkCanLoad = async () => {
      try {
        const result = typeof shouldLoad === 'function' ? await shouldLoad() : shouldLoad;
        setCanLoad(result);
      } catch (error) {
        console.error('Failed to check condition:', error);
        setCanLoad(false);
      } finally {
        setChecked(true);
      }
    };

    checkCanLoad();
  }, [shouldLoad]);

  if (!checked) {
    return loading as React.ReactElement;
  }

  if (!canLoad) {
    return null;
  }

  return children as React.ReactElement;
}

// ================================================================
// STORAGE MONITOR (lazy load)
// ================================================================

export const createStorageMonitor = () => {
  return dynamic(
    () => import('@/lib/pwa/indexedDB.enhanced').then(mod => ({ default: mod.pwaStorage })),
    {
      ssr: false,
    }
  );
};

// ================================================================
// CONFLICT RESOLUTION MONITOR (lazy load)
// ================================================================

export const createConflictMonitor = () => {
  return dynamic(
    () => import('@/lib/pwa/conflictResolution').then(mod => ({ 
      default: mod.conflictResolution,
      getConflictStats: mod.getConflictStats,
      autoResolveConflict: mod.autoResolveConflict,
    })),
    {
      ssr: false,
    }
  );
};

// ================================================================
// LAZY NOTIFICATION COMPONENTS
// ================================================================

/**
 * Carrega componentes de notificação apenas quando necessários
 */
export const OfflineIndicator = dynamic(
  () => import('@/components/offline/OfflineIndicator').then(mod => ({ default: mod.default })),
  {
    loading: () => null,
    ssr: false,
  }
);

export const SyncStatus = dynamic(
  () => import('@/components/offline/SyncStatus').then(mod => ({ default: mod.default })),
  {
    loading: () => null,
    ssr: false,
  }
);
