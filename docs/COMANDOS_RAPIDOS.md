# ⚡ COMANDOS RÁPIDOS - BIZ360

## 🚀 INICIAR O PROJETO

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Banco de Dados
```bash
npx prisma generate
npx prisma migrate dev
```

### 3. Popular com Dados Enterprise
```bash
npx prisma db seed
```

### 4. Iniciar Servidor
```bash
npm run dev
```

---

## 🔑 CREDENCIAIS DE ACESSO

### Gestor (Admin)
- **Email:** `gestor@bizcontrol.co.mz`
- **Senha:** `Admin123!`
- **Permissões:** Todas

### Vendedor
- **Email:** `vendedor@bizcontrol.co.mz`
- **Senha:** `Venda123!`
- **Permissões:** Vendas

---

## 📍 ROTAS DISPONÍVEIS

### Dashboard
```
http://localhost:3000/dashboard
```

### Funcionários (NOVO!)
```
http://localhost:3000/funcionarios
```

### Produtos
```
http://localhost:3000/produtos
```

### Vendas
```
http://localhost:3000/vendas
```

---

## 🧪 TESTES RÁPIDOS

### Testar Gestão de Funcionários
1. Acesse `/funcionarios`
2. Clique em "➕ Adicionar Funcionário"
3. Preencha: Nome, Email, Função
4. Salve e veja na tabela
5. Teste editar e deletar

### Testar Impressão de Recibos
```bash
# Fazer requisição para gerar PDF
curl -o recibo.pdf http://localhost:3000/api/sales/1/receipt
```

### Testar Alertas de Stock
1. Acesse `/dashboard`
2. Veja produtos pulsando em vermelho
3. Produtos com stock < min_stock:
   - Fanta Laranja (5 unidades)
   - Óleo Oli (8 unidades)
   - Pasta de Dentes (9 unidades)
   - Massa Vamy (12 unidades)
   - Peixe Carapau (6 unidades)

---

## 🛠️ COMANDOS ÚTEIS

### Limpar Banco e Popular Novamente
```bash
npx prisma migrate reset
# Confirme com 'y'
# Seed roda automaticamente
```

### Ver Dados no Prisma Studio
```bash
npx prisma studio
```

### Rebuild Completo
```bash
rm -rf node_modules
rm -rf .next
npm install
npm run build
```

---

## 📊 DADOS CRIADOS PELO SEED

- ✅ **1 Empresa:** NEXUS COMERCIAL LDA
- ✅ **2 Usuários:** Gestor + Vendedor
- ✅ **2 Funcionários:** Gestor + Vendedor
- ✅ **4 Categorias:** Mercearia, Bebidas, Higiene, Congelados
- ✅ **20 Produtos:** Moçambicanos reais
- ✅ **30 Vendas:** Últimos 7 dias

---

## 🎯 CHECKLIST FINAL

Antes de apresentar ao cliente:

- [ ] `npm install` executado
- [ ] `npx prisma migrate dev` executado
- [ ] `npx prisma db seed` executado com sucesso
- [ ] `npm run dev` rodando sem erros
- [ ] Login testado com gestor@bizcontrol.co.mz
- [ ] Dashboard mostrando gráficos populados
- [ ] Alertas de stock baixo visíveis
- [ ] Página de funcionários funcionando
- [ ] CRUD de funcionários testado
- [ ] PDF de recibo gerado com sucesso

---

## 🐛 TROUBLESHOOTING

### Erro: "Cannot find module 'jspdf'"
```bash
npm install jspdf
```

### Erro: "Prisma Client not initialized"
```bash
npx prisma generate
```

### Erro: "Database connection failed"
1. Verifique `.env` com DATABASE_URL correto
2. Certifique-se que PostgreSQL está rodando

### Seed não cria dados
```bash
# Limpar tudo e recomeçar
npx prisma migrate reset
# Confirme com 'y'
```

---

## 💡 DICAS PRO

### Testar Performance
```bash
npm run build
npm run start
```

### Verificar TypeScript
```bash
npm run typecheck
```

### Executar Testes
```bash
npm run test
```

---

## 🎉 TUDO PRONTO!

Agora você tem um sistema **enterprise-level** com:
- ✅ UI Maximalist profissional
- ✅ Dados realistas de Moçambique
- ✅ Gestão completa de funcionários
- ✅ Sistema de impressão de recibos
- ✅ 30 vendas históricas
- ✅ Alertas de stock funcionando

**Próximo passo:** Executar os comandos acima e testar! 🚀
