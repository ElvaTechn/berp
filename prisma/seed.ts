import { PrismaClient, Prisma, Role, PaymentMethod } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ============================================
// 🏢 SEED ENTERPRISE PARA BIZ360
// ============================================
// Dados realistas de Moçambique para demonstração profissional
// - 1 Empresa: NEXUS COMERCIAL LDA
// - 4 Categorias com cores vibrantes
// - 20 Produtos reais moçambicanos
// - 30 Vendas históricas (últimos 7 dias)
// - 2 Usuários: Gestor e Vendedor
// ============================================

async function main() {
  console.log('🚀 Iniciando Seed Enterprise BIZ360...\n');

  // ============================================
  // 1️⃣ CRIAR USUÁRIOS
  // ============================================
  console.log('👤 Criando usuários...');
  
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  const gestorPassword = await bcrypt.hash('Gestor123!', 12);
  const vendedorPassword = await bcrypt.hash('Venda123!', 12);

  // Super Admin (acesso total ao sistema)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@bizcontrol.co.mz' },
    update: {},
    create: {
      email: 'admin@bizcontrol.co.mz',
      full_name: 'Administrador Sistema',
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  // Gestor da empresa
  const gestor = await prisma.user.upsert({
    where: { email: 'gestor@bizcontrol.co.mz' },
    update: {},
    create: {
      email: 'gestor@bizcontrol.co.mz',
      full_name: 'João Machado',
      password: gestorPassword,
      role: Role.GESTOR,
    },
  });

  const vendedor = await prisma.user.upsert({
    where: { email: 'vendedor@bizcontrol.co.mz' },
    update: {},
    create: {
      email: 'vendedor@bizcontrol.co.mz',
      full_name: 'Maria Santos',
      password: vendedorPassword,
      role: Role.VENDEDOR,
    },
  });

  console.log('✅ Usuários criados: Admin, Gestor e Vendedor\n');

  // ============================================
  // 2️⃣ CRIAR EMPRESA
  // ============================================
  console.log('🏢 Criando empresa...');

  const company = await prisma.company.upsert({
    where: { nuit: '123456789' },
    update: {},
    create: {
      name: 'NEXUS COMERCIAL LDA',
      nuit: '123456789',
      address: 'Av. Julius Nyerere, 1234, Maputo',
      phone: '+258 84 123 4567',
      email: 'contacto@nexus.co.mz',
      owner_id: gestor.id,
      tax_regime: 'NORMAL',
    },
  });

  console.log('✅ Empresa criada: NEXUS COMERCIAL LDA\n');

  // ============================================
  // 3️⃣ CRIAR FUNCIONÁRIOS
  // ============================================
  console.log('👥 Criando funcionários...');

  // Admin employee - vinculado à empresa para poder acessar dashboard
  const existingAdmin = await prisma.employee.findFirst({
    where: {
      company_id: company.id,
      email: 'admin@bizcontrol.co.mz',
    },
  });

  if (!existingAdmin) {
    await prisma.employee.create({
      data: {
        full_name: 'Administrador Sistema',
        email: 'admin@bizcontrol.co.mz',
        role: Role.ADMIN,
        company_id: company.id,
        user_id: admin.id,
      },
    });
  }

  // Buscar por combinação única de company_id e email
  const existingGestor = await prisma.employee.findFirst({
    where: {
      company_id: company.id,
      email: 'gestor@bizcontrol.co.mz',
    },
  });

  if (!existingGestor) {
    await prisma.employee.create({
      data: {
        full_name: 'João Machado',
        email: 'gestor@bizcontrol.co.mz',
        role: Role.GESTOR,
        company_id: company.id,
        user_id: gestor.id,
      },
    });
  }

  const existingVendedor = await prisma.employee.findFirst({
    where: {
      company_id: company.id,
      email: 'vendedor@bizcontrol.co.mz',
    },
  });

  if (!existingVendedor) {
    await prisma.employee.create({
      data: {
        full_name: 'Maria Santos',
        email: 'vendedor@bizcontrol.co.mz',
        role: Role.VENDEDOR,
        company_id: company.id,
        user_id: vendedor.id,
      },
    });
  }

  // Pegar os funcionários criados
  const gestorEmployee = await prisma.employee.findFirst({
    where: {
      company_id: company.id,
      email: 'gestor@bizcontrol.co.mz',
    },
  });

  const vendedorEmployee = await prisma.employee.findFirst({
    where: {
      company_id: company.id,
      email: 'vendedor@bizcontrol.co.mz',
    },
  });

  console.log('✅ Funcionários criados\n');

  // ============================================
  // 4️⃣ CRIAR CATEGORIAS
  // ============================================
  console.log('📂 Criando categorias...');

  const categories = await seedCategories(company.id);
  console.log('✅ 4 Categorias criadas\n');

  // ============================================
  // 5️⃣ CRIAR PRODUTOS
  // ============================================
  console.log('📦 Criando produtos moçambicanos...');

  const products = await seedProducts(company.id, categories);
  console.log(`✅ ${products.length} Produtos criados\n`);

  // ============================================
  // 6️⃣ GERAR VENDAS HISTÓRICAS
  // ============================================
  console.log('🛒 Gerando vendas históricas (últimos 7 dias)...');

  if (vendedorEmployee) {
    await seedSales(company.id, vendedorEmployee.id, products);
    console.log('✅ 30 Vendas geradas\n');
  } else {
    console.log('⚠️ Vendedor não encontrado, pulando vendas\n');
  }

  // ============================================
  // 🎉 FINALIZADO
  // ============================================
  console.log('═══════════════════════════════════════════');
  console.log('✨ SEED ENTERPRISE FINALIZADO COM SUCESSO!');
  console.log('═══════════════════════════════════════════\n');
  console.log('🔑 CREDENCIAIS DE ACESSO:');
  console.log('───────────────────────────────────────────');
  console.log('🔐 ADMIN (Super Administrador):');
  console.log('   Email:    admin@bizcontrol.co.mz');
  console.log('   Senha:    Admin123!');
  console.log('   Acesso:   Dashboard completo da empresa');
  console.log('');
  console.log('👨‍💼 GESTOR (Gestor da Empresa):');
  console.log('   Email:    gestor@bizcontrol.co.mz');
  console.log('   Senha:    Gestor123!');
  console.log('   Acesso:   Dashboard e gestão completa');
  console.log('');
  console.log('👨‍💻 VENDEDOR:');
  console.log('   Email:    vendedor@bizcontrol.co.mz');
  console.log('   Senha:    Venda123!');
  console.log('   Acesso:   Apenas ponto de venda (PDV)');
  console.log('═══════════════════════════════════════════\n');
}

// ============================================
// 📂 SEED CATEGORIAS
// ============================================
async function seedCategories(companyId: string) {
  const categoryData = [
    { name: 'Mercearia', color: '#3b82f6' }, // Azul
    { name: 'Bebidas', color: '#ef4444' },   // Vermelho
    { name: 'Higiene', color: '#8b5cf6' },   // Roxo
    { name: 'Congelados', color: '#f59e0b' }, // Laranja
  ];

  const categories = [];
  for (const cat of categoryData) {
    // Buscar categoria existente
    const existing = await prisma.category.findFirst({
      where: {
        name: cat.name,
        company_id: companyId,
      },
    });

    if (existing) {
      categories.push(existing);
    } else {
      const category = await prisma.category.create({
        data: {
          name: cat.name,
          color: cat.color,
          company_id: companyId,
        },
      });
      categories.push(category);
    }
  }

  return categories;
}

// ============================================
// 📦 SEED PRODUTOS
// ============================================
async function seedProducts(
  companyId: string,
  categories: { id: string; name: string }[]
) {
  const catMercearia = categories.find((c) => c.name === 'Mercearia')!;
  const catBebidas = categories.find((c) => c.name === 'Bebidas')!;
  const catHigiene = categories.find((c) => c.name === 'Higiene')!;
  const catCongelados = categories.find((c) => c.name === 'Congelados')!;

  const productsData = [
    // 🌾 MERCEARIA (7 produtos)
    {
      name: 'Arroz Tio Lucas 5kg',
      description: 'Arroz branco tipo 1',
      price: new Prisma.Decimal('450.00'),
      cost_price: new Prisma.Decimal('380.00'),
      quantity: 45,
      min_stock: 20,
      category_id: catMercearia.id,
    },
    {
      name: 'Óleo Oli 750ml',
      description: 'Óleo alimentar refinado',
      price: new Prisma.Decimal('120.00'),
      cost_price: new Prisma.Decimal('95.00'),
      quantity: 8, // BAIXO STOCK! 🚨
      min_stock: 15,
      category_id: catMercearia.id,
    },
    {
      name: 'Açúcar Central 1kg',
      description: 'Açúcar refinado branco',
      price: new Prisma.Decimal('75.00'),
      cost_price: new Prisma.Decimal('60.00'),
      quantity: 120,
      min_stock: 30,
      category_id: catMercearia.id,
    },
    {
      name: 'Farinha Nobre 1kg',
      description: 'Farinha de trigo fortificada',
      price: new Prisma.Decimal('65.00'),
      cost_price: new Prisma.Decimal('50.00'),
      quantity: 80,
      min_stock: 25,
      category_id: catMercearia.id,
    },
    {
      name: 'Massa Alimentícia Vamy 500g',
      description: 'Esparguete',
      price: new Prisma.Decimal('45.00'),
      cost_price: new Prisma.Decimal('35.00'),
      quantity: 12, // BAIXO STOCK! 🚨
      min_stock: 20,
      category_id: catMercearia.id,
    },
    {
      name: 'Sal Refinado 1kg',
      description: 'Sal marinho iodado',
      price: new Prisma.Decimal('25.00'),
      cost_price: new Prisma.Decimal('18.00'),
      quantity: 150,
      min_stock: 40,
      category_id: catMercearia.id,
    },
    {
      name: 'Feijão Manteiga 1kg',
      description: 'Feijão tipo manteiga',
      price: new Prisma.Decimal('85.00'),
      cost_price: new Prisma.Decimal('70.00'),
      quantity: 60,
      min_stock: 20,
      category_id: catMercearia.id,
    },

    // 🍺 BEBIDAS (7 produtos)
    {
      name: 'Cerveja 2M 550ml',
      description: 'Cerveja moçambicana',
      price: new Prisma.Decimal('60.00'),
      cost_price: new Prisma.Decimal('45.00'),
      quantity: 200,
      min_stock: 50,
      category_id: catBebidas.id,
    },
    {
      name: 'Água da Namaacha 500ml',
      description: 'Água mineral natural',
      price: new Prisma.Decimal('25.00'),
      cost_price: new Prisma.Decimal('18.00'),
      quantity: 300,
      min_stock: 100,
      category_id: catBebidas.id,
    },
    {
      name: 'Refrigerante Fanta Laranja 350ml',
      description: 'Refrigerante gaseificado',
      price: new Prisma.Decimal('35.00'),
      cost_price: new Prisma.Decimal('25.00'),
      quantity: 5, // CRÍTICO! 🚨🚨🚨
      min_stock: 80,
      category_id: catBebidas.id,
    },
    {
      name: 'Coca-Cola 350ml',
      description: 'Refrigerante de cola',
      price: new Prisma.Decimal('40.00'),
      cost_price: new Prisma.Decimal('30.00'),
      quantity: 150,
      min_stock: 80,
      category_id: catBebidas.id,
    },
    {
      name: 'Sumo Coração Natural 1L',
      description: 'Sumo tropical misto',
      price: new Prisma.Decimal('55.00'),
      cost_price: new Prisma.Decimal('42.00'),
      quantity: 70,
      min_stock: 30,
      category_id: catBebidas.id,
    },
    {
      name: 'Laurentina Preta 330ml',
      description: 'Cerveja preta premium',
      price: new Prisma.Decimal('70.00'),
      cost_price: new Prisma.Decimal('55.00'),
      quantity: 90,
      min_stock: 40,
      category_id: catBebidas.id,
    },
    {
      name: 'Água Glacial 1.5L',
      description: 'Água mineral sem gás',
      price: new Prisma.Decimal('35.00'),
      cost_price: new Prisma.Decimal('26.00'),
      quantity: 180,
      min_stock: 60,
      category_id: catBebidas.id,
    },

    // 🧼 HIGIENE (3 produtos)
    {
      name: 'Sabão Lux 90g',
      description: 'Sabonete perfumado',
      price: new Prisma.Decimal('30.00'),
      cost_price: new Prisma.Decimal('22.00'),
      quantity: 100,
      min_stock: 30,
      category_id: catHigiene.id,
    },
    {
      name: 'Pasta de Dentes Colgate 90g',
      description: 'Proteção completa',
      price: new Prisma.Decimal('75.00'),
      cost_price: new Prisma.Decimal('60.00'),
      quantity: 9, // BAIXO! 🚨
      min_stock: 20,
      category_id: catHigiene.id,
    },
    {
      name: 'Detergente Omo 1kg',
      description: 'Detergente em pó',
      price: new Prisma.Decimal('150.00'),
      cost_price: new Prisma.Decimal('125.00'),
      quantity: 40,
      min_stock: 15,
      category_id: catHigiene.id,
    },

    // 🧊 CONGELADOS (3 produtos)
    {
      name: 'Frango Inteiro Congelado 1.5kg',
      description: 'Frango limpo e embalado',
      price: new Prisma.Decimal('320.00'),
      cost_price: new Prisma.Decimal('260.00'),
      quantity: 25,
      min_stock: 10,
      category_id: catCongelados.id,
    },
    {
      name: 'Peixe Carapau 1kg',
      description: 'Carapau congelado',
      price: new Prisma.Decimal('280.00'),
      cost_price: new Prisma.Decimal('230.00'),
      quantity: 6, // BAIXO! 🚨
      min_stock: 12,
      category_id: catCongelados.id,
    },
    {
      name: 'Batatas Fritas McCain 1kg',
      description: 'Batatas pré-fritas congeladas',
      price: new Prisma.Decimal('180.00'),
      cost_price: new Prisma.Decimal('145.00'),
      quantity: 30,
      min_stock: 15,
      category_id: catCongelados.id,
    },
  ];

  const products = [];
  for (const prod of productsData) {
    // Buscar produto existente
    const existing = await prisma.product.findFirst({
      where: {
        name: prod.name,
        company_id: companyId,
      },
    });

    if (existing) {
      products.push(existing);
    } else {
      const product = await prisma.product.create({
        data: {
          ...prod,
          company_id: companyId,
        },
      });
      products.push(product);
    }
  }

  return products;
}

// ============================================
// 🛒 SEED VENDAS HISTÓRICAS
// ============================================
async function seedSales(
  companyId: string,
  employeeId: string,
  products: any[]
) {
  const paymentMethods: PaymentMethod[] = [
    PaymentMethod.DINHEIRO,
    PaymentMethod.MPESA,
    PaymentMethod.EMOLA,
    PaymentMethod.CARTAO,
  ];
  
  // Gerar 30 vendas distribuídas pelos últimos 7 dias
  for (let i = 0; i < 30; i++) {
    // Data aleatória nos últimos 7 dias
    const daysAgo = Math.floor(Math.random() * 7);
    const saleDate = new Date();
    saleDate.setDate(saleDate.getDate() - daysAgo);
    saleDate.setHours(
      8 + Math.floor(Math.random() * 12), // Entre 8h e 20h
      Math.floor(Math.random() * 60),
      0,
      0
    );

    // Selecionar 1-5 produtos aleatórios
    const numItems = 1 + Math.floor(Math.random() * 5);
    const selectedProducts = [];
    const usedIndexes = new Set();

    while (selectedProducts.length < numItems) {
      const randomIndex = Math.floor(Math.random() * products.length);
      if (!usedIndexes.has(randomIndex)) {
        usedIndexes.add(randomIndex);
        selectedProducts.push(products[randomIndex]);
      }
    }

    // Calcular totais
    let subtotal = new Prisma.Decimal(0);
    let totalCost = new Prisma.Decimal(0);
    let totalProfit = new Prisma.Decimal(0);

    const items = selectedProducts.map((product) => {
      const quantity = 1 + Math.floor(Math.random() * 3); // 1-3 unidades
      const itemPrice = new Prisma.Decimal(product.price);
      const itemCost = new Prisma.Decimal(product.cost_price || 0);
      const itemSubtotal = itemPrice.mul(quantity);
      const itemCostTotal = itemCost.mul(quantity);
      const itemProfit = itemSubtotal.sub(itemCostTotal);

      subtotal = subtotal.add(itemSubtotal);
      totalCost = totalCost.add(itemCostTotal);
      totalProfit = totalProfit.add(itemProfit);

      return {
        product_id: product.id,
        quantity,
        unit_price: itemPrice,
        cost_price: itemCost,
        subtotal: itemSubtotal,
        profit: itemProfit,
      };
    });

    const taxRate = new Prisma.Decimal('0.16'); // IVA 16%
    const taxAmount = subtotal.mul(taxRate);
    const total = subtotal.add(taxAmount);

    // Método de pagamento aleatório
    const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

    // Criar venda
    await prisma.sale.create({
      data: {
        company_id: companyId,
        employee_id: employeeId,
        subtotal: subtotal,
        tax_amount: taxAmount,
        total: total,
        total_profit: totalProfit,
        payment_method: paymentMethod,
        created_at: saleDate,
        sale_items: {
          create: items,
        },
      },
    });
  }
}

// ============================================
// 🚀 EXECUTAR
// ============================================
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Erro no seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
