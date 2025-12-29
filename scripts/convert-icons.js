/**
 * ================================================================
 * ICON CONVERTER - BIZCONTROL 360 ERP
 * ================================================================
 * Script Node.js para converter ícones SVG para PNG
 * 
 * USO:
 *   node scripts/convert-icons.js
 * 
 * REQUISITOS:
 *   npm install sharp
 * 
 * O QUE FAZ:
 *   - Converte SVGs em public/icons para PNG
 *   - Cria apple-touch-icon.png otimizado
 *   - Cria favicon.ico
 *   - Mantém SVGs originais
 * ================================================================
 */

const fs = require('fs');
const path = require('path');

// Verificar se sharp está instalado
let sharp;
try {
  sharp = require('sharp');
} catch (error) {
  console.error('❌ Sharp não instalado. Execute: npm install sharp');
  process.exit(1);
}

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const ICONS_DIR = path.join(PUBLIC_DIR, 'icons');

// Tamanhos para converter
const ICON_SIZES = [72, 96, 128, 144, 152, 384];

// Cor de fundo padrão (transparente ou cor)
const BG_COLOR = { r: 37, g: 99, b: 235, alpha: 1 }; // #2563eb

async function convertSVGtoPNG(svgPath, pngPath, size) {
  try {
    await sharp(svgPath)
      .resize(size, size, {
        fit: 'contain',
        background: BG_COLOR
      })
      .png({
        quality: 100,
        compressionLevel: 9
      })
      .toFile(pngPath);
    
    console.log(`✅ Convertido: ${path.basename(pngPath)}`);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao converter ${path.basename(svgPath)}:`, error.message);
    return false;
  }
}

async function createAppleTouchIcon() {
  const svgPath = path.join(PUBLIC_DIR, 'apple-touch-icon.svg');
  const pngPath = path.join(PUBLIC_DIR, 'apple-touch-icon.png');
  
  console.log('\n📱 Criando apple-touch-icon.png...');
  
  if (!fs.existsSync(svgPath)) {
    console.error('❌ apple-touch-icon.svg não encontrado');
    return false;
  }
  
  return await convertSVGtoPNG(svgPath, pngPath, 180);
}

async function createFavicon() {
  const svgPath = path.join(PUBLIC_DIR, 'favicon.svg');
  const icoPath = path.join(PUBLIC_DIR, 'favicon.ico');
  const pngPath = path.join(PUBLIC_DIR, 'favicon-32x32.png');
  
  console.log('\n🔖 Criando favicon...');
  
  if (!fs.existsSync(svgPath)) {
    console.error('❌ favicon.svg não encontrado');
    return false;
  }
  
  // Criar PNG 32x32 (ICO creation requires external tool)
  const success = await convertSVGtoPNG(svgPath, pngPath, 32);
  
  if (success) {
    console.log('⚠️  favicon.ico não criado (requer ferramenta externa)');
    console.log('   Use https://realfavicongenerator.net/ ou:');
    console.log('   npm install -g sharp-cli && sharp-cli -i favicon-32x32.png -o favicon.ico');
  }
  
  return success;
}

async function convertAllIcons() {
  console.log('\n🎨 Convertendo ícones SVG para PNG...\n');
  
  let converted = 0;
  let skipped = 0;
  let errors = 0;
  
  for (const size of ICON_SIZES) {
    const svgFile = `icon-${size}x${size}.svg`;
    const pngFile = `icon-${size}x${size}.png`;
    const svgPath = path.join(ICONS_DIR, svgFile);
    const pngPath = path.join(ICONS_DIR, pngFile);
    
    // Verificar se SVG existe
    if (!fs.existsSync(svgPath)) {
      console.log(`⏭️  ${svgFile} não encontrado, pulando...`);
      skipped++;
      continue;
    }
    
    // Verificar se PNG já existe
    if (fs.existsSync(pngPath)) {
      console.log(`⚠️  ${pngFile} já existe, pulando...`);
      skipped++;
      continue;
    }
    
    // Converter
    const success = await convertSVGtoPNG(svgPath, pngPath, size);
    if (success) {
      converted++;
    } else {
      errors++;
    }
  }
  
  return { converted, skipped, errors };
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║  ICON CONVERTER - BIZCONTROL 360 ERP                  ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  
  // Verificar se diretórios existem
  if (!fs.existsSync(ICONS_DIR)) {
    console.error('❌ Diretório public/icons não encontrado');
    process.exit(1);
  }
  
  // Converter ícones
  const { converted, skipped, errors } = await convertAllIcons();
  
  // Criar apple-touch-icon
  await createAppleTouchIcon();
  
  // Criar favicon
  await createFavicon();
  
  // Resumo
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║  RESUMO                                                ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log(`✅ Convertidos: ${converted}`);
  console.log(`⏭️  Pulados: ${skipped}`);
  console.log(`❌ Erros: ${errors}`);
  console.log('');
  
  if (errors > 0) {
    console.log('⚠️  Alguns ícones não foram convertidos. Verifique os erros acima.');
    process.exit(1);
  }
  
  console.log('✅ Conversão concluída com sucesso!');
  console.log('');
  console.log('📋 PRÓXIMOS PASSOS:');
  console.log('1. Verifique os ícones gerados em public/icons/');
  console.log('2. Teste o PWA: npm run build && npm start');
  console.log('3. Verifique instalabilidade no Chrome DevTools');
  console.log('');
}

// Executar
main().catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
