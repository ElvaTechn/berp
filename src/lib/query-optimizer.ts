import { PrismaClient, PaymentMethod } from '@prisma/client';

export class QueryOptimizer {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  // Batch operations para products
  async batchCreateProducts(products: any[]) {
    return await this.prisma.product.createMany({
      data: products,
    });
  }

  async batchUpdateProducts(updates: { id: string; data: any }[]) {
    const results = await Promise.all(
      updates.map(({ id, data }) => 
        this.prisma.product.update({ where: { id }, data })
      )
    );
    return results;
  }

  // Optimized queries com índices compostos
  async getCompanyProducts(companyId: string, options?: {
    category?: string;
    lowStock?: boolean;
    page?: number;
    limit?: number;
  }) {
    const { category, lowStock, page = 1, limit = 50 } = options || {};
    
    const where = {
      company_id: companyId,
      ...(category && { category: { name: category } }),
      ...(lowStock && { quantity: { lte: this.prisma.product.fields.min_stock } }),
    };

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          category: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [
          { quantity: 'asc' },
          { name: 'asc' },
        ],
      }),
      this.prisma.product.count({ where }),
    ]);

    return { products, total, page, limit };
  }

  // Optimized sales queries
  async getCompanySales(companyId: string, options?: {
    startDate?: Date;
    endDate?: Date;
    employeeId?: string;
    paymentMethod?: string;
    page?: number;
    limit?: number;
  }) {
    const { 
      startDate, 
      endDate, 
      employeeId, 
      paymentMethod, 
      page = 1, 
      limit = 50 
    } = options || {};

    const where = {
      company_id: companyId,
      ...(startDate && endDate && {
        created_at: {
          gte: startDate,
          lte: endDate,
        },
      }),
      ...(employeeId && { employee_id: employeeId }),
      ...(paymentMethod && { payment_method: paymentMethod as PaymentMethod }),
    };

    const [sales, total] = await Promise.all([
      this.prisma.sale.findMany({
        where,
        include: {
          employee: {
            select: {
              id: true,
              full_name: true,
            },
          },
          sale_items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.sale.count({ where }),
    ]);

    return { sales, total, page, limit };
  }

  // Analytics queries otimizadas
  async getCompanyAnalytics(companyId: string, period?: 'day' | 'week' | 'month') {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    const [
      totalSales,
      totalRevenue,
      totalProfit,
      topProducts,
      salesByPayment,
      lowStockProducts,
    ] = await Promise.all([
      this.prisma.sale.count({
        where: {
          company_id: companyId,
          created_at: { gte: startDate },
        },
      }),
      this.prisma.sale.aggregate({
        where: {
          company_id: companyId,
          created_at: { gte: startDate },
        },
        _sum: { total: true },
      }),
      this.prisma.sale.aggregate({
        where: {
          company_id: companyId,
          created_at: { gte: startDate },
        },
        _sum: { total_profit: true },
      }),
      this.prisma.saleItem.groupBy({
        by: ['product_id'],
        where: {
          sale: {
            company_id: companyId,
            created_at: { gte: startDate },
          },
        },
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 10,
      }),
      this.prisma.sale.groupBy({
        by: ['payment_method'],
        where: {
          company_id: companyId,
          created_at: { gte: startDate },
        },
        _sum: { total: true },
        _count: true,
      }),
      this.prisma.product.findMany({
        where: {
          company_id: companyId,
          quantity: { lte: this.prisma.product.fields.min_stock },
        },
        take: 20,
        orderBy: { quantity: 'asc' },
      }),
    ]);

    return {
      period,
      totalSales,
      totalRevenue: totalRevenue._sum.total || 0,
      totalProfit: totalProfit._sum.total_profit || 0,
      topProducts,
      salesByPayment,
      lowStockProducts: lowStockProducts.length,
    };
  }

  // Efficient audit trail queries
  async getAuditLogs(options: {
    companyId?: string;
    userId?: string;
    action?: string;
    resource?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }) {
    const {
      companyId,
      userId,
      action,
      resource,
      startDate,
      endDate,
      page = 1,
      limit = 100,
    } = options;

    const where = {
      ...(companyId && { company_id: companyId }),
      ...(userId && { user_id: userId }),
      ...(action && { action }),
      ...(resource && { resource }),
      ...(startDate && endDate && {
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      }),
    };

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              full_name: true,
              email: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { timestamp: 'desc' },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { logs, total, page, limit };
  }

  // Stock optimization queries
  async getStockReport(companyId: string) {
    const [
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      totalValue,
      categories,
    ] = await Promise.all([
      this.prisma.product.count({
        where: { company_id: companyId },
      }),
      this.prisma.product.count({
        where: {
          company_id: companyId,
          quantity: { lte: this.prisma.product.fields.min_stock },
        },
      }),
      this.prisma.product.count({
        where: {
          company_id: companyId,
          quantity: 0,
        },
      }),
      this.prisma.product.aggregate({
        where: { company_id: companyId },
        _sum: { quantity: true },
      }),
      this.prisma.category.findMany({
        where: { company_id: companyId },
        include: {
          _count: {
            select: { products: true },
          },
        },
      }),
    ]);

    return {
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      totalStock: totalValue._sum.quantity || 0,
      categories,
    };
  }
}