/**
 * DECIMAL HELPERS - BizControl 360 ERP
 * 
 * Utilitários para trabalhar com Prisma.Decimal (precisão financeira)
 * 
 * IMPORTANTE: Sempre use Decimal para valores monetários!
 * Float tem problemas de precisão (0.1 + 0.2 ≠ 0.3)
 */

import { Prisma } from '@prisma/client';

/**
 * Converte número ou string para Prisma.Decimal
 * 
 * @example
 * toDecimal(150.50)  // → Decimal(150.50)
 * toDecimal("99.99") // → Decimal(99.99)
 */
export function toDecimal(value: number | string | Prisma.Decimal): Prisma.Decimal {
  if (value instanceof Prisma.Decimal) {
    return value;
  }
  return new Prisma.Decimal(value);
}

/**
 * Converte Prisma.Decimal para número
 * 
 * ⚠️ ATENÇÃO: Use apenas para display, não para cálculos!
 * 
 * @example
 * const decimal = new Prisma.Decimal(150.50);
 * fromDecimal(decimal) // → 150.5
 */
export function fromDecimal(value: Prisma.Decimal): number {
  return value.toNumber();
}

/**
 * Formata Decimal como moeda de Moçambique (MT)
 * 
 * @example
 * formatCurrency(150.50)                    // → "150,50 MT"
 * formatCurrency(new Prisma.Decimal(99.99)) // → "99,99 MT"
 */
export function formatCurrency(value: Prisma.Decimal | number): string {
  const num = typeof value === 'number' ? value : value.toNumber();
  return new Intl.NumberFormat('pt-MZ', {
    style: 'currency',
    currency: 'MZN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
}

/**
 * Formata Decimal como string com 2 casas decimais
 * 
 * @example
 * formatDecimal(150.5)  // → "150.50"
 * formatDecimal(99)     // → "99.00"
 */
export function formatDecimal(value: Prisma.Decimal | number): string {
  const decimal = toDecimal(value);
  return decimal.toFixed(2);
}

/**
 * Calcula subtotal (preço unitário × quantidade)
 * 
 * @example
 * calculateSubtotal(100.50, 3) // → Decimal(301.50)
 */
export function calculateSubtotal(
  unitPrice: Prisma.Decimal | number,
  quantity: number
): Prisma.Decimal {
  const price = toDecimal(unitPrice);
  const qty = toDecimal(quantity);
  return price.mul(qty);
}

/**
 * Calcula lucro de um item
 * Lucro = (Preço de Venda - Preço de Custo) × Quantidade
 * 
 * @example
 * calculateProfit(150, 100, 5) // → Decimal(250.00)
 * // (150 - 100) × 5 = 250
 */
export function calculateProfit(
  unitPrice: Prisma.Decimal | number,
  costPrice: Prisma.Decimal | number,
  quantity: number
): Prisma.Decimal {
  const price = toDecimal(unitPrice);
  const cost = toDecimal(costPrice);
  const qty = toDecimal(quantity);
  
  return price.sub(cost).mul(qty);
}

/**
 * Aplica desconto ao subtotal
 * 
 * @param subtotal - Valor antes do desconto
 * @param discountType - 'PERCENTAGE' (%) ou 'FIXED' (valor fixo)
 * @param discountValue - Valor do desconto
 * 
 * @example
 * // Desconto de 10%
 * applyDiscount(1000, 'PERCENTAGE', 10) // → Decimal(100.00)
 * 
 * // Desconto fixo de 50 MT
 * applyDiscount(1000, 'FIXED', 50) // → Decimal(50.00)
 */
export function applyDiscount(
  subtotal: Prisma.Decimal | number,
  discountType: 'PERCENTAGE' | 'FIXED',
  discountValue: Prisma.Decimal | number
): Prisma.Decimal {
  const amount = toDecimal(subtotal);
  const value = toDecimal(discountValue);
  
  if (discountType === 'PERCENTAGE') {
    // Desconto percentual: subtotal × (value / 100)
    return amount.mul(value.div(100));
  } else {
    // Desconto fixo: retornar o valor direto
    // (mas garantir que não seja maior que o subtotal)
    return value.lessThanOrEqualTo(amount) ? value : amount;
  }
}

/**
 * Calcula total final de uma venda (sem impostos)
 * Total = Subtotal - Desconto
 * 
 * @example
 * calculateTotalWithoutTax({
 *   subtotal: 1000,
 *   discountAmount: 100
 * })
 * // → Decimal(900.00)
 */
export function calculateTotalWithoutTax(params: {
  subtotal: Prisma.Decimal | number;
  discountAmount?: Prisma.Decimal | number;
}): Prisma.Decimal {
  const subtotal = toDecimal(params.subtotal);
  const discount = toDecimal(params.discountAmount || 0);
  
  return subtotal.sub(discount);
}

/**
 * Calcula total final de uma venda (legado, mantida para compatibilidade)
 * @deprecated Use calculateTotalWithoutTax instead
 */
export function calculateTotal(params: {
  subtotal: Prisma.Decimal | number;
  discountAmount?: Prisma.Decimal | number;
  taxAmount?: Prisma.Decimal | number;
}): Prisma.Decimal {
  const subtotal = toDecimal(params.subtotal);
  const discount = toDecimal(params.discountAmount || 0);
  // Ignora taxAmount, pois o sistema não usa mais IVA
  
  return subtotal.sub(discount);
}

/**
 * Calcula margem de lucro percentual
 * Margem = ((Preço - Custo) / Preço) × 100
 * 
 * @example
 * calculateProfitMargin(150, 100) // → Decimal(33.33)
 * // ((150 - 100) / 150) × 100 = 33.33%
 */
export function calculateProfitMargin(
  price: Prisma.Decimal | number,
  cost: Prisma.Decimal | number
): Prisma.Decimal {
  const priceDecimal = toDecimal(price);
  const costDecimal = toDecimal(cost);
  
  if (priceDecimal.equals(0)) {
    return toDecimal(0);
  }
  
  return priceDecimal
    .sub(costDecimal)
    .div(priceDecimal)
    .mul(100);
}

/**
 * Calcula markup (percentual sobre o custo)
 * Markup = ((Preço - Custo) / Custo) × 100
 * 
 * @example
 * calculateMarkup(150, 100) // → Decimal(50.00)
 * // ((150 - 100) / 100) × 100 = 50%
 */
export function calculateMarkup(
  price: Prisma.Decimal | number,
  cost: Prisma.Decimal | number
): Prisma.Decimal {
  const priceDecimal = toDecimal(price);
  const costDecimal = toDecimal(cost);
  
  if (costDecimal.equals(0)) {
    return toDecimal(0);
  }
  
  return priceDecimal
    .sub(costDecimal)
    .div(costDecimal)
    .mul(100);
}

/**
 * Calcula preço com markup aplicado
 * Preço = Custo × (1 + Markup/100)
 * 
 * @example
 * calculatePriceFromMarkup(100, 50) // → Decimal(150.00)
 * // 100 × (1 + 50/100) = 150
 */
export function calculatePriceFromMarkup(
  cost: Prisma.Decimal | number,
  markupPercent: number
): Prisma.Decimal {
  const costDecimal = toDecimal(cost);
  const markup = toDecimal(markupPercent);
  
  return costDecimal.mul(toDecimal(1).add(markup.div(100)));
}

/**
 * Soma array de Decimals
 * 
 * @example
 * sumDecimals([100, 200.50, 50]) // → Decimal(350.50)
 */
export function sumDecimals(values: (Prisma.Decimal | number)[]): Prisma.Decimal {
  return values.reduce<Prisma.Decimal>(
    (sum, value) => sum.add(toDecimal(value)),
    toDecimal(0)
  );
}

/**
 * Calcula média de array de Decimals
 * 
 * @example
 * averageDecimals([100, 200, 150]) // → Decimal(150.00)
 */
export function averageDecimals(values: (Prisma.Decimal | number)[]): Prisma.Decimal {
  if (values.length === 0) {
    return toDecimal(0);
  }
  
  const sum = sumDecimals(values);
  return sum.div(values.length);
}

/**
 * Compara dois Decimals
 * 
 * @returns 
 * - Negativo se a < b
 * - Zero se a === b
 * - Positivo se a > b
 * 
 * @example
 * compareDecimals(100, 200)  // → -100
 * compareDecimals(200, 100)  // → 100
 * compareDecimals(100, 100)  // → 0
 */
export function compareDecimals(
  a: Prisma.Decimal | number,
  b: Prisma.Decimal | number
): number {
  const aDecimal = toDecimal(a);
  const bDecimal = toDecimal(b);
  
  return aDecimal.comparedTo(bDecimal);
}

/**
 * Verifica se valor está dentro de um range
 * 
 * @example
 * isInRange(150, 100, 200) // → true
 * isInRange(50, 100, 200)  // → false
 */
export function isInRange(
  value: Prisma.Decimal | number,
  min: Prisma.Decimal | number,
  max: Prisma.Decimal | number
): boolean {
  const valueDecimal = toDecimal(value);
  const minDecimal = toDecimal(min);
  const maxDecimal = toDecimal(max);
  
  return valueDecimal.greaterThanOrEqualTo(minDecimal) && 
         valueDecimal.lessThanOrEqualTo(maxDecimal);
}

/**
 * Arredonda Decimal para N casas decimais
 * 
 * @example
 * roundDecimal(150.556, 2)  // → Decimal(150.56)
 * roundDecimal(150.554, 2)  // → Decimal(150.55)
 */
export function roundDecimal(
  value: Prisma.Decimal | number,
  decimals: number = 2
): Prisma.Decimal {
  const decimal = toDecimal(value);
  return toDecimal(decimal.toFixed(decimals));
}

/**
 * Validar se string é um número decimal válido
 * 
 * @example
 * isValidDecimal("150.50")   // → true
 * isValidDecimal("abc")      // → false
 * isValidDecimal("-10.5")    // → true
 */
export function isValidDecimal(value: string): boolean {
  try {
    new Prisma.Decimal(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Parse string para Decimal com fallback
 * 
 * @example
 * parseDecimal("150.50")        // → Decimal(150.50)
 * parseDecimal("abc", 0)        // → Decimal(0)
 * parseDecimal("invalid", 100)  // → Decimal(100)
 */
export function parseDecimal(
  value: string,
  fallback: number = 0
): Prisma.Decimal {
  try {
    return new Prisma.Decimal(value);
  } catch {
    return toDecimal(fallback);
  }
}
