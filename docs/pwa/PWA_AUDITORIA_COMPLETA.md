# Auditoria PWA - BIZ360 ERP
**Data:** 29 Dezembro 2025  
**Versão:** 2.0.0  
**Auditor:** Letta Code Agent

---

## 📊 Resumo Executivo

| Métrica | Valor |
|---------|-------|
| **Total de Issues** | 28 |
| **Críticas** | 6 |
| **Altas** | 8 |
| **Médias** | 10 |
| **Baixas** | 4 |
| **Status Geral** | ⚠️ AÇÃO NECESSÁRIA |

---

## 🔴 Issues Críticas (6)

### 1. Service Worker Nunca Registrado
**Arquivo:** `Nenhum arquivo de registro encontrado`  
**Severidade:** 🔴 CRÍTICA  
**Impacto:** O Service Worker nunca é registrado, então o PWA não funciona

**Problema:**
- Não há código que registre o service worker em nenhum componente
- O arquivo `public/sw.js` existe mas nunca é ativado
- next-pwa está configurado em `next.config.js` mas desabilitado em desenvolvimento

**Como Reproduzir:**
1. Abrir DevTools → Application → Service Workers
2. Verificar que nenhum service worker está registrado
3. Tentar instalar o app - falha

**Correção:**
Criar arquivo `src/app/register-sw.tsx` (client component):

```typescript
"use client";

import { useEffect } from 'react';

export function RegisterServiceWorker() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'production'
    ) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registrado:', registration.scope);
          
          // Verificar updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // Nova versão disponível
                  if (confirm('Nova versão disponível. Atualizar agora?')) {
                    newWorker.postMessage({ type: 'SKIP_WAITING' });
                    window.location.reload();
                  }
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('❌ Erro ao registrar Service Worker:', error);
        });

      // Recarregar quando novo SW assumir controle
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }
  }, []);

  return null;
}
```

E adicionar ao `src/app/layout.tsx`:
```typescript
import { RegisterServiceWorker } from './register-sw';

export default async function RootLayout({ children }) {
  return (
    <html lang="pt-MZ">
      <body>
        <RegisterServiceWorker />
        {/* ... resto do código */}
      </body>
    </html>
  );
}
```

---

### 2. Manifest.json Não Linkado no HTML
**Arquivo:** `src/app/layout.tsx`  
**Linha:** N/A (faltando)  
**Severidade:** 🔴 CRÍTICA  
**Impacto:** Navegador não detecta que é um PWA instalável

**Problema:**
O arquivo `public/manifest.json` existe mas não está linkado no `<head>` do HTML.

**Correção:**
Adicionar ao `src/app/layout.tsx` dentro do `<html>`:

```typescript
export const metadata: Metadata = {
  title: 'BIZ360 | Enterprise ERP',
  description: 'Corporate Management System for High-Performance Teams',
  manifest: '/manifest.json', // ← ADICIONAR
  themeColor: '#000000',       // ← ADICIONAR
  appleWebApp: {               // ← ADICIONAR
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'BizControl 360',
  },
  icons: {                     // ← ADICIONAR
    icon: '/icons/icon-192x192.png',
    apple: '/icons/icon-192x192.png',
  },
};
```

---

### 3. Screenshots do Manifest Não Existem
**Arquivo:** `public/manifest.json`  
**Linhas:** 60-75  
**Severidade:** 🔴 CRÍTICA  
**Impacto:** Instalação falha em alguns browsers (Chrome Android mostra erro)

**Problema:**
```json
"screenshots": [
  {
    "src": "/screenshots/dashboard.png",  // ← NÃO EXISTE
    "src": "/screenshots/mobile.png",     // ← NÃO EXISTE
```

**Como Reproduzir:**
1. Verificar `public/screenshots/` - pasta não existe
2. Tentar instalar no Android Chrome - mostra warning

**Correção:**
Opção 1 - Remover screenshots do manifest:
```json
{
  "name": "BizControl 360",
  "short_name": "BizControl",
  // ... outros campos
  // REMOVER seção "screenshots" completamente
}
```

Opção 2 - Criar screenshots reais:
1. Capturar tela do dashboard em 1280x720 (desktop)
2. Capturar tela mobile em 750x1334
3. Salvar em `public/screenshots/`

---

### 4. Ícones PNG Faltando
**Arquivo:** `public/icons/`  
**Severidade:** 🔴 CRÍTICA  
**Impacto:** Ícones não aparecem ao instalar, especialmente em iOS

**Problema:**
Manifest referencia ícones PNG mas a maioria são SVG:
```
✅ icon-192x192.png (existe)
✅ icon-512x512.png (existe)
❌ icon-72x72.png (é SVG)
❌ icon-96x96.png (é SVG)
❌ icon-128x128.png (é SVG)
❌ icon-144x144.png (é SVG)
❌ icon-152x152.png (é SVG)
❌ icon-384x384.png (é SVG)
```

**Correção:**
Converter todos os SVG para PNG usando ferramentas:
```bash
# Usando ImageMagick
convert icon-72x72.svg -resize 72x72 icon-72x72.png
convert icon-96x96.svg -resize 96x96 icon-96x96.png
convert icon-128x128.svg -resize 128x128 icon-128x128.png
convert icon-144x144.svg -resize 144x144 icon-144x144.png
convert icon-152x152.svg -resize 152x152 icon-152x152.png
convert icon-384x384.svg -resize 384x384 icon-384x384.png
```

Ou atualizar manifest.json para usar SVG:
```json
{
  "src": "/icons/icon-72x72.svg",
  "sizes": "72x72",
  "type": "image/svg+xml",  // ← Mudar de "image/png"
  "purpose": "any maskable"
}
```

---

### 5. Página Offline Não Existe
**Arquivo:** `public/sw.js`  
**Linha:** 29, 358  
**Severidade:** 🔴 CRÍTICA  
**Impacto:** Usuários veem erro genérico quando offline

**Problema:**
Service worker tenta cachear e servir `/offline` mas arquivo não existe:
```javascript
const STATIC_ASSETS = [
  '/',
  '/login',
  '/dashboard',
  '/offline',  // ← NÃO EXISTE
```

**Correção:**
Criar `public/offline.html`:

```html
<!DOCTYPE html>
<html lang="pt-MZ">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Offline - BizControl 360</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }
    .container {
      text-align: center;
      padding: 2rem;
      max-width: 500px;
    }
    .icon {
      font-size: 4rem;
      margin-bottom: 1rem;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    h1 { font-size: 2rem; margin-bottom: 1rem; }
    p { font-size: 1.1rem; opacity: 0.9; margin-bottom: 2rem; }
    .btn {
      background: white;
      color: #667eea;
      padding: 1rem 2rem;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      display: inline-block;
      transition: transform 0.2s;
    }
    .btn:hover { transform: scale(1.05); }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">📡</div>
    <h1>Sem Conexão</h1>
    <p>Você está offline. Conecte-se à internet para continuar usando o BizControl 360.</p>
    <a href="/dashboard" class="btn" onclick="window.location.reload(); return false;">
      Tentar Novamente
    </a>
  </div>
  <script>
    // Auto-reload quando voltar online
    window.addEventListener('online', () => {
      window.location.href = '/dashboard';
    });
  </script>
</body>
</html>
```

---

### 6. BackgroundSyncManager.updateCache Não Existe
**Arquivo:** `public/sw.js`  
**Linha:** 186  
**Severidade:** 🔴 CRÍTICA  
**Impacto:** Service Worker crasha ao executar cache-first

**Problema:**
```javascript
// Linha 186
BackgroundSyncManager.updateCache(request);  // ← MÉTODO NÃO EXISTE
```

A classe `BackgroundSyncManager` não tem método `updateCache`, mas é chamado em `CacheStrategyManager.handleCacheFirst()`.

**Correção:**
Remover chamada ou implementar método:

```javascript
class BackgroundSyncManager {
  // ... código existente
  
  /**
   * Atualizar cache em background (ADICIONAR)
   */
  static async updateCache(request: Request): Promise<void> {
    try {
      const response = await fetch(request);
      if (response.ok) {
        const cache = await caches.open(STATIC_CACHE);
        await cache.put(request, response);
      }
    } catch (error) {
      // Silenciar erro de background update
      console.debug('Background cache update failed:', error);
    }
  }
}
```

---

## 🟠 Issues de Alta Prioridade (8)

### 7. next-pwa Desabilitado em Desenvolvimento
**Arquivo:** `next.config.js`  
**Linha:** 5  
**Severidade:** 🟠 ALTA  
**Impacto:** Impossível testar PWA localmente

**Problema:**
```javascript
disable: process.env.NODE_ENV === 'development',  // ← PWA desabilitado
```

**Correção:**
Permitir ativar PWA em dev com variável de ambiente:

```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development' && !process.env.ENABLE_PWA_DEV,
  // ...
});
```

Adicionar ao `.env.local`:
```bash
ENABLE_PWA_DEV=true  # Para testar PWA localmente
```

---

### 8. Webpack Duplicado em next.config.js
**Arquivo:** `next.config.js`  
**Linhas:** 142-153, 166-177, 179-194  
**Severidade:** 🟠 ALTA  
**Impacto:** Configuração webpack conflitante, build pode falhar

**Problema:**
Webpack configurado 3 vezes com mesma lógica:
```javascript
// Linha 142
webpack: (config, { dev, isServer }) => { ... }

// Linha 166 (duplicado)
webpack: (config, { dev, isServer }) => { ... }

// Linha 179 (triplicado)
webpack: (config, { dev, isServer }) => { ... }
```

**Correção:**
Consolidar em uma única função:

```javascript
const nextConfig = {
  // ... outras configs
  
  // Webpack (ÚNICO)
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'fs': false,
        'path': false,
      };
    }
    return config;
  },
};
```

---

### 9. Service Worker com Erro de Sintaxe
**Arquivo:** `public/sw.js`  
**Linha:** 16  
**Severidade:** 🟠 ALTA  
**Impacto:** Service Worker falha ao carregar

**Problema:**
```javascript
// ================================================================
 * CACHE STORAGE STRATEGY     // ← Asterisco órfão, erro de sintaxe
// ================================================================
```

**Correção:**
```javascript
// ================================================================
// CACHE STORAGE STRATEGY
// ================================================================
```

---

### 10. useOfflineSync Hook Depende de Módulo Inexistente
**Arquivo:** `src/components/pwa/PWALayout.tsx`  
**Linha:** 6  
**Severidade:** 🟠 ALTA  
**Impacto:** Componente PWALayout crasha

**Problema:**
```typescript
import { useOfflineSync } from '@/hooks/useOfflineSync';  // ✅ Existe
const { isOnline, pendingCount } = useOfflineSync();
```

Mas o hook `useOfflineSync` depende de:
```typescript
import { ERPNotifications } from '@/lib/notifications/notificationService';  // ❌ NÃO EXISTE
```

**Como Reproduzir:**
1. Renderizar `<PWALayout />`
2. Erro: "Module not found: @/lib/notifications/notificationService"

**Correção:**
Criar `src/lib/notifications/notificationService.ts`:

```typescript
import { toast } from 'sonner';

export class ERPNotifications {
  static sincronizacaoSucesso(count: number): void {
    toast.success('Sincronização concluída', {
      description: `${count} ${count === 1 ? 'item sincronizado' : 'itens sincronizados'}`,
    });
  }

  static erroSincronizacao(message: string): void {
    toast.error('Erro de sincronização', {
      description: message,
    });
  }

  static vendaSalvaOffline(): void {
    toast.info('Venda salva offline', {
      description: 'Será sincronizada quando voltar online',
    });
  }
}
```

---

### 11. SyncButton Importa Toast Inexistente
**Arquivo:** `src/components/pwa/SyncButton.tsx`  
**Linha:** 6  
**Severidade:** 🟠 ALTA  
**Impacto:** SyncButton crasha

**Problema:**
```typescript
import { toast } from '@/components/ui/toast';  // ❌ Exportação errada
```

O arquivo `src/components/ui/toast.tsx` exporta componentes React, não função `toast()`.

**Correção:**
Mudar para:
```typescript
import { toast } from 'sonner';  // ✅ Biblioteca correta
```

---

### 12. API Endpoints Pré-Cache Podem Falhar
**Arquivo:** `public/sw.js`  
**Linhas:** 36-40, 299-307  
**Severidade:** 🟠 ALTA  
**Impacto:** Install event falha se APIs precisarem autenticação

**Problema:**
```javascript
const API_ENDPOINTS = [
  '/api/products',    // ← Requer autenticação
  '/api/employees',   // ← Requer autenticação
  '/api/categories',  // ← Requer autenticação
];

// Install event tenta cachear sem token
await apiCache.add(endpoint);  // ← Retorna 401 Unauthorized
```

**Correção:**
Não fazer pré-cache de APIs autenticadas no install:

```javascript
// Remover pré-cache de API do install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(STATIC_CACHE);
        await cache.addAll(STATIC_ASSETS);
        
        // NÃO cachear APIs aqui - será feito no primeiro fetch com auth
        
      } catch (error) {
        console.error('Service worker install error:', error);
      }
    })()
  );
});
```

---

### 13. start_url Aponta para /dashboard Sem Autenticação
**Arquivo:** `public/manifest.json`  
**Linha:** 5  
**Severidade:** 🟠 ALTA  
**Impacto:** Usuário instalado vai direto para dashboard, mas é redirecionado para login

**Problema:**
```json
"start_url": "/dashboard",  // ← Página protegida
```

Se usuário não estiver logado, será redirecionado para `/login`, causando confusão.

**Correção:**
Mudar para root que redireciona corretamente:
```json
"start_url": "/?source=pwa",
```

E no código de roteamento detectar:
```typescript
// src/middleware.ts ou página
if (searchParams.get('source') === 'pwa') {
  // Usuário veio do PWA instalado
  if (!session) return redirect('/login?pwa=true');
  return redirect('/dashboard?welcome=true');
}
```

---

### 14. Falta SKIP_WAITING no Service Worker
**Arquivo:** `public/sw.js`  
**Severidade:** 🟠 ALTA  
**Impacto:** Updates do SW não são ativados automaticamente

**Problema:**
Configuração tem `skipWaiting: true` em next.config.js, mas o service worker manual não implementa:

```javascript
self.addEventListener('install', (event) => {
  // Falta: self.skipWaiting();
});
```

**Correção:**
```javascript
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);
      await cache.addAll(STATIC_ASSETS);
      
      // ✅ ADICIONAR - Ativar novo SW imediatamente
      await self.skipWaiting();
    })()
  );
});

// ✅ ADICIONAR - Listener para mensagens de update
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
```

---

## 🟡 Issues de Média Prioridade (10)

### 15. STATIC_ASSETS Inclui Favicon que Pode Não Existir
**Arquivo:** `public/sw.js`  
**Linha:** 30  
**Severidade:** 🟡 MÉDIA

**Problema:**
```javascript
const STATIC_ASSETS = [
  '/favicon.ico',  // ← Pode não existir ou ter nome diferente
```

**Correção:**
Verificar se favicon existe e corrigir nome.

---

### 16. Cache Names Sem Max-Age
**Arquivo:** `public/sw.js`  
**Linhas:** 19-22  
**Severidade:** 🟡 MÉDIA  
**Impacto:** Cache pode crescer indefinidamente

**Problema:**
Caches não têm limite de tempo, apenas de quantidade.

**Correção:**
Implementar limpeza de cache antigo:
```javascript
// No activate event
const CACHE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 dias

async function cleanOldCaches() {
  const cacheNames = await caches.keys();
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();
    
    for (const request of requests) {
      const response = await cache.match(request);
      const dateHeader = response?.headers.get('date');
      
      if (dateHeader) {
        const cacheDate = new Date(dateHeader).getTime();
        if (Date.now() - cacheDate > CACHE_MAX_AGE) {
          await cache.delete(request);
        }
      }
    }
  }
}
```

---

### 17. Inconsistência de Nomes: BizControl vs BIZ360
**Arquivos:** Vários  
**Severidade:** 🟡 MÉDIA  
**Impacto:** Confusão de branding

**Problema:**
- manifest.json: "BizControl 360"
- layout.tsx metadata: "BIZ360"
- Service Worker comments: "BIZCONTROL 360"
- IndexedDB name: "BizControl360_v2"

**Correção:**
Padronizar para um único nome em todos os arquivos.

---

### 18. PWALayout Não É Usado em layout.tsx
**Arquivo:** `src/app/layout.tsx`  
**Severidade:** 🟡 MÉDIA  
**Impacto:** Componentes PWA (InstallPrompt, OfflineBanner) não são renderizados

**Problema:**
```typescript
// layout.tsx não importa PWALayout
// InstallPrompt e OfflineBanner nunca aparecem
```

**Correção:**
```typescript
import PWALayout from '@/components/pwa/PWALayout';

export default async function RootLayout({ children }) {
  return (
    <html lang="pt-MZ">
      <body>
        <ThemeProvider>
          <AuthProvider initialUser={initialUser}>
            <PWALayout>  {/* ← ADICIONAR */}
              <ClientLayout user={initialUser}>
                {children}
              </ClientLayout>
            </PWALayout>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

---

### 19. TypeScript Errors em sw.js
**Arquivo:** `public/sw.js`  
**Linhas:** 13, 50  
**Severidade:** 🟡 MÉDIA

**Problema:**
Arquivo usa sintaxe TypeScript mas extensão é `.js`:
```javascript
declare const self: ServiceWorkerGlobalScope;  // ← TypeScript em .js
```

**Correção:**
Opção 1 - Remover tipos:
```javascript
// Remover linha 13 completamente
```

Opção 2 - Renomear para `.ts` e compilar:
- Renomear para `sw.ts`
- Configurar build para compilar para `public/sw.js`

---

### 20. Sync Event Handler Usa Tipo Errado
**Arquivo:** `public/sw.js`  
**Linha:** 50  
**Severidade:** 🟡 MÉDIA

**Problema:**
```javascript
static async handleSync(event: ExtendableMessageEvent) // ← Tipo errado
```

Deve ser `SyncEvent`, não `ExtendableMessageEvent`.

**Correção:**
```javascript
static async handleSync(event: any): Promise<void> {
  if (event.tag === 'background-sync') {
```

---

### 21. localStorage Usado para Auth Token
**Arquivo:** `src/components/pwa/SyncButton.tsx`  
**Linha:** 46  
**Severidade:** 🟡 MÉDIA  
**Impacto:** Risco de segurança XSS

**Problema:**
```typescript
'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
```

Tokens em localStorage são vulneráveis a XSS.

**Correção:**
Usar httpOnly cookies ou mover para contexto seguro.

---

### 22. Push Notifications Sem Permissão
**Arquivo:** `public/sw.js`  
**Linhas:** 397-414  
**Severidade:** 🟡 MÉDIA

**Problema:**
Service Worker tenta mostrar notificações sem verificar permissão:
```javascript
self.addEventListener('push', (event) => {
  // Não verifica se usuário deu permissão
  self.registration.showNotification(...);
});
```

**Correção:**
Adicionar verificação de permissão no frontend antes de enviar push.

---

### 23. Dependência Circular em Hooks
**Arquivo:** `src/hooks/useOfflineSync.ts`  
**Linhas:** 146  
**Severidade:** 🟡 MÉDIA

**Problema:**
```typescript
useEffect(() => {
  // ...
}, [pendingCount, isSyncing, handleSync, handleCancel]);
```

`handleSync` e `handleCancel` são dependências mas dependem de outras variáveis.

**Correção:**
Usar `useCallback` com deps corretos ou remover das dependências.

---

### 24. IndexedDB Não Verifica Quota
**Arquivo:** `src/lib/pwa/indexedDB.ts`  
**Severidade:** 🟡 MÉDIA

**Problema:**
Não verifica se há espaço antes de adicionar ao cache.

**Correção:**
```typescript
async function checkQuota(): Promise<boolean> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const { usage, quota } = await navigator.storage.estimate();
    const percentUsed = (usage! / quota!) * 100;
    
    if (percentUsed > 90) {
      console.warn('Storage quase cheio:', percentUsed.toFixed(2) + '%');
      return false;
    }
  }
  return true;
}
```

---

## 🔵 Issues de Baixa Prioridade (4)

### 25. Console.logs em Produção
**Arquivos:** Vários  
**Severidade:** 🔵 BAIXA

**Problema:**
Muitos `console.log` e `console.error` em código de produção.

**Correção:**
Usar logger condicional ou remover em build.

---

### 26. Comentários em Português e Inglês Misturados
**Arquivos:** Todos  
**Severidade:** 🔵 BAIXA

**Problema:**
Inconsistência linguística em comentários.

**Correção:**
Padronizar para um idioma (preferencialmente inglês no código).

---

### 27. Falta Meta Tags para iOS
**Arquivo:** `src/app/layout.tsx`  
**Severidade:** 🔵 BAIXA

**Problema:**
Faltam meta tags específicas para iOS PWA:
```html
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
```

**Correção:**
Adicionar ao metadata.

---

### 28. Versão Hardcoded em Vários Lugares
**Arquivos:** sw.js, indexedDB.ts  
**Severidade:** 🔵 BAIXA

**Problema:**
Versão "v2-0-0" / "v2.0.0" hardcoded em múltiplos locais.

**Correção:**
Centralizar em constante ou ler de package.json.

---

## ✅ Verificações Que Passaram

1. ✅ Manifest.json é JSON válido
2. ✅ Ícones 192x192 e 512x512 existem (PNG)
3. ✅ Theme colors definidos (preto)
4. ✅ Display mode "standalone" configurado
5. ✅ Shortcuts definidos corretamente
6. ✅ Categories adequadas: business, finance, productivity
7. ✅ Language e direction corretos (pt-MZ, ltr)
8. ✅ IndexedDB bem estruturado com stores corretos
9. ✅ Offline sync implementado com retry logic
10. ✅ Cache strategies diversificadas (Cache First, Network First, SWR)
11. ✅ Background sync configurado
12. ✅ Dependencies corretas no package.json (next-pwa, workbox)
13. ✅ TypeScript strict mode habilitado
14. ✅ Security headers configurados no Next.js
15. ✅ HTTPS enforcement em produção

---

## 📋 Checklist de Correções Prioritárias

### Fase 1 - Crítico (Fazer AGORA)
- [ ] **#1** - Registrar Service Worker em layout
- [ ] **#2** - Linkar manifest.json no metadata
- [ ] **#3** - Remover screenshots ou criar arquivos
- [ ] **#4** - Converter ícones SVG para PNG
- [ ] **#5** - Criar página offline.html
- [ ] **#6** - Implementar BackgroundSyncManager.updateCache

### Fase 2 - Alta Prioridade (Esta Semana)
- [ ] **#7** - Permitir PWA em desenvolvimento
- [ ] **#8** - Consolidar configuração webpack
- [ ] **#9** - Corrigir sintaxe em sw.js
- [ ] **#10** - Criar notificationService
- [ ] **#11** - Corrigir import de toast
- [ ] **#12** - Remover pré-cache de APIs autenticadas
- [ ] **#13** - Ajustar start_url
- [ ] **#14** - Adicionar skipWaiting

### Fase 3 - Melhorias (Próximo Sprint)
- [ ] **#15-24** - Issues de média prioridade
- [ ] **#25-28** - Polimento e boas práticas

---

## 🧪 Testes Recomendados

### Teste 1: Instalabilidade
```bash
1. Build de produção: npm run build
2. Servir: npm start
3. Abrir Chrome DevTools → Lighthouse
4. Run "Progressive Web App" audit
5. Score deve ser > 90
```

### Teste 2: Offline
```bash
1. Abrir app
2. DevTools → Network → Offline
3. Recarregar página
4. Deve mostrar página offline customizada
5. Vendas devem ser salvas localmente
```

### Teste 3: Instalação Real
```bash
1. Android Chrome: Clicar "Add to Home Screen"
2. iOS Safari: Compartilhar → "Add to Home Screen"
3. Desktop Chrome: Ícone de instalação na barra de URL
```

### Teste 4: Service Worker
```bash
1. DevTools → Application → Service Workers
2. Verificar status "activated and running"
3. Testar Update on reload
4. Verificar caches em Cache Storage
```

---

## 📈 Recomendações de Performance

1. **Lazy Loading de Componentes PWA**
   ```typescript
   const PWALayout = dynamic(() => import('@/components/pwa/PWALayout'), {
     ssr: false,
   });
   ```

2. **Precache Seletivo**
   - Não cachear todas as páginas no install
   - Usar runtime caching para a maioria

3. **IndexedDB Pagination**
   - Não carregar toda fila de sync de uma vez
   - Implementar cursor-based iteration

4. **Web Workers para Sync Pesado**
   - Mover sync logic para Web Worker
   - Não bloquear main thread

---

## 🔐 Recomendações de Segurança

1. **Não Cachear Dados Sensíveis**
   ```javascript
   // NÃO cachear:
   - Tokens de autenticação
   - Dados bancários
   - Informações pessoais de clientes
   ```

2. **CSP Headers**
   ```javascript
   'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-eval';"
   ```

3. **Validar Origin em Service Worker**
   ```javascript
   if (new URL(request.url).origin !== self.location.origin) {
     return fetch(request);  // Não cachear cross-origin
   }
   ```

---

## 📞 Próximos Passos

1. **Implementar correções críticas** (#1-6)
2. **Testar em dispositivos reais**
   - Android (Chrome, Samsung Internet)
   - iOS (Safari)
   - Desktop (Chrome, Edge, Firefox)
3. **Executar Lighthouse audit**
4. **Monitorar métricas PWA** no Google Analytics
5. **Documentar fluxo de instalação** para usuários

---

**Fim do Relatório**  
*Gerado automaticamente por Letta Code Agent*
