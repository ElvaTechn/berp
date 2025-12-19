// Service Worker Customizado para BizControl 360
// Cache estratégico para modo offline

const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `bizcontrol-${CACHE_VERSION}`;

// Recursos críticos para funcionamento offline
const CRITICAL_ASSETS = [
  '/',
  '/dashboard',
  '/vendas',
  '/produtos',
  '/offline',
  '/manifest.json',
  '/_next/static/css/*.css',
  '/_next/static/chunks/*.js',
];

// Estratégias de cache
const CACHE_STRATEGIES = {
  // Cache First: Para assets estáticos
  cacheFirst: async (request) => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    if (cached) return cached;
    
    try {
      const response = await fetch(request);
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    } catch (error) {
      return new Response('Offline', { status: 503 });
    }
  },

  // Network First: Para dados dinâmicos
  networkFirst: async (request) => {
    try {
      const response = await fetch(request);
      if (response.ok) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, response.clone());
      }
      return response;
    } catch (error) {
      const cached = await caches.match(request);
      return cached || new Response('Offline', { status: 503 });
    }
  },

  // Stale While Revalidate: Para dados que podem estar desatualizados
  staleWhileRevalidate: async (request) => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    
    const fetchPromise = fetch(request).then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    });

    return cached || fetchPromise;
  },
};

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('🚀 Service Worker: Instalando...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('📦 Cache: Pré-carregando recursos críticos');
      return cache.addAll(CRITICAL_ASSETS.filter(url => !url.includes('*')));
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker: Ativado');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Cache: Removendo versão antiga', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Interceptação de requisições
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignora requisições que não são HTTP/HTTPS
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Ignora requisições de API durante sync
  if (url.pathname.startsWith('/api/offline-sync')) {
    return;
  }

  // Determina estratégia baseada no tipo de recurso
  let strategy;

  if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'image' ||
    request.destination === 'font'
  ) {
    // Cache First para assets estáticos
    strategy = CACHE_STRATEGIES.cacheFirst;
  } else if (url.pathname.startsWith('/api/')) {
    // Network First para APIs
    strategy = CACHE_STRATEGIES.networkFirst;
  } else {
    // Stale While Revalidate para páginas
    strategy = CACHE_STRATEGIES.staleWhileRevalidate;
  }

  event.respondWith(strategy(request));
});

// Background Sync para vendas offline
self.addEventListener('sync', (event) => {
  console.log('🔄 Background Sync: Iniciando...', event.tag);

  if (event.tag === 'sync-offline-sales') {
    event.waitUntil(syncOfflineSales());
  }
});

// Sincronização de vendas offline
async function syncOfflineSales() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();
    
    // Busca requisições pendentes de venda
    const pendingSales = keys.filter(request => 
      request.url.includes('/api/vendas') && 
      request.method === 'POST'
    );

    console.log(`📤 Sync: ${pendingSales.length} vendas pendentes`);

    for (const request of pendingSales) {
      try {
        const response = await fetch(request.clone());
        if (response.ok) {
          await cache.delete(request);
          console.log('✅ Sync: Venda sincronizada');
          
          // Notifica o cliente sobre sucesso
          self.clients.matchAll().then(clients => {
            clients.forEach(client => {
              client.postMessage({
                type: 'SYNC_SUCCESS',
                message: 'Venda sincronizada com sucesso!'
              });
            });
          });
        }
      } catch (error) {
        console.error('❌ Sync: Erro ao sincronizar venda', error);
      }
    }
  } catch (error) {
    console.error('❌ Sync: Erro geral', error);
    throw error; // Retry sync later
  }
}

// Notificações Push (futuro)
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  
  const options = {
    body: data.body || 'Nova atualização disponível',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    vibrate: [200, 100, 200],
    data: data,
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'BizControl 360', options)
  );
});

// Mensagens do cliente
self.addEventListener('message', (event) => {
  console.log('💬 Mensagem recebida:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(event.data.urls);
      })
    );
  }
});

console.log('🎯 Service Worker: Carregado e pronto!');
