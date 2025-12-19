# 🚀 **GUIA DE MIGRAÇÃO - SCHEMA 2.0.0**

**BizControl 360 ERP - Database Migration Guide**

---

## ⚠️ **AVISOS IMPORTANTES**

🚨 **ESTA MIGRATION É DESTRUTIVA EM ALGUNS ASPECTOS**

- ❌ Mudança de Float → Decimal requer conversão de dados
- ❌ Novos campos obrigatórios podem causar erros
- ❌ Índices novos demoram tempo para criar (grandes volumes)

✅ **SEMPRE FAÇA BACKUP ANTES**

---

## 📋 **PRÉ-REQUISITOS**

### **1. Backup do Banco de Dados**

```bash
# SQLite (Dev)
cp prisma/dev.db prisma/dev.db.backup

# PostgreSQL (Prod)
pg_dump bizcontrol360 > backup_$(date +%Y%m%d_%H%M%S).sql
```

### **2. Validar Dados Existentes**

Crie e execute este script: `scripts/validate_data.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function validateData() {
  console.log('🔍 Validando dados antes da migration...\n');

  // 1. Produtos com preços negativos
  const negativeprices = await prisma.product.count({
    where: {
      OR: [
        { price: { lt: 0 } },
        { cost_price: { lt: 0 } }
      ]
    }
  });

  if (negativePrices > 0) {
    console.error(`❌ ${negativePrices} produtos com preços negativos`);
    console.log('   Corrija antes de migrar!');
  } else {
    console.log('✅ Preços de produtos válidos');
  }

  // 2. Vendas sem employee_id
  const orphanSales = await prisma.sale.count({
    where: { employee_id: null }
  });

  if (orphanSales > 0) {
    console.error(`❌ ${orphanSales} vendas sem funcionário`);
    console.log('   Atribua a um funcionário antes de migrar!');
  } else {
    console.log('✅ Todas as vendas têm funcionário');
  }

  // 3. Produtos sem categoria
  const orphanProducts = await prisma.product.count({
    where: { category_id: null }
  });

  if (orphanProducts > 0) {
    console.error(`❌ ${orphanProducts} produtos sem categoria`);
  } else {
    console.log('✅ Todos os produtos têm categoria');
  }

  // 4. SaleItems com preços zerados
  const zeroprices = await prisma.$queryRaw`
    SELECT COUNT(*) as count FROM sale_items WHERE unit_price = 0
  `;

  const zeroPriceCount = zeroprices[0].count;
  if (zeroPriceCount > 0) {
    console.warn(`⚠️  ${zeroPriceCount} itens de venda com preço zero`);
  } else {
    console.log('✅ Todos os itens têm preço');
  }

  console.log('\n✅ Validação completa!');
}

validateData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Execute:
```bash
npx ts-node scripts/validate_data.ts
```

---

## 🔄 **PASSOS DA MIGRATION**

### **Passo 1: Atualizar Schema**

O novo schema já está em `prisma/schema.prisma`. Revise as mudanças:

```bash
# Ver diferenças
git diff prisma/schema.prisma
```

### **Passo 2: Gerar Cliente Prisma**

```bash
npx prisma generate
```

Isso atualiza os tipos TypeScript.

### **Passo 3: Criar Migration**

```bash
# Dev (SQLite)
npx prisma migrate dev --name enterprise_refactor_v2

# Produção (PostgreSQL)
npx prisma migrate deploy
```

**Tempo estimado**:
- Pequeno (< 10k registros): 1-2 minutos
- Médio (10k-100k): 5-10 minutos
- Grande (> 100k): 15-30 minutos

### **Passo 4: Preencher Novos Campos**

Alguns campos novos precisam de valores iniciais:

```typescript
// scripts/fill_new_fields.ts
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

async function fillNewFields() {
  console.log('📝 Preenchendo novos campos...\n');

  // 1. Adicionar cost_price em SaleItems existentes
  console.log('1. Adicionando cost_price em SaleItems...');
  
  const saleItems = await prisma.saleItem.findMany({
    include: { product: true }
  });

  for (const item of saleItems) {
    // Usar o cost_price atual do produto como snapshot
    const costPrice = item.product.cost_price || 0;
    const profit = (item.unit_price - costPrice) * item.quantity;
    const subtotal = item.unit_price * item.quantity;

    await prisma.saleItem.update({
      where: { id: item.id },
      data: {
        cost_price: new Prisma.Decimal(costPrice),
        subtotal: new Prisma.Decimal(subtotal),
        profit: new Prisma.Decimal(profit)
      }
    });
  }

  console.log(`✅ ${saleItems.length} SaleItems atualizados`);

  // 2. Adicionar is_active em Users
  console.log('\n2. Ativando todos os usuários existentes...');
  
  await prisma.user.updateMany({
    data: { is_active: true }
  });

  console.log('✅ Usuários ativados');

  // 3. Adicionar is_active em Products
  console.log('\n3. Ativando todos os produtos existentes...');
  
  await prisma.product.updateMany({
    data: { is_active: true }
  });

  console.log('✅ Produtos ativados');

  // 4. Adicionar subtotal em Sales
  console.log('\n4. Calculando subtotal em Sales...');
  
  const sales = await prisma.sale.findMany({
    include: { sale_items: true }
  });

  for (const sale of sales) {
    const subtotal = sale.sale_items.reduce((sum, item) => 
      sum + (item.unit_price * item.quantity), 0
    );

    await prisma.sale.update({
      where: { id: sale.id },
      data: {
        subtotal: new Prisma.Decimal(subtotal),
        discount_amount: new Prisma.Decimal(0),
        tax_amount: new Prisma.Decimal(0)
      }
    });
  }

  console.log(`✅ ${sales.length} Sales atualizadas`);

  console.log('\n✅ Preenchimento completo!');
}

fillNewFields()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Execute:
```bash
npx ts-node scripts/fill_new_fields.ts
```

---

## 🔧 **MUDANÇAS NO CÓDIGO DA APLICAÇÃO**

### **1. Float → Decimal**

#### **ANTES:**
```typescript
// ❌ NÃO FUNCIONA MAIS
const product = await prisma.product.create({
  data: {
    name: "Produto X",
    price: 150.50,  // Float
    cost_price: 100.00
  }
});
```

#### **DEPOIS:**
```typescript
// ✅ CORRETO
import { Prisma } from '@prisma/client';

const product = await prisma.product.create({
  data: {
    name: "Produto X",
    price: new Prisma.Decimal(150.50),
    cost_price: new Prisma.Decimal(100.00)
  }
});
```

### **2. Cálculos Financeiros**

#### **ANTES:**
```typescript
// ❌ Cálculo com Float (impreciso)
const total = product.price * quantity;
const profit = (product.price - product.cost_price) * quantity;
```

#### **DEPOIS:**
```typescript
// ✅ Cálculo com Decimal (preciso)
const price = new Prisma.Decimal(product.price);
const costPrice = new Prisma.Decimal(product.cost_price);
const qty = new Prisma.Decimal(quantity);

const total = price.mul(qty);
const profit = price.sub(costPrice).mul(qty);
```

### **3. Helper Functions**

Crie: `src/lib/decimal-helpers.ts`

```typescript
import { Prisma } from '@prisma/client';

/**
 * Converte número para Decimal
 */
export function toDecimal(value: number | string): Prisma.Decimal {
  return new Prisma.Decimal(value);
}

/**
 * Converte Decimal para número
 */
export function fromDecimal(value: Prisma.Decimal): number {
  return value.toNumber();
}

/**
 * Formata Decimal como moeda (MT)
 */
export function formatCurrency(value: Prisma.Decimal | number): string {
  const num = typeof value === 'number' ? value : value.toNumber();
  return new Intl.NumberFormat('pt-MZ', {
    style: 'currency',
    currency: 'MZN'
  }).format(num);
}

/**
 * Calcula subtotal de venda
 */
export function calculateSubtotal(
  unitPrice: Prisma.Decimal,
  quantity: number
): Prisma.Decimal {
  return unitPrice.mul(quantity);
}

/**
 * Calcula lucro
 */
export function calculateProfit(
  unitPrice: Prisma.Decimal,
  costPrice: Prisma.Decimal,
  quantity: number
): Prisma.Decimal {
  return unitPrice.sub(costPrice).mul(quantity);
}

/**
 * Calcula IVA (17% em Moçambique)
 */
export function calculateTax(
  subtotal: Prisma.Decimal,
  taxRate: number = 0.17
): Prisma.Decimal {
  return subtotal.mul(taxRate);
}

/**
 * Aplica desconto
 */
export function applyDiscount(
  subtotal: Prisma.Decimal,
  discountType: 'PERCENTAGE' | 'FIXED',
  discountValue: Prisma.Decimal
): Prisma.Decimal {
  if (discountType === 'PERCENTAGE') {
    // Desconto percentual: subtotal * (value / 100)
    return subtotal.mul(discountValue.div(100));
  } else {
    // Desconto fixo
    return discountValue;
  }
}
```

### **4. Exemplo de Criação de Venda**

```typescript
import { Prisma } from '@prisma/client';
import { toDecimal, calculateSubtotal, calculateProfit, calculateTax, applyDiscount } from '@/lib/decimal-helpers';

async function createSale(data: {
  items: { productId: string; quantity: number }[];
  employeeId: string;
  companyId: string;
  paymentMethod: PaymentMethod;
  discountCode?: string;
}) {
  // 1. Buscar produtos
  const products = await prisma.product.findMany({
    where: { id: { in: data.items.map(i => i.productId) } }
  });

  // 2. Calcular subtotal
  let subtotal = toDecimal(0);
  const saleItems = [];

  for (const item of data.items) {
    const product = products.find(p => p.id === item.productId)!;
    const unitPrice = toDecimal(product.price);
    const costPrice = toDecimal(product.cost_price || 0);
    const qty = item.quantity;

    const itemSubtotal = calculateSubtotal(unitPrice, qty);
    const itemProfit = calculateProfit(unitPrice, costPrice, qty);

    subtotal = subtotal.add(itemSubtotal);

    saleItems.push({
      product_id: product.id,
      quantity: qty,
      unit_price: unitPrice,
      cost_price: costPrice,
      subtotal: itemSubtotal,
      profit: itemProfit
    });
  }

  // 3. Aplicar desconto (se houver)
  let discountAmount = toDecimal(0);
  let discountId = null;

  if (data.discountCode) {
    const discount = await prisma.discount.findFirst({
      where: {
        code: data.discountCode,
        company_id: data.companyId,
        is_active: true,
        OR: [
          { expires_at: null },
          { expires_at: { gte: new Date() } }
        ]
      }
    });

    if (discount) {
      discountAmount = applyDiscount(
        subtotal,
        discount.type,
        toDecimal(discount.value)
      );
      discountId = discount.id;

      // Incrementar uso
      await prisma.discount.update({
        where: { id: discount.id },
        data: { current_uses: { increment: 1 } }
      });
    }
  }

  // 4. Calcular IVA
  const taxAmount = calculateTax(subtotal.sub(discountAmount));

  // 5. Total final
  const total = subtotal.sub(discountAmount).add(taxAmount);

  // 6. Calcular lucro total
  const totalProfit = saleItems.reduce(
    (sum, item) => sum.add(item.profit),
    toDecimal(0)
  );

  // 7. Criar venda (transação atômica)
  const sale = await prisma.$transaction(async (tx) => {
    // Criar Sale
    const newSale = await tx.sale.create({
      data: {
        subtotal,
        discount_amount: discountAmount,
        tax_amount: taxAmount,
        total,
        total_profit: totalProfit,
        payment_method: data.paymentMethod,
        payment_status: 'PAID',
        discount_id: discountId,
        company_id: data.companyId,
        employee_id: data.employeeId
      }
    });

    // Criar SaleItems
    for (const item of saleItems) {
      await tx.saleItem.create({
        data: {
          ...item,
          sale_id: newSale.id
        }
      });

      // Atualizar stock
      await tx.product.update({
        where: { id: item.product_id },
        data: { quantity: { decrement: item.quantity } }
      });
    }

    return newSale;
  });

  return sale;
}
```

---

## 📊 **VERIFICAÇÕES PÓS-MIGRATION**

### **1. Testar Queries Críticas**

```typescript
// scripts/test_queries.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testQueries() {
  console.log('🧪 Testando queries...\n');

  // 1. Produtos ativos por empresa
  const products = await prisma.product.findMany({
    where: {
      company_id: 'test_company_id',
      is_active: true
    }
  });
  console.log(`✅ ${products.length} produtos ativos encontrados`);

  // 2. Vendas do mês
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const sales = await prisma.sale.findMany({
    where: {
      company_id: 'test_company_id',
      created_at: { gte: startOfMonth }
    },
    include: { sale_items: true }
  });
  console.log(`✅ ${sales.length} vendas do mês encontradas`);

  // 3. Produtos expirando (próximos 30 dias)
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const expiring = await prisma.product.findMany({
    where: {
      company_id: 'test_company_id',
      is_active: true,
      expiry_date: {
        gte: new Date(),
        lte: thirtyDaysFromNow
      }
    }
  });
  console.log(`⚠️  ${expiring.length} produtos expirando em 30 dias`);

  // 4. Descontos ativos
  const discounts = await prisma.discount.findMany({
    where: {
      company_id: 'test_company_id',
      is_active: true,
      OR: [
        { expires_at: null },
        { expires_at: { gte: new Date() } }
      ]
    }
  });
  console.log(`✅ ${discounts.length} descontos ativos`);

  console.log('\n✅ Todos os testes passaram!');
}

testQueries()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

### **2. Monitorar Performance**

```bash
# PostgreSQL - Ver queries lentas
SELECT query, calls, total_time, mean_time 
FROM pg_stat_statements 
WHERE query LIKE '%products%'
ORDER BY mean_time DESC 
LIMIT 10;
```

---

## 🚨 **ROLLBACK (SE NECESSÁRIO)**

Se algo der errado:

```bash
# 1. Restaurar backup
# SQLite
rm prisma/dev.db
cp prisma/dev.db.backup prisma/dev.db

# PostgreSQL
psql -d bizcontrol360 < backup_YYYYMMDD_HHMMSS.sql

# 2. Reverter código
git revert HEAD
git push

# 3. Reverter schema
git checkout HEAD~1 prisma/schema.prisma
npx prisma generate
```

---

## ✅ **CHECKLIST FINAL**

- [ ] Backup do banco de dados criado
- [ ] Dados validados (sem erros)
- [ ] Migration executada com sucesso
- [ ] Novos campos preenchidos
- [ ] Código atualizado (Float → Decimal)
- [ ] Testes de queries executados
- [ ] Performance monitorada
- [ ] Documentação atualizada
- [ ] Equipe treinada nas mudanças

---

## 📞 **SUPORTE**

Em caso de problemas durante a migration:

1. **Não entre em pânico** - Você tem backup ✅
2. **Documente o erro** - Capture logs completos
3. **Reverta se necessário** - Siga o processo de rollback
4. **Consulte a documentação** - `DATABASE_AUDIT_REPORT_2025.md`

---

**Boa sorte com a migration! 🚀**
