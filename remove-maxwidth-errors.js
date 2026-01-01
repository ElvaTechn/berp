/**
 * Remove MaxWidthContainer dos arquivos com erro
 * Isso vai fazer o build funcionar novamente
 */

const fs = require('fs');

const filesWithErrors = [
  'src/app/admin/audit/page.tsx',
  'src/app/admin/backup/page.tsx',
  'src/app/admin/companies/page.tsx',
  'src/app/admin/subscriptions/page.tsx',
  'src/app/categories/page.tsx',
  'src/app/dashboard/performance/page.tsx',
  'src/app/reports/page.tsx',
  'src/app/reservations/page.tsx',
];

console.log('🔧 Removendo MaxWidthContainer dos arquivos com erro...\n');

filesWithErrors.forEach(file => {
  try {
    const fullPath = `F:\\berp\\${file}`;
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Remover import
    content = content.replace(/import { MaxWidthContainer } from ['"]@\/components\/layout\/MaxWidthContainer['"];\n/g, '');
    
    // Remover tag de abertura
    content = content.replace(/<MaxWidthContainer size="xl">\s*/g, '');
    
    // Remover tag de fechamento
    content = content.replace(/\s*<\/MaxWidthContainer>/g, '');
    
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ ${file}`);
    
  } catch (error) {
    console.log(`❌ ${file}: ${error.message}`);
  }
});

console.log('\n✅ Concluído! Execute: npm run build');
