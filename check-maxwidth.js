/**
 * 🔍 VERIFICADOR ESPECÍFICO DE MAXWIDTHCONTAINER
 * Verifica se todas as tags MaxWidthContainer estão fechadas
 * Executa: node check-maxwidth.js
 * Tempo: ~1 segundo
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔍 Verificando tags MaxWidthContainer...\n');

// Encontrar todos os arquivos que usam MaxWidthContainer
const files = glob.sync('src/app/**/page.tsx', { cwd: __dirname });

let totalFiles = 0;
let filesWithIssues = 0;
const issues = [];

files.forEach(file => {
  const fullPath = path.join(__dirname, file);
  const content = fs.readFileSync(fullPath, 'utf8');
  
  // Verifica se tem MaxWidthContainer
  if (!content.includes('MaxWidthContainer')) {
    return;
  }
  
  totalFiles++;
  
  // Contar tags de abertura
  const openTags = (content.match(/<MaxWidthContainer/g) || []).length;
  
  // Contar tags de fechamento
  const closeTags = (content.match(/<\/MaxWidthContainer>/g) || []).length;
  
  if (openTags !== closeTags) {
    filesWithIssues++;
    issues.push({
      file: file.replace(/\\/g, '/'),
      openTags,
      closeTags,
      problem: openTags > closeTags ? 'Faltando fechamento' : 'Fechamento extra'
    });
  }
});

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log(`📊 Arquivos verificados: ${totalFiles}`);
console.log(`✅ Corretos: ${totalFiles - filesWithIssues}`);
console.log(`❌ Com problemas: ${filesWithIssues}\n`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

if (filesWithIssues === 0) {
  console.log('🎉 TUDO CERTO!\n');
  console.log('✅ Todas as tags MaxWidthContainer estão fechadas corretamente!\n');
  console.log('🚀 Pode fazer o build agora: npm run build\n');
} else {
  console.log('❌ PROBLEMAS ENCONTRADOS:\n');
  
  issues.forEach((issue, index) => {
    console.log(`${index + 1}. ${issue.file}`);
    console.log(`   Abertura: <MaxWidthContainer> × ${issue.openTags}`);
    console.log(`   Fechamento: </MaxWidthContainer> × ${issue.closeTags}`);
    console.log(`   Problema: ${issue.problem}\n`);
  });
  
  console.log('🔧 CORREÇÃO RÁPIDA:\n');
  issues.forEach(issue => {
    if (issue.openTags > issue.closeTags) {
      console.log(`   Adicionar </MaxWidthContainer> antes do último );`);
      console.log(`   em: ${issue.file}\n`);
    }
  });
  
  // Salvar relatório
  fs.writeFileSync(
    path.join(__dirname, 'maxwidth-issues.json'),
    JSON.stringify({ timestamp: new Date().toISOString(), issues }, null, 2)
  );
  
  console.log('📝 Relatório salvo: maxwidth-issues.json\n');
}

process.exit(filesWithIssues > 0 ? 1 : 0);
