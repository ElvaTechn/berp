# 🚀 EXECUTAR SEED - PASSO A PASSO

## ✅ CORREÇÕES FEITAS

Ajustei o `seed.ts` para corresponder exatamente ao seu schema Prisma:

### **Corrigido:**
1. ✅ `role: 'USER'` → `role: Role.VENDEDOR`
2. ✅ `email_company_id` → `findFirst` com `company_id` e `email`
3. ✅ `PaymentMethod` agora usa enum tipado
4. ✅ `seller_id` → `employee_id`
5. ✅ `total_amount` → `total`
6. ✅ Removido `invoice_number` e `customer_name` (não existem no schema)
7. ✅ `items` → `sale_items`
8. ✅ Endpoint de PDF ajustado para usar `employee` ao invés de `seller`

---

## 📋 COMANDOS PARA EXECUTAR

### **PASSO 1: Gerar Prisma Client**
```bash
npx prisma generate
```

### **PASSO 2: Aplicar Migrações** (se necessário)
```bash
npx prisma migrate dev
```

### **PASSO 3: Executar Seed**
```bash
npx prisma db seed
```

---

## ✨ O QUE VOCÊ VAI VER

Quando executar o seed com sucesso:

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

## 🎯 APÓS O SEED

### **1. Iniciar o Servidor**
```bash
npm run dev
```

### **2. Fazer Login**
- URL: `http://localhost:3000`
- Email: `gestor@bizcontrol.co.mz`
- Senha: `Admin123!`

### **3. Testar Funcionalidades**

#### **Dashboard**
```
http://localhost:3000/dashboard
```
- ✅ Gráficos populados com 30 vendas
- ✅ 5 produtos com alerta de stock baixo pulsando

#### **Funcionários**
```
http://localhost:3000/funcionarios
```
- ✅ 2 funcionários na tabela
- ✅ CRUD completo funcionando

#### **Recibo HTML** (Nova Implementação!)
```
http://localhost:3000/api/sales/[SALE_ID]/receipt
```
- ✅ Gera HTML responsivo
- ✅ Pode ser impresso diretamente pelo navegador
- ✅ Design profissional estilo recibo térmico

---

## 🐛 SE HOUVER ERROS

### **Erro: "Prisma Client not initialized"**
```bash
npx prisma generate
```

### **Erro: "Table doesn't exist"**
```bash
npx prisma migrate dev
```

### **Limpar tudo e recomeçar**
```bash
npx prisma migrate reset
# Digite 'y' para confirmar
# O seed roda automaticamente após reset
```

---

## 📊 DADOS CRIADOS

### **Empresa**
- Nome: NEXUS COMERCIAL LDA
- NUIT: 123456789
- Localização: Maputo

### **Usuários**
| Email | Senha | Role |
|-------|-------|------|
| gestor@bizcontrol.co.mz | Admin123! | ADMIN |
| vendedor@bizcontrol.co.mz | Venda123! | VENDEDOR |

### **Categorias (4)**
- Mercearia (Azul)
- Bebidas (Vermelho)
- Higiene (Roxo)
- Congelados (Laranja)

### **Produtos (20)**
- 7 Mercearia (Arroz, Óleo, Açúcar, etc.)
- 7 Bebidas (2M, Namaacha, Laurentina, etc.)
- 3 Higiene (Lux, Colgate, Omo)
- 3 Congelados (Frango, Peixe, Batatas)

### **Vendas (30)**
- Distribuídas pelos últimos 7 dias
- Métodos: DINHEIRO, MPESA, EMOLA, CARTÃO
- Horários: 8h - 20h

### **Produtos com Stock Baixo (5)** 🚨
- Fanta Laranja: 5 unidades (min: 80) - CRÍTICO!
- Óleo Oli: 8 unidades (min: 15)
- Massa Vamy: 12 unidades (min: 20)
- Pasta de Dentes: 9 unidades (min: 20)
- Peixe Carapau: 6 unidades (min: 12)

---

## ✅ CHECKLIST

Execute na ordem:

- [ ] `npx prisma generate`
- [ ] `npx prisma migrate dev` (se necessário)
- [ ] `npx prisma db seed`
- [ ] Viu mensagem de sucesso
- [ ] `npm run dev`
- [ ] Login funciona
- [ ] Dashboard mostra gráficos
- [ ] Alertas de stock pulsando
- [ ] `/funcionarios` funciona
- [ ] Recibo HTML funciona

---

## 🎉 PRONTO!

Depois que o seed rodar com sucesso, você terá:

- ✅ Sistema totalmente populado
- ✅ Dados realistas de Moçambique
- ✅ 30 vendas para análise
- ✅ Alertas de stock funcionando
- ✅ Recibos HTML para impressão

---

**Execute agora:**
```bash
npx prisma db seed
```

**Se der erro, compartilhe a mensagem completa para eu ajudar!** 🚀
