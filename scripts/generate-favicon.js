/**
 * ================================================================
 * FAVICON GENERATOR - BIZCONTROL 360 ERP
 * ================================================================
 * Script Node.js para gerar favicon.ico a partir do SVG
 * 
 * USO:
 *   node scripts/generate-favicon.js
 * 
 * REQUISITOS:
 *   npm install sharp to-ico
 * 
 * O QUE FAZ:
 *   - Converte favicon.svg para PNG em múltiplos tamanhos
 *   - Gera favicon.ico com tamanhos 16x16, 32x32, 48x48
 *   - Otimiza para melhor compatibilidade
 * ================================================================
 */

const fs = require('fs');
const path = require('path');

// Verificar se dependências estão instaladas
let sharp, toIco;
try {
  sharp = require('sharp');
} catch (error) {
  console.error('❌ Sharp não instalado. Execute: npm install sharp');
  process.exit(1);
}

try {
  toIco = require('to-ico');
} catch (error) {
  console.error('❌ to-ico não instalado. Execute: npm install to-ico');
  process.exit(1);
}

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const FAVICON_SVG = path.join(PUBLIC_DIR, 'favicon.svg');
const FAVICON_ICO = path.join(PUBLIC_DIR, 'favicon.ico');

// Tamanhos para ICO
const ICO_SIZES = [16, 32, 48];

async function generateFavicon() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║  FAVICON GENERATOR - BIZCONTROL 360 ERP               ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  // Verificar se favicon.svg existe
  if (!fs.existsSync(FAVICON_SVG)) {
    console.error('❌ favicon.svg não encontrado em:', FAVICON_SVG);
    process.exit(1);
  }

  console.log('📄 Gerando PNGs temporários...\n');

  // Gerar PNGs em diferentes tamanhos
  const pngBuffers = [];
  
  for (const size of ICO_SIZES) {
    try {
      const buffer = await sharp(FAVICON_SVG)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 37, g: 99, b: 235, alpha: 1 }
        })
        .png({
          quality: 100,
          compressionLevel: 9
        })
        .toBuffer();
      
      pngBuffers.push(buffer);
      console.log(`✅ Gerado PNG ${size}x${size}`);
    } catch (error) {
      console.error(`❌ Erro ao gerar PNG ${size}x${size}:`, error.message);
      process.exit(1);
    }
  }

  console.log('\n🔨 Criando favicon.ico...\n');

  // Converter PNGs para ICO
  try {
    const icoBuffer = await toIco(pngBuffers);
    fs.writeFileSync(FAVICON_ICO, icoBuffer);
    
    const stats = fs.statSync(FAVICON_ICO);
    console.log(`✅ favicon.ico criado com sucesso!`);
    console.log(`   Tamanho: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log(`   Localização: ${FAVICON_ICO}`);
    
  } catch (error) {
    console.error('❌ Erro ao criar favicon.ico:', error.message);
    process.exit(1);
  }

  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║  SUCESSO                                               ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log('\n✅ Favicon gerado com sucesso!');
  console.log('\n📋 PRÓXIMOS PASSOS:');
  console.log('1. Verifique o arquivo: public/favicon.ico');
  console.log('2. Teste no navegador: npm run build && npm start');
  console.log('3. Verifique o favicon nas tabs do browser\n');
}

// Executar
generateFavicon().catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
