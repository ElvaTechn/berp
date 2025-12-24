/**
 * ================================================================
 * PWA SERVICE WORKER - BIZCONTROL 360 ERP v2.0.0
 * ================================================================
 * Service Worker completo seguindo padrões agent-os:
 * - Single Responsibility
 * - Performance Considerations
 * - Clear Interface
 * - Reusability
 * ================================================================ */

// Types para service worker
declare const self: ServiceWorkerGlobalScope;

// ================================================================
 * CACHE STORAGE STRATEGY
// ================================================================

const CACHE_NAME = 'bizcontrol-v2-0-0';
const STATIC_CACHE = 'bizcontrol-static-v2-0-0';
const API_CACHE = 'bizcontrol-api-v2-0-0';
const IMAGE_CACHE = 'bizcontrol-images-v2-0-0';

// URLs para cache estático (performance)
const STATIC_ASSETS = [
  '/',
  '/login',
  '/dashboard',
  '/offline',
  '/favicon.ico',
  '/manifest.json',
  // Adicionar mais assets conforme necessário
];

// API endpoints para cache (offline support)
const API_ENDPOINTS = [
  '/api/products',
  '/api/employees',
  '/api/categories',
];

// ================================================================
 * BACKGROUND SYNC MANAGER
// ================================================================

class BackgroundSyncManager {
  /**
   * Evento de sync em background
   */
  static async handleSync(event: ExtendableMessageEvent): Promise<void> {
    if (event.tag === 'background-sync') {
      try {
        await BackgroundSyncManager.processQueue();
      } catch (error) {
        console.error('Background sync error:', error);
        
        // Notify user if available
        if (self.registration.showNotification) {
          self.registration.showNotification('Erro de Sincronização', {
            body: 'Não foi possível sincronizar os dados. Tente manualmente.',
            icon: '/favicon.ico',
            tag: 'sync-error',
          });
        }
      }
    }
  }

  /**
   * Processa fila de sincronização offline
   */
  private static async processQueue(): Promise<void> {
    try {
      // Obter dados do IndexedDB cache
      const queue = await BackgroundSyncManager.getSyncQueue();
      
      if (queue.length === 0) return;

      let successCount = 0;
      let errorCount = 0;

      for (const item of queue) {
        try {
          await BackgroundSyncManager.syncItem(item);
          await BackgroundSyncManager.removeFromQueue(item.id);
          successCount++;
        } catch (error) {
          console.error('Error syncing item:', error);
          errorCount++;
          
          // Incrementar retries
          item.retries = (item.retries || 0) + 1;
          if (item.retries <= 3) {
            await BackgroundSyncManager.updateQueueItem(item);
          } else {
            await BackgroundSyncManager.removeFromQueue(item.id);
          }
        }
      }

      // Notify de sucesso
      if (successCount > 0 && self.registration.showNotification) {
        self.registration.showNotification('Sincronização Completa', {
          body: `${successCount} itens sincronizados com sucesso`,
          icon: '/favicon.ico',
          tag: 'sync-success',
        });
      }

    } catch (error) {
      console.error('Queue processing error:', error);
      throw error;
    }
  }

  /**
   * Sincroniza item individual
   */
  private static async syncItem(item: any): Promise<Response> {
    const options: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await BackgroundSyncManager.getAuthToken()}`,
      },
      body: JSON.stringify(item.data),
    };

    switch (item.type) {
      case 'sale':
        return fetch('/api/sales', options);
      case 'product':
        return fetch('/api/products', options);
      case 'employee':
        return fetch('/api/employees', options);
      default:
        throw new Error(`Unknown item type: ${item.type}`);
    }
  }

  /**
   * Obter fila de sincronização ( IndexedDB cache )
   */
  private static async getSyncQueue(): Promise<any[]> {
    // Implementação simplificada - na prática usaria IndexedDB
    return [];
  }

  /**
   * Remover item da fila
   */
  private static async removeFromQueue(id: string): Promise<void> {
    // Implementação simplificada
  }

  /**
   * Atualizar item na fila
   */
  private static async updateQueueItem(item: any): Promise<void> {
    // Implementação simplificada
  }

  /**
   * Obter token de autenticação
   */
  private static async getAuthToken(): Promise<string> {
    // Implementação simplificada
    return '';
  }
}

// ================================================================
 * CACHE STRATEGY MANAGER
// ================================================================

class CacheStrategyManager {
  /**
   * Estratégia Cache Firstpara assets estáticos
   */
  static async handleCacheFirst(request: Request): Promise<Response> {
    try {
      // Tentar cache primeiro
      const cached = await caches.match(request, { cacheName: STATIC_CACHE });
      if (cached) {
        // Atualar cache em background
        BackgroundSyncManager.updateCache(request);
        return cached;
      }

      // Fallback para network
      const response = await fetch(request);
      
      // Cache se for sucesso
      if (response.ok) {
        const cache = await caches.open(STATIC_CACHE);
        cache.put(request, response.clone());
      }
      
      return response;
      
    } catch (error) {
      // Offline - tentar cache mesmo que expirado
      return caches.match(request) || new Response('Offline', { 
        status: 503,
        statusText: 'Service Unavailable'
      });
    }
  }

  /**
   * Estratégia Network First para API calls
   */
  static async handleNetworkFirst(request: Request): Promise<Response> {
    try {
      // Tentar network primeiro
      const response = await fetch(request);
      
      if (response.ok) {
        // Cache resposta
        const cache = await caches.open(API_CACHE);
        cache.put(request, response.clone());
      }
      
      return response;
      
    } catch (error) {
      // Fallback para cache
      const cached = await caches.match(request, { cacheName: API_CACHE });
      return cached || new Response('Offline API Error', { 
        status: 503,
        statusText: 'Service Unavailable'
      });
    }
  }

  /**
   * Estratégia Stale While Revalidate para dados frequentes
   */
  static async handleStaleWhileRevalidate(request: Request): Promise<Response> {
    const cache = await caches.open(API_CACHE);
    const cached = await cache.match(request);

    // Retornar cache imediatamente se existir
    if (cached) {
      // Atualizar em background
      fetch(request)
        .then(response => {
          if (response.ok) {
            cache.put(request, response);
          }
        })
        .catch(() => {
          // Ignorar erros de background update
        });
      
      return cached;
    }

    // Fallback para network
    try {
      const response = await fetch(request);
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    } catch (error) {
      return new Response('Network Error', { status: 503 });
    }
  }

  /**
   * Atualizar cache em background
   */
  private static async updateCache(request: Request): Promise<void> {
    try {
      const response = await fetch(request);
      if (response.ok) {
        const cache = await caches.open(STATIC_CACHE);
        cache.put(request, response);
      }
    } catch (error) {
      // Ignorar erros de background update
    }
  }
}

// ================================================================
 * EVENT HANDLERS
// ================================================================

// Install event - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(STATIC_CACHE);
        await cache.addAll(STATIC_ASSETS);
        
        // Pré-cache API endpoints
        const apiCache = await caches.open(API_CACHE);
        for (const endpoint of API_ENDPOINTS) {
          try {
            await apiCache.add(endpoint);
          } catch (error) {
            console.warn(`Failed to pre-cache ${endpoint}:`, error);
          }
        }

        // Pré-cache imagens do produto se necessário
        const imageCache = await caches.open(IMAGE_CACHE);
        // Implementar lógica para cache de imagens produtos

      } catch (error) {
        console.error('Service worker install error:', error);
      }
    })()
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      try {
        // Limpar caches antigos
        const cacheNames = await caches.keys();
        const oldCaches = cacheNames.filter(name => 
          name.startsWith('bizcontrol-') && 
          name !== STATIC_CACHE && 
          name !== API_CACHE && 
          name !== IMAGE_CACHE
        );

        await Promise.all(oldCaches.map(name => caches.delete(name)));
        
        // Claim clients
        await self.clients.claim();
        
      } catch (error) {
        console.error('Service worker activate error:', error);
      }
    })()
  );
});

// Fetch event - routing
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Navegação de página
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          return await fetch(request);
        } catch (error) {
          // Offline fallback
          const offlineResponse = await caches.match('/offline');
          return offlineResponse || new Response('Offline', { 
            status: 503,
            statusText: 'Service Unavailable'
          });
        }
      })()
    );
    return;
  }

  // Assets estáticos
  if (STATIC_ASSETS.some(asset => request.url.includes(asset))) {
    event.respondWith(CacheStrategyManager.handleCacheFirst(request));
    return;
  }

  // API calls
  if (request.url.includes('/api/')) {
    // GET requests para dados que podem ser stale-while-revalidate
    if (request.method === 'GET') {
      event.respondWith(CacheStrategyManager.handleStaleWhileRevalidate(request));
    } else {
      // POST/PUT/DELETE - tentar network primeiro
      event.respondWith(CacheStrategyManager.handleNetworkFirst(request));
    }
    return;
  }

  // Imagens e outros estáticos
  if (request.destination === 'image' || request.destination === 'font') {
    event.respondWith(CacheStrategyManager.handleCacheFirst(request));
    return;
  }

  // Default behavior
  event.respondWith(fetch(request));
});

// Push event - notificações
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: data.tag || 'general',
        requireInteraction: data.persistent || false,
        actions: data.actions || [],
        data: data.url,
      })
    );
  }
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.notification.data) {
    event.waitUntil(
      clients.openWindow(event.notification.data)
    );
  } else {
    // Fallback para página principal
    event.waitUntil(
      clients.matchAll().then(clientList => {
        for (const client of clientList) {
          if (client.url.includes(self.registration.scope) && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});

// Background sync event
self.addEventListener('sync', (event) => {
  BackgroundSyncManager.handleSync(event);
});

// Periodic sync para cache updates
self.addEventListener('periodicSync', (event) => {
  if (event.tag === 'api-cache-update') {
    event.waitUntil(
      (async () => {
        try {
          // Atualizar cache de API endpoints
          const apiCache = await caches.open(API_CACHE);
          for (const endpoint of API_ENDPOINTS) {
            try {
              const response = await fetch(endpoint);
              if (response.ok) {
                apiCache.put(endpoint, response);
              }
            } catch (error) {
              console.warn(`Failed to update ${endpoint}:`, error);
            }
          }
        } catch (error) {
          console.error('Periodic sync error:', error);
        }
      })()
    );
  }
});

export default null; // Service worker pattern
