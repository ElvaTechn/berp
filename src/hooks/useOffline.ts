import { useState, useEffect } from 'react';

export interface OfflineStatus {
  isOnline: boolean;
  isOffline: boolean;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

/**
 * Hook para detectar status de conexão offline/online
 * Monitora navigator.onLine e Network Information API
 */
export function useOffline(): OfflineStatus {
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof window !== 'undefined') {
      return navigator.onLine;
    }
    return true;
  });

  const [networkInfo, setNetworkInfo] = useState<{
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
    saveData?: boolean;
  }>({});

  useEffect(() => {
    // Atualiza status de conexão
    const handleOnline = () => {
      console.log('🟢 Conexão: ONLINE');
      setIsOnline(true);

      // Dispara evento customizado para sincronização
      window.dispatchEvent(new CustomEvent('app-online'));

      // Registra sync se disponível
      if ('serviceWorker' in navigator && 'sync' in (self as any).registration) {
        navigator.serviceWorker.ready.then((registration: any) => {
          return registration.sync.register('sync-offline-sales');
        }).catch((error: any) => {
          console.error('Erro ao registrar sync:', error);
        });
      }
    };

    const handleOffline = () => {
      console.log('🔴 Conexão: OFFLINE');
      setIsOnline(false);

      // Dispara evento customizado
      window.dispatchEvent(new CustomEvent('app-offline'));
    };

    // Atualiza informações de rede
    const updateNetworkInfo = () => {
      if ('connection' in navigator) {
        const conn = (navigator as any).connection;
        setNetworkInfo({
          effectiveType: conn.effectiveType,
          downlink: conn.downlink,
          rtt: conn.rtt,
          saveData: conn.saveData,
        });
      }
    };

    // Event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Network Information API
    if ('connection' in navigator) {
      const conn = (navigator as any).connection;
      conn.addEventListener('change', updateNetworkInfo);
      updateNetworkInfo();
    }

    // Verifica conexão periodicamente (fallback)
    const checkConnection = setInterval(() => {
      if (navigator.onLine !== isOnline) {
        navigator.onLine ? handleOnline() : handleOffline();
      }
    }, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(checkConnection);

      if ('connection' in navigator) {
        const conn = (navigator as any).connection;
        conn.removeEventListener('change', updateNetworkInfo);
      }
    };
  }, [isOnline]);

  return {
    isOnline,
    isOffline: !isOnline,
    ...networkInfo,
  };
}

/**
 * Hook para executar código quando a conexão é restaurada
 */
export function useOnlineEffect(callback: () => void, deps: any[] = []) {
  const { isOnline } = useOffline();

  useEffect(() => {
    if (isOnline) {
      callback();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline, ...deps]);
}

/**
 * Hook para executar código quando fica offline
 */
export function useOfflineEffect(callback: () => void, deps: any[] = []) {
  const { isOffline } = useOffline();

  useEffect(() => {
    if (isOffline) {
      callback();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOffline, ...deps]);
}
