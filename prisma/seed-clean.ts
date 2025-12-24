/**
 * ================================================================
 * CLEAN SEED - BIZCONTROL 360 ERP
 * ================================================================
 * Versão limpa sem dados mockados
 * Dados reais e minimalistas para demonstração
 * ================================================================
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Criando dados clean BIZ360...\n');

  // 1. Limpar todos os dados existentes primeiro
  console.log('🗑️ Limpando dados existentes...');
  
  // Limpar registros em ordem correta (evitando foreign key constraints)
  await prisma.auditLog.deleteMany({});
  await prisma.returnItem.deleteMany({});
  await prisma.saleItem.deleteMany({});
  await prisma.sale.deleteMany({});
  await prisma.discount.deleteMany({});
  await prisma.reservation.deleteMany({});
  await prisma.employee.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.company.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.loginAttempt.deleteMany({});
  await prisma.rateLimitEntry.deleteMany({});

  console.log('✅ Dados existentes removidos\n');

  // 2. Criar usuários clean
  console.log('👤 Criando usuários...');
  
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  const gestorPassword = await bcrypt.hash('Gestor123!', 12);
  const vendedorPassword = await bcrypt.hash('Venda123!', 12);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@bizcontrol.co.mz',
      full_name: 'Administrador Sistema',
      password: adminPassword,
      role: 'ADMIN',
      is_active: true,
    },
  });

  const gestor = await prisma.user.create({
    data: {
      email: 'gestor@bizcontrol.co.mz',
      full_name: 'Gestor Principal',
      password: gestorPassword,
      role: 'GESTOR',
      is_active: true,
    },
  });

  const vendedor = await prisma.user.create({
    data: {
      email: 'vendedor@bizcontrol.co.mz',
      full_name: 'Vendedor',
      password: vendedorPassword,
      role: 'VENDEDOR',
      is_active: true,
    },
  });

  console.log('✅ Usuários criados: Admin, Gestor, Vendedor\n');

  // 3. Criar empresa
  console.log('🏢 Criando empresa...');
  const company = await prisma.company.create({
    data: {
      name: 'Demo ERP Solutions',
      nuit: '123456789',
      address: 'Avenida Principal, 1000',
      phone: '+258 21 234 5678',
      email: 'contato@demoerp.mz',
      owner_id: gestor.id,
      subscription_status: 'ACTIVE',
      subscription_type: 'MONTHLY',
      tax_regime: 'NORMAL',
    },
  });

  // 4. Criar funcionários
  console.log('👥 Criando funcionários...');
  await prisma.employee.createMany({
    data: [
      {
        full_name: 'Admin Sistema',
        email: 'admin@bizcontrol.co.mz',
        role: 'ADMIN',
        company_id: company.id,
        user_id: admin.id,
        is_active: true,
      },
      {
        full_name: 'Gestor Principal',
        email: 'gestor@bizcontrol.co.mz',
        role: 'GESTOR',
        company_id: company.id,
        user_id: gestor.id,
        is_active: true,
      },
      {
        full_name: 'Vendedor Um',
        email: 'vendedor@bizcontrol.co.mz',
        role: 'VENDEDOR',
        company_id: company.id,
        user_id: vendedor.id,
        is_active: true,
      },
    ],
  });

  console.log('✅ Funcionários criados\n');

  // 5. Criar categorias simplificadas
  console.log('📂 Criando categorias...');
  const categories = await prisma.category.createMany({
    data: [
      { name: 'Alimentos', color: '#3b82f6', company_id: company.id },
      { name: 'Bebidas', color: '#ef4444', company_id: company.id },
      { name: 'Limpeza', color: '#8b5cf6', company_id: company.id },
      { name: 'Eletrônicos', color: '#f59e0b', company_id: company.id },
    ],
  });

  console.log('✅ 4 Categorias criadas\n');

  // 6. Criar produtos simplificados (sem dados mock complexos)
  console.log('📦 Criando produtos...');
  const products = await prisma.product.createMany({
    data: [
      // Alimentos
      { name: 'Arroz', description: 'Arroz branco 1kg', price: 50.00, cost_price: 40.00, quantity: 100, min_stock: 20, category_id: categories[0].id, company_id: company.id },
      { name: 'Feijão', description: 'Feijão preto 1kg', price: 80.00, cost_price: 60.00, quantity: 50, min_stock: 15, category_id: categories[0].id, company_id: company.id },
      
      // Bebidas
      { name: 'Refrigerante', description: 'Refrigerante 350ml', price: 35.00, cost_price: 25.00, quantity: 200, min_stock: 50, category_id: categories[1].id, company_id: company.id },
      { name: 'Água', description: 'Água mineral 500ml', price: 25.00, cost_price: 20.00, quantity: 300, min_stock: 100, category_id: categories[1].id, company_id: company.id },
      
      // Limpeza
      { name: 'Sabão', description: 'Sabão líquido 500ml', price: 45.00, cost_price: 35.00, quantity: 80, min_stock: 25, category_id: categories[2].id, company_id: company.id },
      { name: 'Detergente', description: 'Detergente em pó 500g', price: 120.00, cost_price: 90.00, quantity: 40, min_stock: 15, category_id: categories[2].id, company_id: company.id },
      
      // Eletrônicos
      { name: 'Telefone', description: 'Telefone básico', price: 250.00, cost_price: 200.00, quantity: 25, min_stock: 10, category_id: categories[3].id, company_id: company.id },
      { name: 'Carregador', description: 'Carregador USB', price: 80.00, cost_price: 60.00, quantity: 60, min_stock: 20, category_id: categories[3].id, company_id: company.id },
      { name: 'Fone de Ouvido', description: 'Fone sem fio Bluetooth', price: 150.00, cost_price: 100.00, quantity: 30, min_stock: 10, category_id: categories[3].id, company_id: company.id },
      { name: 'Pilhas', description: 'Pilhas AA', price: 15.00, cost_price: 10.00, quantity: 500, min_stock: 100, category_id: categories[3].id, company_id: company.id },
    ],
  });

  console.log(`✅ ${products.length} Produtos criados\n`);

  // 7. Criar algumas vendas básicas para演示
  console.log('🛒 Criando vendas de demonstração...');
  const seller = await prisma.employee.findFirst({
    where: { email: 'vendedor@bizcontrol.co.mz' },
  });

  if (seller) {
    // Usar um dos produtos (arroz) para criar vendas simples
    const arroz = products.find(p => p.name === 'Arroz');
    if (arroz) {
      // Criar 3 vendas simples
      const prices = [50, 100, 75]; // 1, 2, 1.5 arroz
      for (let i = 0; i < prices.length; i++) {
        const total = prices[i];
        const quantity = [1, 2, 3][i]; // quantities
        await prisma.sale.create({
          data: {
            company_id: company.id,
            employee_id: seller.id,
            subtotal: total * quantity,
            total: total * quantity,
            total_profit: ((arroz.price.toNumber() - arroz.cost_price.toNumber()) * quantity),
            payment_method: 'DINHEIRO',
            created_at: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)), // Cada venda há 1 dia atrás
            sale_items: {
              create: {
                data: {
                  product_id: arroz.id,
                  quantity: quantity,
                  unit_price: arroz.price,
                  cost_price: arroz.cost_price,
                  subtotal: total * quantity,
                  profit: ((arroz.price.toNumber() - arroz.cost_price.toNumber()) * quantity),
                }
              }
            },
          },
        });
      }
    }
    
    console.log('✅ Vendas de demonstração criadas\n');
  }

  console.log('═════════════════════════════════════════');
  console.log('✨ LIMPEZA COMPLETA!');
  console.log('═════════════════════════════════════════\n');
  console.log('🔑 CREDENCIAIS:');
  console.log('──────────────');
  console.log('🔐 Admin: admin@bizcontrol.co.mz / Admin123!');
  console.log('👨‍💼 Gestor: gestor@bizcontrol.co.mz / Gestor123!');
  console.log('👨‍💻 Vendedor: vendedor@bizcontrol.co.mz / Venda123!');
  console.log('═════════════════════════════════════════\n');
  console.log('📌 Sistema limpo e pronto para testar!\n');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Erro no seed limpo:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
