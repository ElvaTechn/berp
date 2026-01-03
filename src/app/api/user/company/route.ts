import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

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

    // Buscar usuário com empresa
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        employees: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                nuit: true,
                address: true,
                phone: true,
                email: true,
              },
            },
          },
          take: 1,
        },
        companies: {
          select: {
            id: true,
            name: true,
            nuit: true,
            address: true,
            phone: true,
            email: true,
          },
          take: 1,
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Tentar pegar empresa do employee primeiro, depois das companies
    let company = user.employees[0]?.company || user.companies[0];

    if (!company) {
      // Segurança: não expor empresas aleatórias do banco de dados
      // Registrar tentativa de acesso sem empresa associada
      logger.warn('User without company association attempted to access company data', {
        userId: payload.userId,
        email: user.email,
      });

      // Retornar empresa padrão genérica para usuários sem empresa
      company = {
        id: 'default',
        name: 'Minha Empresa',
        nuit: null,
        address: null,
        phone: null,
        email: null,
      };
    }

    return NextResponse.json({
      success: true,
      company,
    });
  } catch (error) {
    logger.error('Error fetching user company', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      { error: 'Erro ao buscar dados da empresa' },
      { status: 500 }
    );
  }
}
