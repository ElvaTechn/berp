import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import prisma from '@/lib/prisma';
import { generateReceiptHTML } from '@/lib/generate-receipt-pdf';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { id: saleId } = await params;

    // Buscar employee para obter company_id
    const employee = await prisma.employee.findFirst({
      where: { email: session.email },
      select: { company_id: true }
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'Funcionário não encontrado' },
        { status: 404 }
      );
    }

    // Buscar venda com todos os dados necessários
    const sale = await prisma.sale.findUnique({
      where: { id: saleId },
      include: {
        sale_items: {
          include: {
            product: true,
          },
        },
        company: true,
        employee: {
          select: {
            full_name: true,
          },
        },
      },
    });

    if (!sale) {
      return NextResponse.json(
        { error: 'Venda não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se a venda pertence à empresa do usuário
    if (sale.company_id !== employee.company_id) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      );
    }

    // Preparar dados para o recibo
    const receiptData = {
      sale: {
        id: sale.id,
        subtotal: sale.subtotal,
        discount_amount: sale.discount_amount,
        total: sale.total,
        payment_method: sale.payment_method,
        created_at: sale.created_at,
        company: {
          name: sale.company.name,
          nuit: sale.company.nuit,
          address: sale.company.address,
          phone: sale.company.phone,
        },
        employee: {
          full_name: sale.employee.full_name,
        },
        sale_items: sale.sale_items.map((item) => ({
          product_name: item.product.name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          subtotal: item.subtotal,
        })),
      },
    };

    // Gerar HTML do recibo
    const html = await generateReceiptHTML(receiptData);

    // Retornar HTML (que pode ser impresso diretamente pelo navegador)
    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Erro ao gerar recibo:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar recibo' },
      { status: 500 }
    );
  }
}
