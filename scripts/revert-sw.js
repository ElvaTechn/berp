/**
 * ================================================================
 * REVERTER SERVICE WORKER - BIZCONTROL 360
 * ================================================================
 * Script para reverter para o SW original caso necessário
 * 
 * USO:
 *   node scripts/revert-sw.js
 * ================================================================
 */

const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const SW_CURRENT = path.join(PUBLIC_DIR, 'sw.js');
const SW_BACKUP = path.join(PUBLIC_DIR, 'sw-backup.js');

function revertSW() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║  REVERTER SERVICE WORKER                               ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  // Verificar se backup existe
  if (!fs.existsSync(SW_BACKUP)) {
    console.error('❌ Backup não encontrado: sw-backup.js');
    console.log('\n💡 Não há backup disponível para reverter.');
    process.exit(1);
  }

  // Reverter
  console.log('↩️  Revertendo para versão anterior...');
  fs.copyFileSync(SW_BACKUP, SW_CURRENT);
  console.log('✅ sw.js revertido com sucesso!\n');

  console.log('📋 PRÓXIMOS PASSOS:');
  console.log('1. Build do projeto: npm run build');
  console.log('2. Testar: npm start\n');
}

// Executar
try {
  revertSW();
} catch (error) {
  console.error('❌ Erro:', error.message);
  process.exit(1);
}
