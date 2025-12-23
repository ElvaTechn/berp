// src/app/api/admin/companies/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // 1. Verificar autenticação
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // 2. Verificar se é ADMIN
    if (session.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem acessar.' },
        { status: 403 }
      );
    }

    // 3. Buscar todas as empresas com contagens e owner
    const companies = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
        nuit: true,
        email: true,
        phone: true,
        address: true,
        created_at: true,
        updated_at: true,
        owner: {
          select: {
            id: true,
            full_name: true,
            email: true,
          }
        },
        _count: {
          select: {
            employees: true,
            products: true,
            sales: true,
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      companies,
      total: companies.length
    });

  } catch (error) {
    console.error('Erro ao buscar empresas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar empresas' },
      { status: 500 }
    );
  }
}
