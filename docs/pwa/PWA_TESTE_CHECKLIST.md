# ✅ Checklist de Teste - PWA Offline

## 🚀 Antes de Testar

### 1. Iniciar o Servidor
```bash
npm run dev
# ou
npm run build && npm start
```

### 2. Verificar Arquivos Criados
- ✅ `next.config.js` - Configuração next-pwa
- ✅ `public/manifest.json` - Manifest PWA
- ✅ `public/sw.js` - Service Worker customizado
- ✅ `src/hooks/useOffline.ts` - Hook de detecção
- ✅ `src/hooks/useOfflineQueue.ts` - Hook da fila
- ✅ `src/lib/offline-queue.ts` - Sistema de fila
- ✅ `src/lib/offline-helpers.ts` - Helpers de integração
- ✅ `src/components/offline/OfflineIndicator.tsx` - Indicador visual
- ✅ `src/app/offline/page.tsx` - Página fallback
- ✅ `src/components/vendas/VendaFormOffline.tsx` - Exemplo de uso

## 🧪 Testes Essenciais

### Teste 1: Service Worker Registrado ✅
1. Abra o navegador
2. Pressione `F12` (DevTools)
3. Aba "Application" → "Service Workers"
4. **Esperado**: Service Worker ativo e em execução

```
✓ Service Worker Status: activated
✓ Scope: /
✓ Source: sw.js
```

### Teste 2: Manifest Carregado ✅
1. DevTools → "Application" → "Manifest"
2. **Esperado**: Informações do app

```
✓ Name: BizControl 360 - ERP Enterprise
✓ Short Name: BizControl
✓ Start URL: /dashboard
✓ Display: standalone
✓ Icons: 8 ícones
```

### Teste 3: Indicador de Status Visível ✅
1. Acesse qualquer página
2. **Esperado**: Badge flutuante no canto inferior direito

```
✓ Badge verde com "Online"
✓ Clique mostra painel de detalhes
✓ Painel mostra status de conexão
```

### Teste 4: Modo Offline ✅
1. DevTools → Aba "Network"
2. Dropdown "No throttling" → **"Offline"**
3. **Esperado**: 

```
✓ Badge muda para vermelho com "Offline"
✓ Ícone WifiOff piscando
✓ Toast de notificação: "Modo offline ativo..."
```

### Teste 5: Criar Venda Offline ✅
1. Ainda em modo offline
2. Acesse o exemplo: `VendaFormOffline`
3. Preencha o formulário
4. Clique em "Registrar Venda (Offline)"
5. **Esperado**:

```
✓ Venda registrada localmente
✓ Mensagem: "Venda registrada offline!"
✓ Badge mostra número (1)
✓ Console: "📦 Venda adicionada à fila offline"
```

### Teste 6: Verificar Fila ✅
1. Clique no badge offline
2. Painel de detalhes deve mostrar:

```
✓ Pendente: 1
✓ Sincronizando: 0
✓ Sucesso: 0
✓ Falha: 0
```

3. Console do navegador:
```javascript
// Ver fila completa
console.log(offlineQueue.getAll());

// Ver estatísticas
console.log(offlineQueue.getStats());
```

### Teste 7: Voltar Online e Sincronizar ✅
1. DevTools → Network → **"Online"**
2. **Esperado - Automático**:

```
✓ Badge muda para verde "Online"
✓ Toast: "1 operações serão sincronizadas..."
✓ Console: "🔄 Iniciando sincronização de 1 operações..."
✓ Toast: "1 operação(ões) sincronizada(s) com sucesso!"
✓ Badge: número desaparece após 5 segundos
```

### Teste 8: Sincronização Manual ✅
1. Criar venda offline (modo offline)
2. Voltar online
3. **NÃO ESPERAR** sincronização automática
4. Clicar no badge → Painel de detalhes
5. Clicar em **"Sincronizar Agora"**
6. **Esperado**:

```
✓ Botão mostra "Sincronizando..." com spinner
✓ Requisição enviada para API
✓ Toast de sucesso
✓ Operação removida da fila
```

### Teste 9: Cache de Recursos ✅
1. Com internet, navegue pela aplicação
2. Vá para DevTools → Application → Cache Storage
3. **Esperado**:

```
✓ Cache: "bizcontrol-v1.0.0"
✓ Recursos armazenados:
  - Páginas HTML
  - CSS e JS
  - Imagens
  - Fonts
```

4. Teste offline:
```
✓ Páginas visitadas carregam offline
✓ Imagens aparecem
✓ Estilos mantidos
```

### Teste 10: Página Offline Fallback ✅
1. Modo offline
2. Tente acessar página não visitada antes: `/teste-offline-nova-rota`
3. **Esperado**:

```
✓ Redireciona para /offline
✓ Mostra página com ícone WifiOff
✓ Texto: "Você está offline"
✓ Botões: "Tentar Novamente" e "Ir para Dashboard"
```

### Teste 11: LocalStorage ✅
1. DevTools → Application → Local Storage
2. **Esperado**:

```
✓ Key: "bizcontrol_offline_queue"
✓ Value: Array JSON com operações pendentes
✓ Atualiza em tempo real
```

3. Teste persistência:
```
✓ Criar venda offline
✓ Recarregar página (F5)
✓ Fila mantém operações
✓ Badge mostra número correto
```

### Teste 12: Network Information API ✅
1. Clique no badge
2. Painel de detalhes deve mostrar:

```
✓ Status: Online/Offline
✓ Tipo: 4G / WiFi / etc
✓ Velocidade: X Mbps
```

### Teste 13: Múltiplas Operações ✅
1. Modo offline
2. Crie 3 vendas diferentes
3. **Esperado**:

```
✓ Badge mostra: 3
✓ Painel: Pendente: 3
✓ LocalStorage: 3 operações
```

4. Voltar online:
```
✓ Sincroniza todas em ordem
✓ Toast mostra: "3 operação(ões) sincronizada(s)"
✓ Badge volta a 0
```

### Teste 14: Falha de Sincronização ✅
1. Criar venda offline com dados inválidos
2. Voltar online
3. **Esperado**:

```
✓ Tenta sincronizar
✓ Falha (erro HTTP)
✓ Incrementa contador de retry
✓ Após 3 tentativas: marca como "failed"
✓ Toast: "Falha ao sincronizar X operação(ões)"
✓ Painel: Falha: 1
```

### Teste 15: Instalação do PWA ✅

#### Desktop (Chrome/Edge)
1. Acesse a aplicação
2. Barra de endereço: ícone de instalação (+)
3. Clique e instale
4. **Esperado**:

```
✓ App abre em janela separada
✓ Sem barra de navegação do navegador
✓ Ícone na área de trabalho/dock
✓ Funciona como app nativo
```

#### Mobile (Android)
1. Chrome → Menu (⋮) → "Adicionar à tela inicial"
2. **Esperado**:

```
✓ Ícone na tela inicial
✓ Abre em tela cheia
✓ Splash screen
✓ Funciona offline
```

### Teste 16: Background Sync ✅
1. Criar venda offline
2. **Fechar o navegador**
3. Conectar à internet
4. **Abrir o navegador**
5. **Esperado**:

```
✓ Service Worker detecta conexão
✓ Registra sync tag
✓ Sincroniza automaticamente
✓ Operações processadas em background
```

## 🔍 Testes Avançados

### Teste A: Cache Strategy - Cache First
```javascript
// DevTools Console
fetch('/icons/icon-192x192.png').then(r => console.log(r));
// ✓ Carrega do cache instantaneamente
```

### Teste B: Cache Strategy - Network First
```javascript
fetch('/api/vendas').then(r => console.log(r));
// ✓ Tenta network primeiro
// ✓ Fallback para cache se offline
```

### Teste C: Stale While Revalidate
```javascript
fetch('/dashboard').then(r => console.log(r));
// ✓ Retorna cache imediatamente
// ✓ Atualiza cache em background
```

### Teste D: Tamanho do Cache
```javascript
import { getCacheSize, formatCacheSize } from '@/lib/offline-helpers';

const size = getCacheSize();
console.log(formatCacheSize(size));
// ✓ Mostra tamanho em KB/MB
```

### Teste E: Limpar Cache Expirado
```javascript
import { clearExpiredCache } from '@/lib/offline-helpers';

clearExpiredCache();
// ✓ Remove caches expirados
// ✓ Mantém caches válidos
```

### Teste F: Eventos Customizados
```javascript
window.addEventListener('app-online', () => {
  console.log('✅ App voltou online!');
});

window.addEventListener('app-offline', () => {
  console.log('⚠️ App ficou offline!');
});

// Teste: Alterne online/offline no DevTools
```

## 🐛 Troubleshooting

### Problema: Service Worker não registra
```javascript
// Solução 1: Limpar registration
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => reg.unregister());
});
location.reload();

// Solução 2: Verificar console
// Deve mostrar: "🎯 Service Worker: Carregado e pronto!"
```

### Problema: Sincronização não funciona
```javascript
// Verificar fila
console.log(offlineQueue.getPending());

// Forçar sincronização
await offlineQueue.syncAll();

// Ver estatísticas
console.log(offlineQueue.getStats());
```

### Problema: Cache não atualiza
```javascript
// Limpar todo o cache
caches.keys().then(keys => {
  keys.forEach(key => caches.delete(key));
});

// Hard reload
// Ctrl + Shift + R (Windows)
// Cmd + Shift + R (Mac)
```

### Problema: LocalStorage cheio
```javascript
// Ver tamanho
import { getCacheSize } from '@/lib/offline-helpers';
console.log(getCacheSize());

// Limpar fila
localStorage.removeItem('bizcontrol_offline_queue');

// Limpar tudo
localStorage.clear();
```

## 📊 Métricas de Sucesso

### Lighthouse Audit
1. DevTools → Lighthouse
2. Selecione: ✅ Progressive Web App
3. Click "Analyze page load"
4. **Esperado**:

```
✓ PWA Score: 100
✓ Installable: ✅
✓ Service Worker: ✅
✓ HTTPS: ✅ (production)
✓ Redirects HTTP to HTTPS: ✅
✓ Viewport meta tag: ✅
✓ Apple touch icon: ✅
```

### Performance
```
✓ First Contentful Paint: < 1.8s
✓ Time to Interactive: < 3.8s
✓ Speed Index: < 3.4s
✓ Offline functionality: ✅
```

## ✅ Checklist Final

Marque cada item após testar:

- [ ] Service Worker registrado e ativo
- [ ] Manifest carregado corretamente
- [ ] Indicador de status visível
- [ ] Detecção de offline funciona
- [ ] Criar operação offline funciona
- [ ] Fila armazena operações
- [ ] Sincronização automática funciona
- [ ] Sincronização manual funciona
- [ ] Cache de recursos funciona
- [ ] Página offline fallback aparece
- [ ] LocalStorage persiste dados
- [ ] Network info aparece no painel
- [ ] Múltiplas operações funcionam
- [ ] Retry de falhas funciona
- [ ] PWA é instalável
- [ ] Background sync funciona
- [ ] Eventos customizados funcionam
- [ ] Cache strategies corretas
- [ ] Notificações aparecem
- [ ] Performance adequada

## 🎉 Sucesso!

Se todos os testes passaram, seu PWA está pronto para produção! 🚀

### Próximos Passos:
1. ✅ Deploy em HTTPS
2. ✅ Teste em dispositivos reais
3. ✅ Monitore métricas de uso
4. ✅ Colete feedback dos usuários
5. ✅ Implemente push notifications
