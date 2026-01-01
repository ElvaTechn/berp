// Test Supabase Connection
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  console.log('🔍 Testando conexão com Supabase...\n');
  
  try {
    // Test 1: Raw query
    console.log('1️⃣ Testando query básica...');
    await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Conexão com banco OK!\n');
    
    // Test 2: Check tables
    console.log('2️⃣ Verificando tabelas existentes...');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    
    if (tables.length > 0) {
      console.log(`✅ Encontradas ${tables.length} tabelas:`);
      tables.forEach(t => console.log(`   - ${t.table_name}`));
    } else {
      console.log('⚠️  Nenhuma tabela encontrada (precisa rodar migrations)\n');
    }
    
    // Test 3: Check specific tables
    console.log('\n3️⃣ Verificando tabelas do ERP...');
    const erpTables = ['users', 'companies', 'products', 'sales', 'employees'];
    
    for (const table of erpTables) {
      try {
        const result = await prisma.$queryRaw`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = ${table}
          );
        `;
        const exists = result[0].exists;
        console.log(`   ${exists ? '✅' : '❌'} ${table}`);
      } catch (e) {
        console.log(`   ❌ ${table} - Erro: ${e.message}`);
      }
    }
    
    console.log('\n✅ Teste de conexão concluído!');
    
  } catch (error) {
    console.error('\n❌ Erro na conexão:');
    console.error('Tipo:', error.constructor.name);
    console.error('Mensagem:', error.message);
    
    if (error.message.includes('ENOTFOUND')) {
      console.error('\n🔧 Solução: Verifique se o host está correto no DATABASE_URL');
    } else if (error.message.includes('authentication')) {
      console.error('\n🔧 Solução: Verifique se a senha está correta no DATABASE_URL');
    } else if (error.message.includes('timeout')) {
      console.error('\n🔧 Solução: Firewall do Supabase pode estar bloqueando');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
