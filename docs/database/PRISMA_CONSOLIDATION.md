# 📋 Configuração do Prisma - Consolidada

## ✅ Mudanças Realizadas

### Consolidação de Schemas
- ✅ **Removido**: `schema-production.prisma` (duplicado)
- ✅ **Mantido**: `schema.prisma` (único, melhorado com todas as features)
- ✅ **Atualizado**: Suporta SQLite (dev) e PostgreSQL (produção)

### Consolidação de Seeds
- ✅ **Removido**: `seed-secure.ts` (código integrado)
- ✅ **Atualizado**: `seed.ts` (com todas as práticas seguras)
- ✅ **Features**: Variáveis de ambiente, logging, senhas seguras

### Limpeza de Arquivos
- ✅ **Removido**: `prisma.config.ts` (não necessário)
- ✅ **Novo**: `.env.local` (desenvolvimento)
- ✅ **Novo**: `.env.production` (produção)

---

## 🏗️ Estrutura Final do Prisma

```
prisma/
├── schema.prisma           # ⭐ Schema único (SQLite/PostgreSQL)
├── seed.ts                 # ⭐ Seed melhorado (com logging e env)
├── dev.db                  # Banco de dados SQLite (dev)
├── migrations/             # Histórico de migrações
│   ├── 20251214202837_init/
│   ├── 20251214203516_add_category_color/
│   └── migration_lock.toml
└── .env files (na raiz)
```

---

## 🚀 Como Usar

### Desenvolvimento Local

1. **Configurar variáveis de ambiente**:
```bash
# .env.local já está pronto!
# Customizar se necessário
```

2. **Resetar banco de dados** (se houver mudanças no schema):
```bash
npm run prisma:reset
```

3. **Gerar migrations** (após alterar schema.prisma):
```bash
npm run prisma:migrate:dev --name "descricao_mudanca"
```

4. **Visualizar dados** (Prisma Studio):
```bash
npm run prisma:studio
```

---

### Produção

1. **Copiar `.env.production`** para servidor:
```bash
# Atualizar credenciais reais:
# - DATABASE_URL com PostgreSQL
# - DEFAULT_ADMIN_PASSWORD
# - JWT_SECRET
# - NEXT_PUBLIC_API_URL
```

2. **Aplicar migrations**:
```bash
npm run prisma:migrate:deploy
```

3. **Executar seed** (opcional, só na primeira vez):
```bash
node prisma/seed.ts
```

---

## 📊 Schema Consolidado - Features

### ✨ O que melhorou

| Aspecto | Antes | Depois |
|---------|-------|--------|
| **Arquivos** | 2 schemas + 2 seeds | 1 schema + 1 seed |
| **Segurança** | Senhas hardcoded | Env variables + hash bcrypt |
| **Logging** | Sem logs | Logger completo |
| **Tipos** | String genérico | Enums (Role, PaymentMethod) |
| **Features** | Sem reservas | Modelo Reservation completo |
| **Auditoria** | Sem AuditLog | Modelo completo com índices |
| **Produção** | Não pronta | PostgreSQL ready |

### 🎯 Models Inclusos

1. **User** - Autenticação com roles (ADMIN, GESTOR, VENDEDOR)
2. **Company** - Empresas com múltiplos employees
3. **Employee** - Funcionários por empresa
4. **Category** - Categorias de produtos
5. **Product** - Produtos com barcode e cost_price
6. **Sale** - Vendas com items
7. **SaleItem** - Itens de venda (imutável, histórico de preços)
8. **Reservation** - Sistema de reservas com expiração
9. **AuditLog** - Trilha de auditoria completa

### 🔐 Segurança

- Enums para roles (Type-safe)
- On Delete CASCADE/RESTRICT/SetNull apropriados
- Índices otimizados
- Unique constraints
- Campos de auditoria (timestamp, user_id, IP, user_agent)

---

## 🔧 Scripts Recomendados (package.json)

```json
{
  "scripts": {
    "prisma:studio": "prisma studio",
    "prisma:migrate:dev": "prisma migrate dev",
    "prisma:migrate:deploy": "prisma migrate deploy",
    "prisma:reset": "prisma migrate reset --force",
    "prisma:seed": "node prisma/seed.ts",
    "seed": "prisma db seed"
  },
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

---

## ⚠️ Próximos Passos

1. **Testar migrations**: `npm run prisma:migrate:dev --name "test"`
2. **Gerar Prisma Client**: Automático ao fazer migrate
3. **Adicionar seed no package.json** se necessário
4. **Configurar DATABASE_URL** em `.env.local` para seu banco

---

## 📚 Documentação

- [Prisma Docs](https://www.prisma.io/docs)
- [Prisma PostgreSQL](https://www.prisma.io/docs/concepts/database-connectors/postgresql)
- [Prisma Enums](https://www.prisma.io/docs/concepts/components/prisma-schema/data-types#enum)
