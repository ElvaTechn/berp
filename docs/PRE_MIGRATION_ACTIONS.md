# ⚠️ **AÇÕES PRÉ-MIGRATION OBRIGATÓRIAS**

**Data**: 18 Dezembro 2025  
**Status**: 🔴 **BLOQUEADOR - NÃO MIGRAR AINDA**

---

## 🔴 **AÇÕES CRÍTICAS (OBRIGATÓRIAS)**

### **1. Mudar Provider para PostgreSQL** ⚠️ **URGENTE**

**Arquivo**: `prisma/schema.prisma`  
**Linha**: 22

**❌ ATUAL** (SQLite):
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

**✅ CORRETO** (PostgreSQL):
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**Como fazer**:
1. Abrir `F:/berp/prisma/schema.prisma`
2. Linha 22: Trocar `"sqlite"` por `"postgresql"`
3. Salvar

---

### **2. Configurar DATABASE_URL** ⚠️ **URGENTE**

**Arquivo**: `.env`

**Adicionar**:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/bizcontrol360"
```

**Exemplo Real**:
```env
# PostgreSQL local
DATABASE_URL="postgresql://postgres:sua_senha@localhost:5432/bizcontrol360"

# Ou se usar outro host/porta
DATABASE_URL="postgresql://postgres:admin123@192.168.1.100:5432/bizcontrol360"
```

**Verificar**:
```bash
# Testar conexão PostgreSQL
psql -U postgres -h localhost -p 5432 -d bizcontrol360
```

---

## 🟡 **AÇÕES RECOMENDADAS (OPCIONAL)**

### **3. Limpar Código Morto**

**Verificar se existe**:
```bash
# Windows
dir /B F:\berp\src\lib\db-services.ts 2>nul

# Se existir, deletar
del F:\berp\src\lib\db-services.ts
```

**Motivo**: Arquivo era da v1.0, agora obsoleto (usamos `server-api.ts`)

---

### **4. Gerar Ícones PWA**

**Criar ícones em** `/public/icons/`:
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

**Ferramenta**:
```bash
npx pwa-asset-generator logo.png public/icons
```

**Motivo**: PWA requer ícones para instalação

---

### **5. Backup SQLite (Se Houver Dados)**

```bash
# Windows
copy prisma\dev.db prisma\dev.db.backup_pre_postgresql

# Linux/Mac
cp prisma/dev.db prisma/dev.db.backup_pre_postgresql
```

**Motivo**: Segurança (caso precise reverter)

---

## ✅ **CHECKLIST DE VERIFICAÇÃO**

Antes de executar a migration, confirme:

- [ ] **Provider = "postgresql"** no schema.prisma
- [ ] **DATABASE_URL** configurado no .env
- [ ] **PostgreSQL** rodando (porta 5432)
- [ ] **Database "bizcontrol360"** criada
- [ ] **Backup SQLite** feito (se necessário)
- [ ] **Dependências instaladas** (`npm install`)
- [ ] **PWA dependency** instalada (`@ducanh2912/next-pwa`)

---

## 🚀 **COMANDOS DA MIGRATION**

**APENAS DEPOIS** de completar as ações acima:

```bash
# 1. Gerar Prisma Client (PostgreSQL)
npx prisma generate

# 2. Executar Migration
npx prisma migrate dev --name init_enterprise_postgresql

# 3. Verificar Migration
npx prisma migrate status

# 4. Abrir Prisma Studio (verificar dados)
npx prisma studio
```

---

## 📊 **STATUS ATUAL**

| Item | Status | Bloqueador? |
|------|--------|-------------|
| Provider PostgreSQL | ❌ SQLite | ✅ **SIM** |
| DATABASE_URL | ❌ Não config | ✅ **SIM** |
| Código Limpo | ⚠️ Verificar | ❌ Não |
| Ícones PWA | ❌ Faltam | ❌ Não |
| Backup | ⚠️ Opcional | ❌ Não |

**Bloqueadores**: **2**  
**Pode Migrar?**: ❌ **NÃO** (corrigir bloqueadores primeiro)

---

## 🎯 **TEMPO ESTIMADO**

- Ação 1 (Provider): **30 segundos**
- Ação 2 (DATABASE_URL): **2 minutos**
- Ação 3 (Código Morto): **1 minuto**
- Ação 4 (Ícones PWA): **5 minutos**
- Ação 5 (Backup): **1 minuto**

**Total**: **~10 minutos**

---

## 📞 **SUPORTE**

Se encontrar erros:

1. Verificar se PostgreSQL está rodando
2. Verificar credenciais no .env
3. Verificar se database existe
4. Consultar `/docs/FIDELITY_AUDIT_REPORT.md`

---

**⚠️ NÃO EXECUTE A MIGRATION ATÉ COMPLETAR AS AÇÕES CRÍTICAS!**

**Última Atualização**: 18 Dezembro 2025
