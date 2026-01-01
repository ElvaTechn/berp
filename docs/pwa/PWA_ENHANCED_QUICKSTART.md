# 🚀 PWA Enhanced - Guia Rápido

**BizControl 360 ERP v2.1.0** - Melhorias Implementadas em 01/01/2026

---

## ⚡ O Que Mudou (em 3 minutos)

### 1. **CONFLICT RESOLUTION** - Nunca mais perda de dados

**Problema:** 2 vendedores offline editam o mesmo produto → quem ganha?  
**Solução:** 5 estratégias inteligentes de merge

```typescript
import { autoResolveConflict, getConflictStats } from '@/lib/pwa';

// Auto-detect + resolve (1 linha!)
const result = await autoResolveConflict(
  'product', 'p1', 'CachedProduct',
  localData, serverData,
  { 
    localTimestamp: cachedAt, 
    remoteTimestamp: Date.now() 
  }
);

if (result.hadConflict) {
  console.log('Conflict resolved:', result.strategy);
}
```

---

### 2. **STORAGE LIMITS** - Esqueceu de limpar o cache? Nós fazemos!

**Problema:** App cresce infinitamente → crash do IndexedDB  
**Solução:** Auto-cleanup a cada hora

```typescript
import { pwaStorage } from '@/lib/pwa';

// Verificar stats
const stats = await pwaStorage.getStorageStats();
console.log(`Usando: ${(stats.usagePercentage).toFixed(1)}%`);
console.log(`Near limit: ${stats.isNearLimit}`);

// O sistema auto-limpa quando >80%

// Forçar cleanup manual
const cleaned = await pwaStorage.forceCleanup();
console.log(`Freed ${cleaned.freedBytes / 1024 / 1024}MB`);
```

---

### 3. **LAZY LOADING** - Bundle 40% menor

**Problema:** Todo código PWA carrega de uma vez  
**Solução:** Carrega sob demanda

```typescript
import { PWAOfflineBanner, ConditionalPWAFeature } from '@/lib/pwa/lazy';

export default function App() {
  return (
    <>
      {/* Carrega SOMENTE se offline */}
      <ConditionalPWAFeature shouldLoad={!navigator.onLine}>
        <PWAOfflineBanner />
      </ConditionalPWAFeature>
    </>
  );
}
```

---

### 4. **TESTES** - 105+ test cases para confiança

```bash
npm test                    # Rodar todos
npm run test:coverage       # Com cobertura
npm run test:watch          # Watch mode
```

Coverage alvo: 70%+ (branches, functions, lines, statements)

---

## 📚 Novas APIs Disponíveis

### IndexedDB Enhanced

```typescript
import { pwaStorage } from '@/lib/pwa';

// Todas as funções antigas continuam funcionando
await pwaStorage.addPendingSale(sale);
await pwaStorage.getPendingSales({ synced: false, limit: 10 });
await pwaStorage.cacheProducts(products, userId); // com conflict check
await pwaStorage.getStorageStats();
await pwaStorage.forceCleanup();
```

### Conflict Resolution

```typescript
import {
  conflictResolution,
  autoResolveConflict,
  manualResolveConflict,
  getConflictStats
} from '@/lib/pwa';

// Estratégias
- 'lww'           : Last-Write-Wins (default)
- 'merge'         : Combina campos não conflitantes
- 'manual'        : Você resolve via UI
- 'keep_remote'   : API é source of truth
- 'keep_local'    : Offline tem prioridade

// Callback para novos conflitos
const unsubscribe = conflictResolution.onNewConflict((conflict) => {
  console.log('New conflict detected:', conflict);
  // Mostrar modal para resolver manual
});

// Stats
const stats = getConflictStats();
// { total, resolved, pending, byType }
```

### Lazy Components

```typescript
import {
  PWAInstallPrompt,
  PWAOfflineBanner,
  PWASyncButton,
  OfflineIndicator,
  SyncStatus
} from '@/lib/pwa/lazy';

// Todos são dynamic imports (0 impacto no bundle se não usados)
```

---

## 🔄 Migrando Código Existente

### Passo 1: Atualizar imports

**Antes:**
```typescript
import { addPendingSale, getPendingSales } from '@/lib/pwa/indexedDB';
```

**Depois:**
```typescript
import { pwaStorage } from '@/lib/pwa';

await pwaStorage.addPendingSale(sale);
const sales = await pwaStorage.getPendingSales();
```

### Passo 2: Adicionar conflict resolution (opcional)

```typescript
import { autoResolveConflict } from '@/lib/pwa';

// Ao sincronizar produto da API
const result = await autoResolveConflict(
  'product',
  product.id,
  'CachedProduct',
  localProduct,
  apiProduct,
  { localTimestamp: localProduct.cached_at }
);

// Usar versão resolvida
const finalProduct = result.resolved;
await pwaStorage.cacheProducts([finalProduct]);
```

### Passo 3: Usar lazy loading (recomendado)

```typescript
import { PWAOfflineBanner } from '@/lib/pwa/lazy';

// No layout ou componente principal
<PWAOfflineBanner />
```

---

## 🎯 Checklist de Implementação

### Em componentes existentes:

- [ ] Atualizar imports para usar `pwaStorage`
- [ ] Adicionar `ConditionalPWAFeature` para banners
- [ ] Implementar conflict resolution em sync APIs
- [ ] Adicionar monitoramento de storage (stats)
- [ ] Usar lazy components onde possível

### Em novas features:

- [ ] Usar `pwaStorage` (já com storage limits)
- [ ] Usar `autoResolveConflict` em sync
- [ ] Importar lazy components
- [ ] Escrever testes para novas features
- [ ] Documentar novos patterns

---

## 🧪 Rodando Testes

```bash
# Instalar dependências se necessário
npm install

# Rodar todos os testes
npm test

# Ver coverage
npm run test:coverage

# Rodar apenas testes de PWA
npm test -- lib/pwa/__tests__

# Watch mode (desenvolvimento)
npm run test:watch
```

---

## 📊 Monitorando em Produção

### Storage Stats Dashboard

```typescript
// Adicionar em DevTools ou Admin
import { pwaStorage } from '@/lib/pwa';

const showPWAStats = async () => {
  const stats = await pwaStorage.getCacheStats();
  console.table({
    'Pending Sales': stats.pending_sales,
    'Cached Products': stats.cached_products,
    'Cached Employees': stats.cached_employees,
    'Sync Queue': stats.sync_queue,
    'Total Size (MB)': (stats.totalSize / 1024 / 1024).toFixed(2),
    'Usage %': stats.usagePercentage.toFixed(1),
    'Near Limit': stats.isNearLimit ? '⚠️ YES' : '✅ No',
  });
  
  // Conflict stats
  const conflictStats = getConflictStats();
  console.table({
    'Total Conflicts': conflictStats.total,
    'Resolved': conflictStats.resolved,
    'Pending': conflictStats.pending,
    'Products': conflictStats.byType.product,
    'Sales': conflictStats.byType.sale,
    'Employees': conflictStats.byType.employee,
  });
};
```

---

## 🐛 Troubleshooting

### "Storage limit reached"

```typescript
// Force cleanup
const result = await pwaStorage.forceCleanup();
console.log(`Cleanup: ${result.deletedCount} items freed`);
```

### "Conflito não resolvido"

```typescript
// Resolver manualmente
import { manualResolveConflict } from '@/lib/pwa';

const resolution = {
  id: 'p1',
  name: 'Product Merge',  // Nome customizado
  price: 120,            // Valor escolhido
  quantity: 40,          // Quantidade escolhida
};

await manualResolveConflict(conflictId, resolution);
```

### Testes falhando

```bash
# Limpar cache de Jest
npm test -- --clearCache

# Rodar com logs detalhados
npm test -- --verbose

# Ver apenas testes de um arquivo
npm test -- lib/pwa/__tests__/indexedDB.enhanced.test.ts
```

---

## 📚 Documentação Completa

- ✅ **PWA_MELHORIAS_IMPLEMENTADAS.md** - Detalhes completos
- ✅ **conflictResolution.ts** - Com comentários inline
- ✅ **indexedDB.enhanced.ts** - Com comentários inline
- ✅ **Testes** - Como usar features (exemplos reais)

---

## 🚀 Proximos Passos

1. **Ler `PWA_MELHORIAS_IMPLEMENTADAS.md`** - Entenda tudo
2. **Rodar `npm test`** - Ver se tudo funciona
3. **Migrar 1 componente** - Começar simples
4. **Adicionar stats monitoring** - Dashboard
5. **Implementar conflict resolution** - Em sync endpoints
6. **Deploy** - Production!

---

## 💡 Tips & Tricks

### Monitore storage regularmente

```typescript
// Usar useEffect para check periódico
useEffect(() => {
  const checkStorage = async () => {
    const stats = await pwaStorage.getStorageStats();
    if (stats.isNearLimit) {
      toast.warning('Storage almost full', {
        description: 'Auto-cleanup will run soon',
      });
    }
  };

  checkStorage();
  const interval = setInterval(checkStorage, 60000); // 1 min
  return () => clearInterval(interval);
}, []);
```

### Track conflict resolution patterns

```typescript
// Usar callback para analytics
conflictResolution.onNewConflict((conflict) => {
  analytics.track('conflict_detected', {
    type: conflict.type,
    strategy: conflict.strategy,
    fields: conflict.conflictedFields.length,
  });
});
```

### Optimistic UI updates

```typescript
// Atualizar UI localmente, sync em background
const handleProductUpdate = async (updates) => {
  // 1. Atualizar IndexedDB
  await pwaStorage.cacheProducts([{ ...product, ...updates }]);
  
  // 2. Adicionar à sync queue
  await pwaStorage.addToSyncQueue({
    type: 'product',
    action: 'update',
    data: updates,
    priority: 'high',
  });
  
  // 3. UI atualizada imediatamente!
  // Sync acontece em background
};
```

---

## ✅ Verificação Final

Antes de commitar:

```bash
# 1. Typecheck
npm run typecheck

# 2. Lint
npm run lint

# 3. Testes
npm test

# 4. Build
npm run build
```

Tudo passando? ✅ Deployment ready!

---

## 📞 Suporte

- **Docs:** `docs/pwa/`
- **Testes:** `src/lib/pwa/__tests__/`
- **Código:** Comentários inline explicam tudo

**Happy Coding! 🚀**
