// src/app/api/admin/companies/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { registerNewCompany } from '@/services/admin-service';

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

    // 3. Atualizar automaticamente status expirados
    const now = new Date();
    await prisma.company.updateMany({
      where: {
        subscription_end: {
          lt: now
        },
        subscription_status: {
          in: ['TRIAL', 'ACTIVE']
        }
      },
      data: {
        subscription_status: 'EXPIRED'
      }
    });

    // 4. Buscar todas as empresas com contagens e owner
    const companies = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
        nuit: true,
        email: true,
        phone: true,
        address: true,
        subscription_status: true,
        subscription_type: true,
        subscription_end: true,
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

export async function POST(request: NextRequest) {
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
        { error: 'Acesso negado. Apenas administradores podem criar empresas.' },
        { status: 403 }
      );
    }

    // 3. Parse do body
    const body = await request.json();
    const {
      companyName,
      nuit,
      address,
      phone,
      companyEmail,
      businessSector,
      ownerName,
      ownerEmail,
      ownerPassword,
      trialDays,
    } = body;

    // 4. Validações básicas
    if (!companyName || !nuit || !ownerName || !ownerEmail || !ownerPassword) {
      return NextResponse.json(
        { error: 'Dados obrigatórios faltando' },
        { status: 400 }
      );
    }

    // 5. Obter IP e User-Agent
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // 6. Chamar serviço de registro
    const result = await registerNewCompany(
      {
        companyName,
        nuit,
        address,
        phone,
        companyEmail,
        businessSector,
        ownerName,
        ownerEmail,
        ownerPassword,
        trialDays: trialDays || 30,
      },
      session.userId,
      ipAddress,
      userAgent
    );

    // 7. Retornar resultado
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Erro ao criar empresa' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        company: {
          id: result.company?.id,
          name: result.company?.name,
          nuit: result.company?.nuit,
          subscriptionEnd: result.company?.subscriptionEnd,
        },
        user: {
          id: result.user?.id,
          email: result.user?.email,
          fullName: result.user?.fullName,
        },
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Erro ao criar empresa:', error);
    return NextResponse.json(
      { error: 'Erro ao criar empresa' },
      { status: 500 }
    );
  }
}
