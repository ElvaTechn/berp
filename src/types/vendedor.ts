/**
 * ================================================================
 * VENDEDOR TYPES - BIZCONTROL 360 ERP v2.1.0
 * ================================================================
 * Tipos TypeScript para dashboard do vendedor
 * ================================================================
 */

export interface VendedorMetrics {
  // Identificação
  vendedor_id: string;
  vendedor_nome: string;
  periodo: string; // "2025-12"
  
  // Metas
  meta_vendas_quantidade: number;
  meta_vendas_valor: number;
  vendas_realizadas: number;
  valor_total_vendido: number;
  percentual_meta: number;
  dias_uteis_restantes: number;
  previsao_fechamento: number;
  
  // Desempenho Hoje
  vendas_hoje: number;
  valor_hoje: number;
  clientes_atendidos_hoje: number;
  taxa_conversao_hoje: number;
  ticket_medio_hoje: number;
  
  // Desempenho Período
  ticket_medio: number;
  novos_clientes: number;
  clientes_recorrentes: number;
  taxa_conversao: number;
  tempo_medio_venda: number; // em minutos
  
  // Comissões
  comissao_acumulada: number;
  comissao_projetada: number;
  ultima_comissao_paga: number;
  data_ultimo_pagamento: string;
  
  // Comparações
  vendas_mes_anterior: number;
  valor_mes_anterior: number;
  variacao_vendas: number; // %
  variacao_valor: number; // %
  
  // Status
  ranking_posicao: number;
  ranking_total_vendedores: number;
  vendas_offline_pendentes: number;
}

export interface RankingVendedor {
  posicao: number;
  vendedor_id: string;
  vendedor_nome: string;
  vendas: number;
  valor_total: number;
  avatar?: string;
  eh_voce: boolean;
}

export interface UltimaVenda {
  id: string;
  cliente_nome: string;
  valor: number;
  items_count: number;
  data: string;
  status: 'synced' | 'syncing' | 'pending' | 'error';
  erro_mensagem?: string;
  metodo_pagamento: string;
}

export interface ProdutoDestaque {
  id: string;
  nome: string;
  preco: number;
  preco_original?: number;
  desconto_percentual?: number;
  estoque_disponivel: number;
  estoque_baixo: boolean;
  promocao_ativa: boolean;
  promocao_texto?: string;
  imagem_url?: string;
  categoria: string;
}

export interface FollowUp {
  id: string;
  tipo: 'ligar' | 'email' | 'visita' | 'orcamento' | 'aniversario';
  cliente_nome: string;
  cliente_id: string;
  descricao: string;
  data_prevista: string;
  prioridade: 'alta' | 'media' | 'baixa';
  concluido: boolean;
}

export interface ComissaoDetalhada {
  mes: string;
  valor: number;
  vendas_quantidade: number;
  percentual_comissao: number;
  status: 'pendente' | 'pago';
  data_pagamento?: string;
}

export interface VendaOfflinePendente {
  id: string;
  timestamp: number;
  valor: number;
  items_count: number;
  status: 'pending' | 'syncing' | 'error';
  retry_count: number;
  erro?: string;
}

// Response types para APIs
export interface VendedorDashboardResponse {
  metrics: VendedorMetrics;
  ranking: RankingVendedor[];
  ultimas_vendas: UltimaVenda[];
  produtos_destaque: ProdutoDestaque[];
  follow_ups: FollowUp[];
  vendas_offline: VendaOfflinePendente[];
  comissoes_historico: ComissaoDetalhada[];
}

// Filtros
export interface DashboardFilters {
  periodo?: 'hoje' | 'semana' | 'mes' | 'custom';
  data_inicio?: string;
  data_fim?: string;
}
