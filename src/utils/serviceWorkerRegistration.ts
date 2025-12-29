/**
 * ================================================================
 * SERVICE WORKER REGISTRATION - BIZCONTROL 360 ERP v2.0.0
 * ================================================================
 * Gerencia o registro, atualização e lifecycle do Service Worker
 * 
 * FEATURES:
 * - Registro automático em produção
 * - Detecção de updates
 * - Eventos customizados para UI
 * - Tratamento de erros
 * - Suporte a skip waiting
 * ================================================================
 */

"use client";

export interface ServiceWorkerConfig {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onInstalled?: () => void;
  onWaiting?: (registration: ServiceWorkerRegistration) => void;
}

/**
 * Registra o Service Worker
 */
export function register(config?: ServiceWorkerConfig): void {
  // Apenas em produção e se browser suportar
  if (process.env.NODE_ENV !== 'production' || typeof window === 'undefined') {
    console.log('🔧 Service Worker desabilitado em desenvolvimento');
    return;
  }

  if (!('serviceWorker' in navigator)) {
    console.warn('⚠️ Service Worker não suportado neste navegador');
    return;
  }

  window.addEventListener('load', () => {
    const swUrl = '/sw.js';

    navigator.serviceWorker
      .register(swUrl)
      .then((registration) => {
        console.log('✅ Service Worker registrado com sucesso:', registration.scope);

        // Callback de sucesso
        if (config?.onSuccess) {
          config.onSuccess(registration);
        }

        // Verificar se há service worker em espera
        if (registration.waiting) {
          handleWaitingServiceWorker(registration, config);
        }

        // Monitorar novos service workers sendo instalados
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;

          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            console.log('🔄 Service Worker state:', newWorker.state);

            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // Nova versão disponível
                console.log('🆕 Nova versão do app disponível!');
                
                // Disparar evento customizado
                window.dispatchEvent(
                  new CustomEvent('swUpdateAvailable', {
                    detail: { registration }
                  })
                );

                // Callback de update
                if (config?.onUpdate) {
                  config.onUpdate(registration);
                }
              } else {
                // Primeira instalação, conteúdo cacheado
                console.log('📦 Conteúdo cacheado para uso offline');
                
                // Disparar evento de instalação
                window.dispatchEvent(new CustomEvent('swInstalled'));

                // Callback de instalação
                if (config?.onInstalled) {
                  config.onInstalled();
                }
              }
            }
          });
        });

        // Verificar updates periodicamente (a cada 1 hora)
        setInterval(() => {
          registration.update().catch((error) => {
            console.debug('Erro ao verificar updates:', error);
          });
        }, 60 * 60 * 1000); // 1 hora
      })
      .catch((error) => {
        console.error('❌ Erro ao registrar Service Worker:', error);
      });

    // Listener para recarregar quando novo SW assumir controle
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        console.log('🔄 Novo Service Worker ativado, recarregando...');
        refreshing = true;
        window.location.reload();
      }
    });
  });
}

/**
 * Trata service worker em espera
 */
function handleWaitingServiceWorker(
  registration: ServiceWorkerRegistration,
  config?: ServiceWorkerConfig
): void {
  console.log('⏳ Service Worker aguardando ativação');

  // Disparar evento
  window.dispatchEvent(
    new CustomEvent('swWaiting', {
      detail: { registration }
    })
  );

  // Callback
  if (config?.onWaiting) {
    config.onWaiting(registration);
  }
}

/**
 * Força a ativação do novo service worker
 */
export function skipWaiting(): void {
  navigator.serviceWorker.ready.then((registration) => {
    if (registration.waiting) {
      // Envia mensagem para o SW em espera ativar
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  });
}

/**
 * Desregistra o service worker (útil para debugging)
 */
export function unregister(): void {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister().then(() => {
          console.log('❌ Service Worker desregistrado');
        });
      })
      .catch((error) => {
        console.error('Erro ao desregistrar Service Worker:', error);
      });
  }
}

/**
 * Verifica se há service worker ativo
 */
export function isServiceWorkerActive(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return Promise.resolve(false);
  }

  return navigator.serviceWorker.ready
    .then((registration) => {
      return registration.active !== null;
    })
    .catch(() => false);
}

/**
 * Obtém informações do service worker
 */
export async function getServiceWorkerInfo(): Promise<{
  isSupported: boolean;
  isActive: boolean;
  controller: ServiceWorker | null;
  registration: ServiceWorkerRegistration | null;
}> {
  const isSupported = 'serviceWorker' in navigator;

  if (!isSupported) {
    return {
      isSupported: false,
      isActive: false,
      controller: null,
      registration: null,
    };
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    return {
      isSupported: true,
      isActive: registration.active !== null,
      controller: navigator.serviceWorker.controller,
      registration,
    };
  } catch (error) {
    return {
      isSupported: true,
      isActive: false,
      controller: null,
      registration: null,
    };
  }
}

/**
 * Limpa todos os caches (útil para troubleshooting)
 */
export async function clearAllCaches(): Promise<void> {
  if (!('caches' in window)) {
    console.warn('Cache API não disponível');
    return;
  }

  try {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map((cacheName) => {
        console.log('🗑️ Deletando cache:', cacheName);
        return caches.delete(cacheName);
      })
    );
    console.log('✅ Todos os caches deletados');
  } catch (error) {
    console.error('❌ Erro ao deletar caches:', error);
  }
}
