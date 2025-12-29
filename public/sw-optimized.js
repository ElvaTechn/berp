/**
 * ================================================================
 * PWA SERVICE WORKER OPTIMIZED - BIZCONTROL 360 ERP v2.1.0
 * ================================================================
 * Service Worker otimizado com:
 * - Cache strategies eficientes
 * - Limpeza automática de caches antigos
 * - Navigation preload
 * - Precache inteligente
 * - Runtime caching otimizado
 * ================================================================
 */

// ================================================================
// VERSÃO E CACHE NAMES
// ================================================================

const VERSION = '2.1.0';
const CACHE_PREFIX = 'bizcontrol';

// Nomes de cache organizados por tipo
const CACHES = {
  static: `${CACHE_PREFIX}-static-v${VERSION}`,
  api: `${CACHE_PREFIX}-api-v${VERSION}`,
  images: `${CACHE_PREFIX}-images-v${VERSION}`,
  fonts: `${CACHE_PREFIX}-fonts-v${VERSION}`,
  pages: `${CACHE_PREFIX}-pages-v${VERSION}`,
};

// Lista de caches antigos para deletar
const OLD_CACHES = [
  'bizcontrol-v1-0-0',
  'bizcontrol-v2-0-0',
  'bizcontrol-static-v1',
  'bizcontrol-static-v2-0-0',
  'bizcontrol-api-v1',
  'bizcontrol-api-v2-0-0',
  'bizcontrol-images-v1',
  'bizcontrol-images-v2-0-0',
  'offline-cache',
  'api-cache',
  'images-cache',
  'static-cache',
];

// Assets críticos para funcionamento offline imediato
const CRITICAL_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/favicon.ico',
];

// ================================================================
// INSTALL EVENT - Precache inteligente
// ================================================================

self.addEventListener('install', (event) => {
  console.log(`[SW ${VERSION}] Installing...`);
  
  event.waitUntil(
    (async () => {
      try {
        // Habilitar navigation preload
        if (self.registration.navigationPreload) {
          await self.registration.navigationPreload.enable();
          console.log('[SW] Navigation preload enabled');
        }

        // Abrir cache de assets estáticos
        const cache = await caches.open(CACHES.static);
        
        // Fazer precache de assets críticos (não bloqueia instalação)
        await Promise.allSettled(
          CRITICAL_ASSETS.map(async (asset) => {
            try {
              const request = new Request(asset, { cache: 'reload' });
              const response = await fetch(request);
              if (response.ok) {
                await cache.put(request, response);
                console.log(`[SW] Cached: ${asset}`);
              }
            } catch (error) {
              console.warn(`[SW] Failed to cache ${asset}:`, error.message);
            }
          })
        );

        console.log('[SW] Critical assets precached');

        // Skip waiting para ativar imediatamente
        await self.skipWaiting();
        console.log('[SW] Skipped waiting');

      } catch (error) {
        console.error('[SW] Install error:', error);
      }
    })()
  );
});

// ================================================================
// ACTIVATE EVENT - Limpeza de caches antigos
// ================================================================

self.addEventListener('activate', (event) => {
  console.log(`[SW ${VERSION}] Activating...`);
  
  event.waitUntil(
    (async () => {
      try {
        // Obter todos os nomes de cache
        const cacheNames = await caches.keys();
        
        // Identificar caches para deletar
        const cachesToDelete = cacheNames.filter((cacheName) => {
          // Deletar caches da lista de antigos
          if (OLD_CACHES.includes(cacheName)) {
            return true;
          }
          
          // Deletar caches do BizControl que não são da versão atual
          if (cacheName.startsWith(CACHE_PREFIX)) {
            return !Object.values(CACHES).includes(cacheName);
          }
          
          return false;
        });

        // Deletar caches antigos
        if (cachesToDelete.length > 0) {
          console.log(`[SW] Deleting ${cachesToDelete.length} old caches:`, cachesToDelete);
          await Promise.all(
            cachesToDelete.map((cacheName) => {
              console.log(`[SW] Deleted cache: ${cacheName}`);
              return caches.delete(cacheName);
            })
          );
        }

        // Tomar controle de todas as páginas imediatamente
        await self.clients.claim();
        console.log(`[SW ${VERSION}] Activated and claimed clients`);

      } catch (error) {
        console.error('[SW] Activate error:', error);
      }
    })()
  );
});

// ================================================================
// FETCH EVENT - Runtime caching strategies
// ================================================================

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const { url, method } = request;

  // Ignorar non-GET requests
  if (method !== 'GET') {
    return;
  }

  // Ignorar chrome-extension e outras URLs especiais
  if (!url.startsWith('http')) {
    return;
  }

  event.respondWith(handleFetch(request));
});

/**
 * Handler principal de fetch com estratégias otimizadas
 */
async function handleFetch(request) {
  const url = new URL(request.url);
  
  try {
    // ===== ESTRATÉGIA 1: Navigation Requests (HTML pages) =====
    if (request.mode === 'navigate') {
      return await handleNavigationRequest(request);
    }

    // ===== ESTRATÉGIA 2: API Requests =====
    if (url.pathname.startsWith('/api/')) {
      return await networkFirstStrategy(request, CACHES.api, {
        timeout: 10000,
        maxAge: 5 * 60 * 1000, // 5 minutos
      });
    }

    // ===== ESTRATÉGIA 3: Imagens =====
    if (/\.(png|jpg|jpeg|svg|gif|webp|ico|avif)$/i.test(url.pathname)) {
      return await cacheFirstStrategy(request, CACHES.images, {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 dias
      });
    }

    // ===== ESTRATÉGIA 4: Fontes =====
    if (/\.(woff2?|ttf|eot|otf)$/i.test(url.pathname) || url.pathname.includes('/fonts/')) {
      return await cacheFirstStrategy(request, CACHES.fonts, {
        maxAge: 365 * 24 * 60 * 60 * 1000, // 1 ano
      });
    }

    // ===== ESTRATÉGIA 5: Assets estáticos (JS, CSS) =====
    if (/\.(js|css)$/i.test(url.pathname)) {
      return await staleWhileRevalidateStrategy(request, CACHES.static);
    }

    // ===== ESTRATÉGIA 6: Manifest e Service Worker =====
    if (url.pathname === '/manifest.json' || url.pathname === '/sw.js') {
      return await networkFirstStrategy(request, CACHES.static, {
        timeout: 3000,
        maxAge: 0, // Sempre buscar nova versão
      });
    }

    // ===== ESTRATÉGIA PADRÃO: Network First =====
    return await networkFirstStrategy(request, CACHES.pages, {
      timeout: 5000,
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
    });

  } catch (error) {
    console.error('[SW] Fetch error:', error);
    
    // Fallback para página offline se for navegação
    if (request.mode === 'navigate') {
      const offlinePage = await caches.match('/offline.html');
      if (offlinePage) {
        return offlinePage;
      }
    }
    
    return new Response('Offline', {
      status: 503,
      statusText: 'Service Unavailable',
    });
  }
}

/**
 * Estratégia: Navigation Request com preload
 */
async function handleNavigationRequest(request) {
  try {
    // Tentar usar navigation preload primeiro
    const preloadResponse = await self.registration.navigationPreload.getState()
      .then((state) => state.enabled ? self.registration.navigationPreload.response : null)
      .catch(() => null);

    if (preloadResponse) {
      console.log('[SW] Using preload response');
      
      // Atualizar cache em background
      const cache = await caches.open(CACHES.pages);
      cache.put(request, preloadResponse.clone()).catch(() => {});
      
      return preloadResponse;
    }

    // Fallback para network first
    return await networkFirstStrategy(request, CACHES.pages, {
      timeout: 5000,
      maxAge: 24 * 60 * 60 * 1000,
    });

  } catch (error) {
    // Fallback para offline page
    const offlinePage = await caches.match('/offline.html');
    if (offlinePage) {
      return offlinePage;
    }
    
    throw error;
  }
}

/**
 * Estratégia: Cache First (Static assets, images, fonts)
 */
async function cacheFirstStrategy(request, cacheName, options = {}) {
  const { maxAge = Infinity } = options;
  
  // Tentar cache primeiro
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    // Verificar idade do cache
    const dateHeader = cachedResponse.headers.get('date');
    const cachedTime = dateHeader ? new Date(dateHeader).getTime() : 0;
    const now = Date.now();
    
    if (now - cachedTime < maxAge) {
      console.log('[SW] Cache hit:', request.url);
      
      // Atualizar em background se está ficando antigo (>50% maxAge)
      if (now - cachedTime > maxAge * 0.5) {
        updateCacheInBackground(request, cacheName);
      }
      
      return cachedResponse;
    }
  }

  // Se não há cache válido, buscar da rede
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone()).catch(() => {});
    }
    
    return networkResponse;
  } catch (error) {
    // Se rede falhar, retornar cache mesmo que antigo
    if (cachedResponse) {
      console.log('[SW] Network failed, using stale cache:', request.url);
      return cachedResponse;
    }
    
    throw error;
  }
}

/**
 * Estratégia: Network First (API, dynamic content)
 */
async function networkFirstStrategy(request, cacheName, options = {}) {
  const { timeout = 10000, maxAge = Infinity } = options;
  
  try {
    // Tentar rede com timeout
    const networkResponse = await fetchWithTimeout(request, timeout);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone()).catch(() => {});
    }
    
    console.log('[SW] Network response:', request.url);
    return networkResponse;

  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    
    // Fallback para cache
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      // Verificar idade
      const dateHeader = cachedResponse.headers.get('date');
      const cachedTime = dateHeader ? new Date(dateHeader).getTime() : 0;
      const now = Date.now();
      
      if (now - cachedTime < maxAge) {
        console.log('[SW] Cache hit (fallback):', request.url);
        return cachedResponse;
      }
    }
    
    throw error;
  }
}

/**
 * Estratégia: Stale While Revalidate (Best for frequently updated content)
 */
async function staleWhileRevalidateStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  // Buscar da rede e atualizar cache em background
  const fetchPromise = fetch(request).then(async (networkResponse) => {
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone()).catch(() => {});
    }
    return networkResponse;
  }).catch(() => null);

  // Retornar cache imediatamente se disponível
  if (cachedResponse) {
    console.log('[SW] Stale cache hit:', request.url);
    return cachedResponse;
  }

  // Se não há cache, aguardar rede
  return await fetchPromise || new Response('Not found', { status: 404 });
}

/**
 * Fetch com timeout
 */
function fetchWithTimeout(request, timeout) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('Request timeout'));
    }, timeout);

    fetch(request)
      .then((response) => {
        clearTimeout(timeoutId);
        resolve(response);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
}

/**
 * Atualizar cache em background sem bloquear
 */
function updateCacheInBackground(request, cacheName) {
  fetch(request)
    .then(async (response) => {
      if (response.ok) {
        const cache = await caches.open(cacheName);
        await cache.put(request, response);
        console.log('[SW] Background cache update:', request.url);
      }
    })
    .catch(() => {
      // Silenciar erros de background update
    });
}

// ================================================================
// MESSAGE EVENT - Commands from client
// ================================================================

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLAIM_CLIENTS') {
    self.clients.claim();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(clearAllCaches());
  }
});

/**
 * Limpar todos os caches
 */
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map((cacheName) => {
      console.log(`[SW] Clearing cache: ${cacheName}`);
      return caches.delete(cacheName);
    })
  );
  console.log('[SW] All caches cleared');
}

// ================================================================
// PUSH NOTIFICATION (Preparado para futuro)
// ================================================================

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'BizControl 360';
  const options = {
    body: data.body || 'Nova notificação',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    data: data.url || '/',
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data || '/')
  );
});

console.log(`[SW ${VERSION}] Loaded successfully`);
