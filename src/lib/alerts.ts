/**
 * ================================================================
 * ALERTS MANAGER - BIZCONTROL 360 ERP v2.1.0
 * ================================================================
 * Sistema de gerenciamento de alertas e notificações
 * ================================================================
 */

import type { Alert, CreateAlertInput, AlertType, AlertPriority } from '@/types/alerts';

// Storage em memória (temporário - pode migrar para DB depois)
const alerts: Alert[] = [];

/**
 * Cria um novo alerta
 */
export async function createAlert(input: CreateAlertInput): Promise<Alert> {
  const alert: Alert = {
    id: generateId(),
    type: input.type,
    priority: input.priority,
    status: 'unread',
    title: input.title,
    message: input.message,
    metadata: input.metadata,
    created_at: new Date().toISOString(),
    company_id: input.company_id,
  };

  alerts.push(alert);
  
  console.log(`[Alerts] Created alert: ${alert.type} - ${alert.title}`);
  
  // TODO: Implementar notificação push/email para gerentes
  
  return alert;
}

/**
 * Cria alerta de conflito de estoque
 */
export async function createStockConflictAlert(params: {
  company_id: string;
  sale_id: string;
  product_id: string;
  product_name: string;
  requested_quantity: number;
  available_quantity: number;
  seller_id: string;
  seller_name: string;
}): Promise<Alert> {
  return createAlert({
    type: 'stock_conflict',
    priority: 'high',
    title: 'Conflito de Estoque Detectado',
    message: `Venda offline processada com estoque insuficiente. Produto: ${params.product_name}. Solicitado: ${params.requested_quantity}, Disponível: ${params.available_quantity}.`,
    metadata: {
      sale_id: params.sale_id,
      product_id: params.product_id,
      product_name: params.product_name,
      requested_quantity: params.requested_quantity,
      available_quantity: params.available_quantity,
      seller_id: params.seller_id,
      seller_name: params.seller_name,
      conflict_type: 'insufficient_stock',
    },
    company_id: params.company_id,
  });
}

/**
 * Busca alertas não lidos
 */
export async function getUnreadAlerts(companyId: string): Promise<Alert[]> {
  return alerts.filter(
    a => a.company_id === companyId && a.status === 'unread'
  ).sort((a, b) => {
    // Ordenar por prioridade e data
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

/**
 * Busca todos os alertas
 */
export async function getAllAlerts(companyId: string): Promise<Alert[]> {
  return alerts.filter(a => a.company_id === companyId);
}

/**
 * Marca alerta como lido
 */
export async function markAlertAsRead(alertId: string): Promise<void> {
  const alert = alerts.find(a => a.id === alertId);
  if (alert && alert.status === 'unread') {
    alert.status = 'read';
    alert.read_at = new Date().toISOString();
  }
}

/**
 * Marca alerta como resolvido
 */
export async function resolveAlert(alertId: string): Promise<void> {
  const alert = alerts.find(a => a.id === alertId);
  if (alert) {
    alert.status = 'resolved';
    alert.resolved_at = new Date().toISOString();
  }
}

/**
 * Gera ID único
 */
function generateId(): string {
  return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
