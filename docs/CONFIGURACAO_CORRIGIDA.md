# ✅ CONFIGURAÇÃO CORRIGIDA!

## 🔧 O QUE FOI CORRIGIDO

### **1. Arquivo `.env`**
- ✅ **Corrigido:** Removida duplicação `DATABASE_URL="DATABASE_URL="`
- ✅ **Adicionado:** `NEXTAUTH_URL` para NextAuth funcionar
- ✅ **Adicionado:** `NEXTAUTH_SECRET` com o mesmo valor do JWT_SECRET
- ✅ **Formatado:** Todas as variáveis organizadas com comentários

### **Antes (Errado):**
```env
DATABASE_URL="DATABASE_URL="postgresql://postgres:...
```

### **Depois (Correto):**
```env
DATABASE_URL="postgresql://postgres:Godis7*369@localhost:5432/bizcontrol_db?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="79c2323b..."
```

---

## 🚀 EXECUTE AGORA (PASSO A PASSO)

### **PASSO 1: Verificar PostgreSQL**

Certifique-se que o PostgreSQL está rodando:

```bash
# Windows: Verificar se o serviço está ativo
# Abra Services (services.msc) e procure por "postgresql"
```

Ou tente conectar:
```bash
psql -U postgres -h localhost -p 5432
# Senha: Godis7*369
```

Se conectar, digite `\q` para sair e continue.

---

### **PASSO 2: Criar Banco de Dados** (se não existir)

```bash
# Conecte ao PostgreSQL
psql -U postgres -h localhost -p 5432

# Dentro do psql, execute:
CREATE DATABASE bizcontrol_db;

# Verifique:
\l

# Saia:
\q
```

---

### **PASSO 3: Gerar Prisma Client**

```bash
npx prisma generate
```

**Você verá:**
```
✔ Generated Prisma Client
```

---

### **PASSO 4: Aplicar Migrações**

```bash
npx prisma migrate dev --name init
```

**Você verá:**
```
✔ Generated Prisma Client
Your database is now in sync with your schema.
```

---

### **PASSO 5: Executar Seed**

```bash
npx prisma db seed
```

**Você DEVE ver:**
```
🚀 Iniciando Seed Enterprise BIZ360...

👤 Criando usuários...
✅ Usuários criados: Gestor e Vendedor

🏢 Criando empresa...
✅ Empresa criada: NEXUS COMERCIAL LDA

👥 Criando funcionários...
✅ Funcionários criados

📂 Criando categorias...
✅ 4 Categorias criadas

📦 Criando produtos moçambicanos...
✅ 20 Produtos criados

🛒 Gerando vendas históricas (últimos 7 dias)...
✅ 30 Vendas geradas

═══════════════════════════════════════════
✨ SEED ENTERPRISE FINALIZADO COM SUCESSO!
═══════════════════════════════════════════

🔑 CREDENCIAIS DE ACESSO:
───────────────────────────────────────────
👨‍💼 GESTOR:
   Email: gestor@bizcontrol.co.mz
   Senha: Admin123!

👨‍💻 VENDEDOR:
   Email: vendedor@bizcontrol.co.mz
   Senha: Venda123!
═══════════════════════════════════════════
```

---

### **PASSO 6: Iniciar Servidor**

```bash
npm run dev
```

**Aguarde até ver:**
```
✓ Ready in 3.5s
○ Local:   http://localhost:3000
```

---

### **PASSO 7: Fazer Login**

1. Abra o navegador
2. Acesse: `http://localhost:3000`
3. Use estas credenciais:

```
Email: gestor@bizcontrol.co.mz
Senha: Admin123!
```

---

### **PASSO 8: Testar Funcionalidades**

#### **Dashboard**
```
http://localhost:3000/dashboard
```
- ✅ Gráficos de vendas dos últimos 7 dias
- ✅ 5 produtos com alerta de stock baixo (pulsando)

#### **Funcionários**
```
http://localhost:3000/funcionarios
```
- ✅ 2 funcionários na tabela
- ✅ Adicionar, editar, deletar funcionários

#### **Recibo HTML**
```
http://localhost:3000/api/sales/[COPIE_UM_ID_DO_PRISMA_STUDIO]/receipt
```
- ✅ Gera HTML responsivo
- ✅ Pode imprimir diretamente

---

## 🐛 TROUBLESHOOTING

### **Erro: "role postgres does not exist"**

**Solução:**
```bash
# Conecte ao PostgreSQL como superuser
psql -U postgres -h localhost -p 5432

# Crie a role se não existir
CREATE ROLE postgres WITH LOGIN PASSWORD 'Godis7*369' SUPERUSER;
```

---

### **Erro: "database bizcontrol_db does not exist"**

**Solução:**
```bash
# Conecte ao PostgreSQL
psql -U postgres -h localhost -p 5432

# Crie o banco
CREATE DATABASE bizcontrol_db;

# Saia e tente novamente
\q
```

---

### **Erro: "Port 5432 is not open"**

**Solução:**
- PostgreSQL não está rodando
- No Windows: Abra `services.msc` e inicie o serviço "postgresql-x64-XX"
- Ou reinstale PostgreSQL

---

### **Erro: "Authentication failed for user postgres"**

**Solução:**
- Senha incorreta no `.env`
- Verifique a senha do PostgreSQL
- Edite `.env` com a senha correta:
```env
DATABASE_URL="postgresql://postgres:SUA_SENHA_AQUI@localhost:5432/bizcontrol_db?schema=public"
```

---

### **Limpar Tudo e Recomeçar**

Se tudo falhar:

```bash
# 1. Dropar banco (se existir)
psql -U postgres -h localhost -p 5432
DROP DATABASE IF EXISTS bizcontrol_db;
CREATE DATABASE bizcontrol_db;
\q

# 2. Resetar Prisma
npx prisma migrate reset

# 3. Digite 'y' para confirmar
# O seed roda automaticamente após reset
```

---

## ✅ CHECKLIST FINAL

Execute na ordem e marque:

- [ ] PostgreSQL está rodando
- [ ] Banco `bizcontrol_db` existe
- [ ] `npx prisma generate` executado
- [ ] `npx prisma migrate dev` executado
- [ ] `npx prisma db seed` executou com SUCESSO
- [ ] Viu mensagem "SEED ENTERPRISE FINALIZADO COM SUCESSO"
- [ ] `npm run dev` rodando
- [ ] Login funciona com gestor@bizcontrol.co.mz
- [ ] Dashboard mostra dados
- [ ] `/funcionarios` funciona
- [ ] Recibos HTML funcionam

---

## 📊 DADOS QUE VOCÊ TERÁ

Após seed bem-sucedido:

- ✅ **1 Empresa:** NEXUS COMERCIAL LDA
- ✅ **2 Usuários:** Gestor + Vendedor
- ✅ **2 Funcionários:** Cadastrados
- ✅ **4 Categorias:** Mercearia, Bebidas, Higiene, Congelados
- ✅ **20 Produtos:** Moçambicanos reais
- ✅ **30 Vendas:** Últimos 7 dias
- ✅ **5 Alertas:** Stock baixo

---

## 🎉 PRONTO!

Agora execute:

```bash
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

**Se der qualquer erro, compartilhe a mensagem completa!** 🚀

---

**Desenvolvido com 💜 para o BIZ360 🇲🇿**
