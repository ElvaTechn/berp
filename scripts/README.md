# Scripts Utilitários - BizControl 360

## 📁 convert-icons.js

Script Node.js para converter ícones SVG para PNG quando necessário.

### 🚀 Uso Rápido

```bash
# 1. Instalar dependência
npm install sharp

# 2. Executar script
node scripts/convert-icons.js
```

### 📋 O Que Faz

- ✅ Converte todos os SVGs em `public/icons/` para PNG
- ✅ Cria `apple-touch-icon.png` (180x180)
- ✅ Cria `favicon-32x32.png`
- ✅ Mantém qualidade máxima (PNG quality 100)
- ✅ Pula arquivos já existentes
- ✅ Mostra relatório detalhado

### 🎯 Quando Usar

**Use este script se:**
- Precisa suportar iOS Safari 13 ou anterior
- Quer garantir 100% compatibilidade
- Está tendo problemas com SVGs em alguns dispositivos

**NÃO use se:**
- SVGs estão funcionando bem (já implementado)
- Prefere tamanho de arquivo menor
- Só precisa Android + iOS 14+

### 📊 Saída Esperada

```
╔════════════════════════════════════════════════════════╗
║  ICON CONVERTER - BIZCONTROL 360 ERP                  ║
╚════════════════════════════════════════════════════════╝

🎨 Convertendo ícones SVG para PNG...

✅ Convertido: icon-72x72.png
✅ Convertido: icon-96x96.png
✅ Convertido: icon-128x128.png
✅ Convertido: icon-144x144.png
✅ Convertido: icon-152x152.png
✅ Convertido: icon-384x384.png

📱 Criando apple-touch-icon.png...
✅ Convertido: apple-touch-icon.png

🔖 Criando favicon...
✅ Convertido: favicon-32x32.png

╔════════════════════════════════════════════════════════╗
║  RESUMO                                                ║
╚════════════════════════════════════════════════════════╝
✅ Convertidos: 8
⏭️  Pulados: 0
❌ Erros: 0

✅ Conversão concluída com sucesso!

📋 PRÓXIMOS PASSOS:
1. Verifique os ícones gerados em public/icons/
2. Teste o PWA: npm run build && npm start
3. Verifique instalabilidade no Chrome DevTools
```

### ⚙️ Configuração Avançada

Edite o script para ajustar:

```javascript
// Cor de fundo (linha 21)
const BG_COLOR = { r: 37, g: 99, b: 235, alpha: 1 }; // #2563eb

// Tamanhos para converter (linha 24)
const ICON_SIZES = [72, 96, 128, 144, 152, 384];

// Qualidade PNG (linha 38)
png({
  quality: 100,           // 0-100
  compressionLevel: 9     // 0-9
})
```

### 🛠️ Troubleshooting

#### Erro: "Sharp não instalado"
```bash
npm install sharp
```

#### Erro: "ENOENT: no such file"
```bash
# Verifique se está na raiz do projeto
cd /caminho/para/berp
node scripts/convert-icons.js
```

#### Erro: "Permission denied"
```bash
# Windows PowerShell como Admin
Set-ExecutionPolicy RemoteSigned

# Linux/Mac
chmod +x scripts/convert-icons.js
```

### 📚 Mais Informações

Ver documentação completa:
- `docs/PWA_ICONES_RELATORIO.md` - Relatório de correções
- `docs/PWA_AUDITORIA_COMPLETA.md` - Auditoria original
- `PWA_QUICK_START.md` - Guia de teste

---

**Criado:** 30 Dezembro 2025  
**Versão:** 1.0.0  
**Compatibilidade:** Node.js 14+
