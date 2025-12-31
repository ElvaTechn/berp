/**
 * ================================================================
 * ALERTS TYPES - BIZCONTROL 360 ERP v2.1.0
 * ================================================================
 * Sistema de alertas para conflitos e notificações
 * ================================================================
 */

export type AlertType = 
  | 'stock_conflict'        // Conflito de estoque (venda offline)
  | 'low_stock'            // Estoque baixo
  | 'stock_zero'           // Estoque zerado
  | 'sale_error'           // Erro ao processar venda
  | 'sync_error'           // Erro de sincronização
  | 'system';              // Alerta do sistema

export type AlertPriority = 'low' | 'medium' | 'high' | 'critical';

export type AlertStatus = 'unread' | 'read' | 'resolved' | 'dismissed';

export interface Alert {
  id: string;
  type: AlertType;
  priority: AlertPriority;
  status: AlertStatus;
  title: string;
  message: string;
  metadata?: {
    sale_id?: string;
    product_id?: string;
    product_name?: string;
    requested_quantity?: number;
    available_quantity?: number;
    seller_id?: string;
    seller_name?: string;
    [key: string]: any;
  };
  created_at: string;
  read_at?: string;
  resolved_at?: string;
  company_id: string;
}

export interface CreateAlertInput {
  type: AlertType;
  priority: AlertPriority;
  title: string;
  message: string;
  metadata?: Alert['metadata'];
  company_id: string;
}
