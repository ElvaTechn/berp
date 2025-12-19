/**
 * ================================================================
 * ANALYTICS SERVICE - BIZCONTROL 360 ERP v2.0.0
 * ================================================================
 * Sistema de Analytics e Dashboards com Performance Otimizada
 * 
 * FUNCIONALIDADES:
 * - KPIs Principais (Hoje vs Ontem)
 * - Gráfico de Tendência (7 dias)
 * - Top Produtos (Ranking)
 * - Alertas de Inventário
 * - Distribuição de Pagamentos
 * - Margem de Lucro %
 * 
 * PERFORMANCE:
 * - Usa Prisma.aggregate e groupBy
 * - Queries paralelas
 * - Índices otimizados
 * 
 * AUTOR: Data Engineering Team
 * DATA: 18 Dezembro 2025
 * ================================================================
 */

import "server-only";
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { 
  toDecimal, 
  fromDecimal,
  formatCurrency,
  sumDecimals,
  averageDecimals
} from '@/lib/decimal-helpers';
import { logger } from '@/lib/logger';

// ================================================================
// TYPES
// ================================================================

export interface KPIData {
  today: {
    revenue: number;
    revenue_formatted: string;
    profit: number;
    profit_formatted: string;
    sales_count: number;
    avg_ticket: number;
    avg_ticket_formatted: string;
    profit_margin: number; // Percentual
  };
  yesterday: {
    revenue: number;
    profit: number;
    sales_count: number;
    avg_ticket: number;
    profit_margin: number;
  };
  growth: {
    revenue_percent: number;
    profit_percent: number;
    sales_percent: number;
    avg_ticket_percent: number;
  };
}

export interface TrendData {
  date: string; // YYYY-MM-DD
  revenue: number;
  profit: number;
  sales_count: number;
}

export interface TopProduct {
  product_id: string;
  product_name: string;
  quantity_sold: number;
  revenue: number;
  revenue_formatted: string;
  profit: number;
  profit_margin: number;
}

export interface InventoryAlert {
  product_id: string;
  product_name: string;
  current_stock: number;
  min_stock: number;
  status: 'critical' | 'warning' | 'low';
}

export interface PaymentDistribution {
  method: string;
  amount: number;
  amount_formatted: string;
  count: number;
  percentage: number;
}

export interface DashboardData {
  kpis: KPIData;
  trend: TrendData[];
  top_products: TopProduct[];
  inventory_alerts: InventoryAlert[];
  payment_distribution: PaymentDistribution[];
}

// ================================================================
// ANALYTICS SERVICE CLASS
// ================================================================

export class AnalyticsService {
  /**
   * Busca todas as métricas do dashboard
   */
  static async getDashboardData(companyId: string): Promise<DashboardData> {
    logger.info('Fetching dashboard analytics', { company_id: companyId });

    const startTime = Date.now();

    // Executar todas as queries em paralelo para máxima performance
    const [kpis, trend, topProducts, inventoryAlerts, paymentDistribution] = 
      await Promise.all([
        this.getKPIs(companyId),
        this.getTrendData(companyId, 7),
        this.getTopProducts(companyId, 5),
        this.getInventoryAlerts(companyId),
        this.getPaymentDistribution(companyId)
      ]);

    const duration = Date.now() - startTime;

    logger.info('Dashboard analytics fetched', {
      company_id: companyId,
      duration_ms: duration
    });

    return {
      kpis,
      trend,
      top_products: topProducts,
      inventory_alerts: inventoryAlerts,
      payment_distribution: paymentDistribution
    };
  }

  // ================================================================
  // KPIs PRINCIPAIS (Hoje vs Ontem)
  // ================================================================

  static async getKPIs(companyId: string): Promise<KPIData> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const yesterdayEnd = new Date(todayEnd);
    yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);

    // Buscar dados de hoje e ontem em paralelo
    const [todayData, yesterdayData] = await Promise.all([
      this.getSalesSummary(companyId, todayStart, todayEnd),
      this.getSalesSummary(companyId, yesterdayStart, yesterdayEnd)
    ]);

    // Calcular crescimento percentual
    const growth = {
      revenue_percent: this.calculateGrowth(todayData.revenue, yesterdayData.revenue),
      profit_percent: this.calculateGrowth(todayData.profit, yesterdayData.profit),
      sales_percent: this.calculateGrowth(todayData.count, yesterdayData.count),
      avg_ticket_percent: this.calculateGrowth(todayData.avg_ticket, yesterdayData.avg_ticket)
    };

    return {
      today: {
        revenue: todayData.revenue,
        revenue_formatted: formatCurrency(todayData.revenue),
        profit: todayData.profit,
        profit_formatted: formatCurrency(todayData.profit),
        sales_count: todayData.count,
        avg_ticket: todayData.avg_ticket,
        avg_ticket_formatted: formatCurrency(todayData.avg_ticket),
        profit_margin: todayData.profit_margin
      },
      yesterday: {
        revenue: yesterdayData.revenue,
        profit: yesterdayData.profit,
        sales_count: yesterdayData.count,
        avg_ticket: yesterdayData.avg_ticket,
        profit_margin: yesterdayData.profit_margin
      },
      growth
    };
  }

  /**
   * Busca resumo de vendas em um período
   */
  private static async getSalesSummary(
    companyId: string,
    startDate: Date,
    endDate: Date
  ) {
    // Usar aggregate para performance máxima
    const result = await prisma.sale.aggregate({
      where: {
        company_id: companyId,
        created_at: {
          gte: startDate,
          lte: endDate
        }
      },
      _sum: {
        total: true,
        total_profit: true
      },
      _count: {
        id: true
      }
    });

    const revenue = result._sum.total ? fromDecimal(result._sum.total) : 0;
    const profit = result._sum.total_profit ? fromDecimal(result._sum.total_profit) : 0;
    const count = result._count.id;
    const avg_ticket = count > 0 ? revenue / count : 0;
    const profit_margin = revenue > 0 ? (profit / revenue) * 100 : 0;

    return {
      revenue,
      profit,
      count,
      avg_ticket,
      profit_margin
    };
  }

  /**
   * Calcula crescimento percentual
   */
  private static calculateGrowth(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  // ================================================================
  // GRÁFICO DE TENDÊNCIA (Últimos N dias)
  // ================================================================

  static async getTrendData(companyId: string, days: number = 7): Promise<TrendData[]> {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // Buscar todas as vendas do período
    const sales = await prisma.sale.findMany({
      where: {
        company_id: companyId,
        created_at: {
          gte: startDate
        }
      },
      select: {
        created_at: true,
        total: true,
        total_profit: true
      },
      orderBy: {
        created_at: 'asc'
      }
    });

    // Agrupar por data
    const dataByDate = new Map<string, { revenue: number; profit: number; count: number }>();

    // Inicializar todas as datas com zero
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateKey = date.toISOString().split('T')[0];
      dataByDate.set(dateKey, { revenue: 0, profit: 0, count: 0 });
    }

    // Acumular valores por data
    for (const sale of sales) {
      const dateKey = sale.created_at.toISOString().split('T')[0];
      const current = dataByDate.get(dateKey) || { revenue: 0, profit: 0, count: 0 };
      
      current.revenue += fromDecimal(sale.total);
      current.profit += sale.total_profit ? fromDecimal(sale.total_profit) : 0;
      current.count += 1;
      
      dataByDate.set(dateKey, current);
    }

    // Converter para array ordenado
    const trend: TrendData[] = [];
    for (const [date, data] of dataByDate.entries()) {
      trend.push({
        date,
        revenue: data.revenue,
        profit: data.profit,
        sales_count: data.count
      });
    }

    return trend.sort((a, b) => a.date.localeCompare(b.date));
  }

  // ================================================================
  // TOP PRODUTOS (Ranking)
  // ================================================================

  static async getTopProducts(companyId: string, limit: number = 5): Promise<TopProduct[]> {
    // Usar groupBy para agrupar por produto
    const topProductsData = await prisma.saleItem.groupBy({
      by: ['product_id'],
      where: {
        sale: {
          company_id: companyId
        }
      },
      _sum: {
        quantity: true,
        subtotal: true,
        profit: true
      },
      orderBy: {
        _sum: {
          subtotal: 'desc' // Ordenar por valor gerado
        }
      },
      take: limit
    });

    // Buscar informações dos produtos em paralelo
    const productIds = topProductsData.map(item => item.product_id);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds }
      },
      select: {
        id: true,
        name: true
      }
    });

    // Criar map para lookup rápido
    const productMap = new Map(products.map(p => [p.id, p.name]));

    // Montar resultado
    const topProducts: TopProduct[] = topProductsData.map(item => {
      const revenue = item._sum.subtotal ? fromDecimal(item._sum.subtotal) : 0;
      const profit = item._sum.profit ? fromDecimal(item._sum.profit) : 0;
      const profit_margin = revenue > 0 ? (profit / revenue) * 100 : 0;

      return {
        product_id: item.product_id,
        product_name: productMap.get(item.product_id) || 'Produto Desconhecido',
        quantity_sold: item._sum.quantity || 0,
        revenue,
        revenue_formatted: formatCurrency(revenue),
        profit,
        profit_margin
      };
    });

    return topProducts;
  }

  // ================================================================
  // ALERTAS DE INVENTÁRIO
  // ================================================================

  static async getInventoryAlerts(companyId: string): Promise<InventoryAlert[]> {
    // Buscar produtos com stock baixo
    const products = await prisma.product.findMany({
      where: {
        company_id: companyId,
        is_active: true,
        quantity: {
          lte: prisma.product.fields.min_stock // quantity <= min_stock
        }
      },
      select: {
        id: true,
        name: true,
        quantity: true,
        min_stock: true
      },
      orderBy: {
        quantity: 'asc' // Mais críticos primeiro
      },
      take: 20 // Máximo 20 alertas
    });

    const alerts: InventoryAlert[] = products.map(product => {
      let status: 'critical' | 'warning' | 'low';
      
      if (product.quantity === 0) {
        status = 'critical'; // Sem stock
      } else if (product.quantity <= product.min_stock * 0.5) {
        status = 'critical'; // Abaixo de 50% do mínimo
      } else if (product.quantity <= product.min_stock * 0.75) {
        status = 'warning'; // Abaixo de 75% do mínimo
      } else {
        status = 'low'; // Entre 75% e 100% do mínimo
      }

      return {
        product_id: product.id,
        product_name: product.name,
        current_stock: product.quantity,
        min_stock: product.min_stock,
        status
      };
    });

    return alerts;
  }

  // ================================================================
  // DISTRIBUIÇÃO DE PAGAMENTOS
  // ================================================================

  static async getPaymentDistribution(companyId: string): Promise<PaymentDistribution[]> {
    // Agrupar vendas por método de pagamento
    const distribution = await prisma.sale.groupBy({
      by: ['payment_method'],
      where: {
        company_id: companyId
      },
      _sum: {
        total: true
      },
      _count: {
        id: true
      }
    });

    // Calcular total geral
    const totalRevenue = distribution.reduce(
      (sum, item) => sum + (item._sum.total ? fromDecimal(item._sum.total) : 0),
      0
    );

    // Montar resultado
    const result: PaymentDistribution[] = distribution.map(item => {
      const amount = item._sum.total ? fromDecimal(item._sum.total) : 0;
      const percentage = totalRevenue > 0 ? (amount / totalRevenue) * 100 : 0;

      return {
        method: item.payment_method,
        amount,
        amount_formatted: formatCurrency(amount),
        count: item._count.id,
        percentage
      };
    });

    // Ordenar por valor (maior para menor)
    return result.sort((a, b) => b.amount - a.amount);
  }

  // ================================================================
  // MÉTRICAS ADICIONAIS
  // ================================================================

  /**
   * Busca produtos próximos da validade
   */
  static async getExpiringProducts(
    companyId: string,
    daysAhead: number = 30
  ) {
    const now = new Date();
    const futureDate = new Date(now);
    futureDate.setDate(futureDate.getDate() + daysAhead);

    const products = await prisma.product.findMany({
      where: {
        company_id: companyId,
        is_active: true,
        expiry_date: {
          gte: now,
          lte: futureDate
        }
      },
      select: {
        id: true,
        name: true,
        expiry_date: true,
        quantity: true
      },
      orderBy: {
        expiry_date: 'asc'
      },
      take: 10
    });

    return products.map(p => ({
      product_id: p.id,
      product_name: p.name,
      expiry_date: p.expiry_date?.toISOString().split('T')[0],
      days_until_expiry: p.expiry_date 
        ? Math.ceil((p.expiry_date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : null,
      quantity: p.quantity
    }));
  }

  /**
   * Busca total de vendas por funcionário
   */
  static async getSalesByEmployee(companyId: string, limit: number = 10) {
    const salesByEmployee = await prisma.sale.groupBy({
      by: ['employee_id'],
      where: {
        company_id: companyId
      },
      _sum: {
        total: true,
        total_profit: true
      },
      _count: {
        id: true
      },
      orderBy: {
        _sum: {
          total: 'desc'
        }
      },
      take: limit
    });

    // Buscar nomes dos funcionários
    const employeeIds = salesByEmployee.map(s => s.employee_id);
    const employees = await prisma.employee.findMany({
      where: { id: { in: employeeIds } },
      select: { id: true, full_name: true }
    });

    const employeeMap = new Map(employees.map(e => [e.id, e.full_name]));

    return salesByEmployee.map(item => ({
      employee_id: item.employee_id,
      employee_name: employeeMap.get(item.employee_id) || 'Desconhecido',
      total_sales: item._sum.total ? fromDecimal(item._sum.total) : 0,
      total_profit: item._sum.total_profit ? fromDecimal(item._sum.total_profit) : 0,
      sales_count: item._count.id
    }));
  }
}
