# 🔄 INSTRUÇÕES: RESET E SEED DO BANCO DE DADOS

## ⚠️ PROBLEMA IDENTIFICADO

Você reportou 3 problemas:

1. ✅ **Layout do Dashboard** - Muito espaço entre título e conteúdo → **CORRIGIDO**
2. ✅ **Dados persistem após reset** - Dados não são mock/JSON, são do banco → **EXPLICADO ABAIXO**
3. ✅ **Login de Admin falha** - Admin não tinha employee → **CORRIGIDO**

---

## 🛠️ CORREÇÕES APLICADAS

### 1. **Layout do Dashboard**
- Removido `mx-auto` e `max-w-7xl` do container principal
- Agora o conteúdo usa a largura total disponível
- Sem espaço excessivo à esquerda

### 2. **Dados do Dashboard**
- ✅ **NÃO HÁ DADOS MOCK/JSON** no código
- ✅ Todos os dados vêm do banco de dados PostgreSQL
- ✅ Vendas são criadas pelo seed (30 vendas dos últimos 7 dias)
- ✅ Produtos são criados pelo seed (20 produtos moçambicanos)

### 3. **Login de Admin**
- ✅ Admin agora TEM employee vinculado à empresa
- ✅ Admin pode acessar dashboard e todas as funcionalidades
- ✅ Credenciais corretas adicionadas

---

## 📝 PASSOS PARA RESET COMPLETO

Execute estes comandos **NA ORDEM EXATA**:

### **Passo 1: Parar o Servidor**
```bash
# Pressione Ctrl+C no terminal onde npm run dev está rodando
```

### **Passo 2: Reset Completo do Banco**
```bash
# Reset do Prisma (apaga TUDO e recria)
npx prisma migrate reset

# Confirme com 'y' quando perguntar
```

**O que acontece:**
- ✅ Apaga TODAS as tabelas
- ✅ Recria as tabelas do zero
- ✅ Executa o seed automaticamente
- ✅ Cria: Admin, Gestor, Vendedor, 20 produtos, 30 vendas

### **Passo 3: Verificar se Seed Rodou**
Você DEVE ver esta mensagem no final:

```
✨ SEED ENTERPRISE FINALIZADO COM SUCESSO!
═══════════════════════════════════════════

🔑 CREDENCIAIS DE ACESSO:
───────────────────────────────────────────
🔐 ADMIN (Super Administrador):
   Email:    admin@bizcontrol.co.mz
   Senha:    Admin123!
   Acesso:   Dashboard completo da empresa

👨‍💼 GESTOR (Gestor da Empresa):
   Email:    gestor@bizcontrol.co.mz
   Senha:    Gestor123!
   Acesso:   Dashboard e gestão completa

👨‍💻 VENDEDOR:
   Email:    vendedor@bizcontrol.co.mz
   Senha:    Venda123!
   Acesso:   Apenas ponto de venda (PDV)
═══════════════════════════════════════════
```

**SE NÃO VIU ESSA MENSAGEM**, o seed não rodou!

### **Passo 4: Limpar Cache do Navegador**
```bash
# NO NAVEGADOR:
1. Pressione Ctrl+Shift+Delete
2. Selecione:
   ✅ Cookies e dados de sites
   ✅ Imagens e arquivos em cache
3. Clique em "Limpar dados"
```

**OU simplesmente:**
- Use **Janela Anônima** (Ctrl+Shift+N no Chrome)
- Ou use **outro navegador**

### **Passo 5: Reconstruir o Projeto**
```bash
# Build completo
npm run build
```

### **Passo 6: Iniciar Servidor**
```bash
npm run dev
```

### **Passo 7: Testar Login**

Acesse: `http://localhost:3000/login`

#### **Teste 1: Login como ADMIN**
```
Email:    admin@bizcontrol.co.mz
Senha:    Admin123!
```
- ✅ Deve redirecionar para `/dashboard`
- ✅ Deve mostrar sidebar
- ✅ Deve mostrar dados das 30 vendas

#### **Teste 2: Login como GESTOR**
```
Email:    gestor@bizcontrol.co.mz
Senha:    Gestor123!
```
- ✅ Deve redirecionar para `/dashboard`
- ✅ Deve mostrar sidebar
- ✅ Deve mostrar dados das 30 vendas

#### **Teste 3: Login como VENDEDOR**
```
Email:    vendedor@bizcontrol.co.mz
Senha:    Venda123!
```
- ✅ Deve redirecionar para `/sales/pos` (PDV)
- ✅ Deve mostrar sidebar
- ✅ Deve mostrar lista de produtos

---

## ❓ SE OS DADOS AINDA APARECEM APÓS RESET

### **Causa 1: Cache do Navegador**
**Solução:**
1. Limpar cache (Ctrl+Shift+Delete)
2. Ou usar janela anônima
3. Ou usar outro navegador

### **Causa 2: Seed Não Rodou**
**Solução:**
```bash
# Executar seed manualmente
npx prisma db seed
```

### **Causa 3: Banco Não Foi Resetado**
**Solução:**
```bash
# Abrir Prisma Studio e verificar
npx prisma studio

# Deve abrir em http://localhost:5555
# Clique em "Sale" → Deve mostrar 30 vendas
# Clique em "Product" → Deve mostrar 20 produtos
```

### **Causa 4: Dados em localStorage/Cache**
**Solução:**
```bash
# No Console do Navegador (F12):
localStorage.clear();
sessionStorage.clear();
location.reload();
```

---

## 🔍 VERIFICAR SE O RESET FUNCIONOU

### **Opção 1: Prisma Studio (Recomendado)**
```bash
npx prisma studio
```

Acesse `http://localhost:5555` e verifique:

| Tabela | O que deve ter |
|--------|----------------|
| **User** | 3 usuários (admin, gestor, vendedor) |
| **Company** | 1 empresa (NEXUS COMERCIAL LDA) |
| **Employee** | 3 employees (1 para cada user) |
| **Category** | 4 categorias |
| **Product** | 20 produtos |
| **Sale** | 30 vendas |
| **SaleItem** | ~60-90 items (varia) |

### **Opção 2: Query Direta (PostgreSQL)**
```bash
# Conectar ao PostgreSQL
psql -U postgres -h localhost -p 5432 -d bizcontrol_db

# Contar registros
SELECT 
  'Users' as tabela, COUNT(*) as total FROM "User"
UNION ALL
SELECT 'Sales', COUNT(*) FROM "Sale"
UNION ALL
SELECT 'Products', COUNT(*) FROM "Product";

# Sair
\q
```

---

## 🎯 O QUE ESPERAR NO DASHBOARD

Após login bem-sucedido, o dashboard deve mostrar:

### **KPIs (Cards no topo)**
- **Faturação Hoje**: Valor das vendas de hoje
- **Lucro Real**: Margem de lucro
- **Vendas Hoje**: Número de vendas
- **Ticket Médio**: Valor médio por venda

### **Gráfico de Tendência**
- Linha mostrando faturação dos últimos 7 dias
- Baseado nas 30 vendas do seed

### **Top 5 Produtos**
- Produtos mais vendidos
- Baseado nas vendas do seed

### **Alertas de Stock**
- Produtos com stock baixo (se houver)

### **Distribuição de Pagamentos**
- Gráfico de pizza com métodos (DINHEIRO, MPESA, etc.)

---

## 🚨 SE NADA FUNCIONAR

Execute este comando de RESET BRUTAL:

```bash
# 1. Parar servidor (Ctrl+C)

# 2. Remover banco completamente
dropdb -U postgres bizcontrol_db

# 3. Criar banco novo
createdb -U postgres bizcontrol_db

# 4. Aplicar migrations
npx prisma migrate deploy

# 5. Executar seed
npx prisma db seed

# 6. Build
npm run build

# 7. Iniciar
npm run dev
```

---

## ✅ CHECKLIST DE VERIFICAÇÃO

Marque cada item:

- [ ] Parei o servidor (Ctrl+C)
- [ ] Executei `npx prisma migrate reset`
- [ ] Vi mensagem "SEED ENTERPRISE FINALIZADO"
- [ ] Limpei cache do navegador
- [ ] Executei `npm run build` sem erros
- [ ] Iniciei `npm run dev`
- [ ] Abri janela anônima (Ctrl+Shift+N)
- [ ] Testei login como ADMIN (`admin@bizcontrol.co.mz / Admin123!`)
- [ ] Testei login como GESTOR (`gestor@bizcontrol.co.mz / Gestor123!`)
- [ ] Testei login como VENDEDOR (`vendedor@bizcontrol.co.mz / Venda123!`)
- [ ] Dashboard mostra dados das vendas
- [ ] Sidebar aparece em todas as páginas
- [ ] Layout sem espaço excessivo

---

## 💡 DICAS

1. **Sempre use janela anônima para testar** após reset
2. **Verifique se o seed rodou** (veja mensagem de sucesso)
3. **Use Prisma Studio** para confirmar dados no banco
4. **Não feche o terminal** onde `npm run dev` está rodando

---

Me avise o resultado após seguir estes passos! 🚀
