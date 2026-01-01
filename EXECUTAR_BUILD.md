# 🚀 Como Executar o Build - 3 Opções

**Todos os scripts foram corrigidos!**

---

## ✅ OPÇÃO 1: Script BAT (Mais Simples)

```cmd
build-agora.bat
```

**Por quê usar:**
- ✅ Mais simples
- ✅ Sem problemas de encoding
- ✅ Funciona sempre

---

## ✅ OPÇÃO 2: PowerShell Completo

```powershell
.\build-clean.ps1
```

**O que faz:**
1. Para Node.js
2. Limpa cache
3. Gera Prisma Client
4. Builda projeto

---

## ✅ OPÇÃO 3: Manual (Se scripts não funcionarem)

```powershell
# 1. Parar Node.js
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# 2. Limpar cache
Remove-Item -Recurse -Force .next

# 3. Gerar Prisma
npx prisma generate

# 4. Buildar
npm run build
```

---

## ⚡ COMANDO MAIS RÁPIDO

Se só quiser limpar o lock:

```powershell
.\fix-build-lock.ps1
npm run build
```

---

## 🎯 RECOMENDAÇÃO

**Use o arquivo .bat - é o mais confiável:**

```cmd
build-agora.bat
```

Depois aguarde 2-3 minutos para o build completar.

---

## ✅ SUCESSO ESPERADO

```
[1/4] Parando Node.js... OK
[2/4] Limpando cache... OK
[3/4] Gerando Prisma... OK
[4/4] Buildando... 

✔ Generated Prisma Client
✔ Compiled successfully in 2.0min
✔ Build completed

BUILD SUCESSO!
Pronto para producao!
```

---

## ❌ SE DER ERRO

Execute manualmente linha por linha:

```powershell
# Ver se tem Node.js rodando
Get-Process -Name node

# Se tiver, matar
Get-Process -Name node | Stop-Process -Force

# Limpar tudo
Remove-Item -Recurse -Force .next

# Tentar build
npm run build
```

---

**Execute agora:**

```cmd
build-agora.bat
```

Ou:

```powershell
.\build-clean.ps1
```
