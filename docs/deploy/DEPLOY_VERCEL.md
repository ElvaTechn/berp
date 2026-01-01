# 🚀 Guia de Deploy na Vercel - BizControl 360

## ✅ Pré-requisitos

- [x] Conta no Supabase criada
- [x] Projeto Supabase configurado
- [x] Conta GitHub/GitLab (para conectar repositório)

---

## 📋 Passo 1: Configurar Banco de Dados Supabase

### 1.1 Pegar Connection String

1. Acesse o dashboard do Supabase
2. Vá em **Settings** (⚙️) > **Database**
3. Role até **Connection String**
4. Selecione **"URI"** (não Session mode)
5. Copie a string (exemplo):
   ```
   postgresql://postgres.[seu-projeto]:[SUA-SENHA]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```
6. **⚠️ IMPORTANTE**: Substitua `[SUA-SENHA]` pela senha do projeto

### 1.2 Criar as Tabelas no Supabase

**Opção A - Via Supabase Dashboard:**

1. No Supabase, vá em **SQL Editor**
2. Cole o schema do Prisma convertido para SQL
3. Execute

**Opção B - Via Prisma Migrate (Recomendado):**

1. Crie arquivo `.env` local temporário:
   ```bash
   DATABASE_URL="postgresql://postgres.[projeto]:[senha]@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
   ```

2. Execute as migrações:
   ```bash
   npx prisma migrate deploy
   ```

3. **Opcional** - Popular com dados de exemplo:
   ```bash
   npx prisma db seed
   ```

---

## 🔐 Passo 2: Gerar Secrets

Execute no terminal para gerar secrets fortes:

### Windows (PowerShell):
```powershell
# JWT Secret
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 }))

# NextAuth Secret (execute novamente para outro valor)
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 }))
```

### Linux/Mac:
```bash
# JWT Secret
openssl rand -base64 64

# NextAuth Secret
openssl rand -base64 64
```

**Guarde esses valores!** Você vai precisar deles na Vercel.

---

## 🌐 Passo 3: Deploy na Vercel

### 3.1 Conectar Repositório

1. Acesse [vercel.com](https://vercel.com)
2. Faça login com GitHub/GitLab
3. Clique em **"Add New Project"**
4. Selecione o repositório **berp**
5. Clique em **"Import"**

### 3.2 Configurar Build Settings

A Vercel detecta automaticamente Next.js. Confirme:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build` (já configurado com Prisma)
- **Output Directory**: `.next` (padrão)
- **Install Command**: `npm install`

### 3.3 Configurar Variáveis de Ambiente

Antes de fazer deploy, clique em **"Environment Variables"** e adicione:

#### Obrigatórias:

| Key | Value | Exemplo |
|-----|-------|---------|
| `DATABASE_URL` | Connection string do Supabase | `postgresql://postgres.abc:senha@aws-0-us-east-1.pooler.supabase.com:6543/postgres` |
| `JWT_SECRET` | Secret gerado no Passo 2 | `A7x9B...` (64 caracteres) |
| `NEXTAUTH_SECRET` | Secret gerado no Passo 2 | `B8y0C...` (64 caracteres) |
| `NEXTAUTH_URL` | **Deixe em branco** (Vercel preenche) | Auto-detectado |
| `NEXT_PUBLIC_APP_URL` | **Deixe em branco** (Vercel preenche) | Auto-detectado |

#### Opcionais (já configuradas):

| Key | Value |
|-----|-------|
| `UPSTASH_REDIS_REST_URL` | `https://genuine-squid-25904.upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | `AmUwAAIg...` |

**Dica**: Marque todas como **Production**, **Preview** e **Development**.

### 3.4 Deploy!

1. Clique em **"Deploy"**
2. Aguarde o build (2-5 minutos)
3. 🎉 **Deploy concluído!**

---

## ✅ Passo 4: Verificar Deploy

### 4.1 Acessar URL

A Vercel vai gerar uma URL como:
```
https://berp-xyz123.vercel.app
```

### 4.2 Testar Funcionalidades

- [ ] Login funciona?
- [ ] Dashboard carrega?
- [ ] POS (Ponto de Venda) funciona?
- [ ] Vendas são registradas no banco?

### 4.3 Verificar Banco de Dados

No Supabase:
1. Vá em **Table Editor**
2. Verifique se as tabelas foram criadas
3. Teste criar usuário e fazer uma venda

---

## 🔧 Passo 5: Configurações Pós-Deploy

### 5.1 Domínio Customizado (Opcional)

1. Na Vercel, vá em **Settings** > **Domains**
2. Adicione seu domínio (`seuapp.com`)
3. Configure DNS conforme instruções

### 5.2 Atualizar URLs

Se usar domínio customizado, atualize:

- `NEXT_PUBLIC_APP_URL=https://seuapp.com`
- `NEXTAUTH_URL=https://seuapp.com`

### 5.3 Criar Usuário Admin

**Via Supabase SQL Editor:**

```sql
-- Criar usuário admin (senha: admin123)
INSERT INTO "users" (id, full_name, email, password, role, is_active)
VALUES (
  gen_random_uuid(),
  'Administrador',
  'admin@bizcontrol.com',
  '$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDlwpfuAxD2EUEuY.f5qF4Qhx/5C', -- bcrypt de "admin123"
  'ADMIN',
  true
);
```

**Ou via API** (depois do deploy):

```bash
curl -X POST https://seu-app.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Administrador",
    "email": "admin@bizcontrol.com",
    "password": "admin123",
    "role": "ADMIN"
  }'
```

---

## 🐛 Troubleshooting

### Erro: "Prisma Client could not be generated"

**Solução**: O script `postinstall` no `package.json` já está configurado. Faça redeploy.

### Erro: "Could not connect to database"

**Causa**: `DATABASE_URL` incorreta.

**Solução**:
1. Verifique a connection string no Supabase
2. Confirme que substituiu `[SUA-SENHA]`
3. Teste localmente:
   ```bash
   DATABASE_URL="sua-url-aqui" npx prisma db push
   ```

### Erro: "Invalid JWT"

**Causa**: `JWT_SECRET` diferente entre builds.

**Solução**: Use o mesmo secret em todas as variáveis de ambiente.

### PWA não funciona

**Causa**: Service Worker não carrega na Vercel.

**Solução**: PWA funciona apenas em HTTPS. A Vercel já fornece HTTPS automaticamente.

---

## 📊 Monitoramento

### Logs

Na Vercel:
- **Deployments** > Seu deploy > **View Function Logs**

### Database

No Supabase:
- **Database** > **Logs** para queries
- **Table Editor** para ver dados

### Performance

- **Vercel Analytics** (grátis para hobby)
- **Vercel Speed Insights**

---

## 🔄 Atualizações Futuras

Sempre que fizer mudanças:

1. **Commit e Push** para GitHub/GitLab
2. Vercel faz **deploy automático**
3. Verifica logs em caso de erro

### Migrações do Banco

Se adicionar/modificar tabelas:

```bash
# Local
npx prisma migrate dev --name nome_da_migracao

# Production (Vercel + Supabase)
DATABASE_URL="url-supabase" npx prisma migrate deploy
```

---

## 📞 Suporte

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Prisma Docs**: https://www.prisma.io/docs

---

## ✅ Checklist Final

Antes de marcar como concluído:

- [ ] Deploy na Vercel bem-sucedido
- [ ] Todas variáveis de ambiente configuradas
- [ ] Banco de dados Supabase conectado
- [ ] Tabelas criadas via Prisma Migrate
- [ ] Login funciona
- [ ] POS funciona
- [ ] Vendas registram no banco
- [ ] PWA funciona (ícone instalável)
- [ ] Domínio customizado (se aplicável)

---

🎉 **Parabéns! Seu BizControl 360 está no ar!**
