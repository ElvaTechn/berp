/**
 * ================================================================
 * VENDEDOR DASHBOARD API - BIZCONTROL 360 ERP v2.1.0
 * ================================================================
 * API para buscar métricas e dados do dashboard do vendedor
 * ================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/server-api';
import { getSession } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import type { VendedorDashboardResponse } from '@/types/vendedor';

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Buscar usuário
    const user = await db.user.findById(session.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se é vendedor
    if (user.role !== 'VENDEDOR' && user.role !== 'GESTOR' && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      );
    }

    // Buscar company_id do usuário
    let companyId: string | null = null;
    const employee = await prisma.employee.findFirst({
      where: { user_id: session.userId, is_active: true },
      select: { company_id: true }
    });

    if (employee) {
      companyId = employee.company_id;
    } else {
      const company = await prisma.company.findFirst({
        where: { owner_id: session.userId },
        select: { id: true }
      });
      if (company) {
        companyId = company.id;
      }
    }

    if (!companyId) {
      return NextResponse.json(
        { error: 'Empresa não encontrada' },
        { status: 404 }
      );
    }

    // Parâmetros
    const searchParams = request.nextUrl.searchParams;
    const periodo = searchParams.get('periodo') || 'mes';
    
    // Datas
    const hoje = new Date();
    const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    
    // Buscar vendas do vendedor no período
    const vendas = await db.sale.list({
      company_id: companyId,
      employee_id: user.id,
      created_at: {
        gte: primeiroDiaMes.toISOString(),
        lte: ultimoDiaMes.toISOString(),
      },
    });

    // Vendas de hoje
    const inicioDia = new Date(hoje.setHours(0, 0, 0, 0));
    const vendasHoje = vendas.filter(
      (v: any) => new Date(v.created_at) >= inicioDia
    );

    // Calcular métricas
    const totalVendas = vendas.length;
    const valorTotalVendido = vendas.reduce((sum: number, v: any) => sum + parseFloat(v.total.toString()), 0);
    const vendasHojeCount = vendasHoje.length;
    const valorHoje = vendasHoje.reduce((sum: number, v: any) => sum + parseFloat(v.total.toString()), 0);
    
    // Metas (mock - você pode buscar de uma tabela de metas)
    const metaVendasQuantidade = 20;
    const metaVendasValor = 200000;
    const percentualMeta = (totalVendas / metaVendasQuantidade) * 100;
    
    // Dias úteis restantes (simplificado)
    const diasRestantes = ultimoDiaMes.getDate() - hoje.getDate();
    
    // Ticket médio
    const ticketMedio = totalVendas > 0 ? valorTotalVendido / totalVendas : 0;
    const ticketMedioHoje = vendasHojeCount > 0 ? valorHoje / vendasHojeCount : 0;
    
    // Clientes atendidos hoje (aproximação baseada em vendas)
    // Nota: Sistema atual não rastreia customer_id em vendas (walk-in)
    const clientesAtendidosHoje = vendasHojeCount;

    // Buscar ranking (todos os vendedores da empresa)
    const todosFuncionarios = await prisma.employee.findMany({
      where: {
        company_id: companyId,
        is_active: true,
        user_id: { not: null }
      },
      include: {
        user: {
          select: {
            id: true,
            full_name: true,
            role: true
          }
        }
      }
    });

    // Filtrar apenas VENDEDORES
    const todosVendedores = todosFuncionarios
      .map((f: any) => f.user)
      .filter((u: any) => u && u.role === 'VENDEDOR');

    const rankingPromises = todosVendedores.map(async (vendedor: any) => {
      const vendasVendedor = await db.sale.count({
        company_id: companyId,
        employee_id: vendedor.id,
        created_at: {
          gte: primeiroDiaMes.toISOString(),
          lte: ultimoDiaMes.toISOString(),
        },
      });

      const valorVendedor = await db.sale.aggregate({
        where: {
          company_id: companyId,
          employee_id: vendedor.id,
          created_at: {
            gte: primeiroDiaMes.toISOString(),
            lte:ultimoDiaMes.toISOString(),
          },
        },
        _sum: {
          total: true,
        },
      });

      return {
        posicao: 0, // será calculado depois
        vendedor_id: vendedor.id,
        vendedor_nome: vendedor.full_name,
        vendas: vendasVendedor,
        valor_total: parseFloat(valorVendedor._sum?.total?.toString() || '0'),
        eh_voce: vendedor.id === user.id,
      };
    });

    const rankingData = await Promise.all(rankingPromises);

    // Ordenar por vendas e atribuir posições
    rankingData.sort((a: any, b: any) => b.vendas - a.vendas);
    rankingData.forEach((item: any, index: number) => {
      item.posicao = index + 1;
    });

    const minhaPosicao = rankingData.find((r: any) => r.eh_voce)?.posicao || 0;

    // Buscar produtos com estoque baixo ou em promoção
    const produtosDestaque = await db.product.list(companyId, {
      OR: [
        { quantity: { lte: 5 } }, // Estoque baixo
        { price: { gt: 0 } }, // Simplificado
      ],
    });

    // Ultimas vendas formatadas
    const ultimasVendas = vendas.slice(0, 10).map((venda: any) => ({
      id: venda.id,
      cliente_nome: 'Cliente Walk-in',
      valor: parseFloat(venda.total.toString()),
      items_count: (venda.sale_items || []).length,
      data: venda.created_at,
      status: 'synced' as const,
      metodo_pagamento: venda.payment_method,
    }));

    // Comissões (mock - você pode ter uma tabela de comissões)
    const comissaoPercentual = 0.10; // 10%
    const comissaoAcumulada = valorTotalVendido * comissaoPercentual;
    const comissaoProjetada = (metaVendasValor * percentualMeta / 100) * comissaoPercentual;

    // Montar resposta
    const response: VendedorDashboardResponse = {
      metrics: {
        vendedor_id: user.id,
        vendedor_nome: user.full_name,
        periodo: `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`,
        
        // Metas
        meta_vendas_quantidade: metaVendasQuantidade,
        meta_vendas_valor: metaVendasValor,
        vendas_realizadas: totalVendas,
        valor_total_vendido: valorTotalVendido,
        percentual_meta: percentualMeta,
        dias_uteis_restantes: diasRestantes,
        previsao_fechamento: totalVendas + (totalVendas / (ultimoDiaMes.getDate() - diasRestantes)) * diasRestantes,
        
        // Hoje
        vendas_hoje: vendasHojeCount,
        valor_hoje: valorHoje,
        clientes_atendidos_hoje: clientesAtendidosHoje,
        taxa_conversao_hoje: 0, // Requer dados de visitas
        ticket_medio_hoje: ticketMedioHoje,
        
        // Período
        ticket_medio: ticketMedio,
        novos_clientes: 0, // Sistema não rastreia clientes individuais
        clientes_recorrentes: 0, // Sistema não rastreia clientes individuais
        taxa_conversao: 0, // Requer dados de visitas
        tempo_medio_venda: 15, // Mock
        
        // Comissões
        comissao_acumulada: comissaoAcumulada,
        comissao_projetada: comissaoProjetada,
        ultima_comissao_paga: 12500,
        data_ultimo_pagamento: new Date(hoje.getFullYear(), hoje.getMonth() - 1, 5).toISOString(),
        
        // Comparações (mock - requer dados históricos)
        vendas_mes_anterior: 15,
        valor_mes_anterior: 150000,
        variacao_vendas: ((totalVendas - 15) / 15) * 100,
        variacao_valor: ((valorTotalVendido - 150000) / 150000) * 100,
        
        // Status
        ranking_posicao: minhaPosicao,
        ranking_total_vendedores: rankingData.length,
        vendas_offline_pendentes: 0, // Será preenchido pelo frontend
      },
      
      ranking: rankingData.slice(0, 10),
      
      ultimas_vendas: ultimasVendas,
      
      produtos_destaque: produtosDestaque.map((p: any) => ({
        id: p.id,
        nome: p.name,
        preco: parseFloat(p.price.toString()),
        estoque_disponivel: p.quantity,
        estoque_baixo: p.quantity <= 5,
        promocao_ativa: false, // Simplificado
        categoria: p.category_id || 'Geral',
      })),
      
      follow_ups: [], // TODO: Implementar sistema de follow-ups
      
      vendas_offline: [], // Será preenchido pelo frontend
      
      comissoes_historico: [
        {
          mes: `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`,
          valor: comissaoAcumulada,
          vendas_quantidade: totalVendas,
          percentual_comissao: comissaoPercentual * 100,
          status: 'pendente',
        },
      ],
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[API Vendedor Dashboard] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar dados do dashboard' },
      { status: 500 }
    );
  }
}
