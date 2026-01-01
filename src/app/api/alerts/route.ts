/**
 * ================================================================
 * ALERTS API - BIZCONTROL 360 ERP v2.1.0
 * ================================================================
 * API para gerenciar alertas do sistema
 * ================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { getAllAlerts, getUnreadAlerts, markAlertAsRead, resolveAlert } from '@/lib/alerts';
import { db } from '@/lib/server-api';
import prisma from '@/lib/prisma';

/**
 * GET /api/alerts - Buscar alertas
 */
export async function GET(request: NextRequest) {
  try {
    // Autenticação
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

    // Buscar company_id do usuário (pode ser employee ou owner)
    let companyId: string | null = null;
    
    const employee = await prisma.employee.findFirst({
      where: { user_id: session.userId, is_active: true },
      select: { company_id: true }
    });

    if (employee) {
      companyId = employee.company_id;
    } else {
      // Se não encontrou como funcionário, verifica se é dono de alguma empresa
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

    // Verificar permissão (apenas ADMIN e GESTOR)
    if (user.role !== 'ADMIN' && user.role !== 'GESTOR') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      );
    }

    // Parâmetros
    const searchParams = request.nextUrl.searchParams;
    const onlyUnread = searchParams.get('unread') === 'true';

    // Buscar alertas
    const alerts = onlyUnread 
      ? await getUnreadAlerts(companyId)
      : await getAllAlerts(companyId);

    return NextResponse.json({
      alerts,
      count: alerts.length,
      unread_count: alerts.filter(a => a.status === 'unread').length,
    });
  } catch (error) {
    console.error('[API Alerts] Error:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar alertas' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/alerts/:id - Atualizar alerta
 */
export async function PATCH(request: NextRequest) {
  try {
    // Autenticação
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const user = await db.user.findById(session.userId);
    if (!user || (user.role !== 'ADMIN' && user.role !== 'GESTOR')) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      );
    }

    // Parse body
    const body = await request.json();
    const { alert_id, action } = body;

    if (!alert_id || !action) {
      return NextResponse.json(
        { error: 'alert_id e action são obrigatórios' },
        { status: 400 }
      );
    }

    // Executar ação
    switch (action) {
      case 'mark_read':
        await markAlertAsRead(alert_id);
        break;
      case 'resolve':
        await resolveAlert(alert_id);
        break;
      default:
        return NextResponse.json(
          { error: 'Ação inválida' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: 'Alerta atualizado com sucesso',
    });
  } catch (error) {
    console.error('[API Alerts] Error:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar alerta' },
      { status: 500 }
    );
  }
}
