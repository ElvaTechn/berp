import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { Prisma } from '@prisma/client';

// PATCH - Atualizar produto
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params (Next.js 16+)
    const { id: productId } = await params;

    // Verificar autenticação
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    // Buscar empresa do usuário
    const employee = await prisma.employee.findFirst({
      where: { user_id: payload.userId },
      select: { company_id: true, role: true },
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'Funcionário não encontrado' },
        { status: 404 }
      );
    }

    // Verificar permissão
    if (employee.role !== 'GESTOR' && employee.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Sem permissão para editar produtos' },
        { status: 403 }
      );
    }

    // Verificar se produto existe e pertence à empresa
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      );
    }

    if (existingProduct.company_id !== employee.company_id) {
      return NextResponse.json(
        { error: 'Produto não pertence à sua empresa' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Preparar dados para atualização
    const updateData: any = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.barcode !== undefined) {
      // Verificar se barcode já existe em outro produto
      if (body.barcode) {
        const duplicate = await prisma.product.findFirst({
          where: {
            barcode: body.barcode,
            company_id: employee.company_id,
            id: { not: productId },
          },
        });

        if (duplicate) {
          return NextResponse.json(
            { error: 'Código de barras já cadastrado em outro produto' },
            { status: 400 }
          );
        }
      }
      updateData.barcode = body.barcode;
    }
    if (body.sku !== undefined) updateData.sku = body.sku;
    
    // Preços (converter para Decimal)
    if (body.price !== undefined) {
      if (body.price <= 0) {
        return NextResponse.json(
          { error: 'Preço de venda deve ser maior que zero' },
          { status: 400 }
        );
      }
      updateData.price = new Prisma.Decimal(body.price);
    }
    
    if (body.cost_price !== undefined) {
      if (body.cost_price !== null && body.cost_price < 0) {
        return NextResponse.json(
          { error: 'Preço de custo não pode ser negativo' },
          { status: 400 }
        );
      }
      updateData.cost_price = body.cost_price ? new Prisma.Decimal(body.cost_price) : null;
    }

    // Stocks
    if (body.quantity !== undefined) {
      const qty = parseInt(body.quantity);
      if (qty < 0) {
        return NextResponse.json(
          { error: 'Quantidade não pode ser negativa' },
          { status: 400 }
        );
      }
      updateData.quantity = qty;
    }

    if (body.min_stock !== undefined) {
      const minStock = parseInt(body.min_stock);
      if (minStock <= 0) {
        return NextResponse.json(
          { error: 'Stock mínimo deve ser maior que zero' },
          { status: 400 }
        );
      }
      updateData.min_stock = minStock;
    }

    if (body.max_stock !== undefined) {
      updateData.max_stock = body.max_stock ? parseInt(body.max_stock) : null;
    }

    // Outros campos
    if (body.category_id !== undefined) updateData.category_id = body.category_id;
    if (body.expiry_date !== undefined) {
      updateData.expiry_date = body.expiry_date ? new Date(body.expiry_date) : null;
    }
    if (body.is_active !== undefined) updateData.is_active = body.is_active;

    // Atualizar produto
    const product = await prisma.product.update({
      where: { id: productId },
      data: updateData,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });

    logger.info('Product updated', {
      productId: product.id,
      productName: product.name,
      companyId: employee.company_id,
      userId: payload.userId,
    });

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error) {
    logger.error('Error updating product', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      { error: 'Erro ao atualizar produto' },
      { status: 500 }
    );
  }
}

// DELETE - Deletar produto
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params (Next.js 16+)
    const { id: productId } = await params;

    // Verificar autenticação
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    // Buscar empresa do usuário
    const employee = await prisma.employee.findFirst({
      where: { user_id: payload.userId },
      select: { company_id: true, role: true },
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'Funcionário não encontrado' },
        { status: 404 }
      );
    }

    // Verificar permissão
    if (employee.role !== 'GESTOR' && employee.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Sem permissão para deletar produtos' },
        { status: 403 }
      );
    }

    // Verificar se produto existe e pertence à empresa
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      );
    }

    if (existingProduct.company_id !== employee.company_id) {
      return NextResponse.json(
        { error: 'Produto não pertence à sua empresa' },
        { status: 403 }
      );
    }

    // Verificar se produto tem vendas associadas
    const hasSales = await prisma.saleItem.findFirst({
      where: { product_id: productId },
    });

    if (hasSales) {
      // Soft delete (não pode deletar permanentemente por integridade)
      const product = await prisma.product.update({
        where: { id: productId },
        data: { is_active: false },
      });

      logger.info('Product soft deleted (has sales)', {
        productId: product.id,
        productName: product.name,
        companyId: employee.company_id,
        userId: payload.userId,
      });

      return NextResponse.json({
        success: true,
        message: 'Produto desativado (possui vendas associadas)',
        soft_delete: true,
        product,
      });
    }

    // Delete permanente (não tem vendas)
    await prisma.product.delete({
      where: { id: productId },
    });

    logger.info('Product permanently deleted', {
      productId: productId,
      productName: existingProduct.name,
      companyId: employee.company_id,
      userId: payload.userId,
    });

    return NextResponse.json({
      success: true,
      message: 'Produto deletado permanentemente',
      soft_delete: false,
    });
  } catch (error) {
    logger.error('Error deleting product', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      { error: 'Erro ao deletar produto' },
      { status: 500 }
    );
  }
}
