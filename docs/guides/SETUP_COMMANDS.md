# 🚀 **COMANDOS DE SETUP - BIZCONTROL 360 ERP v2.0.0**

**Data**: 18 Dezembro 2025  
**Versão**: 2.0.0 (Enterprise Grade)

---

## ⚠️ **IMPORTANTE - LEIA ANTES DE EXECUTAR**

Este documento contém os comandos necessários para atualizar o banco de dados para a versão 2.0.0.

**⚠️ AVISOS CRÍTICOS:**
1. **Faça backup do banco de dados ANTES de executar qualquer comando**
2. **A migration é irreversível** (sem backup, não há volta)
3. **Campos Float → Decimal** (conversão automática do Prisma)
4. **Novos campos obrigatórios** (serão criados com valores padrão)

---

## 📋 **CHECKLIST PRÉ-MIGRATION**

Antes de executar os comandos, certifique-se:

- [ ] ✅ Código atualizado (`git pull` ou download)
- [ ] ✅ Dependências instaladas (`npm install`)
- [ ] ✅ Backup do banco criado
- [ ] ✅ `.env` configurado corretamente
- [ ] ✅ Aplicação parada (sem requests ativos)

---

## 🔧 **COMANDOS DE SETUP**

### **1. Backup do Banco de Dados** ⚠️ **CRÍTICO**

#### **SQLite (Dev)**
```bash
# Windows
copy prisma\dev.db prisma\dev.db.backup

# Linux/Mac
cp prisma/dev.db prisma/dev.db.backup
```

#### **PostgreSQL (Prod)**
```bash
# Backup completo
pg_dump -U postgres -d bizcontrol360 > backup_$(date +%Y%m%d_%H%M%S).sql

# Ou usando variável de ambiente
pg_dump $DATABASE_URL > backup_pre_v2.sql
```

---

### **2. Instalar Dependências**

```bash
npm install
```

**Dependências principais**:
- `@prisma/client` (atualizado)
- `prisma` (atualizado)
- `zod` (validações)
- `bcryptjs` (hashing de senhas)
- `jose` (JWT)

---

### **3. Gerar Prisma Client** 

```bash
npx prisma generate
```

**O que faz**:
- ✅ Lê `prisma/schema.prisma`
- ✅ Gera TypeScript types atualizados
- ✅ Cria `@prisma/client` com novos modelos
- ✅ Suporte a Decimal, novos Enums, novos campos

**Saída esperada**:
```
✔ Generated Prisma Client (5.x.x) to ./node_modules/@prisma/client in 1.2s

Start by importing your Prisma Client:
  import { PrismaClient } from '@prisma/client'
```

---

### **4. Criar Migration** ⚠️ **PONTO DE NÃO RETORNO**

#### **Desenvolvimento (SQLite)**
```bash
npx prisma migrate dev --name enterprise_refactor_v2
```

**O que faz**:
- ✅ Cria arquivo de migration em `prisma/migrations/`
- ✅ Executa migration no banco SQLite
- ✅ Atualiza schema
- ✅ Regenera Prisma Client automaticamente

**Saída esperada**:
```
Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma
Datasource "db": SQLite database "dev.db" at "file:./dev.db"

Applying migration `20251218_enterprise_refactor_v2`

The following migration(s) have been created and applied from new schema changes:

migrations/
  └─ 20251218_enterprise_refactor_v2/
      └─ migration.sql

Your database is now in sync with your schema.

✔ Generated Prisma Client (5.x.x) to ./node_modules/@prisma/client in 1.5s
```

#### **Produção (PostgreSQL)**
```bash
# 1. Criar migration (sem executar)
npx prisma migrate dev --create-only --name enterprise_refactor_v2

# 2. Revisar migration em prisma/migrations/

# 3. Aplicar em produção
npx prisma migrate deploy
```

---

### **5. Verificar Migration**

```bash
# Ver status das migrations
npx prisma migrate status

# Ver histórico
npx prisma migrate history
```

**Saída esperada**:
```
Status:
✔ Database schema is up to date

Applied migrations:
  20251218_enterprise_refactor_v2
```

---

### **6. Preencher Campos Novos** (Opcional)

Se você já tem dados no banco, execute o script de preenchimento:

```bash
npx ts-node scripts/fill_new_fields.ts
```

**O que faz**:
- ✅ Adiciona `cost_price` em `SaleItem` (snapshot)
- ✅ Ativa todos os usuários existentes (`is_active = true`)
- ✅ Ativa todos os produtos existentes (`is_active = true`)
- ✅ Calcula `subtotal` em vendas antigas

---

### **7. Validar Banco de Dados**

```bash
# Verificar schema
npx prisma db pull

# Abrir Prisma Studio (GUI)
npx prisma studio
```

**Prisma Studio**:
- Abre em `http://localhost:5555`
- Permite visualizar e editar dados
- Útil para verificar se migration funcionou

---

## 🧪 **TESTES PÓS-MIGRATION**

### **Teste 1: Verificar Campos Decimal**

```typescript
// scripts/test_decimal.ts
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

async function testDecimal() {
  // Criar produto com Decimal
  const product = await prisma.product.create({
    data: {
      name: "Teste Decimal",
      price: new Prisma.Decimal(150.50),
      cost_price: new Prisma.Decimal(100.00),
      quantity: 10,
      min_stock: 5,
      category_id: "cat_xxx",
      company_id: "comp_xxx"
    }
  });

  console.log('✅ Produto criado com Decimal:', product.price.toString());
  
  // Verificar tipo
  console.log('Tipo:', product.price instanceof Prisma.Decimal ? 'Decimal' : 'Number');
}

testDecimal()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Execute:
```bash
npx ts-node scripts/test_decimal.ts
```

---

### **Teste 2: Verificar Novos Campos**

```sql
-- SQLite
.schema products

-- PostgreSQL
\d products
```

**Campos esperados**:
- ✅ `price` (DECIMAL)
- ✅ `cost_price` (DECIMAL)
- ✅ `is_active` (BOOLEAN)
- ✅ `expiry_date` (DATETIME)
- ✅ `sku` (TEXT)
- ✅ `max_stock` (INTEGER)

---

### **Teste 3: API de Vendas**

```bash
# Criar venda de teste
curl -X POST http://localhost:3000/api/sales \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {seu_token}" \
  -d '{
    "items": [
      { "product_id": "prod_123", "quantity": 2 }
    ],
    "payment_method": "DINHEIRO"
  }'
```

**Resposta esperada**:
```json
{
  "success": true,
  "data": {
    "id": "sale_xyz",
    "subtotal": "300,00 MT",
    "discount_amount": "0,00 MT",
    "tax_amount": "51,00 MT",
    "total": "351,00 MT",
    "total_profit": "100,00 MT",
    "items_count": 1,
    "payment_method": "DINHEIRO"
  }
}
```

---

### **Teste 4: Analytics Dashboard**

```bash
# Buscar dashboard
curl -X GET http://localhost:3000/api/analytics/dashboard \
  -H "Authorization: Bearer {seu_token}"
```

**Resposta esperada**:
```json
{
  "success": true,
  "data": {
    "kpis": { ... },
    "trend": [ ... ],
    "top_products": [ ... ],
    "inventory_alerts": [ ... ],
    "payment_distribution": [ ... ]
  }
}
```

---

## 🚨 **ROLLBACK (Emergência)**

Se algo der errado:

### **1. Restaurar Backup**

#### **SQLite**
```bash
# Windows
del prisma\dev.db
copy prisma\dev.db.backup prisma\dev.db

# Linux/Mac
rm prisma/dev.db
cp prisma/dev.db.backup prisma/dev.db
```

#### **PostgreSQL**
```bash
# Restaurar backup
psql -U postgres -d bizcontrol360 < backup_pre_v2.sql
```

---

### **2. Reverter Código**

```bash
# Ver commit antes da migration
git log --oneline

# Reverter para commit anterior
git revert HEAD

# Ou resetar (CUIDADO - perde mudanças)
git reset --hard HEAD~1

# Reinstalar dependências antigas
npm install

# Regenerar Prisma Client antigo
npx prisma generate
```

---

## 📊 **MONITORAMENTO PÓS-DEPLOY**

### **Logs**

```bash
# Ver logs da aplicação
npm run dev

# Ver logs do Prisma (query log)
DEBUG="prisma:query" npm run dev
```

### **Performance**

```sql
-- PostgreSQL: Ver queries lentas
SELECT 
  query,
  calls,
  total_time,
  mean_time
FROM pg_stat_statements
WHERE query LIKE '%sales%'
ORDER BY mean_time DESC
LIMIT 10;
```

### **Integridade**

```sql
-- Verificar vendas sem itens (não deveria existir)
SELECT s.id, s.total, COUNT(si.id) as items_count
FROM sales s
LEFT JOIN sale_items si ON s.id = si.sale_id
GROUP BY s.id
HAVING items_count = 0;

-- Verificar produtos com preço negativo (não deveria existir)
SELECT id, name, price, cost_price
FROM products
WHERE price < 0 OR cost_price < 0;
```

---

## ✅ **CHECKLIST PÓS-MIGRATION**

- [ ] Migration executada com sucesso
- [ ] Prisma Client regenerado
- [ ] Todos os testes passaram
- [ ] API de vendas funcionando
- [ ] Analytics dashboard funcionando
- [ ] Logs sem erros críticos
- [ ] Performance aceitável (< 100ms)
- [ ] Backup criado e testado
- [ ] Equipe notificada
- [ ] Documentação atualizada

---

## 📞 **SUPORTE**

Em caso de problemas:

1. **Consulte os logs** (`npm run dev`)
2. **Verifique a documentação**:
   - `/docs/DATABASE_AUDIT_REPORT_2025.md`
   - `/docs/MIGRATION_GUIDE.md`
   - `/docs/SALES_SYSTEM_GUIDE.md`
   - `/docs/ANALYTICS_SYSTEM_GUIDE.md`
3. **Rollback** se necessário (passos acima)
4. **Reporte issues** no GitHub

---

## 🎉 **SUCESSO!**

Se todos os passos foram completados sem erros:

**✅ BizControl 360 ERP v2.0.0 está PRONTO PARA PRODUÇÃO!**

**Mudanças principais**:
- ✅ Precisão Financeira (Decimal)
- ✅ Sistema de Vendas Enterprise
- ✅ Analytics Dashboard Completo
- ✅ Multi-tenancy Reforçado
- ✅ Auditoria Completa

---

**Última Atualização**: 18 Dezembro 2025  
**Versão**: 2.0.0
