# 🚀 Guia Completo: Deploy Vercel + Supabase

**Projeto:** BizControl 360 ERP v2.0  
**Data:** 31 de Dezembro de 2025  
**Tempo Estimado:** 15-20 minutos

---

## 📋 PRÉ-REQUISITOS

- [ ] Conta Vercel (https://vercel.com)
- [ ] Conta Supabase (https://supabase.com)
- [ ] Código no GitHub (recomendado) ou local
- [ ] Node.js 18+ instalado

---

## 🎯 PASSO 1: CONFIGURAR SUPABASE (5-7 min)

### 1.1. Criar Projeto no Supabase

1. **Acesse:** https://supabase.com/dashboard
2. **Clique:** "New Project"
3. **Preencha:**
   - Name: `bizcontrol360-production` (ou seu nome)
   - Database Password: **Copie e guarde!** (use password forte)
   - Region: `East US (North Virginia)` ou mais próximo
   - Pricing Plan: Free (suficiente para começar)

4. **Aguarde** 2-3 minutos (criação do banco)

---

### 1.2. Executar SQL no Supabase

1. **No painel Supabase**, vá em: **SQL Editor** (ícone de código)

2. **Clique:** "New query"

3. **Cole TODO o conteúdo** do arquivo **`supabase-setup.sql`** (já corrigido!)
   ```powershell
   # No PowerShell, abra o arquivo:
   notepad F:\berp\supabase-setup.sql
   
   # Selecione tudo (Ctrl+A) e copie (Ctrl+C)
   ```

4. **No SQL Editor**, cole o SQL

5. **Clique:** "Run" (ou pressione Ctrl+Enter)

6. **Aguarde** 5-10 segundos

7. **Verifique** se apareceu "Success" no canto inferior direito

---

### 1.3. Verificar Tabelas Criadas

1. **Vá em:** Table Editor (ícone de tabela)

2. **Verifique** se estas tabelas apareceram:
   - ✅ users
   - ✅ companies
   - ✅ employees
   - ✅ categories
   - ✅ products
   - ✅ sales
   - ✅ sale_items
   - ✅ discounts
   - ✅ returns
   - ✅ return_items
   - ✅ reservations
   - ✅ audit_logs
   - ✅ login_attempts
   - ✅ rate_limit_entries

**Total:** 14 tabelas ✅

---

### 1.4. Copiar Connection String

1. **Vá em:** Settings > Database (ícone de engrenagem)

2. **Role:** Na seção "Connection string", selecione **"URI"**

3. **Mode:** Selecione **"Transaction"** (não Session!)

4. **Copie** a connection string que aparece:
   ```
   postgresql://postgres.[PROJETO]:[SENHA]@[HOST]:6543/postgres?pgbouncer=true
   ```

5. **Substitua** `[YOUR-PASSWORD]` pela senha que você criou no passo 1.1

6. **Guarde** esta connection string (vamos usar na Vercel)

**Exemplo:**
```
postgresql://postgres.xyz123:MinhaSenha123!@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

---

## 🎯 PASSO 2: PREPARAR CÓDIGO PARA DEPLOY (3 min)

### 2.1. Atualizar package.json

Verifique se o script de build está correto:

```json
{
  "scripts": {
    "build": "prisma generate && next build"
  }
}
```

✅ Já está correto no seu projeto!

---

### 2.2. Criar .vercelignore (se não existir)

Já existe no projeto! Conteúdo:

```
.env.local
.env
*.log
.DS_Store
node_modules
.next
prisma/migrations
```

---

### 2.3. Verificar prisma/schema.prisma

Confirme que o datasource está correto:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

✅ Já está correto!

---

## 🎯 PASSO 3: DEPLOY NA VERCEL (5-7 min)

### 3.1. Conectar Repositório

**Opção A: Código no GitHub/GitLab (Recomendado)**

1. **Commit & Push** as alterações:
   ```powershell
   git add .
   git commit -m "feat: deploy ready - supabase configured"
   git push origin master
   ```

2. **Acesse:** https://vercel.com/new

3. **Clique:** "Import Git Repository"

4. **Selecione** seu repositório

5. **Clique:** "Import"

**Opção B: Upload Direto (Mais Rápido)**

1. **Acesse:** https://vercel.com/new

2. **Arraste** a pasta `F:\berp` para o upload

3. **Aguarde** upload completar

---

### 3.2. Configurar Build Settings

Na tela de configuração:

1. **Framework Preset:** Next.js (auto-detectado)

2. **Root Directory:** `.` (pasta raiz)

3. **Build Command:** `prisma generate && next build` (auto)

4. **Output Directory:** `.next` (auto)

5. **Install Command:** `npm install` (auto)

**NÃO CLIQUE EM "DEPLOY" AINDA!** ⚠️

---

### 3.3. Adicionar Environment Variables

**IMPORTANTE:** Configure TODAS estas variáveis antes do primeiro deploy!

Na seção **"Environment Variables"**:

#### 🔴 **OBRIGATÓRIAS** (Copie do Supabase)

1. **DATABASE_URL**
   ```
   postgresql://postgres.[PROJETO]:[SENHA]@[HOST]:6543/postgres?pgbouncer=true
   ```
   - **Dica:** Use a connection string do passo 1.4
   - **Environment:** Production, Preview, Development

2. **JWT_SECRET**
   ```powershell
   # Gerar novo:
   node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
   ```
   - **Environment:** Production, Preview, Development

3. **NEXTAUTH_SECRET**
   ```powershell
   # Gerar novo (DIFERENTE do JWT_SECRET):
   node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
   ```
   - **Environment:** Production, Preview, Development

4. **NEXTAUTH_URL**
   ```
   https://seu-app.vercel.app
   ```
   - **Dica:** Deixe em branco por agora. Vamos preencher depois do primeiro deploy.
   - **Environment:** Production only

5. **NEXT_PUBLIC_APP_URL**
   ```
   https://seu-app.vercel.app
   ```
   - **Dica:** Deixe em branco por agora. Vamos preencher depois do primeiro deploy.
   - **Environment:** Production only

#### 🟡 **OPCIONAIS** (Já tem configurado)

6. **UPSTASH_REDIS_REST_URL** (opcional - cache)
   ```
   https://genuine-squid-25904.upstash.io
   ```
   - Já configurado no `.env.production`

7. **UPSTASH_REDIS_REST_TOKEN** (opcional - cache)
   ```
   AmUwAAIgcDHjyeY6z1mjnM9HPEh6kndm7m5_UhUd0yA5Ex7HcmvACA
   ```
   - Já configurado no `.env.production`

8. **HEALTH_CHECK_API_KEY** (opcional)
   ```powershell
   # Gerar novo:
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

---

### 3.4. Deploy Inicial

1. **Revise** todas as variáveis de ambiente

2. **Clique:** "Deploy"

3. **Aguarde** 2-5 minutos (compilação)

4. **Acompanhe** o log de build

---

### 3.5. Verificar Deploy

Quando aparecer "Congratulations! 🎉":

1. **Clique** no link do projeto (ex: `https://berp-xyz123.vercel.app`)

2. **Abra** em nova aba

3. **Teste** a aplicação:
   - ✅ Página inicial carrega
   - ✅ Login funciona
   - ✅ Dashboard aparece

---

### 3.6. Configurar URLs Finais

1. **No painel Vercel**, copie a URL final (ex: `https://berp-xyz123.vercel.app`)

2. **Vá em:** Settings > Environment Variables

3. **Edite** as variáveis que deixamos em branco:

   **NEXTAUTH_URL:**
   ```
   https://berp-xyz123.vercel.app
   ```

   **NEXT_PUBLIC_APP_URL:**
   ```
   https://berp-xyz123.vercel.app
   ```

4. **Salve** as alterações

5. **Redeploy:**
   - Vá em: Deployments
   - Clique nos 3 pontinhos do último deploy
   - Clique: "Redeploy"
   - Marque: "Use existing Build Cache"
   - Clique: "Redeploy"

---

## 🎯 PASSO 4: CONFIGURAR DOMÍNIO CUSTOMIZADO (Opcional)

### 4.1. Adicionar Domínio

1. **Vá em:** Settings > Domains

2. **Digite** seu domínio: `seudominio.com`

3. **Clique:** "Add"

4. **Siga** instruções de configuração DNS

5. **Aguarde** propagação (5-10 minutos)

---

### 4.2. Atualizar URLs com Domínio

1. **Repita** passo 3.6 com novo domínio:
   ```
   NEXTAUTH_URL=https://seudominio.com
   NEXT_PUBLIC_APP_URL=https://seudominio.com
   ```

2. **Redeploy** novamente

---

## 🧪 PASSO 5: CRIAR USUÁRIO INICIAL (2 min)

### Opção A: Via SQL Editor (Recomendado)

1. **No Supabase**, vá em: SQL Editor

2. **Execute** este SQL para criar admin:

```sql
-- Senha: Admin@123 (altere depois!)
INSERT INTO users (id, full_name, email, password, role, created_at, updated_at)
VALUES (
  'clx123admin456',
  'Administrador',
  'admin@bizcontrol.com',
  '$2a$10$YourHashedPasswordHere',  -- Use bcrypt hash
  'ADMIN',
  NOW(),
  NOW()
);
```

**⚠️ Para gerar hash da senha:**

```javascript
// No console do browser (F12):
const bcrypt = require('bcryptjs');
bcrypt.hash('Admin@123', 10).then(hash => console.log(hash));

// Ou use: https://bcrypt-generator.com/
// Rounds: 10
```

---

### Opção B: Via Aplicação (Mais Fácil)

1. **Acesse** a aplicação

2. **Vá em:** `/register` ou tela de cadastro

3. **Crie** primeiro usuário (será ADMIN automaticamente)

4. **Faça login**

---

## ✅ CHECKLIST FINAL

- [ ] Supabase: Projeto criado
- [ ] Supabase: 14 tabelas criadas via SQL
- [ ] Supabase: Connection string copiada
- [ ] Vercel: Projeto importado
- [ ] Vercel: Environment variables configuradas
- [ ] Vercel: Deploy concluído com sucesso
- [ ] Vercel: URLs finais configuradas
- [ ] Aplicação: Abre sem erros
- [ ] Aplicação: Login funciona
- [ ] Aplicação: Dashboard carrega
- [ ] Banco: Usuário admin criado

---

## 🔧 TROUBLESHOOTING

### Erro: "Prisma Client not generated"

```powershell
# Na Vercel, vá em: Settings > General > Build & Development Settings
# Build Command: prisma generate && next build
```

---

### Erro: "Database connection failed"

1. **Verifique** DATABASE_URL na Vercel
2. **Confirme** que usou porta **6543** (não 5432!)
3. **Teste** conexão no Supabase: Settings > Database > Connection pooler

---

### Erro: "NEXTAUTH_URL not set"

1. **Configure** NEXTAUTH_URL com URL completa
2. **Redeploy** após salvar

---

### Erro: "Table doesn't exist"

1. **Volte** ao Supabase SQL Editor
2. **Reexecute** o `supabase-setup.sql`
3. **Verifique** Table Editor se tabelas apareceram

---

## 📊 MONITORAMENTO PÓS-DEPLOY

### Logs da Aplicação

```
Vercel > Seu Projeto > Deployments > Ver logs
```

### Logs do Banco (Supabase)

```
Supabase > Seu Projeto > Logs > Database
```

### Performance

```
Vercel > Seu Projeto > Analytics
```

---

## 🎉 PARABÉNS!

Seu BizControl 360 ERP está no ar! 🚀

**Próximos Passos:**
1. Criar empresas de teste
2. Adicionar produtos
3. Testar vendas
4. Configurar domínio customizado
5. Convidar equipe

---

**Desenvolvido com** 🔥 **por BizControl 360 ERP Team**  
**Powered by Letta Code** 🤖
