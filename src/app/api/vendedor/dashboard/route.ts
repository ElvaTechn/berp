/**
 * ================================================================
 * API ROUTE: DASHBOARD VENDEDOR (SIMPLIFICADO)
 * ================================================================
 * Retorna APENAS as vendas do vendedor logado
 * ================================================================
 */

import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getSession();
    
    if (!session) {
      return Response.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        full_name: true,
        role: true,
      },
    });

    if (!user) {
      return Response.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se é VENDEDOR
    if (user.role !== 'VENDEDOR') {
      return Response.json(
        { error: 'Acesso negado. Apenas vendedores.' },
        { status: 403 }
      );
    }

    // Buscar employee_id do usuário
    const employee = await prisma.employee.findFirst({
      where: {
        user_id: user.id,
        is_active: true,
      },
      select: {
        id: true,
        company_id: true,
        full_name: true,
      },
    });

    if (!employee) {
      return Response.json(
        { error: 'Funcionário não encontrado' },
        { status: 404 }
      );
    }

    // Buscar TODAS as vendas do vendedor (ordenadas por data)
    const vendas = await prisma.sale.findMany({
      where: {
        employee_id: employee.id,
        company_id: employee.company_id,
      },
      include: {
        sale_items: {
          include: {
            product: {
              select: {
                name: true,
                barcode: true,
              },
            },
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    // Calcular resumo
    const totalVendas = vendas.length;
    const valorTotal = vendas.reduce((sum, venda) => {
      return sum + Number(venda.total);
    }, 0);
    const lucroTotal = vendas.reduce((sum, venda) => {
      return sum + Number(venda.total_profit || 0);
    }, 0);

    // Calcular vendas por método de pagamento
    const vendasPorMetodo = vendas.reduce((acc, venda) => {
      const metodo = venda.payment_method;
      acc[metodo] = (acc[metodo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Formatar vendas para retorno
    const vendasFormatadas = vendas.map((venda) => ({
      id: venda.id,
      data: venda.created_at,
      total: Number(venda.total),
      subtotal: Number(venda.subtotal),
      desconto: Number(venda.discount_amount || 0),
      lucro: Number(venda.total_profit || 0),
      metodo_pagamento: venda.payment_method,
      status_pagamento: venda.payment_status,
      items: venda.sale_items.map((item) => ({
        produto: item.product.name,
        barcode: item.product.barcode,
        quantidade: item.quantity,
        preco_unitario: Number(item.unit_price),
        subtotal: Number(item.subtotal),
        lucro: Number(item.profit),
      })),
    }));

    return Response.json({
      vendedor: {
        id: employee.id,
        nome: employee.full_name,
      },
      resumo: {
        total_vendas: totalVendas,
        valor_total: valorTotal,
        lucro_total: lucroTotal,
        vendas_por_metodo: vendasPorMetodo,
      },
      vendas: vendasFormatadas,
    });
  } catch (error) {
    console.error('[API] Erro no dashboard vendedor:', error);
    return Response.json(
      { 
        error: 'Erro ao buscar dados do dashboard',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
