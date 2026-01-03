# 📱 BIZCONTROL 360 - CONTEXT PARA IA DE UX MOBILE

## 📋 INSTRUÇÕES PARA A IA

**Seu papel:** Especialista em UX/UI Mobile para sistemas ERP
**Objetivo:** Analisar e sugerir melhorias para experiência do usuário mobile
**Contexto:** Leia TODO este documento antes de dar qualquer sugestão

---

## 🎯 VISÃO GERAL DO PROJETO

**Nome:** BIZCONTROL 360 ERP
**Tipo:** Sistema ERP/POS para pequenas e médias empresas em Moçambique
**Plataforma:** Web app responsivo (PWA) - funciona em desktop, tablet e mobile
**Usuários principais:**
- **GESTOR** - Gerencia negócio, inventário, relatórios
- **VENDEDOR** - Realiza vendas no PDV, consulta histórico
- **ADMIN** - Gerencia múltiplas empresas, usuários, sistema

**Características do mercado:**
- 🇲🇿 Moçambique - África
- Usuários muitas vezes com internet instável
- Celulares Android de gama média/baixa
- Preferência por apps simples e diretos
- Pagamentos: M-Pesa, e-Mola, Multicaixa

---

## 🏗️ ARQUITETURA ATUAL DE NAVEGAÇÃO

### Navegação Desktop (≥1024px)
- **Sidebar fixa** (288px largura) - Sempre visível no lado esquerdo
- Acesso: 1 clique para qualquer destino
- Contém: Dashboard, Inventário, Vendas, Funcionários, Reservas, Definições

### Navegação Mobile (<1024px)
- **Sidebar oculta** - Acessível via botão hambúrguer (canto superior esquerdo)
- **Acesso atual: 3 toques para navegar**
  1. Toque no ícone hambúrguer ☰
  2. Aguardar sidebar abrir (slide da esquerda)
  3. Toque no destino desejado
- **BottomNav REMOVIDO** (2026-01-01) - Decisão do usuário para simplificar código

### Rotas Principais
- `/dashboard` - Dashboard principal com KPIs
- `/sales` - Histórico completo de vendas (lista, detalhes, recibo)
- `/sales/pos` - Ponto de Venda (PDV/Caixa) - sistema de caixa ativo
- `/inventory` - Gestão completa de inventário (stats, filtros, tabela)
- `/products` - Cadastro simples de produtos (secundário)
- `/reservations` - Sistema de reservas
- `/more` - Menu com opções adicionais (Funcionários, Relatórios, Categorias, etc.)

---

## 📊 PÁGINAS PRINCIPAIS - ESTADO ATUAL

### 1. Dashboard (`/dashboard`)
**Conteúdo atual:**
- Cards de KPI (Vendas hoje, Produtos, Receita)
- Gráficos de tendência
- Tabelas de vendas recentes

**Problemas identificados:**
- ❌ Sem acesso rápido a ações comuns (Nova venda, Ver inventário)
- ❌ Muita informação em uma tela mobile
- ❌ Navegação lenta (3 toques via sidebar)

---

### 2. Histórico de Vendas (`/sales`)
**Conteúdo atual:**
- Cards de estatísticas (Total vendas, Vendas hoje, Receita hoje)
- Tabela de vendas (expandível para ver itens)
- Botão "NOVA VENDA (PDV)" no topo
- Filtros por data, vendedor, método de pagamento

**Problemas identificados:**
- ⚠️ Tabela difícil em mobile (scroll horizontal)
- ⚠️ Botão "NOVA VENDA" pode não ser óbvio em mobile

---

### 3. Ponto de Venda - PDV (`/sales/pos`)
**Conteúdo atual:**
- **Desktop:** Layout dividido (produtos à esquerda, carrinho à direita)
- **Mobile:** Produtos em tela cheia, carrinho em modal/drawer
- Grid de produtos com cards
- Busca por nome/categoria
- Carrinho com quantidade, subtotal, total
- Botão "Finalizar Venda"

**Problemas identificados:**
- ⚠️ Em mobile, carrinho fica escondido (botão flutuante pequeno)
- ⚠️ Sem atalhos para produtos frequentes
- ⚠️ Checkout pode ser lento se tiver muitos itens

---

### 4. Inventário (`/inventory`)
**Conteúdo atual:**
- Cards de estatísticas (Total, Ativos, Alerta, Valor em stock)
- Tabela de produtos (scroll horizontal)
- Filtros (busca, categoria, status do stock)
- Botão "Adicionar Produto"

**Problemas identificados:**
- ❌ Tabela impossível de usar em mobile
- ❌ Muitos dados em cada linha
- ❌ Filtros podem ser confusos

---

## 🎨 DESIGN SYSTEM ATUAL

### Cores
- **Primary:** Orange (#F97316)
- **Success:** Green
- **Error:** Red
- **Warning:** Yellow
- **Background:** Light gray / Dark mode
- **Surface:** White cards com sombras (Neumorphism)

### Tipografia
- **Headings:** Títulos grandes e bold
- **Body:** Texto legível (16px base)
- **Caption:** Texto pequeno (12-14px)

### Componentes
- **NeuCard:** Cards com efeito neumórfico (sombra suave)
- **NeuButton:** Botões com estados (convex, concave, flat)
- **NeuInput:** Inputs com ícones e labels claros

### Responsividade
- **Mobile (<640px):** 1 coluna, padding reduzido
- **Tablet (640px-1024px):** 2 colunas, padding médio
- **Desktop (>1024px):** 3-4 colunas, padding completo

---

## 📱 PROBLEMAS DE UX MOBILE IDENTIFICADOS

### 1. Navegação
- ❌ **3 toques** para qualquer ação (hambúrguer → sidebar → destino)
- ❌ Sem acesso rápido a ações comuns
- ❌ BottomNav removido (era 1 toque, agora 3)

### 2. Tabelas
- ❌ **Tabelas impossíveis** em mobile (scroll horizontal)
- ❌ Muita informação em cada linha
- ❌ Difícil de ler e interagir

### 3. Formulários
- ⚠️ Inputs pequenos em mobile
- ⚠️ Teclado virtual pode esconder botões
- ⚠️ Sem validação visual clara

### 4. Feedback
- ⚠️ Toasts podem ser muito pequenos
- ⚠️ Sem feedback de carregamento em ações longas
- ⚠️ Erros podem não ser óbvios

### 5. Ações Rápidas
- ❌ Sem atalhos para tarefas frequentes
- ❌ "Nova Venda" está escondido em `/sales`
- ❌ Gestor precisa de acesso rápido a KPIs

---

## 🎯 PERFIS DE USUÁRIO E NECESSIDADES

### GESTOR (Mobile)
**Uso típico:**
- Ver vendas do dia
- Consultar inventário
- Ver relatórios simples
- Adicionar produtos rapidamente

**Necessidades:**
- ⚡ Acesso rápido a KPIs
- ⚡ Ação rápida: Nova venda
- ⚡ Ação rápida: Ver inventário
- 📊 Visualização clara de dados

**Dor atual:**
- 😡 Navegação lenta (3 toques)
- 😡 Dashboard muito denso
- 😡 Difícil encontrar ações rápidas

---

### VENDEDOR (Mobile)
**Uso típico:**
- Realizar vendas no PDV
- Consultar histórico de vendas
- Ver stock de produtos
- Imprimir recibos

**Necessidades:**
- ⚡ **Acesso ultra-rápido ao PDV** (ação #1)
- ⚡ Visualização clara de stock
- ⚡ Checkout rápido
- 👆 Botões grandes (touch targets)

**Dor atual:**
- 😡 PDV difícil de acessar
- 😡 Carrinho escondido em mobile
- 😡 Checkout pode ser lento

---

## 🚀 REQUISITOS TÉCNICOS

### Stack
- **Framework:** Next.js 14 (App Router)
- **UI:** Tailwind CSS + shadcn/ui + Framer Motion
- **State:** React Hooks (useState, useEffect)
- **Icons:** Lucide React

### PWA
- ✅ Progressive Web App instalável
- ✅ Offline-first com IndexedDB
- ✅ Sincronização automática
- ✅ Safe areas para iPhone

### Performance
- Mobile: Deve carregar em <3 segundos em 3G
- Animações: 60fps mínimo
- Touch: <100ms de resposta

---

## 💡 SUGESTÕES QUE A IA DEVE CONSIDERAR

### Quando dar sugestões, a IA deve:

1. **Priorizar por impacto:**
   - 🔴 CRÍTICO: Ações que bloqueiam vendas (ex: PDV)
   - 🟡 IMPORTANTE: Melhorias de produtividade
   - 🟢 NICE-TO-HAVE: Melhorias visuais

2. **Considerar contexto de uso:**
   - 🌐 Internet instável (funcionar offline)
   - 📱 Celulares de gama baixa (performance)
   - 🧔 Usuários não técnicos (simplicidade)
   - 🏪 Ambientes de venda (ruído, pressão)

3. **Respeitar restrições:**
   - ⚠️ Não criar novas rotas (usar existentes)
   - ⚠️ Não mudar design system drasticamente
   - ⚠️ Considerar custo de implementação
   - ⚠️ Manter consistência com desktop

4. **Fornecer:**
   - 📸 Mockups visuais (ASCII ou descrição)
   - 🎯 Justificativa clara (por que isso ajuda)
   - 💰 Estimativa de esforço (baixo/médio/alto)
   - 📊 Métricas de sucesso (como medir melhoria)

---

## 🎨 EXEMPLOS DE SUGESTÕES ÚTEIS

### BOA sugestão:
```
PROBLEMA: Vendedores perdem muito tempo para acessar o PDV

SOLUÇÃO: Adicionar botão flutuante "Nova Venda" no dashboard

JUSTIFICATIVA:
- Ação #1 dos vendedores é fazer vendas
- Atualmente: 4 toques (hambúrguer → sidebar → vendas → botão)
- Proposto: 1 toque direto no dashboard
- Impacto: +300% de velocidade na ação mais frequente

IMPLEMENTAÇÃO:
- Custo: BAIXO (1-2 horas)
- Componente: NeuButton fixo no canto inferior direito
- Ícone: ShoppingCart + Plus
- Cor: Primary (orange)

MÉTRICAS:
- Medir: Tempo médio para iniciar venda
- Esperado: Redução de 75% (4 toques → 1 toque)
```

### MÁ sugestão:
```
❌ "Criar app nativo para iOS e Android"

POR QUE É RUIM:
- Fora do escopo (projeto é web app)
- Custo altíssimo (meses de desenvolvimento)
- Perde benefícios do PWA (atualizações automáticas)
- Não resolve problema imediato
```

---

## 🔧 COMO USAR ESTE CONTEXTO

### Para obter boas sugestões de UX mobile:

1. **Copie TODO este documento**
2. **Cole na IA** (Claude, GPT-4, etc.)
3. **Faça perguntas específicas:**
   - "Como melhorar o acesso ao PDV para vendedores?"
   - "Como tornar o inventário usável em mobile?"
   - "Quais atalhos devo adicionar no dashboard?"
   - "Como melhorar a navegação mobile?"

4. **Peça priorização:**
   - "Qual o top 3 de melhorias com maior impacto?"
   - "O que devo implementar primeiro (custo/benefício)?"

---

## 📊 MÉTRICAS ATUAIS (Se disponível)

- 📱 **Usuários mobile:** [INSERIR DADOS]
- ⏱️ **Tempo médio para iniciar venda:** [INSERIR DADOS]
- 🔄 **Taxa de conversão:** [INSERIR DADOS]
- 😠 **Reclamações sobre navegação:** [INSERIR DADOS]

---

## 🎯 OBJETIVOS FUTUROS

- [ ] Reduzir toques para ações comuns de 3 para 1
- [ ] Eliminar tabelas em mobile (usar cards)
- [ ] Adicionar atalhos para top 5 ações
- [ ] Melhorar feedback visual em todas ações
- [ ] Otimizar performance para celulares de gama baixa

---

## 📝 NOTAS ADICIONAIS

**Data de criação:** 2026-01-01
**Versão:** v2.2.0
**Última atualização:** BottomNav removido

**Decisões arquiteturais:**
- ✅ Sidebar é única fonte de navegação
- ✅ Rotas consistentes entre mobile e desktop
- ❌ BottomNav removido (redundância)
- ⚠️ Considerando: Botões de acesso rápido no dashboard

---

**FIM DO CONTEXTO PARA IA**
