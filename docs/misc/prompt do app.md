Contexto do Projeto Criar um sistema completo de Gestão de Stock e Vendas para empresas em Moçambique, focado em resolver problemas de controle desordenado de inventário, gestão financeira comprometida e contas que não fecham. Objetivo Principal Desenvolver uma aplicação desktop (com acesso web/mobile) que permita vendedores e gestores controlarem stock, vendas, caixa e lucros em tempo real. Requisitos Técnicos

Backend: TypeScript + Node.js Frontend: Next.js (React) Base de Dados: PostgreSQL Tipo: Aplicação desktop com sincronização online para acesso mobile

Arquitetura de Usuários

VENDEDOR Funcionalidades:
Efectuar Venda:

Selecionar produto da lista Indicar quantidade Sistema calcula preço automaticamente Registo da venda no sistema

Ver Produtos Disponíveis:

Lista completa de produtos com quantidades Alertas visuais quando produto está em falta Filtros por categoria

Reservar Produtos:

Formulário: Nome do titular + BI Selecionar produto e quantidade a reservar Ver lista de produtos já acumulados/reservados

GESTOR/GERENTE Funcionalidades:
Cadastrar Produtos:

Criar categorias de produtos Adicionar produtos com especificações (nome, preço compra, preço venda, quantidade inicial)

Nível de Stock:

Tabela com todos os produtos e quantidades Gráfico de pizza mostrando distribuição de stock Alertas automáticos para stock baixo com recomendações de reabastecimento

Controle de Finanças:

Dashboard com lucro diário Total de dinheiro que entrou no dia Cálculo automático de lucro por produto

Gestão de Vendedores:

Criar contas de vendedores Ver lista de vendedores activos Gerir permissões de acesso

Estatísticas:

Relatórios: Diário, Semanal, Mensal, Anual Gráfico de pizza com produto mais vendido Análise de lucros por período

Produtos Reservados:

Lista de reservas com titular e BI Produtos reservados por cliente

Definições:

Status de subscrição (activo/inactivo) Opção de pagamento de subscrição (mensal/anual)

SUPER USUÁRIO (ADMIN) Funcionalidades:
Cadastrar novas empresas no sistema Controlar subscrições de empresas activas Dashboard geral de todas as empresas Gestão de pagamentos de subscrições

Fluxo Principal Cliente compra → Vendedor registra venda → Sistema atualiza stock → Gestor monitora em tempo real Funcionalidades Automáticas do Sistema

Cálculo automático de preços nas vendas Atualização automática de stock após cada venda Alertas de stock baixo com recomendações Relatório diário automático enviado ao gestor com:

Total vendido (valor) Produtos mais vendidos Lucro do dia Gráfico de pizza com distribuição de vendas

Cálculo automático de lucro por produto (preço venda - preço compra)

Requisitos de Base de Dados Tabelas principais:

Empresas (multi-tenant) Usuários (super_user, gestor, vendedor) Categorias Produtos (nome, preço_compra, preço_venda, quantidade, categoria_id) Vendas (produto_id, vendedor_id, quantidade, data, valor_total) Reservas (cliente_nome, cliente_bi, produto_id, quantidade) Subscrições (empresa_id, tipo, status, data_vencimento)

Interface Desejada

Design limpo e intuitivo Dashboard com gráficos visuais (pizza, barras) Responsivo para desktop e mobile Alertas visuais claros (cores: vermelho para stock baixo, verde para OK)

Prioridades de Desenvolvimento

Sistema de autenticação (multi-tenant) CRUD de produtos e categorias Sistema de vendas e atualização de stock Dashboard de gestor com estatísticas Sistema de relatórios Sistema de reservas Gestão de subscrições

Sugestões Adicionais Você pode melhorar ainda mais especificando:

Idioma da interface: Português (Moçambique) Moeda: Metical (MT) Notificações: Email/SMS para alertas de stock? Backup: Frequência de backup automático Impressão: Recibos/faturas de venda?