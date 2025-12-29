/**
 * ================================================================
 * ATIVAR SERVICE WORKER OTIMIZADO - BIZCONTROL 360
 * ================================================================
 * Script para substituir o SW atual pelo otimizado
 * 
 * USO:
 *   node scripts/activate-optimized-sw.js
 * 
 * O QUE FAZ:
 *   - Cria backup do sw.js atual
 *   - Substitui sw.js por sw-optimized.js
 *   - Valida a troca
 * ================================================================
 */

const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const SW_CURRENT = path.join(PUBLIC_DIR, 'sw.js');
const SW_OPTIMIZED = path.join(PUBLIC_DIR, 'sw-optimized.js');
const SW_BACKUP = path.join(PUBLIC_DIR, 'sw-backup.js');

function activateOptimizedSW() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║  ATIVAR SERVICE WORKER OTIMIZADO                       ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  // 1. Verificar se sw-optimized.js existe
  if (!fs.existsSync(SW_OPTIMIZED)) {
    console.error('❌ sw-optimized.js não encontrado em:', SW_OPTIMIZED);
    console.log('\n💡 Execute primeiro: npm run setup-pwa-complete');
    process.exit(1);
  }

  // 2. Criar backup do sw.js atual
  if (fs.existsSync(SW_CURRENT)) {
    console.log('📦 Criando backup do sw.js atual...');
    fs.copyFileSync(SW_CURRENT, SW_BACKUP);
    console.log('✅ Backup criado: sw-backup.js\n');
  }

  // 3. Copiar sw-optimized.js para sw.js
  console.log('🔄 Substituindo sw.js pelo sw-optimized.js...');
  fs.copyFileSync(SW_OPTIMIZED, SW_CURRENT);
  console.log('✅ sw.js atualizado com versão otimizada\n');

  // 4. Validar
  const swContent = fs.readFileSync(SW_CURRENT, 'utf8');
  if (swContent.includes('v2.1.0') || swContent.includes('VERSION = \'2.1.0\'')) {
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║  SUCESSO                                               ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
    
    console.log('✅ Service Worker otimizado ativado com sucesso!');
    console.log('\n📋 PRÓXIMOS PASSOS:');
    console.log('1. Build do projeto: npm run build');
    console.log('2. Testar localmente: npm start');
    console.log('3. Verificar no DevTools → Application → Service Workers');
    console.log('4. Validar com Lighthouse\n');
    
    console.log('📦 BACKUP:');
    console.log('   Arquivo original salvo em: public/sw-backup.js');
    console.log('   Para reverter: node scripts/revert-sw.js\n');
  } else {
    console.error('❌ Erro na ativação - arquivo não parece estar correto');
    
    // Reverter se houver erro
    if (fs.existsSync(SW_BACKUP)) {
      fs.copyFileSync(SW_BACKUP, SW_CURRENT);
      console.log('↩️  Revertido para versão anterior');
    }
    process.exit(1);
  }
}

// Executar
try {
  activateOptimizedSW();
} catch (error) {
  console.error('❌ Erro fatal:', error.message);
  process.exit(1);
}
