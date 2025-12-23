# 📱 Guia Completo: PWA com Modo Offline

## 🎯 Visão Geral

Sistema Progressive Web App (PWA) completo com funcionalidade offline, sincronização automática e cache inteligente.

## ✨ Funcionalidades Implementadas

### 1. 🔧 Service Worker Customizado
- **Arquivo**: `public/sw.js`
- **Estratégias de Cache**:
  - Cache First: Assets estáticos (CSS, JS, imagens, fonts)
  - Network First: APIs e dados dinâmicos
  - Stale While Revalidate: Páginas HTML
- **Background Sync**: Sincronização automática de vendas offline
- **Cache Versioning**: Limpeza automática de caches antigos

### 2. 📡 Detecção de Status Online/Offline
- **Hook**: `src/hooks/useOffline.ts`
- **Funcionalidades**:
  - Detecção de conexão (navigator.onLine)
  - Network Information API (tipo de conexão, velocidade)
  - Eventos customizados (app-online, app-offline)
  - Verificação periódica de fallback

### 3. 📦 Fila de Sincronização Offline
- **Biblioteca**: `src/lib/offline-queue.ts`
- **Hook React**: `src/hooks/useOfflineQueue.ts`
- **Funcionalidades**:
  - Armazenamento de operações em localStorage
  - Sincronização automática quando volta online
  - Sistema de retry (até 3 tentativas)
  - Estados: pending, syncing, failed, success
  - Suporte para: vendas, produtos, clientes, pagamentos

### 4. 🎨 Indicador Visual de Status
- **Componente**: `src/components/offline/OfflineIndicator.tsx`
- **Features**:
  - Badge flutuante com status online/offline
  - Painel de detalhes expandível
  - Notificações toast de sincronização
  - Estatísticas da fila em tempo real
  - Botão de sincronização manual

### 5. 🌐 Página Offline Fallback
- **Arquivo**: `src/app/offline/page.tsx`
- **Conteúdo**:
  - Design amigável com instruções
  - Lista de funcionalidades disponíveis offline
  - Botão de retry
  - Link para dashboard

### 6. 🛠️ Helpers de Integração
- **Arquivo**: `src/lib/offline-helpers.ts`
- **Funções**:
  - `createVendaOffline()`: Criar venda offline
  - `updateProdutoOffline()`: Atualizar produto
  - `createClienteOffline()`: Criar cliente
  - `createPagamentoOffline()`: Registrar pagamento
  - `cacheData()`: Cachear dados localmente
  - `getCachedData()`: Recuperar cache
  - `forceSyncAll()`: Forçar sincronização

## 🚀 Como Usar

### 1. Instalação do PWA
```bash
# O next-pwa já está configurado
# Ao acessar a aplicação, o navegador oferecerá instalação
```

### 2. Usar em Componentes

```tsx
import { useOffline } from '@/hooks/useOffline';
import { useOfflineQueue } from '@/hooks/useOfflineQueue';
import { createVendaOffline } from '@/lib/offline-helpers';

function MinhaVenda() {
  const { isOnline, isOffline } = useOffline();
  const { hasPending, syncAll } = useOfflineQueue();

  const handleVenda = async (dados) => {
    // Automaticamente usa online ou offline
    const result = await createVendaOffline(dados);
    
    if (result.offline) {
      alert('Venda registrada offline!');
    } else {
      alert('Venda registrada com sucesso!');
    }
  };

  return (
    <div>
      {isOffline && (
        <div className="alert">
          ⚠️ Modo Offline - Vendas serão sincronizadas depois
        </div>
      )}
      
      {hasPending && (
        <button onClick={syncAll}>
          Sincronizar {stats.pending} operações
        </button>
      )}
    </div>
  );
}
```

### 3. Cachear Dados Localmente

```tsx
import { cacheData, getCachedData } from '@/lib/offline-helpers';

// Cachear produtos
async function carregarProdutos() {
  // Tenta cache primeiro
  const cached = getCachedData<Produto[]>('produtos');
  if (cached) return cached;

  // Se não tiver cache, busca da API
  const produtos = await fetch('/api/produtos').then(r => r.json());
  
  // Cacheia por 30 minutos
  cacheData('produtos', produtos, 30);
  
  return produtos;
}
```

### 4. Eventos Customizados

```tsx
useEffect(() => {
  // Quando volta online
  const handleOnline = () => {
    console.log('Voltou online!');
    // Recarregar dados, etc
  };

  // Quando fica offline
  const handleOffline = () => {
    console.log('Ficou offline!');
    // Avisar usuário, etc
  };

  window.addEventListener('app-online', handleOnline);
  window.addEventListener('app-offline', handleOffline);

  return () => {
    window.removeEventListener('app-online', handleOnline);
    window.removeEventListener('app-offline', handleOffline);
  };
}, []);
```

## 📊 Monitoramento

### Ver Estatísticas da Fila

```tsx
import { getOfflineStats } from '@/lib/offline-helpers';

const stats = getOfflineStats();
console.log(`
  Total: ${stats.total}
  Pendente: ${stats.pending}
  Sincronizando: ${stats.syncing}
  Sucesso: ${stats.success}
  Falha: ${stats.failed}
`);
```

### Ver Tamanho do Cache

```tsx
import { getCacheSize, formatCacheSize } from '@/lib/offline-helpers';

const size = getCacheSize();
console.log(`Cache: ${formatCacheSize(size)}`);
```

## 🎯 Fluxo de Operação

### Criando uma Venda

```
1. Usuário preenche formulário
2. Clica em "Salvar"
3. Sistema verifica conexão:
   
   SE ONLINE:
   ├─ Tenta enviar para API
   ├─ Se sucesso: retorna resultado
   └─ Se falha: adiciona à fila offline
   
   SE OFFLINE:
   └─ Adiciona à fila offline imediatamente

4. Se offline, salva em localStorage
5. Quando volta online:
   ├─ Service Worker dispara sync
   ├─ Fila processa operações pendentes
   ├─ Envia para API uma por uma
   ├─ Notifica sucesso/falha
   └─ Remove da fila após sucesso
```

## 🔄 Sincronização Automática

### Triggers de Sincronização
1. **Evento Online**: Quando conexão é restaurada
2. **Background Sync**: Service Worker registra sync tag
3. **Manual**: Usuário clica em "Sincronizar"
4. **Periódico**: Verificação a cada 5 segundos (fallback)

### Processo de Sincronização
```
1. Busca operações pendentes
2. Para cada operação:
   ├─ Marca como "syncing"
   ├─ Tenta enviar para API
   ├─ Se sucesso:
   │  ├─ Marca como "success"
   │  ├─ Notifica usuário
   │  └─ Remove após 5 segundos
   └─ Se falha:
      ├─ Incrementa contador de retry
      ├─ Se < 3 tentativas: marca como "pending"
      └─ Se >= 3 tentativas: marca como "failed"
```

## 🎨 Personalização

### Modificar Estratégia de Cache

```js
// public/sw.js

// Adicionar nova rota com estratégia específica
if (url.pathname.startsWith('/minha-rota/')) {
  strategy = CACHE_STRATEGIES.networkFirst;
}
```

### Adicionar Novo Tipo de Operação Offline

```ts
// src/lib/offline-queue.ts

// Atualizar tipo
export type OfflineOperation = {
  type: 'venda' | 'produto' | 'cliente' | 'pagamento' | 'MEU_TIPO';
  // ...
};

// src/lib/offline-helpers.ts

// Criar helper
export async function createMeuTipoOffline(data: any) {
  if (navigator.onLine) {
    // Tenta online
  } else {
    // Adiciona à fila
    offlineQueue.add({
      type: 'MEU_TIPO',
      action: 'create',
      data,
    });
  }
}
```

## 📱 Instalação do PWA

### Desktop (Chrome/Edge)
1. Acesse a aplicação
2. Clique no ícone de instalação na barra de endereço
3. Confirme a instalação

### Mobile (Android/iOS)
1. Acesse a aplicação
2. Menu → "Adicionar à tela inicial"
3. Confirme

### Verificar Instalação
```js
// Detecta se está instalado
if (window.matchMedia('(display-mode: standalone)').matches) {
  console.log('PWA está instalado!');
}
```

## 🧪 Testando Modo Offline

### Chrome DevTools
1. Abra DevTools (F12)
2. Aba "Network"
3. Dropdown "No throttling" → "Offline"

### Console
```js
// Simular offline
window.dispatchEvent(new Event('offline'));

// Simular online
window.dispatchEvent(new Event('online'));

// Ver fila
console.log(offlineQueue.getAll());

// Forçar sync
offlineQueue.syncAll();
```

## 🐛 Troubleshooting

### Service Worker não atualiza
```js
// Force update
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.unregister());
});
location.reload();
```

### Limpar cache
```js
// DevTools → Application → Clear storage → Clear site data
// Ou via código:
caches.keys().then(keys => {
  keys.forEach(key => caches.delete(key));
});
```

### Limpar fila offline
```js
localStorage.removeItem('bizcontrol_offline_queue');
```

## 📈 Métricas de Performance

### Lighthouse Score Esperado
- Performance: 90+
- PWA: 100
- Accessibility: 90+
- Best Practices: 90+
- SEO: 90+

## 🔐 Segurança

### Considerações
1. **Dados sensíveis**: Não cachear dados sensíveis
2. **Autenticação**: Token expira, verificar ao sincronizar
3. **Validação**: Revalidar dados offline antes de sincronizar
4. **HTTPS**: PWA requer HTTPS em produção

## 🚀 Próximos Passos

1. **Push Notifications**: Implementar notificações push
2. **Share API**: Compartilhamento nativo
3. **Biometria**: Autenticação biométrica
4. **Geolocalização**: Rastreamento de vendas
5. **Camera API**: Escaneamento de produtos

## 📚 Referências

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Background Sync](https://developer.chrome.com/docs/workbox/modules/workbox-background-sync/)
- [next-pwa](https://github.com/shadowwalker/next-pwa)

## 🎉 Pronto!

Seu sistema agora tem:
- ✅ PWA instalável
- ✅ Modo offline completo
- ✅ Sincronização automática
- ✅ Cache inteligente
- ✅ Notificações visuais
- ✅ Fila de operações
- ✅ Indicador de status

**Teste offline:** Desconecte a internet e continue usando! 🚀
