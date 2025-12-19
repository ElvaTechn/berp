import { z } from 'zod';

// ================================================================
// VALIDATIONS v2.0.0 - ENTERPRISE GRADE
// ================================================================
// Atualizado para suportar schema Prisma v2.0.0
// - Decimal em vez de Float
// - Novos campos (is_active, expiry_date, etc)
// - Validações robustas para ERP
// ================================================================

// Enums para type safety
export enum Role {
  ADMIN = 'ADMIN',
  GESTOR = 'GESTOR',
  VENDEDOR = 'VENDEDOR'
}

export enum PaymentMethod {
  DINHEIRO = 'DINHEIRO',
  MPESA = 'MPESA',
  EMOLA = 'EMOLA',  // NEW: E-Mola (Moçambique)
  CARTAO = 'CARTAO',
  MULTICAIXA = 'MULTICAIXA',
  TRANSFERENCIA = 'TRANSFERENCIA'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  PARTIAL = 'PARTIAL',
  REFUNDED = 'REFUNDED'
}

export enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
  COMPLETED = 'COMPLETED'  // NEW
}

export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED'
}

export enum ReturnStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED'
}

export enum TaxRegime {
  NORMAL = 'NORMAL',
  SIMPLIFIED = 'SIMPLIFIED',
  EXEMPT = 'EXEMPT'
}

// ================================================================
// HELPER: Validação de Decimal como String
// ================================================================
// Prisma Decimal aceita strings, então validamos como string decimal

const decimalString = z.string()
  .regex(/^-?\d+(\.\d{1,2})?$/, 'Deve ser um número decimal válido (máx 2 casas)')
  .refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num >= 0;
  }, 'Valor deve ser positivo');

const decimalStringOptional = z.string()
  .regex(/^-?\d+(\.\d{1,2})?$/, 'Deve ser um número decimal válido (máx 2 casas)')
  .optional();

// ================================================================
// USER SCHEMA
// ================================================================

export const userSchema = z.object({
  id: z.string().cuid().optional(),
  full_name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome muito longo'),
  email: z.string()
    .email('Email inválido')
    .max(255, 'Email muito longo'),
  password: z.string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .max(255, 'Senha muito longa'),
  role: z.nativeEnum(Role, { message: 'Papel inválido' }),
  is_active: z.boolean().default(true),  // NEW
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

// ================================================================
// COMPANY SCHEMA
// ================================================================

export const companySchema = z.object({
  id: z.string().cuid().optional(),
  name: z.string()
    .min(2, 'Nome da empresa deve ter pelo menos 2 caracteres')
    .max(200, 'Nome muito longo'),
  nuit: z.string()
    .regex(/^[0-9]{9}$/, 'NUIT deve ter 9 dígitos')
    .optional()
    .nullable(),
  address: z.string().max(500, 'Endereço muito longo').optional().nullable(),
  phone: z.string()
    .regex(/^[0-9]{9,12}$/, 'Telefone inválido')
    .optional()
    .nullable(),
  email: z.string()
    .email('Email inválido')
    .max(255, 'Email muito longo')
    .optional()
    .nullable(),
  tax_regime: z.nativeEnum(TaxRegime).default(TaxRegime.NORMAL),  // NEW
  owner_id: z.string().cuid('ID do proprietário inválido'),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

// ================================================================
// EMPLOYEE SCHEMA
// ================================================================

export const employeeSchema = z.object({
  id: z.string().cuid().optional(),
  full_name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome muito longo'),
  email: z.string()
    .email('Email inválido')
    .max(255, 'Email muito longo'),
  role: z.nativeEnum(Role, { message: 'Papel inválido' }),
  is_active: z.boolean().default(true),  // NEW
  company_id: z.string().cuid('ID da empresa inválido'),
  user_id: z.string().cuid().optional().nullable(),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

// ================================================================
// CATEGORY SCHEMA
// ================================================================

export const categorySchema = z.object({
  id: z.string().cuid().optional(),
  name: z.string()
    .min(2, 'Nome da categoria deve ter pelo menos 2 caracteres')
    .max(100, 'Nome muito longo'),
  description: z.string().max(500, 'Descrição muito longa').optional().nullable(),
  color: z.string()
    .regex(/^#[0-9A-F]{6}$/i, 'Cor deve ser um hex válido')
    .default('#3b82f6'),
  is_active: z.boolean().default(true),  // NEW
  company_id: z.string().cuid('ID da empresa inválido'),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

// ================================================================
// PRODUCT SCHEMA (v2.0.0 - ENTERPRISE)
// ================================================================

export const productSchema = z.object({
  id: z.string().cuid().optional(),
  name: z.string()
    .min(2, 'Nome do produto deve ter pelo menos 2 caracteres')
    .max(200, 'Nome muito longo'),
  description: z.string().max(1000, 'Descrição muito longa').optional().nullable(),
  barcode: z.string().max(50, 'Código de barras muito longo').optional().nullable(),
  sku: z.string().max(50, 'SKU muito longo').optional().nullable(),  // NEW
  
  // FINANCIAL FIELDS - Decimal as String
  price: decimalString,
  cost_price: decimalStringOptional,
  
  // Stock Management
  quantity: z.number()
    .int('Quantidade deve ser inteira')
    .min(0, 'Quantidade deve ser positiva')
    .max(999999, 'Quantidade muito alta'),
  min_stock: z.number()
    .int('Estoque mínimo deve ser inteiro')
    .min(0, 'Estoque mínimo deve ser positivo')
    .max(999999, 'Estoque mínimo muito alto'),
  max_stock: z.number()
    .int('Estoque máximo deve ser inteiro')
    .min(0, 'Estoque máximo deve ser positivo')
    .optional()
    .nullable(),  // NEW
  
  // Product Lifecycle
  is_active: z.boolean().default(true),  // NEW
  expiry_date: z.string().datetime().optional().nullable(),  // NEW: ISO datetime string
  
  category_id: z.string().cuid('ID da categoria inválido'),
  company_id: z.string().cuid('ID da empresa inválido'),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

// ================================================================
// DISCOUNT SCHEMA (NEW)
// ================================================================

export const discountSchema = z.object({
  id: z.string().cuid().optional(),
  code: z.string()
    .min(3, 'Código deve ter pelo menos 3 caracteres')
    .max(50, 'Código muito longo')
    .regex(/^[A-Z0-9_]+$/, 'Código deve conter apenas letras maiúsculas, números e underscore'),
  description: z.string().max(500, 'Descrição muito longa').optional().nullable(),
  type: z.nativeEnum(DiscountType),
  value: decimalString,  // Percentage (10.00) or Fixed amount (100.00)
  is_active: z.boolean().default(true),
  starts_at: z.string().datetime().optional().nullable(),
  expires_at: z.string().datetime().optional().nullable(),
  max_uses: z.number().int().positive().optional().nullable(),
  current_uses: z.number().int().min(0).default(0),
  company_id: z.string().cuid('ID da empresa inválido'),
});

// ================================================================
// SALE ITEM SCHEMA (v2.0.0 - WITH SNAPSHOT)
// ================================================================

export const saleItemSchema = z.object({
  id: z.string().cuid().optional(),
  quantity: z.number()
    .int('Quantidade deve ser inteira')
    .min(1, 'Quantidade deve ser positiva')
    .max(999999, 'Quantidade muito alta'),
  
  // FINANCIAL SNAPSHOT (all Decimal)
  unit_price: decimalString,
  cost_price: decimalString,  // NEW: Snapshot
  subtotal: decimalString,    // NEW: unit_price × quantity
  profit: decimalString,      // NEW: (unit_price - cost_price) × quantity
  
  product_id: z.string().cuid('ID do produto inválido'),
  sale_id: z.string().cuid().optional(),
  created_at: z.date().optional(),
});

// ================================================================
// SALE SCHEMA (v2.0.0 - COMPLETE)
// ================================================================

export const saleSchema = z.object({
  id: z.string().cuid().optional(),
  
  // FINANCIAL FIELDS (all Decimal)
  subtotal: decimalString,           // NEW: Total before discount/tax
  discount_amount: decimalStringOptional,  // NEW: Total discount
  tax_amount: decimalStringOptional,       // NEW: IVA amount
  total: decimalString,
  total_profit: decimalStringOptional,
  
  payment_method: z.nativeEnum(PaymentMethod, { message: 'Método de pagamento inválido' }),
  payment_status: z.nativeEnum(PaymentStatus).default(PaymentStatus.PAID),  // NEW
  
  discount_id: z.string().cuid().optional().nullable(),  // NEW
  company_id: z.string().cuid('ID da empresa inválido'),
  employee_id: z.string().cuid('ID do funcionário inválido'),
  
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

// ================================================================
// RESERVATION SCHEMA (v2.0.0)
// ================================================================

export const reservationSchema = z.object({
  id: z.string().cuid().optional(),
  customer_name: z.string()
    .min(2, 'Nome do cliente deve ter pelo menos 2 caracteres')
    .max(100, 'Nome muito longo'),
  customer_bi: z.string()
    .regex(/^[0-9]{13}$/, 'BI deve ter 13 dígitos')
    .optional()
    .nullable(),
  customer_phone: z.string()
    .regex(/^[0-9]{9,12}$/, 'Telefone inválido')
    .optional()
    .nullable(),
  quantity: z.number()
    .int('Quantidade deve ser inteira')
    .min(1, 'Quantidade deve ser positiva')
    .max(999999, 'Quantidade muito alta'),
  status: z.nativeEnum(ReservationStatus).default(ReservationStatus.PENDING),
  notes: z.string().max(500, 'Notas muito longas').optional().nullable(),
  
  // NEW: Deposit
  deposit_amount: decimalStringOptional,
  deposit_paid: z.boolean().default(false),
  
  product_id: z.string().cuid('ID do produto inválido').optional().nullable(),
  company_id: z.string().cuid('ID da empresa inválido'),
  employee_id: z.string().cuid('ID do funcionário inválido'),
  
  expires_at: z.string().datetime(),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

// ================================================================
// RETURN SCHEMA (NEW)
// ================================================================

export const returnSchema = z.object({
  id: z.string().cuid().optional(),
  reason: z.string()
    .min(10, 'Motivo deve ter pelo menos 10 caracteres')
    .max(500, 'Motivo muito longo'),
  notes: z.string().max(1000, 'Notas muito longas').optional().nullable(),
  total_refund: decimalString,
  status: z.nativeEnum(ReturnStatus).default(ReturnStatus.PENDING),
  
  sale_id: z.string().cuid('ID da venda inválido'),
  company_id: z.string().cuid('ID da empresa inválido'),
  processed_by: z.string().cuid('ID do funcionário inválido'),
});

// ================================================================
// LOGIN SCHEMA
// ================================================================

export const loginSchema = z.object({
  email: z.string().email('Email inválido').max(255, 'Email muito longo'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

// ================================================================
// CREATE SALE SCHEMA (API Input)
// ================================================================

export const createSaleInputSchema = z.object({
  items: z.array(z.object({
    product_id: z.string().cuid('ID do produto inválido'),
    quantity: z.number()
      .int('Quantidade deve ser inteira')
      .min(1, 'Quantidade deve ser pelo menos 1')
      .max(999999, 'Quantidade muito alta'),
  }))
    .min(1, 'Venda deve ter pelo menos 1 item')
    .max(100, 'Máximo de 100 itens por venda'),
  
  payment_method: z.nativeEnum(PaymentMethod, { message: 'Método de pagamento inválido' }),
  discount_code: z.string()
    .min(3)
    .max(50)
    .regex(/^[A-Z0-9_]+$/)
    .optional(),  // NEW: Optional discount code
});

// ================================================================
// API RESPONSE SCHEMAS
// ================================================================

export const apiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

export const paginatedResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(z.any()),
  pagination: z.object({
    page: z.number().int().min(1),
    limit: z.number().int().min(1).max(100),
    total: z.number().int().min(0),
    totalPages: z.number().int().min(0),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
  }),
});

// ================================================================
// TYPES INFERRED
// ================================================================

export type User = z.infer<typeof userSchema>;
export type Company = z.infer<typeof companySchema>;
export type Employee = z.infer<typeof employeeSchema>;
export type Category = z.infer<typeof categorySchema>;
export type Product = z.infer<typeof productSchema>;
export type Discount = z.infer<typeof discountSchema>;
export type Sale = z.infer<typeof saleSchema>;
export type SaleItem = z.infer<typeof saleItemSchema>;
export type Reservation = z.infer<typeof reservationSchema>;
export type Return = z.infer<typeof returnSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateSaleInput = z.infer<typeof createSaleInputSchema>;

// ================================================================
// VALIDATION HELPERS
// ================================================================

export const validateInput = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  const result = schema.safeParse(data);
  if (!result.success) {
    const firstError = result.error.issues[0];
    throw new Error(firstError?.message || 'Dados inválidos');
  }
  return result.data;
};

export const validatePartial = <T extends z.ZodRawShape>(
  schema: z.ZodObject<T>, 
  data: unknown
) => {
  const partialSchema = schema.partial();
  const result = partialSchema.safeParse(data);
  if (!result.success) {
    const firstError = result.error.issues[0];
    throw new Error(firstError?.message || 'Dados inválidos');
  }
  return result.data as Partial<z.infer<z.ZodObject<T>>>;
};

export const validateArray = <T>(schema: z.ZodSchema<T>, data: unknown): T[] => {
  const arraySchema = z.array(schema);
  const result = arraySchema.safeParse(data);
  if (!result.success) {
    const firstError = result.error.issues[0];
    throw new Error(firstError?.message || 'Array inválido');
  }
  return result.data;
};

// ================================================================
// MIDDLEWARE VALIDATION HELPER
// ================================================================

export const createValidator = <T>(schema: z.ZodSchema<T>) => {
  return (data: unknown): { success: boolean; data?: T; error?: string } => {
    const result = schema.safeParse(data);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return { 
        success: false, 
        error: firstError?.message || 'Dados inválidos' 
      };
    }
    return { success: true, data: result.data };
  };
};

// ================================================================
// PRE-DEFINED VALIDATORS
// ================================================================

export const validateCreateSale = createValidator(createSaleInputSchema);
export const validateProduct = createValidator(productSchema);
export const validateCategory = createValidator(categorySchema);
export const validateEmployee = createValidator(employeeSchema);
export const validateCompany = createValidator(companySchema);
export const validateDiscount = createValidator(discountSchema);
export const validateReturn = createValidator(returnSchema);
