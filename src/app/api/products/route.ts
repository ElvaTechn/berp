import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { Prisma } from '@prisma/client';

// GET - Listar produtos da empresa do usuário
export async function GET(request: NextRequest) {
  try {
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
      select: { company_id: true },
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'Funcionário não encontrado' },
        { status: 404 }
      );
    }

    // Query params para filtros
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('category_id');
    const isActive = searchParams.get('is_active');
    const search = searchParams.get('search');

    // Construir query
    const where: any = {
      company_id: employee.company_id,
    };

    if (categoryId) {
      where.category_id = categoryId;
    }

    if (isActive !== null && isActive !== undefined) {
      where.is_active = isActive === 'true';
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { barcode: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Buscar produtos
    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
      orderBy: [
        { is_active: 'desc' }, // Ativos primeiro
        { quantity: 'asc' }, // Stock baixo primeiro
        { name: 'asc' },
      ],
    });

    return NextResponse.json({
      success: true,
      products,
    });
  } catch (error) {
    logger.error('Error fetching products', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      { error: 'Erro ao buscar produtos' },
      { status: 500 }
    );
  }
}

// POST - Criar novo produto
export async function POST(request: NextRequest) {
  try {
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

    // Verificar permissão (apenas GESTOR e ADMIN)
    if (employee.role !== 'GESTOR' && employee.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Sem permissão para criar produtos' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validações
    if (!body.name || !body.category_id || !body.price || body.quantity === undefined || !body.min_stock) {
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando: name, category_id, price, quantity, min_stock' },
        { status: 400 }
      );
    }

    // Validar preços
    if (body.price <= 0) {
      return NextResponse.json(
        { error: 'Preço de venda deve ser maior que zero' },
        { status: 400 }
      );
    }

    if (body.cost_price && body.cost_price < 0) {
      return NextResponse.json(
        { error: 'Preço de custo não pode ser negativo' },
        { status: 400 }
      );
    }

    // Validar stock
    if (body.quantity < 0) {
      return NextResponse.json(
        { error: 'Quantidade não pode ser negativa' },
        { status: 400 }
      );
    }

    if (body.min_stock <= 0) {
      return NextResponse.json(
        { error: 'Stock mínimo deve ser maior que zero' },
        { status: 400 }
      );
    }

    // Verificar se barcode já existe (se fornecido)
    if (body.barcode) {
      const existing = await prisma.product.findFirst({
        where: {
          barcode: body.barcode,
          company_id: employee.company_id,
        },
      });

      if (existing) {
        return NextResponse.json(
          { error: 'Código de barras já cadastrado nesta empresa' },
          { status: 400 }
        );
      }
    }

    // Criar produto com Decimal
    const product = await prisma.product.create({
      data: {
        name: body.name,
        description: body.description || null,
        barcode: body.barcode || null,
        sku: body.sku || null,
        price: new Prisma.Decimal(body.price),
        cost_price: body.cost_price ? new Prisma.Decimal(body.cost_price) : null,
        quantity: parseInt(body.quantity),
        min_stock: parseInt(body.min_stock),
        max_stock: body.max_stock ? parseInt(body.max_stock) : null,
        category_id: body.category_id,
        company_id: employee.company_id,
        expiry_date: body.expiry_date ? new Date(body.expiry_date) : null,
        is_active: true,
      },
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

    logger.info('Product created', {
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
    logger.error('Error creating product', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      { error: 'Erro ao criar produto' },
      { status: 500 }
    );
  }
}
