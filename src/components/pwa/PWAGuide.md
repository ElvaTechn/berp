/*
╔═══════════════════════════════════════════════════════════════════════════╗
║           BIZCONTROL 360 - GUIA COMPLETO DE IMPLEMENTAÇÃO PWA             ║
║               Progressive Web App com Modo Offline                         ║
╚═══════════════════════════════════════════════════════════════════════════╝

⚠️  AVISO IMPORTANTE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
A implementação COMPLETA de PWA com todas as funcionalidades solicitadas 
requer mudanças na infraestrutura da plataforma Base44 que NÃO podem ser 
feitas diretamente através deste chat.

Este guia documenta TUDO que precisa ser implementado, mas requer:
  1. Acesso ao servidor/backend da Base44
  2. Configuração de Service Workers
  3. Setup de Push Notifications (VAPID keys)
  4. Configuração do build (Vite PWA Plugin)
  5. IndexedDB para offline storage
  6. Background Sync API setup


📋 O QUE JÁ FOI PREPARADO NESTE PROJETO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Componente PWAInstallPrompt (prompt de instalação)
✅ Componente OfflineIndicator (indicador de conexão)
✅ App já é responsivo para mobile
✅ UI otimizada para touch


🚧 O QUE PRECISA SER IMPLEMENTADO PELA PLATAFORMA BASE44:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


1️⃣ MANIFEST.JSON (Arquivo na raiz do projeto)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Criar arquivo: public/manifest.json

{
  "name": "BizControl 360 - Gestão Empresarial",
  "short_name": "BizControl 360",
  "description": "Sistema completo de gestão empresarial para Moçambique",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0f172a",
  "theme_color": "#2563eb",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/dashboard.png",
      "sizes": "1280x720",
      "type": "image/png"
    },
    {
      "src": "/screenshots/pos.png",
      "sizes": "1280x720",
      "type": "image/png"
    }
  ],
  "categories": ["business", "productivity", "finance"],
  "lang": "pt-MZ",
  "scope": "/",
  "prefer_related_applications": false
}


Adicionar no index.html:

<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#2563eb">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="BizControl 360">
<link rel="apple-touch-icon" href="/icons/icon-192x192.png">


2️⃣ SERVICE WORKER (Arquivo na raiz)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Criar arquivo: public/sw.js

const CACHE_NAME = 'bizcontrol-v1';
const RUNTIME_CACHE = 'bizcontrol-runtime';
const DATA_CACHE = 'bizcontrol-data';

// Assets estáticos para cachear (Cache-First)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  // Adicionar todos os JS/CSS bundles
];

// Install: Cachear assets estáticos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: Limpar caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && 
              cacheName !== RUNTIME_CACHE && 
              cacheName !== DATA_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: Estratégias de cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Cache-First para assets estáticos
  if (request.destination === 'style' || 
      request.destination === 'script' || 
      request.destination === 'image') {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        return cachedResponse || fetch(request).then((response) => {
          return caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, response.clone());
            return response;
          });
        });
      })
    );
    return;
  }

  // Network-First com Fallback para API calls
  if (url.pathname.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(DATA_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }

  // Stale-While-Revalidate para dashboards
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request).then((networkResponse) => {
        caches.open(RUNTIME_CACHE).then((cache) => {
          cache.put(request, networkResponse.clone());
        });
        return networkResponse;
      });
      return cachedResponse || fetchPromise;
    })
  );
});

// Background Sync: Sincronizar dados offline
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-sales') {
    event.waitUntil(syncOfflineSales());
  }
  if (event.tag === 'sync-products') {
    event.waitUntil(syncOfflineProducts());
  }
});

async function syncOfflineSales() {
  // Implementar lógica de sincronização de vendas
  const db = await openIndexedDB();
  const offlineSales = await db.getAllFromStore('offlineSales');
  
  for (const sale of offlineSales) {
    try {
      await fetch('/api/sales', {
        method: 'POST',
        body: JSON.stringify(sale),
        headers: { 'Content-Type': 'application/json' }
      });
      await db.deleteFromStore('offlineSales', sale.id);
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }
}

// Push Notifications
self.addEventListener('push', (event) => {
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: data.data,
    actions: [
      { action: 'view', title: 'Ver' },
      { action: 'close', title: 'Fechar' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});


3️⃣ INDEXEDDB PARA ARMAZENAMENTO OFFLINE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Criar: utils/indexedDB.js

export class OfflineDB {
  constructor() {
    this.dbName = 'BizControl360';
    this.version = 1;
  }

  async open() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Object stores
        if (!db.objectStoreNames.contains('offlineSales')) {
          db.createObjectStore('offlineSales', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('products')) {
          db.createObjectStore('products', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('categories')) {
          db.createObjectStore('categories', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('reservations')) {
          db.createObjectStore('reservations', { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  async saveOfflineSale(sale) {
    const db = await this.open();
    const transaction = db.transaction(['offlineSales'], 'readwrite');
    const store = transaction.objectStore('offlineSales');
    
    return new Promise((resolve, reject) => {
      const request = store.add({
        ...sale,
        offline: true,
        timestamp: Date.now()
      });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getOfflineSales() {
    const db = await this.open();
    const transaction = db.transaction(['offlineSales'], 'readonly');
    const store = transaction.objectStore('offlineSales');
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async cacheProducts(products) {
    const db = await this.open();
    const transaction = db.transaction(['products'], 'readwrite');
    const store = transaction.objectStore('products');
    
    products.forEach(product => store.put(product));
    
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async getProducts() {
    const db = await this.open();
    const transaction = db.transaction(['products'], 'readonly');
    const store = transaction.objectStore('products');
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}


4️⃣ VITE PWA PLUGIN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Instalar:
npm install vite-plugin-pwa workbox-window -D

Adicionar no vite.config.js:

import { VitePWA } from 'vite-plugin-pwa'

export default {
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'icons/*.png'],
      manifest: {
        // Usar o manifest.json criado acima
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.base44\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ]
}


5️⃣ PUSH NOTIFICATIONS BACKEND
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A. Gerar VAPID Keys (no servidor):

npm install web-push

const webpush = require('web-push');
const vapidKeys = webpush.generateVAPIDKeys();
console.log(vapidKeys);

B. Configurar no Backend:

webpush.setVapidDetails(
  'mailto:seu-email@base44.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

C. Endpoint para subscrição:

POST /api/push/subscribe
{
  "endpoint": "...",
  "keys": {
    "p256dh": "...",
    "auth": "..."
  }
}

D. Enviar notificação:

webpush.sendNotification(subscription, JSON.stringify({
  title: '🔔 Nova Venda Registada',
  body: 'Venda de 1,500 MT no Ponto de Venda',
  data: {
    url: '/sales/123'
  }
}));


6️⃣ TIPOS DE NOTIFICAÇÕES A IMPLEMENTAR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

VENDEDOR:
  ✅ Venda sincronizada com sucesso
  ⚠️ Produto com stock baixo
  ❌ Produto esgotado
  📦 Novo produto adicionado pelo gestor
  💰 Preço de produto atualizado

GESTOR:
  🔔 Nova venda registada (tempo real)
  📊 Relatório diário pronto (às 23:59)
  ⚠️ Alerta crítico: produto em falta
  💰 Meta de vendas atingida
  👤 Novo vendedor cadastrado
  🔄 Sincronização concluída (múltiplas vendas offline)
  ⚠️ Stock mínimo atingido

SUPER ADMIN:
  🏢 Nova empresa cadastrada
  💳 Pagamento de subscrição recebido
  ⏰ Subscrição próxima do vencimento (7 dias)
  ❌ Subscrição expirada


7️⃣ PERFORMANCE TARGETS (LIGHTHOUSE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Performance Score: >90
✅ PWA Score: 100
✅ Accessibility Score: >90
✅ Best Practices Score: >90
✅ SEO Score: >90

Core Web Vitals:
  • LCP (Largest Contentful Paint): <2.5s
  • FID (First Input Delay): <100ms
  • CLS (Cumulative Layout Shift): <0.1
  • TTI (Time to Interactive): <3.5s
  • FCP (First Contentful Paint): <1.8s


8️⃣ SEGURANÇA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ HTTPS obrigatório em produção
✓ Content Security Policy (CSP)
✓ JWT tokens com refresh token rotation
✓ Tokens em IndexedDB (não localStorage)
✓ Logout automático após inatividade (30 min)
✓ Criptografia de dados sensíveis (Web Crypto API)


📝 CHECKLIST DE IMPLEMENTAÇÃO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Backend:
  ☐ Gerar VAPID keys
  ☐ Criar endpoints de push notifications
  ☐ Implementar background sync endpoints
  ☐ Configurar rate limiting
  ☐ Setup de HTTPS

Frontend:
  ☐ Adicionar manifest.json
  ☐ Criar service worker
  ☐ Implementar IndexedDB wrapper
  ☐ Adicionar componente de instalação PWA
  ☐ Criar indicador offline
  ☐ Testar em múltiplos dispositivos

Build:
  ☐ Instalar vite-plugin-pwa
  ☐ Configurar workbox
  ☐ Gerar ícones em todos os tamanhos
  ☐ Otimizar bundle size
  ☐ Setup de code splitting

Testing:
  ☐ Testar offline completo
  ☐ Testar sincronização
  ☐ Testar notificações
  ☐ Lighthouse audit
  ☐ Testar em iOS/Android


🔗 RECURSOS ÚTEIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• PWA Builder: https://www.pwabuilder.com/
• Workbox Docs: https://developers.google.com/web/tools/workbox
• Web Push Protocol: https://web.dev/push-notifications/
• IndexedDB Guide: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
• Lighthouse: https://developers.google.com/web/tools/lighthouse


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              Este guia deve ser usado pela equipa Base44 para
              implementar PWA completo no BizControl 360
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

*/

export default function PWAGuide() {
  return null;
}