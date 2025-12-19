# Feature Specification: Sistema de Gestão de Stock e Vendas para Moçambique

**Feature Branch**: `001-sistema-gestao-stock-vendas`  
**Created**: 2025-12-15  
**Status**: Draft  
**Input**: Sistema completo de Gestão de Stock e Vendas para empresas em Moçambique, focado em resolver problemas de controle desordenado de inventário, gestão financeira comprometida e contas que não fecham.

## Visão Geral

Sistema multi-tenant de gestão empresarial desenvolvido para o mercado moçambicano, permitindo controle completo de stock, vendas, caixa e lucros em tempo real. A aplicação será desktop-first com sincronização online para acesso mobile, suportando três níveis de usuários: Vendedor, Gestor e Super Usuário (Admin).

**Problema Central**: Empresas em Moçambique enfrentam controle desordenado de inventário, gestão financeira comprometida e dificuldade em fechar contas corretamente.

**Solução**: Sistema integrado que automatiza vendas, atualiza stock em tempo real, calcula lucros automaticamente e fornece relatórios e alertas inteligentes.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Vendedor Efetua Venda de Produto (Priority: P1)

**Descrição**: Como vendedor, quero registrar vendas rapidamente selecionando produtos da lista e indicando quantidades, para que o sistema calcule automaticamente o preço e atualize o stock.

**Why this priority**: É o fluxo principal do sistema - sem vendas funcionando, não há valor para o negócio. Representa 80% do uso diário.

**Independent Test**: Pode ser testado criando um produto no sistema, fazendo login como vendedor, selecionando o produto, indicando quantidade e verificando que a venda foi registrada e o stock atualizado.

**Acceptance Scenarios**:

1. **Given** vendedor autenticado e produtos disponíveis em stock, **When** vendedor seleciona produto "Coca-Cola 500ml" (preço: 50 MT) e indica quantidade 2, **Then** sistema calcula total de 100 MT, registra venda e reduz stock em 2 unidades
2. **Given** vendedor tenta vender produto com quantidade maior que stock disponível, **When** vendedor indica quantidade 10 mas stock tem apenas 5, **Then** sistema exibe alerta "Stock insuficiente. Disponível: 5 unidades" e bloqueia venda
3. **Given** venda completada com sucesso, **When** vendedor visualiza histórico, **Then** venda aparece listada com data, hora, produto, quantidade e valor total

---

### User Story 2 - Gestor Cadastra Produtos e Categorias (Priority: P1)

**Descrição**: Como gestor, quero cadastrar produtos com preço de compra, preço de venda, quantidade inicial e categoria, para que o sistema possa calcular lucros e controlar stock automaticamente.

**Why this priority**: Sem produtos cadastrados, vendedores não podem operar. É pré-requisito para todas as outras funcionalidades.

**Independent Test**: Login como gestor, criar categoria "Bebidas", cadastrar produto "Água 500ml" com preço compra 20 MT, preço venda 30 MT, quantidade 100, verificar que produto aparece na lista com margem de lucro calculada (10 MT/unidade).

**Acceptance Scenarios**:

1. **Given** gestor autenticado, **When** gestor cria categoria "Bebidas" e produto "Água 500ml" (compra: 20 MT, venda: 30 MT, qtd: 100), **Then** sistema salva produto, calcula margem 33.3% e exibe na lista de produtos
2. **Given** gestor tenta cadastrar produto com preço venda menor que preço compra, **When** gestor insere compra 50 MT e venda 40 MT, **Then** sistema exibe aviso "Atenção: Preço de venda inferior ao preço de compra. Margem negativa de -20%" mas permite salvar
3. **Given** produto cadastrado, **When** gestor edita quantidade de 100 para 150, **Then** sistema atualiza stock e registra movimentação no histórico

---

### User Story 3 - Gestor Visualiza Dashboard Financeiro Diário (Priority: P1)

**Descrição**: Como gestor, quero visualizar dashboard com lucro diário, total de dinheiro que entrou e lucro por produto, para monitorar desempenho financeiro em tempo real.

**Why this priority**: Monitoramento financeiro é crítico para decisões de negócio e atende diretamente ao problema de "contas que não fecham".

**Independent Test**: Após registrar vendas (ex: 5 produtos vendidos totalizando 500 MT com custo de 300 MT), gestor acessa dashboard e verifica que mostra lucro de 200 MT, receita de 500 MT e breakdown por produto.

**Acceptance Scenarios**:

1. **Given** vendas realizadas no dia (3 vendas: 100 MT, 150 MT, 200 MT com custos respectivos de 60 MT, 90 MT, 120 MT), **When** gestor acessa dashboard, **Then** sistema exibe receita total 450 MT, custo total 270 MT, lucro 180 MT
2. **Given** nenhuma venda realizada no dia, **When** gestor acessa dashboard, **Then** sistema exibe "Nenhuma venda registrada hoje" com métricas zeradas
3. **Given** vendas de múltiplos produtos, **When** gestor visualiza gráfico de pizza, **Then** sistema exibe produtos ordenados por valor vendido (mais vendido em destaque)

---

### User Story 4 - Gestor Recebe Alertas de Stock Baixo (Priority: P2)

**Descrição**: Como gestor, quero receber alertas automáticos quando produtos atingirem nível crítico de stock, com recomendações de reabastecimento, para evitar rupturas de estoque.

**Why this priority**: Previne perda de vendas por falta de produto, mas é secundário ao fluxo básico de vendas.

**Independent Test**: Cadastrar produto com quantidade 10 e limite mínimo 5, realizar vendas até stock chegar a 4, verificar que alerta vermelho aparece no dashboard e na lista de produtos.

**Acceptance Scenarios**:

1. **Given** produto "Arroz 5kg" com stock de 8 unidades e limite mínimo de 10, **When** gestor acessa painel de stock, **Then** produto aparece com indicador vermelho e mensagem "Stock crítico: 8 unidades. Reabastecer com 20 unidades (sugestão)"
2. **Given** produto com stock acima do limite mínimo, **When** gestor visualiza lista, **Then** produto aparece com indicador verde
3. **Given** múltiplos produtos em stock baixo, **When** gestor acessa dashboard, **Then** contador de alertas exibe número total e lista produtos críticos em ordem de urgência

---

### User Story 5 - Vendedor Reserva Produtos para Clientes (Priority: P2)

**Descrição**: Como vendedor, quero reservar produtos para clientes registrando nome e BI, para controlar produtos separados e garantir disponibilidade para clientes específicos.

**Why this priority**: Funcionalidade importante para relacionamento com cliente, mas não bloqueia operação básica de vendas.

**Independent Test**: Login como vendedor, criar reserva para "João Silva" (BI: 123456789), selecionar "TV Samsung 32" quantidade 1, verificar que produto aparece na lista de reservas e stock disponível é reduzido.

**Acceptance Scenarios**:

1. **Given** vendedor autenticado e produto disponível, **When** vendedor cria reserva para "Maria Costa" (BI: 987654321) de 2 unidades de "Frigorífico LG", **Then** sistema registra reserva, reduz stock disponível em 2 e adiciona à lista de produtos reservados
2. **Given** reserva existente, **When** vendedor acessa lista de reservas, **Then** sistema exibe nome do titular, BI, produto, quantidade e data de reserva
3. **Given** vendedor tenta reservar quantidade maior que stock disponível, **When** indica quantidade 5 mas stock tem 3, **Then** sistema bloqueia com mensagem "Stock insuficiente para reserva"

---

### User Story 6 - Gestor Gera Relatórios Periódicos (Priority: P2)

**Descrição**: Como gestor, quero gerar relatórios diários, semanais, mensais e anuais com estatísticas de vendas e lucros, para analisar desempenho e planejar estratégias.

**Why this priority**: Essencial para planejamento estratégico, mas não urgente para operação diária imediata.

**Independent Test**: Após um mês de vendas simuladas, gestor seleciona "Relatório Mensal", sistema gera PDF/visualização com total vendido, lucro, gráfico de produtos mais vendidos e comparação com mês anterior.

**Acceptance Scenarios**:

1. **Given** vendas registradas no período de 01/12 a 07/12, **When** gestor seleciona "Relatório Semanal", **Then** sistema exibe total vendido (valor), total de vendas (quantidade), lucro bruto, produto mais vendido e gráfico de vendas por dia
2. **Given** gestor seleciona "Relatório Anual 2024", **When** sistema processa dados, **Then** relatório inclui comparação mensal, tendências, produtos top 10 e análise de sazonalidade
3. **Given** período sem vendas, **When** gestor gera relatório, **Then** sistema exibe "Nenhuma venda no período selecionado" com métricas zeradas

---

### User Story 7 - Gestor Gerencia Vendedores (Priority: P3)

**Descrição**: Como gestor, quero criar contas de vendedores, visualizar lista de vendedores ativos e gerir permissões, para controlar acesso ao sistema e monitorar equipe.

**Why this priority**: Importante para gestão de equipe, mas pode ser configurado inicialmente de forma manual.

**Independent Test**: Gestor cria conta de vendedor com nome "Pedro Santos", email "pedro@empresa.mz", senha temporária, verifica que vendedor aparece na lista e consegue fazer login.

**Acceptance Scenarios**:

1. **Given** gestor autenticado, **When** gestor cria vendedor com nome "Ana Silva", email "ana@empresa.mz", **Then** sistema envia credenciais temporárias e vendedor aparece na lista de usuários ativos
2. **Given** vendedor existente, **When** gestor desativa conta, **Then** vendedor não consegue mais fazer login e aparece como "Inativo" na lista
3. **Given** gestor visualiza lista de vendedores, **When** acessa detalhes de vendedor específico, **Then** sistema exibe total de vendas realizadas por esse vendedor e desempenho individual

---

### User Story 8 - Super Usuário Gerencia Empresas e Subscrições (Priority: P3)

**Descrição**: Como super usuário, quero cadastrar novas empresas, controlar subscrições ativas/inativas e gerenciar pagamentos, para administrar plataforma multi-tenant.

**Why this priority**: Funcionalidade administrativa essencial para modelo de negócio SaaS, mas não afeta operação de empresas individuais.

**Independent Test**: Super usuário cria empresa "Supermercado Central Lda", define subscrição mensal, ativa sistema, verifica que gestor da empresa consegue fazer login e acessar sistema isolado.

**Acceptance Scenarios**:

1. **Given** super usuário autenticado, **When** cadastra empresa "Loja ABC" com plano mensal (500 MT/mês), **Then** sistema cria tenant isolado, gera credenciais de gestor e marca subscrição como "Ativa"
2. **Given** empresa com subscrição vencida, **When** super usuário acessa dashboard, **Then** empresa aparece com status "Pendente" e sistema bloqueia acesso de usuários dessa empresa
3. **Given** super usuário visualiza dashboard geral, **When** acessa painel, **Then** sistema exibe total de empresas ativas, receita mensal recorrente (MRR) e lista de pagamentos pendentes

---

### Edge Cases

- **Stock negativo**: O que acontece se houver erro manual e stock ficar negativo? Sistema deve bloquear vendas e exibir alerta crítico para gestor.
- **Vendas simultâneas**: Como sistema lida com 2 vendedores vendendo último item em stock ao mesmo tempo? Usar transações atômicas no banco de dados.
- **Reserva expirada**: Produtos reservados por mais de X dias devem ser liberados automaticamente? Definir política de expiração de reservas.
- **Alteração de preço**: Se gestor altera preço de produto, vendas antigas devem manter preço histórico ou atualizar? Manter histórico imutável.
- **Cancelamento de venda**: Vendedor pode cancelar venda? Se sim, como reverter stock? Implementar funcionalidade de estorno com auditoria.
- **Multi-moeda**: Sistema deve suportar outras moedas além de Metical? Inicialmente apenas MT, considerar para v2.0.
- **Produto sem categoria**: Sistema permite produto sem categoria? Sim, categoria é opcional mas recomendada.
- **Backup de dados**: Com que frequência dados são salvos? Backup automático diário + sincronização em tempo real para versão online.
- **Falha de internet**: Aplicação desktop funciona offline? Sim, com sincronização automática quando conexão é restabelecida.
- **Impressão de recibos**: Sistema gera recibos/faturas de venda? Sim, impressão térmica com logo da empresa e dados fiscais.

## Requirements *(mandatory)*

### Functional Requirements

#### Autenticação e Autorização
- **FR-001**: Sistema MUST suportar três níveis de usuário: Super Usuário (Admin), Gestor e Vendedor com permissões hierárquicas
- **FR-002**: Sistema MUST implementar autenticação multi-tenant isolando dados por empresa
- **FR-003**: Sistema MUST permitir login com email e senha com validação segura
- **FR-004**: Sistema MUST bloquear acesso quando subscrição da empresa estiver inativa/vencida

#### Gestão de Produtos
- **FR-005**: Sistema MUST permitir gestor criar categorias de produtos com nome e descrição
- **FR-006**: Sistema MUST permitir gestor cadastrar produtos com: nome, preço de compra, preço de venda, quantidade inicial e categoria (opcional)
- **FR-007**: Sistema MUST calcular automaticamente margem de lucro: (preço_venda - preço_compra) / preço_compra * 100
- **FR-008**: Sistema MUST permitir gestor editar informações de produtos (preços, quantidade, categoria)
- **FR-009**: Sistema MUST exibir alerta visual quando preço de venda for menor que preço de compra
- **FR-010**: Sistema MUST manter histórico de alterações de preços e ajustes de stock

#### Gestão de Stock
- **FR-011**: Sistema MUST exibir lista completa de produtos com quantidades disponíveis
- **FR-012**: Sistema MUST permitir definir limite mínimo de stock por produto
- **FR-013**: Sistema MUST exibir alertas visuais (cores: vermelho=crítico, amarelo=baixo, verde=ok) baseado em níveis de stock
- **FR-014**: Sistema MUST gerar recomendações automáticas de reabastecimento quando stock atingir nível crítico
- **FR-015**: Sistema MUST atualizar stock automaticamente após cada venda (stock_atual - quantidade_vendida)
- **FR-016**: Sistema MUST bloquear vendas quando quantidade solicitada exceder stock disponível
- **FR-017**: Sistema MUST exibir gráfico de pizza mostrando distribuição de stock por categoria

#### Processo de Vendas
- **FR-018**: Vendedor MUST poder selecionar produto de lista com busca/filtro por nome ou categoria
- **FR-019**: Sistema MUST calcular automaticamente preço total: quantidade * preço_venda
- **FR-020**: Sistema MUST registrar venda com: produto_id, vendedor_id, quantidade, data/hora, valor_total
- **FR-021**: Sistema MUST atualizar stock imediatamente após confirmação de venda
- **FR-022**: Sistema MUST permitir vendedor visualizar histórico de vendas próprias
- **FR-023**: Sistema MUST gerar recibo de venda com logo da empresa, dados do produto, quantidade, preço unitário, total e data/hora

#### Reservas de Produtos
- **FR-024**: Vendedor MUST poder criar reserva com: nome_cliente, BI_cliente, produto, quantidade
- **FR-025**: Sistema MUST reduzir stock disponível ao criar reserva (tratando como "stock comprometido")
- **FR-026**: Sistema MUST permitir visualizar lista de reservas ativas com filtros por cliente/produto
- **FR-027**: Sistema MUST permitir gestor/vendedor cancelar reserva (liberando stock)
- **FR-028**: Sistema MUST marcar reserva como "expirada" após 7 dias sem conversão em venda [CONFIGURÁVEL]

#### Dashboard e Relatórios
- **FR-029**: Gestor MUST visualizar dashboard com: lucro diário, receita total do dia, número de vendas
- **FR-030**: Sistema MUST calcular lucro diário: Σ(preço_venda - preço_compra) * quantidade para vendas do dia
- **FR-031**: Sistema MUST exibir gráfico de pizza com produtos mais vendidos (top 10 por valor)
- **FR-032**: Sistema MUST permitir gerar relatórios com filtros: Diário, Semanal, Mensal, Anual
- **FR-033**: Sistema MUST incluir nos relatórios: total vendido (valor), quantidade de vendas, lucro bruto, produto mais vendido, tendências
- **FR-034**: Sistema MUST enviar relatório diário automático ao gestor por email às 23:59 [CONFIGURÁVEL]

#### Gestão de Vendedores
- **FR-035**: Gestor MUST poder criar conta de vendedor com: nome, email, senha temporária
- **FR-036**: Sistema MUST permitir gestor visualizar lista de vendedores com status (ativo/inativo)
- **FR-037**: Sistema MUST permitir gestor ativar/desativar contas de vendedores
- **FR-038**: Sistema MUST rastrear vendas por vendedor para análise de desempenho individual

#### Gestão de Empresas (Multi-tenant)
- **FR-039**: Super Usuário MUST poder cadastrar nova empresa com: nome, NIF/NUIT, email do gestor, plano de subscrição
- **FR-040**: Sistema MUST criar tenant isolado com banco de dados separado logicamente por empresa_id
- **FR-041**: Sistema MUST permitir Super Usuário gerenciar subscrições com status: Ativa, Inativa, Pendente, Cancelada
- **FR-042**: Sistema MUST bloquear acesso de usuários quando subscrição da empresa estiver inativa
- **FR-043**: Sistema MUST exibir para gestor status de subscrição no menu de Definições
- **FR-044**: Sistema MUST permitir gestor visualizar histórico de pagamentos de subscrição

#### Interface e Localização
- **FR-045**: Sistema MUST usar idioma Português (Moçambique) em toda interface
- **FR-046**: Sistema MUST usar Metical (MT) como moeda padrão com formatação: "1.234,56 MT"
- **FR-047**: Sistema MUST usar formato de data DD/MM/AAAA e hora 24h (HH:MM)
- **FR-048**: Sistema MUST ser responsivo para desktop (1024px+), tablet (768px+) e mobile (320px+)

#### Backup e Sincronização
- **FR-049**: Sistema desktop MUST funcionar offline com sincronização automática quando conectado
- **FR-050**: Sistema MUST realizar backup automático diário dos dados às 02:00 [CONFIGURÁVEL]
- **FR-051**: Sistema MUST sincronizar vendas em tempo real quando online para acesso mobile

### Non-Functional Requirements

#### Performance
- **NFR-001**: Tempo de resposta para registro de venda MUST ser inferior a 2 segundos
- **NFR-002**: Dashboard MUST carregar em menos de 3 segundos com até 10.000 produtos
- **NFR-003**: Sistema MUST suportar até 50 vendedores simultâneos por empresa sem degradação

#### Segurança
- **NFR-004**: Senhas MUST ser armazenadas com hash bcrypt (mínimo 10 rounds)
- **NFR-005**: Sistema MUST implementar proteção contra SQL Injection e XSS
- **NFR-006**: Sessões MUST expirar após 8 horas de inatividade
- **NFR-007**: Dados entre cliente e servidor MUST ser transmitidos via HTTPS
- **NFR-008**: Sistema MUST registrar auditoria de todas ações críticas (vendas, alterações de preço, ajustes de stock)

#### Confiabilidade
- **NFR-009**: Sistema MUST garantir integridade transacional de vendas (ACID compliance)
- **NFR-010**: Backup automático MUST ter retenção mínima de 30 dias
- **NFR-011**: Sistema MUST ter uptime de 99% (excluindo manutenção programada)

#### Usabilidade
- **NFR-012**: Interface MUST seguir princípios de design limpo e intuitivo
- **NFR-013**: Fluxo de venda MUST ser completável em máximo 4 cliques
- **NFR-014**: Sistema MUST exibir mensagens de erro em linguagem clara e não técnica
- **NFR-015**: Gestor MUST poder customizar logo da empresa no sistema

#### Escalabilidade
- **NFR-016**: Arquitetura MUST suportar crescimento para 1.000 empresas (tenants)
- **NFR-017**: Banco de dados MUST suportar até 1 milhão de vendas por empresa sem degradação

### Key Entities

- **Empresa (Tenant)**: Representa organização cliente, contém nome, NIF/NUIT, email, status_subscricao, data_criacao. Relaciona-se com Usuários, Produtos, Vendas.

- **Usuário**: Representa pessoa com acesso ao sistema, contém nome, email, senha_hash, tipo (super_user/gestor/vendedor), empresa_id, status (ativo/inativo). Vendedores relacionam-se com Vendas.

- **Categoria**: Agrupa produtos similares, contém nome, descrição, empresa_id. Relaciona-se com múltiplos Produtos.

- **Produto**: Item comercializável, contém nome, preço_compra, preço_venda, quantidade_stock, limite_minimo, categoria_id, empresa_id. Relaciona-se com Vendas e Reservas.

- **Venda**: Transação comercial, contém produto_id, vendedor_id, quantidade, valor_total, data_hora, empresa_id. Calcula lucro: (preço_venda - preço_compra) * quantidade.

- **Reserva**: Produto separado para cliente, contém cliente_nome, cliente_bi, produto_id, quantidade, data_reserva, status (ativa/expirada/convertida), empresa_id.

- **Subscrição**: Plano de pagamento da empresa, contém empresa_id, tipo (mensal/anual), valor, status (ativa/inativa/pendente), data_vencimento, data_ultimo_pagamento.

- **Histórico_Stock**: Auditoria de movimentações, contém produto_id, tipo_movimento (venda/ajuste/devolução), quantidade_anterior, quantidade_nova, usuario_id, data_hora, motivo.

- **Relatório**: Documento gerado, contém tipo (diario/semanal/mensal/anual), data_inicio, data_fim, total_vendido, lucro_total, dados_json (produtos, gráficos), empresa_id.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Vendedor pode completar registro de venda em menos de 30 segundos (da seleção do produto até confirmação)

- **SC-002**: Sistema reduz erros de stock manual em 95% através de atualização automática

- **SC-003**: Gestor consegue visualizar lucro diário em tempo real com precisão de 100% (sem discrepâncias contábeis)

- **SC-004**: 90% dos gestores conseguem gerar relatório mensal completo em menos de 2 minutos sem treinamento prévio

- **SC-005**: Sistema previne 100% de vendas com stock insuficiente através de validação automática

- **SC-006**: Alertas de stock baixo reduzem rupturas de estoque em 80% comparado a controle manual

- **SC-007**: Tempo de fechamento de caixa diário reduz de média de 2 horas (manual) para menos de 5 minutos (automatizado)

- **SC-008**: 95% dos vendedores conseguem usar sistema sem treinamento formal após demonstração de 15 minutos

- **SC-009**: Sistema mantém 99% de uptime durante horário comercial (08:00-20:00)

- **SC-010**: Multi-tenant suporta isolamento completo: 0% de vazamento de dados entre empresas em testes de penetração

---

## Technical Constraints

- **TC-001**: Backend MUST ser desenvolvido em TypeScript + Node.js
- **TC-002**: Frontend MUST usar Next.js (React framework)
- **TC-003**: Banco de dados MUST ser PostgreSQL (versão 14+)
- **TC-004**: Aplicação desktop MUST usar Electron ou similar para empacotamento
- **TC-005**: API MUST seguir padrões RESTful ou GraphQL
- **TC-006**: Versionamento de API MUST seguir semantic versioning (MAJOR.MINOR.PATCH)

## Out of Scope (v1.0)

- Integração com sistemas fiscais/AT Moçambique (planejado para v1.1)
- Suporte multi-moeda (apenas Metical na v1.0)
- App mobile nativo (apenas web responsive acessível via mobile)
- Integração com gateways de pagamento online
- Módulo de compras/fornecedores (apenas vendas e stock)
- Controle de múltiplos pontos de venda (single location apenas)
- Integração com balanças/scanners de código de barras

## Assumptions

- Empresas têm acesso à internet pelo menos 1x por dia para sincronização
- Gestor possui email funcional para receber relatórios automáticos
- Impressora térmica compatível com ESC/POS para recibos (opcional)
- Desktop/laptop com Windows 10+ ou macOS 10.14+ para app desktop
- Navegador moderno (Chrome 90+, Firefox 88+, Safari 14+) para acesso web

## Dependencies

- Servidor PostgreSQL configurado e acessível
- Serviço de email (SMTP) para envio de relatórios e notificações
- Certificado SSL/TLS válido para comunicação segura
- Storage para backups automáticos (mínimo 10GB por empresa)

## Glossary

- **MT (Metical)**: Moeda oficial de Moçambique
- **BI**: Bilhete de Identidade (documento de identificação moçambicano)
- **NIF/NUIT**: Número de Identificação Fiscal / Número Único de Identificação Tributária
- **Stock**: Inventário de produtos disponíveis para venda
- **Tenant**: Empresa cliente isolada na arquitetura multi-tenant
- **MRR**: Monthly Recurring Revenue (Receita Mensal Recorrente)
- **Margem de Lucro**: Percentual de lucro sobre preço de compra
- **Stock Crítico**: Nível de inventário abaixo do limite mínimo definido
