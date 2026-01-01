/**
 * 🔍 VERIFICADOR RÁPIDO DE ERROS
 * Executa: node check-errors.js
 * Tempo: ~10 segundos (vs 2min do build)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando erros TypeScript...\n');
console.log('⏱️  Isso leva ~10 segundos (10x mais rápido que build)\n');

try {
  // Executar TypeScript check
  const output = execSync('npx tsc --noEmit --pretty', {
    cwd: __dirname,
    encoding: 'utf8',
    stdio: 'pipe'
  });
  
  console.log('✅ NENHUM ERRO ENCONTRADO!\n');
  console.log('🎉 Todos os arquivos TypeScript estão corretos!\n');
  console.log('📊 Status: Pronto para build');
  
} catch (error) {
  const output = error.stdout || error.stderr || '';
  
  // Parsear erros
  const errorLines = output.split('\n');
  const errors = [];
  let currentError = null;
  
  errorLines.forEach(line => {
    // Detectar início de erro (tem caminho do arquivo)
    if (line.includes('.tsx') || line.includes('.ts')) {
      if (currentError) {
        errors.push(currentError);
      }
      currentError = { file: '', line: 0, message: '', code: '' };
      
      // Extrair arquivo e linha
      const match = line.match(/(.+\.tsx?)\((\d+),(\d+)\): (.+)/);
      if (match) {
        currentError.file = match[1].replace(__dirname + '\\', '');
        currentError.line = parseInt(match[2]);
        currentError.message = match[4];
      }
    } else if (currentError && line.trim()) {
      currentError.code += line + '\n';
    }
  });
  
  if (currentError) {
    errors.push(currentError);
  }
  
  // Mostrar erros organizados
  console.log('❌ ERROS ENCONTRADOS:\n');
  console.log(`📊 Total: ${errors.length} erro(s)\n`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // Agrupar por arquivo
  const errorsByFile = {};
  errors.forEach(err => {
    if (!errorsByFile[err.file]) {
      errorsByFile[err.file] = [];
    }
    errorsByFile[err.file].push(err);
  });
  
  // Mostrar por arquivo
  Object.keys(errorsByFile).forEach((file, index) => {
    const fileErrors = errorsByFile[file];
    console.log(`\n📄 Arquivo ${index + 1}: ${file}`);
    console.log(`   Erros: ${fileErrors.length}\n`);
    
    fileErrors.forEach((err, i) => {
      console.log(`   ${i + 1}. Linha ${err.line}:`);
      console.log(`      ${err.message}\n`);
    });
  });
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('🔧 COMO CORRIGIR:\n');
  console.log('   1. Abra os arquivos listados acima');
  console.log('   2. Vá até as linhas indicadas');
  console.log('   3. Corrija os erros');
  console.log('   4. Execute novamente: node check-errors.js\n');
  
  // Criar relatório
  const report = {
    timestamp: new Date().toISOString(),
    totalErrors: errors.length,
    files: Object.keys(errorsByFile).length,
    errors: errorsByFile
  };
  
  fs.writeFileSync(
    path.join(__dirname, 'error-report.json'),
    JSON.stringify(report, null, 2)
  );
  
  console.log('📝 Relatório salvo: error-report.json\n');
  
  process.exit(1);
}
