/**
 * ================================================================
 * SALE SERVICE - BIZCONTROL 360 ERP v2.0.0
 * ================================================================
 * O "Cérebro" do Sistema de Vendas - Enterprise Grade
 * 
 * RESPONSABILIDADES:
 * - Validação de Stock (Quantidade suficiente)
 * - Validação de Produtos (Ativos, Não expirados)
 * - Cálculo Financeiro com Precisão Decimal
 * - Aplicação de Descontos
 * - Snapshot Financeiro Imutável
 * - Transação Atômica (Tudo ou Nada)
 * - Atualização de Stock
 * - Auditoria Completa
 * 
 * AUTOR: Data Engineering Team
 * DATA: 18 Dezembro 2025
 * ================================================================
 */

import "server-only";
import { Prisma, PaymentMethod, PaymentStatus } from '@prisma/client';
import prisma from '@/lib/prisma';
import { 
  toDecimal, 
  calculateSubtotal, 
  calculateProfit,
  applyDiscount,
  calculateTotalWithoutTax,
  sumDecimals,
  formatCurrency
} from '@/lib/decimal-helpers';
import { logger } from '@/lib/logger';

// ================================================================
// TYPES
// ================================================================

export interface CreateSaleInput {
  items: {
    product_id: string;
    quantity: number;
  }[];
  payment_method: PaymentMethod;
  discount_code?: string;
  company_id: string;
  employee_id: string;
}

export interface SaleResult {
  sale_id: string;
  subtotal: string;
  discount_amount: string;
  total: string;
  total_profit: string;
  items_count: number;
  payment_method: PaymentMethod;
  created_at: Date;
}

export interface StockValidationError {
  product_id: string;
  product_name: string;
  available: number;
  requested: number;
}

// ================================================================
// SALE SERVICE CLASS
// ================================================================

export class SaleService {
  /**
   * Cria uma venda com transação atômica
   * 
   * @param input - Dados da venda
   * @returns Resultado da venda criada
   * @throws Error se validações falharem
   */
  static async createSale(input: CreateSaleInput): Promise<SaleResult> {
    logger.info('Creating sale', {
      company_id: input.company_id,
      employee_id: input.employee_id,
      items_count: input.items.length
    });

    // ============================================================
    // TRANSAÇÃO ATÔMICA: Tudo ou Nada
    // ============================================================
    const result = await prisma.$transaction(
      async (tx) => {
        // 1. Buscar informações da empresa
        const company = await tx.company.findUnique({
          where: { id: input.company_id },
          select: { 
            id: true, 
            subscription_status: true 
          }
        });

        if (!company) {
          throw new Error('Empresa não encontrada');
        }

        // Verificar se empresa está ativa
        if (company.subscription_status === 'EXPIRED' || company.subscription_status === 'CANCELLED') {
          throw new Error('Empresa com assinatura inativa. Renove para continuar vendendo.');
        }

        // 2. Validar e buscar produtos
        const validatedItems = await this.validateAndFetchProducts(
          tx,
          input.items,
          input.company_id
        );

        // 3. Calcular subtotal (antes de descontos e impostos)
        const subtotal = sumDecimals(
          validatedItems.map(item => item.subtotal)
        );

        logger.info('Subtotal calculated', { 
          subtotal: subtotal.toString(),
          items: validatedItems.length 
        });

        // 4. Aplicar desconto (se houver)
        let discountAmount = toDecimal(0);
        let discountId: string | null = null;

        if (input.discount_code) {
          const discountResult = await this.applyDiscountCode(
            tx,
            input.discount_code,
            subtotal,
            input.company_id
          );

          discountAmount = discountResult.amount;
          discountId = discountResult.discount_id;

          logger.info('Discount applied', {
            code: input.discount_code,
            amount: discountAmount.toString()
          });
        }

        // 5. Calcular total final (subtotal - desconto)
        const total = calculateTotalWithoutTax({
          subtotal,
          discountAmount
        });

        // 7. Calcular lucro total
        const totalProfit = sumDecimals(
          validatedItems.map(item => item.profit)
        );

        logger.info('Sale totals calculated', {
          subtotal: subtotal.toString(),
          discount: discountAmount.toString(),
          total: total.toString(),
          profit: totalProfit.toString()
        });

        // 8. Criar a venda
        const sale = await tx.sale.create({
          data: {
            subtotal,
            discount_amount: discountAmount,
            total,
            total_profit: totalProfit,
            payment_method: input.payment_method,
            payment_status: PaymentStatus.PAID,
            discount_id: discountId,
            company_id: input.company_id,
            employee_id: input.employee_id,
          }
        });

        logger.info('Sale created', { sale_id: sale.id });

        // 9. Criar itens da venda (com snapshot)
        await this.createSaleItems(tx, sale.id, validatedItems);

        // 10. Atualizar stock dos produtos
        await this.updateProductStock(tx, validatedItems);

        // 11. Se desconto foi usado, incrementar uso
        if (discountId) {
          await tx.discount.update({
            where: { id: discountId },
            data: { current_uses: { increment: 1 } }
          });
        }

        logger.info('Sale completed successfully', {
          sale_id: sale.id,
          total: total.toString()
        });

        return {
          sale_id: sale.id,
          subtotal: subtotal.toString(),
          discount_amount: discountAmount.toString(),
          total: total.toString(),
          total_profit: totalProfit.toString(),
          items_count: validatedItems.length,
          payment_method: sale.payment_method,
          created_at: sale.created_at
        };
      },
      {
        timeout: 15000, // 15 segundos
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable
      }
    );

    return result;
  }

  // ================================================================
  // PRIVATE METHODS
  // ================================================================

  /**
   * Valida e busca produtos com todas as verificações
   */
  private static async validateAndFetchProducts(
    tx: Prisma.TransactionClient,
    items: { product_id: string; quantity: number }[],
    companyId: string
  ) {
    const validatedItems = [];
    const stockErrors: StockValidationError[] = [];

    for (const item of items) {
      // Buscar produto com todos os campos necessários
      const product = await tx.product.findFirst({
        where: {
          id: item.product_id,
          company_id: companyId
        },
        select: {
          id: true,
          name: true,
          price: true,
          cost_price: true,
          quantity: true,
          is_active: true,
          expiry_date: true
        }
      });

      // Validação 1: Produto existe?
      if (!product) {
        throw new Error(`Produto não encontrado: ${item.product_id}`);
      }

      // Validação 2: Produto está ativo? (Soft Delete)
      if (!product.is_active) {
        throw new Error(
          `Produto "${product.name}" está desativado e não pode ser vendido`
        );
      }

      // Validação 3: Produto expirado?
      if (product.expiry_date) {
        const expiryDate = new Date(product.expiry_date);
        const now = new Date();

        if (expiryDate <= now) {
          throw new Error(
            `Produto "${product.name}" está vencido (validade: ${expiryDate.toLocaleDateString('pt-MZ')})`
          );
        }
      }

      // Validação 4: Stock suficiente?
      if (product.quantity < item.quantity) {
        stockErrors.push({
          product_id: product.id,
          product_name: product.name,
          available: product.quantity,
          requested: item.quantity
        });
        continue; // Acumula todos os erros de stock
      }

      // Converter para Decimal
      const unitPrice = toDecimal(product.price);
      const costPrice = toDecimal(product.cost_price || 0);
      const qty = item.quantity;

      // Calcular valores do item
      const itemSubtotal = calculateSubtotal(unitPrice, qty);
      const itemProfit = calculateProfit(unitPrice, costPrice, qty);

      validatedItems.push({
        product_id: product.id,
        product_name: product.name,
        quantity: qty,
        unit_price: unitPrice,
        cost_price: costPrice,
        subtotal: itemSubtotal,
        profit: itemProfit
      });
    }

    // Se houver erros de stock, lançar exceção detalhada
    if (stockErrors.length > 0) {
      const errorMessages = stockErrors.map(
        err => `• ${err.product_name}: Disponível ${err.available}, Solicitado ${err.requested}`
      ).join('\n');

      throw new Error(`Stock insuficiente:\n${errorMessages}`);
    }

    return validatedItems;
  }

  /**
   * Aplica código de desconto
   */
  private static async applyDiscountCode(
    tx: Prisma.TransactionClient,
    code: string,
    subtotal: Prisma.Decimal,
    companyId: string
  ) {
    const now = new Date();

    // Buscar desconto válido
    const discount = await tx.discount.findFirst({
      where: {
        code: code.toUpperCase(),
        company_id: companyId,
        is_active: true,
        OR: [
          { starts_at: null },
          { starts_at: { lte: now } }
        ],
        AND: [
          {
            OR: [
              { expires_at: null },
              { expires_at: { gte: now } }
            ]
          }
        ]
      }
    });

    if (!discount) {
      throw new Error(`Código de desconto "${code}" inválido ou expirado`);
    }

    // Verificar limite de usos
    if (discount.max_uses !== null && discount.current_uses >= discount.max_uses) {
      throw new Error(`Código de desconto "${code}" atingiu o limite de usos`);
    }

    // Calcular desconto
    const discountValue = toDecimal(discount.value);
    const discountAmount = applyDiscount(subtotal, discount.type, discountValue);

    logger.info('Discount code validated', {
      code: discount.code,
      type: discount.type,
      value: discountValue.toString(),
      amount: discountAmount.toString()
    });

    return {
      discount_id: discount.id,
      amount: discountAmount
    };
  }

  /**
   * Cria os itens da venda (snapshot completo)
   */
  private static async createSaleItems(
    tx: Prisma.TransactionClient,
    saleId: string,
    items: Array<{
      product_id: string;
      quantity: number;
      unit_price: Prisma.Decimal;
      cost_price: Prisma.Decimal;
      subtotal: Prisma.Decimal;
      profit: Prisma.Decimal;
    }>
  ) {
    for (const item of items) {
      await tx.saleItem.create({
        data: {
          sale_id: saleId,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          cost_price: item.cost_price,  // Snapshot!
          subtotal: item.subtotal,
          profit: item.profit
        }
      });
    }

    logger.info('Sale items created', { 
      sale_id: saleId,
      count: items.length 
    });
  }

  /**
   * Atualiza stock dos produtos
   */
  private static async updateProductStock(
    tx: Prisma.TransactionClient,
    items: Array<{
      product_id: string;
      quantity: number;
      product_name: string;
    }>
  ) {
    for (const item of items) {
      await tx.product.update({
        where: { id: item.product_id },
        data: {
          quantity: { decrement: item.quantity }
        }
      });

      logger.info('Product stock updated', {
        product_id: item.product_id,
        product_name: item.product_name,
        decremented: item.quantity
      });
    }
  }

  // ================================================================
  // HELPER: Format Sale Result for API
  // ================================================================

  static formatSaleForAPI(result: SaleResult) {
    return {
      id: result.sale_id,
      subtotal: formatCurrency(toDecimal(result.subtotal)),
      discount_amount: formatCurrency(toDecimal(result.discount_amount)),
      total: formatCurrency(toDecimal(result.total)),
      total_profit: formatCurrency(toDecimal(result.total_profit)),
      items_count: result.items_count,
      payment_method: result.payment_method,
      created_at: result.created_at.toISOString()
    };
  }
}
