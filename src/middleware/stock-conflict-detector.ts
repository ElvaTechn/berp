/**
 * ================================================================
 * STOCK CONFLICT DETECTOR - BIZCONTROL 360 ERP v2.1.0
 * ================================================================
 * Middleware para detectar conflitos de estoque em vendas offline
 * ================================================================
 */

import { createStockConflictAlert } from '@/lib/alerts';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export interface SaleItem {
  product_id: string;
  quantity: number;
}

export interface StockConflict {
  product_id: string;
  product_name: string;
  requested: number;
  available: number;
  deficit: number;
}

/**
 * Detecta conflitos de estoque antes de processar venda
 */
export async function detectStockConflicts(
  items: SaleItem[],
  companyId: string
): Promise<StockConflict[]> {
  const conflicts: StockConflict[] = [];

  for (const item of items) {
    const product = await prisma.product.findUnique({
      where: { id: item.product_id },
      select: { 
        id: true, 
        name: true, 
        quantity: true 
      },
    });

    if (!product) {
      logger.warn('[StockConflict] Product not found', { 
        product_id: item.product_id 
      });
      continue;
    }

    // Verificar se há estoque suficiente
    if (product.quantity < item.quantity) {
      conflicts.push({
        product_id: product.id,
        product_name: product.name,
        requested: item.quantity,
        available: product.quantity,
        deficit: item.quantity - product.quantity,
      });

      logger.warn('[StockConflict] Insufficient stock detected', {
        product: product.name,
        requested: item.quantity,
        available: product.quantity,
      });
    }
  }

  return conflicts;
}

/**
 * Processa venda com conflict resolution
 * - Se houver estoque: processa normalmente
 * - Se NÃO houver: aceita mas cria alerta para gerente
 */
export async function processSaleWithConflictResolution(params: {
  saleId: string;
  items: SaleItem[];
  companyId: string;
  sellerId: string;
  sellerName: string;
}): Promise<{
  conflicts: StockConflict[];
  alertsCreated: number;
}> {
  const conflicts = await detectStockConflicts(params.items, params.companyId);

  let alertsCreated = 0;

  // Se houver conflitos, criar alertas
  if (conflicts.length > 0) {
    logger.info('[StockConflict] Creating alerts for conflicts', {
      sale_id: params.saleId,
      conflicts_count: conflicts.length,
    });

    for (const conflict of conflicts) {
      try {
        await createStockConflictAlert({
          company_id: params.companyId,
          sale_id: params.saleId,
          product_id: conflict.product_id,
          product_name: conflict.product_name,
          requested_quantity: conflict.requested,
          available_quantity: conflict.available,
          seller_id: params.sellerId,
          seller_name: params.sellerName,
        });

        alertsCreated++;
      } catch (error) {
        logger.error('[StockConflict] Failed to create alert', {
          error,
          conflict,
        });
      }
    }

    logger.info('[StockConflict] Alerts created', {
      sale_id: params.saleId,
      alerts: alertsCreated,
    });
  }

  return {
    conflicts,
    alertsCreated,
  };
}

/**
 * Middleware para ser usado após processar venda
 */
export async function afterSaleCreated(params: {
  saleId: string;
  items: Array<{ product_id: string; quantity: number }>;
  companyId: string;
  sellerId: string;
  sellerName: string;
}): Promise<void> {
  // Executar detecção em background (não bloqueia response)
  setImmediate(async () => {
    try {
      const result = await processSaleWithConflictResolution(params);
      
      if (result.conflicts.length > 0) {
        logger.warn('[StockConflict] Sale processed with conflicts', {
          sale_id: params.saleId,
          conflicts: result.conflicts.length,
          alerts: result.alertsCreated,
        });
      }
    } catch (error) {
      logger.error('[StockConflict] Error in afterSaleCreated', {
        error,
        sale_id: params.saleId,
      });
    }
  });
}
