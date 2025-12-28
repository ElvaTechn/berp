/**
 * ================================================================
 * SEED LIMPO COMPLETO - BIZCONTROL 360 ERP
 * ================================================================
 * Sistema completamente limpo - Apenas usuários administradores
 * Nenhuma empresa, produto ou dados de negócio
 * ================================================================
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Limpando completamente o sistema...\n');

  // 1. Limpar TODOS os dados existentes
  console.log('🗑️ Limpando todos os dados existentes...');
  
  // Limpar em ordem correta (evitando foreign key constraints)
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

  console.log('✅ Todos os dados removidos\n');

  // 2. Apenas criar usuários administrativos (sem empresas vinculadas)
  console.log('👤 Criando apenas usuários administrativos...');
  
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  const gestorPassword = await bcrypt.hash('Gestor123!', 12);
  const vendedorPassword = await bcrypt.hash('Venda123!', 12);

  await prisma.user.createMany({
    data: [
      {
        email: 'admin@bizcontrol.co.mz',
        full_name: 'Administrador Sistema',
        password: adminPassword,
        role: 'ADMIN',
        is_active: true,
      },
      {
        email: 'gestor@bizcontrol.co.mz',
        full_name: 'Gestor Principal',
        password: gestorPassword,
        role: 'GESTOR',
        is_active: true,
      },
      {
        email: 'vendedor@bizcontrol.co.mz',
        full_name: 'Vendedor Padrão',
        password: vendedorPassword,
        role: 'VENDEDOR',
        is_active: true,
      },
    ],
  });

  console.log('✅ Apenas 3 usuários administrativos criados\n');

  console.log('═════════════════════════════════════════');
  console.log('✨ SISTEMA COMPLETAMENTE LIMPO!');
  console.log('═════════════════════════════════════════\n');
  console.log('🔑 USUÁRIOS DISPONÍVEIS:');
  console.log('─────────────────────────');
  console.log('🔐 Admin: admin@bizcontrol.co.mz / Admin123!');
  console.log('👨‍💼 Gestor: gestor@bizcontrol.co.mz / Gestor123!');
  console.log('👨‍💻 Vendedor: vendedor@bizcontrol.co.mz / Venda123!');
  console.log('');
  console.log('🎯 PRÓXIMO PASSO:');
  console.log('   Faça login e crie sua empresa/dados reais');
  console.log('═════════════════════════════════════════\n');
  console.log('✨ Sistema limpo e pronto para configuração inicial!\n');
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
