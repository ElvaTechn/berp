# ⚡ EXECUTAR AGORA - CONFIGURAÇÃO RÁPIDA

## 🎯 SIGA ESTES PASSOS EM ORDEM

### PASSO 1: Adicionar Dependência ao package.json

Abra o arquivo `package.json` e adicione esta linha nas **dependencies**:

```json
"jspdf": "^2.5.2",
```

**Localização exata:**
```json
{
  "dependencies": {
    ...
    "jose": "^6.1.3",
    "jsonwebtoken": "^9.0.3",
    "jspdf": "^2.5.2",          ← ADICIONE ESTA LINHA
    "lucide-react": "^0.561.0",
    ...
  }
}
```

### PASSO 2: Instalar Dependências

Abra o terminal no VS Code e execute:

```bash
npm install
```

Aguarde a instalação completar (pode demorar 1-2 minutos).

### PASSO 3: Configurar Banco de Dados

Execute estes comandos em sequência:

```bash
# Gerar Prisma Client
npx prisma generate

# Aplicar migrações
npx prisma migrate dev

# Popular com dados Enterprise
npx prisma db seed
```

**Você verá isso no terminal:**
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
🛒 Gerando vendas históricas...
✅ 30 Vendas geradas
✨ SEED ENTERPRISE FINALIZADO COM SUCESSO!
```

### PASSO 4: Iniciar o Servidor

```bash
npm run dev
```

Aguarde até ver:
```
✓ Ready in 3.5s
○ Local:   http://localhost:3000
```

### PASSO 5: Fazer Login

1. Abra o navegador
2. Acesse: `http://localhost:3000`
3. Use estas credenciais:

```
Email: gestor@bizcontrol.co.mz
Senha: Admin123!
```

### PASSO 6: Testar Funcionalidades

#### Testar Dashboard
```
URL: http://localhost:3000/dashboard
```

**O que você deve ver:**
- ✅ Gráficos populados com vendas
- ✅ Receita total dos últimos 7 dias
- ✅ 5 produtos com alerta de stock baixo (pulsando)

#### Testar Funcionários
```
URL: http://localhost:3000/funcionarios
```

**O que você deve ver:**
- ✅ 2 funcionários na tabela
- ✅ Estatísticas: Total 2, Gestores 1, Vendedores 1
- ✅ Botão "Adicionar Funcionário"

**Teste o CRUD:**
1. Clique em "➕ Adicionar Funcionário"
2. Preencha: Nome, Email, Função
3. Salve e veja aparecer na tabela
4. Clique em ✏️ para editar
5. Clique em 🗑️ para deletar (com confirmação)

#### Testar Impressão de Recibos

Abra uma nova aba e acesse:
```
http://localhost:3000/api/sales/1/receipt
```

**O que acontece:**
- ✅ Um PDF é gerado automaticamente
- ✅ O arquivo é baixado: `recibo_BIZ202412XXXX.pdf`
- ✅ PDF contém todos os dados da venda

---

## 🎉 PRONTO!

Se todos os passos funcionaram, você tem agora:

### ✅ Sistema Completo
- Dashboard com dados reais
- Gestão de funcionários (CRUD completo)
- Impressão de recibos em PDF
- 20 produtos moçambicanos
- 30 vendas históricas
- 5 alertas de stock baixo

### ✅ Dados Enterprise
- Empresa: NEXUS COMERCIAL LDA
- 2 Usuários (Gestor + Vendedor)
- 4 Categorias
- 20 Produtos
- 30 Vendas (últimos 7 dias)

### ✅ UI Maximalist
- Gradientes vibrantes
- Animações suaves
- Design profissional
- Responsivo

---

## 🐛 PROBLEMAS?

### Erro: "Cannot find module 'jspdf'"
**Solução:**
```bash
npm install jspdf
```

### Erro: "Prisma Client not initialized"
**Solução:**
```bash
npx prisma generate
```

### Erro: "Port 3000 already in use"
**Solução:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID [número] /F

# Ou use outra porta
npm run dev -- -p 3001
```

### Seed não funciona
**Solução:**
```bash
# Limpar tudo e recomeçar
npx prisma migrate reset
# Digite 'y' para confirmar
```

### Login não funciona
**Verifique:**
1. Seed executou com sucesso?
2. Credenciais corretas: `gestor@bizcontrol.co.mz` / `Admin123!`
3. NextAuth configurado corretamente?

---

## 📋 CHECKLIST FINAL

Antes de demonstrar ao cliente:

- [ ] `npm install` executado com sucesso
- [ ] `npx prisma migrate dev` executado
- [ ] `npx prisma db seed` mostrou "SEED FINALIZADO COM SUCESSO"
- [ ] `npm run dev` rodando sem erros
- [ ] Login funciona com gestor@bizcontrol.co.mz
- [ ] Dashboard mostra gráficos com dados
- [ ] 5 produtos pulsando com alerta vermelho
- [ ] `/funcionarios` carrega corretamente
- [ ] Consegue adicionar novo funcionário
- [ ] Consegue editar funcionário
- [ ] Consegue deletar funcionário
- [ ] PDF de recibo é gerado ao acessar `/api/sales/1/receipt`

---

## 📚 DOCUMENTAÇÃO ADICIONAL

Criamos estes arquivos para você:

1. **FUNCIONALIDADES_IMPLEMENTADAS.md**
   - Detalhes técnicos de tudo que foi feito

2. **COMANDOS_RAPIDOS.md**
   - Lista de comandos úteis

3. **RESUMO_IMPLEMENTACAO.md**
   - Visão geral visual

4. **TEMPLATE_BOTAO_IMPRESSAO.tsx**
   - 5 exemplos de como adicionar botão de impressão

---

## 🚀 PRÓXIMO PASSO

Agora que tudo está funcionando, você pode:

1. **Criar página de Vendas** (`/vendas`)
   - Use o template em `TEMPLATE_BOTAO_IMPRESSAO.tsx`
   - Adicione o botão de impressão em cada venda

2. **Customizar a empresa**
   - Edite dados no seed.ts
   - Execute `npx prisma db seed` novamente

3. **Adicionar mais produtos**
   - Use a interface de produtos
   - Ou adicione no seed.ts

---

## 💡 DICAS PRO

### Ver dados no Prisma Studio
```bash
npx prisma studio
```
Abre interface visual do banco em `http://localhost:5555`

### Testar em produção
```bash
npm run build
npm run start
```

### Limpar cache e rebuild
```bash
rm -rf .next
npm run dev
```

---

## 🎯 O QUE FAZER SE TUDO FUNCIONOU

1. ✅ Testar todas as funcionalidades
2. ✅ Tirar screenshots para apresentação
3. ✅ Preparar demonstração ao cliente
4. ✅ Criar página de vendas (próximo passo)

---

## 📞 SUPORTE

Se encontrar problemas:

1. Verifique este checklist completo
2. Leia `FUNCIONALIDADES_IMPLEMENTADAS.md`
3. Execute comandos em `COMANDOS_RAPIDOS.md`
4. Se persistir, documente o erro completo

---

**🎉 BOA SORTE COM A DEMONSTRAÇÃO!**

**Sistema pronto para impressionar clientes em Moçambique! 🇲🇿**

Desenvolvido com 💜 para o **BIZ360**
