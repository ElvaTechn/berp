/**
 * Script para aplicar MaxWidthContainer em todas as páginas
 * Executa: node apply-maxwidth-all-pages.js
 */

const fs = require('fs');
const path = require('path');

const pagesToUpdate = [
  'src/app/admin/audit/page.tsx',
  'src/app/admin/backup/page.tsx',
  'src/app/admin/companies/page.tsx',
  'src/app/admin/dashboard/page.tsx',
  'src/app/admin/page.tsx',
  'src/app/admin/settings/page.tsx',
  'src/app/admin/subscriptions/page.tsx',
  'src/app/admin/system/page.tsx',
  'src/app/categories/page.tsx',
  'src/app/dashboard/performance/page.tsx',
  'src/app/funcionarios/page.tsx',
  'src/app/inventory/page.tsx',
  'src/app/more/page.tsx',
  'src/app/offline/page.tsx',
  'src/app/pos/page.tsx',
  'src/app/reports/page.tsx',
  'src/app/reservations/page.tsx',
  'src/app/sales/page.tsx',
  'src/app/settings/page.tsx',
  'src/app/team/page.tsx',
  // Ignorar: login, register, setup, page.tsx (landing), theme-demo, toast-demo, subscription-expired
];

const importStatement = `import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';`;

function addMaxWidthContainer(filePath) {
  try {
    const fullPath = path.join(__dirname, filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`❌ Arquivo não encontrado: ${filePath}`);
      return false;
    }

    let content = fs.readFileSync(fullPath, 'utf8');

    // Verificar se já tem MaxWidthContainer
    if (content.includes('MaxWidthContainer')) {
      console.log(`⏭️  Já tem MaxWidthContainer: ${filePath}`);
      return false;
    }

    // 1. Adicionar import
    if (!content.includes(importStatement)) {
      // Procurar último import
      const importLines = content.match(/^import .+;$/gm);
      if (importLines && importLines.length > 0) {
        const lastImport = importLines[importLines.length - 1];
        content = content.replace(lastImport, `${lastImport}\n${importStatement}`);
      } else {
        // Se não tem imports, adicionar após "use client" ou no início
        if (content.includes('"use client"')) {
          content = content.replace('"use client";', `"use client";\n\n${importStatement}`);
        } else {
          content = `${importStatement}\n\n${content}`;
        }
      }
    }

    // 2. Encontrar return principal do componente
    const returnMatch = content.match(/return \(/);
    if (!returnMatch) {
      console.log(`⚠️  Não encontrou return: ${filePath}`);
      return false;
    }

    const returnIndex = returnMatch.index;
    
    // Verificar se o próximo elemento após return ( é uma div
    const afterReturn = content.substring(returnIndex);
    const divMatch = afterReturn.match(/return \(\s*<(div|motion\.div)/);
    
    if (divMatch) {
      // Adicionar MaxWidthContainer wrapper
      const replacement = divMatch[0].replace(/return \(\s*</, 'return (\n    <MaxWidthContainer size="xl">\n      <');
      content = content.substring(0, returnIndex) + afterReturn.replace(divMatch[0], replacement);
      
      // Fechar MaxWidthContainer antes do último )
      // Encontrar o fechamento do return
      const lastReturnClose = content.lastIndexOf('  );');
      if (lastReturnClose !== -1) {
        content = content.substring(0, lastReturnClose) + '    </MaxWidthContainer>\n' + content.substring(lastReturnClose);
      }
    }

    // Salvar arquivo
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Atualizado: ${filePath}`);
    return true;

  } catch (error) {
    console.error(`❌ Erro em ${filePath}:`, error.message);
    return false;
  }
}

console.log('🚀 Iniciando aplicação de MaxWidthContainer em todas as páginas...\n');

let updated = 0;
let skipped = 0;
let errors = 0;

pagesToUpdate.forEach(page => {
  const result = addMaxWidthContainer(page);
  if (result === true) updated++;
  else if (result === false && fs.existsSync(path.join(__dirname, page))) skipped++;
  else errors++;
});

console.log(`\n📊 Resumo:`);
console.log(`✅ Atualizadas: ${updated}`);
console.log(`⏭️  Ignoradas: ${skipped}`);
console.log(`❌ Erros: ${errors}`);
console.log(`\n🎉 Processo concluído!`);
