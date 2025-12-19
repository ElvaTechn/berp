import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

// GET - Listar categorias da empresa
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

    // Buscar categorias ativas da empresa
    const categories = await prisma.category.findMany({
      where: {
        company_id: employee.company_id,
        is_active: true,
      },
      select: {
        id: true,
        name: true,
        color: true,
        description: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      categories,
    });
  } catch (error) {
    logger.error('Error fetching categories', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      { error: 'Erro ao buscar categorias' },
      { status: 500 }
    );
  }
}

// POST - Criar categoria rápida
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

    // Verificar permissão
    if (employee.role !== 'GESTOR' && employee.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Sem permissão para criar categorias' },
        { status: 403 }
      );
    }

    const body = await request.json();

    if (!body.name) {
      return NextResponse.json(
        { error: 'Nome da categoria é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se categoria já existe
    const existing = await prisma.category.findFirst({
      where: {
        name: body.name,
        company_id: employee.company_id,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Categoria já existe' },
        { status: 400 }
      );
    }

    // Cor padrão se não fornecida
    const defaultColors = ['#3b82f6', '#ef4444', '#8b5cf6', '#f59e0b', '#10b981', '#ec4899'];
    const randomColor = defaultColors[Math.floor(Math.random() * defaultColors.length)];

    // Criar categoria
    const category = await prisma.category.create({
      data: {
        name: body.name,
        description: body.description || null,
        color: body.color || randomColor,
        company_id: employee.company_id,
        is_active: true,
      },
    });

    logger.info('Category created', {
      categoryId: category.id,
      categoryName: category.name,
      companyId: employee.company_id,
      userId: payload.userId,
    });

    return NextResponse.json({
      success: true,
      category,
    });
  } catch (error) {
    logger.error('Error creating category', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      { error: 'Erro ao criar categoria' },
      { status: 500 }
    );
  }
}
