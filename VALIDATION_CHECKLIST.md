# ✅ Checklist de Validação PWA

Use este checklist para verificar se tudo está funcionando após executar `npm run setup-pwa-complete`.

---

## 📁 FASE 1: Verificar Arquivos Criados

### Ícones PNG (6 novos)
- [ ] `public/icons/icon-72x72.png` (~2 KB)
- [ ] `public/icons/icon-96x96.png` (~3 KB)
- [ ] `public/icons/icon-128x128.png` (~4 KB)
- [ ] `public/icons/icon-144x144.png` (~5 KB)
- [ ] `public/icons/icon-152x152.png` (~6 KB)
- [ ] `public/icons/icon-384x384.png` (~10 KB)

### Ícones iOS e Favicon (4 novos)
- [ ] `public/apple-touch-icon.png` (~8 KB)
- [ ] `public/favicon-32x32.png` (~2 KB)
- [ ] `public/favicon.ico` (~4 KB)
- [ ] `public/favicon.svg` (já existia)

### Comando de Verificação
```bash
ls public/icons/*.png
ls public/*.png
ls public/*.ico
```

**Total esperado:** 10 arquivos (~50 KB)

---

## 🏗️ FASE 2: Build e Start

### Build
```bash
npm run build
```

- [ ] Build completa sem erros
- [ ] Nenhum warning crítico
- [ ] Tempo de build < 2 minutos

### Start
```bash
npm start
```

- [ ] Servidor inicia na porta 3000
- [ ] Nenhum erro no console
- [ ] Mensagem: "Ready on http://localhost:3000"

---

## 🌐 FASE 3: Browser (Chrome)

### Abrir App
```
http://localhost:3000
```

- [ ] Página carrega corretamente
- [ ] Nenhum erro no console do browser
- [ ] Layout aparece normal

### DevTools → Application → Manifest
- [ ] 0 errors
- [ ] 0 warnings
- [ ] "Identity" preenchido
  - [ ] Name: BizControl 360 - Sistema ERP
  - [ ] Short name: BizControl
- [ ] "Presentation" preenchido
  - [ ] Display: standalone
  - [ ] Theme color: #000000
- [ ] "Icons" preenchidos
  - [ ] 8 icons listados
  - [ ] Todos com preview visual
  - [ ] Sem ícones quebrados (X vermelho)
- [ ] "Installability" says: "Installable"

### DevTools → Application → Service Workers
- [ ] "sw.js" está registrado
- [ ] Status: "activated and running"
- [ ] Scope: "/"
- [ ] Update on reload: opcional

### DevTools → Application → Cache Storage
- [ ] "bizcontrol-static-v2-0-0" existe
- [ ] "bizcontrol-api-v2-0-0" existe
- [ ] Caches têm conteúdo (não vazios)

### DevTools → Network
- [ ] Recarregar página (Ctrl+R)
- [ ] Verificar header do sw.js:
  - [ ] Cache-Control: public, max-age=0, must-revalidate
  - [ ] Service-Worker-Allowed: /
- [ ] Verificar header de API:
  - [ ] Cache-Control: no-store, no-cache

### Favicon
- [ ] Ícone aparece na tab do browser
- [ ] Ícone correto (não ícone padrão do Next.js)
- [ ] Ícone persiste após reload

---

## 📱 FASE 4: Instalação PWA

### Chrome Desktop
- [ ] Ícone de instalação aparece na URL bar (⊕)
- [ ] Clicar no ícone
- [ ] Dialog "Instalar BizControl 360?" aparece
- [ ] Clicar "Instalar"
- [ ] App abre em janela própria
- [ ] Ícone aparece na barra de tarefas

### Após Instalação
- [ ] Ícone correto na janela do app
- [ ] Barra de título: "BizControl 360"
- [ ] App funciona normalmente
- [ ] Pode ser fechado e reaberto

---

## 🔍 FASE 5: Lighthouse Audit

### Executar Lighthouse
```
DevTools (F12) → Lighthouse tab
Selecionar:
  [x] Performance
  [x] Accessibility
  [x] Best Practices
  [x] PWA
  [x] SEO
Device: Desktop
Click "Analyze page load"
```

### Scores Esperados
- [ ] Performance: > 85
- [ ] Accessibility: > 90
- [ ] Best Practices: > 90 (ganho de +25!)
- [ ] PWA: > 90 (ganho de +15!)
- [ ] SEO: > 85

### PWA Checks
- [ ] ✅ Installable
- [ ] ✅ Provides a valid apple-touch-icon
- [ ] ✅ Configured for a custom splash screen
- [ ] ✅ Sets a theme color
- [ ] ✅ Content is sized correctly for the viewport
- [ ] ✅ Has a `<meta name="viewport">` tag
- [ ] ✅ Provides a valid manifest
- [ ] ✅ Registers a service worker

---

## 🔒 FASE 6: Segurança

### Headers de Segurança (DevTools → Network)
Recarregar página e verificar headers da resposta principal:

- [ ] Strict-Transport-Security: max-age=63072000
- [ ] X-XSS-Protection: 1; mode=block
- [ ] X-Frame-Options: SAMEORIGIN
- [ ] X-Content-Type-Options: nosniff
- [ ] Referrer-Policy: strict-origin-when-cross-origin

### CSP (DevTools → Console)
- [ ] Nenhum warning "Refused to..."
- [ ] Nenhum erro de CSP
- [ ] Scripts carregam normalmente

---

## 📴 FASE 7: Modo Offline

### Testar Offline
```
DevTools → Network tab → Throttling → Offline
```

- [ ] Recarregar página (Ctrl+R)
- [ ] Página offline customizada aparece
- [ ] Mensagem: "Você está offline"
- [ ] Botão "Tentar Novamente" presente
- [ ] Design da página offline está correto

### Voltar Online
```
DevTools → Network tab → Throttling → No throttling
```

- [ ] Clicar "Tentar Novamente"
- [ ] Página principal carrega
- [ ] App funciona normalmente

---

## 🎯 RESUMO FINAL

### Contagem de Checks
```
Total de checks: 80+
Mínimo para aprovar: 75/80 (93%)

Seu score: ___/80
```

### Status Geral
- [ ] ✅ APROVADO - Tudo funcionando (>75 checks)
- [ ] ⚠️ REVISAR - Alguns problemas (60-75 checks)
- [ ] ❌ FALHOU - Muitos problemas (<60 checks)

---

## 🐛 Problemas Encontrados?

### Se algum check falhou:

1. **Arquivos não criados:**
   - Ver `EXECUTE_SETUP_PWA.md` seção "Erros Possíveis"
   - Tentar conversão manual

2. **Build falha:**
   - Ver erro específico no console
   - Verificar sintaxe dos arquivos modificados

3. **Manifest com erros:**
   - Validar JSON: https://jsonlint.com/
   - Verificar caminhos dos ícones

4. **Service Worker não registra:**
   - Verificar se está em produção (`npm run build && npm start`)
   - Limpar cache do browser (Ctrl+Shift+Delete)

5. **Lighthouse score baixo:**
   - Ver detalhes no relatório Lighthouse
   - Corrigir um problema por vez

---

## 📞 Comandos de Debug

```bash
# Verificar arquivos criados
ls -R public/

# Verificar package.json
cat package.json | grep -A 5 "scripts"

# Verificar se Sharp está instalado
npm list sharp

# Verificar logs do build
npm run build 2>&1 | tee build.log

# Limpar tudo e tentar novamente
rm -rf node_modules package-lock.json
npm install
npm run setup-pwa-complete
```

---

## ✅ APROVADO!

Se você marcou >75 checks, **parabéns!** 🎉

Seu PWA está pronto para produção!

### Próximos Passos:
1. Commit e push das mudanças
2. Deploy para produção
3. Testar em dispositivo real (Android/iOS)
4. Validar em https://securityheaders.com/
5. Monitorar métricas

---

**Data da Validação:** ___/___/______  
**Validado por:** __________________  
**Score:** ___/80 checks  
**Status:** [ ] Aprovado [ ] Revisar [ ] Falhou

---

**Arquivo:** `VALIDATION_CHECKLIST.md`  
**Versão:** 1.0.0  
**Última atualização:** 30 Dezembro 2025
