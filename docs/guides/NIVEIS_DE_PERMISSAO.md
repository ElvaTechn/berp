# 🔐 NÍVEIS DE PERMISSÃO - BIZ360

## 📊 VISÃO GERAL

O BIZ360 possui **3 níveis de permissão** hierárquicos:

```
┌─────────────────────────────────────┐
│         1. ADMIN (Topo)             │
│   Super Usuário - Acesso Total      │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│        2. GESTOR (Gerente)          │
│   Dono/Gerente da Empresa           │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│       3. VENDEDOR (Operador)        │
│   Vendedor/Caixa - Acesso Limitado  │
└─────────────────────────────────────┘
```

---

## 1️⃣ ADMIN (Administrador)

### **🎯 Descrição**
Super usuário do sistema com **acesso total e irrestrito** a todas as funcionalidades.

### **✅ Permissões**

#### **Gestão de Empresas**
- ✅ Criar, editar, deletar empresas
- ✅ Ver todas as empresas do sistema
- ✅ Gerenciar assinaturas de empresas
- ✅ Suspender/ativar empresas

#### **Gestão de Usuários**
- ✅ Criar, editar, deletar qualquer usuário
- ✅ Alterar roles (funções) de usuários
- ✅ Ver todos os usuários do sistema
- ✅ Resetar senhas de qualquer usuário

#### **Gestão de Funcionários**
- ✅ Gerenciar funcionários de TODAS as empresas
- ✅ Ver relatórios de desempenho de todos

#### **Produtos e Estoque**
- ✅ Gerenciar produtos de todas as empresas
- ✅ Ajustar estoque de qualquer produto
- ✅ Ver alertas de stock de todas as empresas

#### **Vendas**
- ✅ Ver vendas de TODAS as empresas
- ✅ Editar/deletar qualquer venda
- ✅ Gerar relatórios globais

#### **Financeiro**
- ✅ Ver receita de todas as empresas
- ✅ Exportar dados financeiros globais
- ✅ Gerar relatórios consolidados

#### **Sistema**
- ✅ Acessar logs de auditoria completos
- ✅ Configurar integrações do sistema
- ✅ Gerenciar backups
- ✅ Configurações globais do sistema

### **👤 Usuário no Sistema**
```
Email: gestor@bizcontrol.co.mz
Senha: Admin123!
Role: ADMIN
```

### **🎨 Identificação Visual**
- Badge: **Vermelho** com texto "ADMIN"
- Ícone: 👑 Coroa

---

## 2️⃣ GESTOR (Gerente/Dono)

### **🎯 Descrição**
Dono ou gerente de uma empresa específica. Tem controle total **APENAS sobre sua própria empresa**.

### **✅ Permissões**

#### **Gestão da Própria Empresa**
- ✅ Editar dados da empresa (nome, NUIT, endereço)
- ✅ Ver estatísticas da empresa
- ✅ Gerenciar assinatura da empresa

#### **Gestão de Funcionários**
- ✅ Adicionar funcionários à sua empresa
- ✅ Editar dados de funcionários
- ✅ Deletar funcionários
- ✅ Definir funções (Gestor, Vendedor)
- ✅ Ver relatórios de desempenho dos funcionários

#### **Produtos e Estoque**
- ✅ Criar, editar, deletar produtos
- ✅ Gerenciar categorias de produtos
- ✅ Ajustar estoque manualmente
- ✅ Definir preços e custos
- ✅ Configurar alertas de stock mínimo
- ✅ Ver produtos com stock baixo

#### **Vendas**
- ✅ Realizar vendas
- ✅ Ver todas as vendas da empresa
- ✅ Editar vendas (com restrições)
- ✅ Cancelar vendas
- ✅ Gerar relatórios de vendas
- ✅ Imprimir recibos

#### **Financeiro**
- ✅ Ver dashboard financeiro da empresa
- ✅ Ver receita, lucro, despesas
- ✅ Exportar relatórios financeiros
- ✅ Gráficos de desempenho

#### **Descontos**
- ✅ Criar, editar, deletar descontos
- ✅ Definir códigos promocionais
- ✅ Configurar validade de descontos

#### **Devoluções**
- ✅ Aprovar/rejeitar devoluções
- ✅ Processar reembolsos
- ✅ Ver histórico de devoluções

#### **Reservas**
- ✅ Gerenciar reservas de produtos
- ✅ Confirmar/cancelar reservas
- ✅ Converter reservas em vendas

### **❌ Restrições**
- ❌ NÃO pode acessar dados de outras empresas
- ❌ NÃO pode criar outras empresas
- ❌ NÃO pode alterar própria role
- ❌ NÃO pode acessar logs globais do sistema
- ❌ NÃO pode gerenciar assinaturas de outras empresas

### **👤 Usuário no Sistema**
```
Email: gestor@bizcontrol.co.mz
Senha: Admin123!
Role: GESTOR
Empresa: NEXUS COMERCIAL LDA
```

### **🎨 Identificação Visual**
- Badge: **Azul** com texto "GESTOR"
- Ícone: 💼 Pasta

---

## 3️⃣ VENDEDOR (Vendedor/Caixa)

### **🎯 Descrição**
Funcionário operacional da empresa. Foco em **vendas e operações do dia-a-dia**.

### **✅ Permissões**

#### **Vendas**
- ✅ Realizar vendas (PDV - Ponto de Venda)
- ✅ Selecionar produtos
- ✅ Aplicar descontos (se autorizado pelo gestor)
- ✅ Processar pagamentos
- ✅ Imprimir recibos
- ✅ Ver histórico das **próprias vendas**

#### **Produtos**
- ✅ Ver lista de produtos disponíveis
- ✅ Consultar preços
- ✅ Ver estoque disponível
- ❌ NÃO pode editar produtos
- ❌ NÃO pode ajustar estoque

#### **Reservas**
- ✅ Criar reservas para clientes
- ✅ Ver próprias reservas criadas
- ❌ NÃO pode cancelar reservas de outros

#### **Devoluções**
- ✅ Registrar solicitações de devolução
- ❌ NÃO pode aprovar devoluções
- ❌ NÃO pode processar reembolsos

### **❌ Restrições**
- ❌ NÃO pode acessar dashboard financeiro
- ❌ NÃO pode ver vendas de outros vendedores
- ❌ NÃO pode criar/editar produtos
- ❌ NÃO pode gerenciar funcionários
- ❌ NÃO pode ajustar estoque
- ❌ NÃO pode criar descontos
- ❌ NÃO pode ver lucros/custos
- ❌ NÃO pode exportar relatórios
- ❌ NÃO pode editar dados da empresa
- ❌ NÃO pode acessar configurações

### **👤 Usuário no Sistema**
```
Email: vendedor@bizcontrol.co.mz
Senha: Venda123!
Role: VENDEDOR
Empresa: NEXUS COMERCIAL LDA
```

### **🎨 Identificação Visual**
- Badge: **Verde** com texto "VENDEDOR"
- Ícone: 🛒 Carrinho

---

## 📋 TABELA COMPARATIVA

| Funcionalidade | ADMIN | GESTOR | VENDEDOR |
|---------------|-------|--------|----------|
| **Dashboard Financeiro** | ✅ Todos | ✅ Própria empresa | ❌ |
| **Criar/Editar Produtos** | ✅ Todos | ✅ Própria empresa | ❌ |
| **Ajustar Estoque** | ✅ Todos | ✅ Própria empresa | ❌ |
| **Realizar Vendas** | ✅ | ✅ | ✅ |
| **Ver Vendas** | ✅ Todas | ✅ Própria empresa | ✅ Próprias |
| **Gerenciar Funcionários** | ✅ Todos | ✅ Própria empresa | ❌ |
| **Criar Descontos** | ✅ Todos | ✅ Própria empresa | ❌ |
| **Aprovar Devoluções** | ✅ | ✅ | ❌ |
| **Exportar Relatórios** | ✅ | ✅ | ❌ |
| **Ver Lucros/Custos** | ✅ | ✅ | ❌ |
| **Configurações Sistema** | ✅ | ❌ | ❌ |
| **Logs de Auditoria** | ✅ Completos | ✅ Própria empresa | ❌ |

---

## 🔄 FLUXO DE TRABALHO TÍPICO

### **Cenário: Empresa com 5 funcionários**

```
👑 ADMIN (Sistema)
    └── Supervisiona todas empresas
    
💼 GESTOR (Dono da Loja)
    ├── Gerencia estoque
    ├── Define preços
    ├── Aprova devoluções
    ├── Vê relatórios financeiros
    └── Gerencia equipe de vendedores
    
🛒 VENDEDOR 1 (Caixa 1)
    └── Realiza vendas no balcão
    
🛒 VENDEDOR 2 (Caixa 2)
    └── Realiza vendas no balcão
    
🛒 VENDEDOR 3 (Vendas Telefônicas)
    └── Cria reservas e vendas remotas
```

---

## 🔐 SEGURANÇA E MULTI-TENANCY

### **Isolamento de Dados**
- ✅ Cada empresa vê **APENAS seus próprios dados**
- ✅ Vendedor vê **APENAS suas próprias vendas**
- ✅ ADMIN vê **TODOS os dados** (supervisão global)

### **Validação de Permissões**
Todas as rotas da API validam:
1. ✅ Usuário está autenticado?
2. ✅ Usuário tem role suficiente?
3. ✅ Recurso pertence à empresa do usuário?

**Exemplo:**
```typescript
// Vendedor tentando ver vendas de outro vendedor
GET /api/sales?employee_id=outro-vendedor
❌ 403 Forbidden - Acesso negado

// Gestor tentando ver produtos de outra empresa
GET /api/products?company_id=outra-empresa
❌ 403 Forbidden - Acesso negado

// ADMIN pode acessar qualquer recurso
GET /api/sales?company_id=qualquer-empresa
✅ 200 OK - Acesso permitido
```

---

## 🎯 RESUMO

### **Quando usar cada Role:**

**ADMIN:**
- ✅ Equipe de desenvolvimento/suporte
- ✅ Administradores da plataforma BIZ360
- ✅ Supervisão multi-empresa (SaaS)

**GESTOR:**
- ✅ Dono da empresa
- ✅ Gerente geral
- ✅ Diretor financeiro
- ✅ Responsável pela operação

**VENDEDOR:**
- ✅ Caixa
- ✅ Vendedor de loja
- ✅ Atendente
- ✅ Operador de vendas

---

## 📝 NOTAS IMPORTANTES

1. **Um usuário pode ter APENAS UMA role por vez**
2. **A role é definida no momento do cadastro**
3. **APENAS ADMIN pode alterar roles**
4. **Vendedor não pode se promover a Gestor**
5. **Multi-tenancy garante isolamento entre empresas**

---

## 🔄 COMO ALTERAR ROLE DE UM USUÁRIO

**Apenas ADMIN pode fazer isso:**

1. Acesse: `/usuarios` (ou via Prisma Studio)
2. Encontre o usuário
3. Edite o campo `role`
4. Escolha: `ADMIN`, `GESTOR` ou `VENDEDOR`
5. Salve

**Ou via Prisma Studio:**
```bash
npx prisma studio

# Navegue até User
# Clique no usuário
# Edite o campo 'role'
# Salve
```

---

**🎉 Agora você conhece todos os níveis de permissão do BIZ360!**
