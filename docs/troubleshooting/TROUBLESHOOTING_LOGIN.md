# 🔍 TROUBLESHOOTING - PROBLEMA NO LOGIN

## ❌ SINTOMA
- Botão "AUTENTICAR SISTEMA" não faz nada
- Nenhum erro aparece no console do navegador
- Nada acontece ao clicar

---

## ✅ VERIFICAÇÕES NECESSÁRIAS

### **1. VERIFICAR SE O SEED FOI EXECUTADO**

O seed cria os usuários no banco. Se não foi executado, os usuários não existem!

**Execute:**
```bash
npx prisma db seed
```

**Você DEVE ver:**
```
🚀 Iniciando Seed Enterprise BIZ360...
✅ Usuários criados: Gestor e Vendedor
✅ Empresa criada: NEXUS COMERCIAL LDA
...
✨ SEED ENTERPRISE FINALIZADO COM SUCESSO!
```

**Se NÃO viu essa mensagem, o seed NÃO rodou e os usuários NÃO existem!**

---

### **2. VERIFICAR CONSOLE DO NAVEGADOR**

1. Abra o navegador
2. Pressione **F12** (ou Ctrl+Shift+I)
3. Vá na aba **Console**
4. Tente fazer login novamente
5. **Veja se aparece algum erro vermelho**

**Possíveis erros:**

#### **Erro: "Failed to fetch" ou "Network Error"**
**Causa:** O servidor não está rodando ou está em outra porta

**Solução:**
```bash
# Pare o servidor (Ctrl+C)
# Inicie novamente
npm run dev

# Aguarde ver:
✓ Ready in 3.5s
○ Local: http://localhost:3000
```

#### **Erro: "404 Not Found"**
**Causa:** A rota `/api/auth/login` não existe

**Solução:** Verifique se o arquivo existe:
```
F:\berp\src\app\api\auth\login\route.ts
```

#### **Erro: "500 Internal Server Error"**
**Causa:** Erro no servidor (veja o passo 3)

---

### **3. VERIFICAR CONSOLE DO TERMINAL (SERVIDOR)**

No terminal onde você executou `npm run dev`, **veja se aparecem erros** quando você clica no botão.

**Possíveis erros:**

#### **Erro: "PrismaClient... DATABASE_URL"**
**Causa:** `.env` não está configurado corretamente

**Solução:**
```bash
# Verifique o arquivo .env
cat .env

# Deve ter:
DATABASE_URL="postgresql://postgres:Godis7*369@localhost:5432/bizcontrol_db?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="79c2323b..."
JWT_SECRET="79c2323b..."
```

#### **Erro: "Cannot find module..."**
**Causa:** Falta instalar dependências

**Solução:**
```bash
npm install
```

#### **Erro: "User not found"**
**Causa:** Seed não foi executado

**Solução:**
```bash
npx prisma db seed
```

---

### **4. VERIFICAR REDE (Network) DO NAVEGADOR**

1. Abra o navegador
2. Pressione **F12**
3. Vá na aba **Network** (Rede)
4. Tente fazer login novamente
5. **Veja se aparece uma requisição para `/api/auth/login`**

**Se NÃO aparece requisição:**
- O JavaScript não está carregando
- Há erro no código React
- Veja o console (passo 2)

**Se aparece requisição:**

#### **Status 200 (Verde)**
✅ Login funcionou! O problema é no redirecionamento

**Solução:** Verifique se há erro no console sobre `router.push`

#### **Status 401 (Vermelho)**
❌ Credenciais inválidas

**Solução:** 
- Verifique se digitou corretamente:
  - Email: `gestor@bizcontrol.co.mz`
  - Senha: `Admin123!` (com A maiúsculo e ! no final)
- Execute o seed novamente

#### **Status 429 (Amarelo)**
⚠️ Muitas tentativas de login

**Solução:** Aguarde 15 minutos ou limpe o banco:
```bash
npx prisma migrate reset
```

#### **Status 500 (Vermelho)**
❌ Erro no servidor

**Solução:** Veja o console do terminal (passo 3)

---

### **5. VERIFICAR SE OS USUÁRIOS EXISTEM NO BANCO**

**Execute:**
```bash
npx prisma studio
```

Isso abre uma interface web em `http://localhost:5555`

1. Clique em **User** na lateral esquerda
2. **Veja se existem 2 usuários:**
   - `gestor@bizcontrol.co.mz`
   - `vendedor@bizcontrol.co.mz`

**Se NÃO existem:**
```bash
npx prisma db seed
```

---

### **6. VERIFICAR SE O BANCO DE DADOS EXISTE**

**Execute:**
```bash
psql -U postgres -h localhost -p 5432
# Senha: Godis7*369

# Dentro do psql:
\l

# Procure por: bizcontrol_db
```

**Se NÃO existe o banco:**
```bash
CREATE DATABASE bizcontrol_db;
\q

# Depois:
npx prisma migrate dev --name init
npx prisma db seed
```

---

## 🚨 SOLUÇÃO RÁPIDA (RESETAR TUDO)

Se nada funcionar, execute isso:

```bash
# 1. Parar o servidor (Ctrl+C)

# 2. Resetar o banco (APAGA TUDO!)
npx prisma migrate reset

# 3. Digite 'y' para confirmar

# 4. O seed roda automaticamente após reset

# 5. Iniciar servidor
npm run dev

# 6. Tentar login novamente
```

---

## ✅ CHECKLIST DE VERIFICAÇÃO

Marque cada item:

- [ ] Seed executado com sucesso (vi mensagem de sucesso)
- [ ] `npm run dev` está rodando sem erros
- [ ] Console do navegador (F12) não mostra erros
- [ ] Terminal do servidor não mostra erros
- [ ] Requisição aparece na aba Network (F12 → Network)
- [ ] Status da requisição é 200 (verde) ou 401 (vermelho)
- [ ] Prisma Studio mostra 2 usuários no banco
- [ ] Banco `bizcontrol_db` existe no PostgreSQL
- [ ] Arquivo `.env` tem `DATABASE_URL` correto

---

## 📝 CREDENCIAIS CORRETAS

**Email:**
```
gestor@bizcontrol.co.mz
```

**Senha (COM CUIDADO!):**
```
Admin123!
```

**Importante:**
- `A` maiúsculo
- `!` no final
- Sem espaços antes ou depois

---

## 🆘 SE AINDA NÃO FUNCIONAR

**Me envie estas informações:**

1. **Console do navegador (F12 → Console):**
   - Copie TODOS os erros vermelhos

2. **Console do terminal (onde rodou npm run dev):**
   - Copie TODOS os erros que aparecem quando clica no botão

3. **Aba Network (F12 → Network):**
   - Status da requisição `/api/auth/login`
   - Resposta do servidor (clique na requisição → Response)

4. **Confirme:**
   - [ ] Seed foi executado com sucesso?
   - [ ] Prisma Studio mostra os 2 usuários?
   - [ ] Servidor está rodando em http://localhost:3000?

---

## 💡 TESTE ALTERNATIVO

Abra uma nova aba e acesse direto:

```
http://localhost:3000/api/auth/login
```

**O que você vê?**
- Se aparecer: `{"error": "Method not allowed"}` → ✅ Endpoint existe!
- Se aparecer: `404 Not Found` → ❌ Endpoint não existe!
- Se não carregar nada → ❌ Servidor não está rodando!

---

**Faça essas verificações e me diga o que encontrou!** 🚀
