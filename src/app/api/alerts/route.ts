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

    // Buscar usuário e empresa
    const user = await db.user.findById(session.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    const company = await db.user.getCompany(user.id);
    if (!company) {
      return NextResponse.json(
        { error: 'Empresa não encontrada' },
        { status: 404 }
      );
    }

    // Verificar permissão (apenas admin e manager)
    if (user.role !== 'admin' && user.role !== 'manager') {
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
      ? await getUnreadAlerts(company.id)
      : await getAllAlerts(company.id);

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
    if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
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
