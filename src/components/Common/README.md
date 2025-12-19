/*
╔═══════════════════════════════════════════════════════════════════════════╗
║                    BIZCONTROL 360 - GUIA DE INSTALAÇÃO                    ║
║                     Sistema de Gestão Empresarial                          ║
╚═══════════════════════════════════════════════════════════════════════════╝

📋 SOBRE O PROJETO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BizControl 360 é um sistema completo de gestão empresarial desenvolvido para
Moçambique, com suporte para múltiplas empresas (multi-tenancy), gestão de
stock, vendas, reservas e relatórios detalhados.

🎯 FUNCIONALIDADES PRINCIPAIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PARA SUPER ADMIN:
  • Dashboard global com visão de todas as empresas
  • Gestão de empresas (criar, activar/desactivar subscrições)
  • Monitoramento de estatísticas gerais do sistema

PARA GESTORES DE EMPRESA:
  • Dashboard com métricas de vendas e lucros
  • Ponto de Venda (POS) completo
  • Gestão de produtos e stock
  • Sistema de categorias por sector de negócio
  • Gestão de reservas de clientes
  • Relatórios detalhados (vendas, lucros, produtos mais vendidos)
  • Gestão de equipa (adicionar vendedores)
  • Alertas de stock baixo
  • Cálculo automático de lucros
  • Definições da empresa

PARA VENDEDORES:
  • Acesso ao Ponto de Venda
  • Visualização de produtos e stock
  • Gestão de reservas

📱 TELAS DO SISTEMA (11 PÁGINAS)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1.  Setup            - Configuração inicial da empresa
2.  Dashboard        - Visão geral do negócio (gestor)
3.  AdminDashboard   - Dashboard do super admin
4.  AdminCompanies   - Gestão de empresas (super admin)
5.  PointOfSale      - Ponto de venda completo
6.  Products         - Gestão de produtos e stock
7.  Categories       - Gestão de categorias
8.  Reservations     - Sistema de reservas de clientes
9.  Reports          - Relatórios e análises de vendas
10. Team             - Gestão de equipa e funcionários
11. Settings         - Definições da empresa e subscrição

🚀 COMO EXECUTAR LOCALMENTE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 PRÉ-REQUISITOS:

Antes de começar, certifique-se de ter instalado:

✓ Node.js (versão 18 ou superior)
  Download: https://nodejs.org/
  
✓ npm (vem incluído com Node.js)

✓ Uma conta na plataforma Base44
  Criar conta: https://base44.com


📥 INSTALAÇÃO PASSO A PASSO:

1️⃣ CLONAR OU BAIXAR O PROJETO
   
   Se você tem o projeto em um repositório Git:
   
   git clone [URL_DO_REPOSITORIO]
   cd bizcontrol360
   
   Ou extraia o arquivo ZIP para uma pasta


2️⃣ INSTALAR DEPENDÊNCIAS
   
   Abra o terminal/prompt de comando na pasta do projeto e execute:
   
   npm install
   
   Este comando irá instalar todas as bibliotecas necessárias.
   Pode demorar alguns minutos na primeira vez.


3️⃣ CONFIGURAR VARIÁVEIS DE AMBIENTE
   
   Crie um arquivo chamado .env na raiz do projeto com:
   
   VITE_BASE44_APP_ID=seu_app_id_aqui
   VITE_BASE44_OWNER=seu_email_base44_aqui
   
   Como obter estas informações:
   • Acesse base44.com
   • Faça login na sua conta
   • Vá para o dashboard do seu app
   • Copie o App ID e o Owner email das configurações


4️⃣ EXECUTAR O PROJETO
   
   npm run dev
   
   Aguarde a mensagem:
   
   ➜  Local:   http://localhost:5173/
   ➜  Network: use --host to expose


5️⃣ ABRIR NO NAVEGADOR
   
   Acesse: http://localhost:5173/
   
   Você verá a tela de login/setup do BizControl 360


🛠️ COMANDOS ÚTEIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Criar build de produção
npm run build

# Pré-visualizar build de produção
npm run preview

# Limpar cache e reinstalar (se tiver problemas)
rm -rf node_modules package-lock.json
npm install


🔧 RESOLUÇÃO DE PROBLEMAS COMUNS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ Erro: "comando npm não encontrado"
   ✓ Solução: Instale o Node.js do site oficial (nodejs.org)

❌ Erro: "porta 5173 já está em uso"
   ✓ Solução: Feche outros projetos ou mude a porta no vite.config.js

❌ Erro ao fazer login
   ✓ Verifique se as variáveis de ambiente (.env) estão corretas
   ✓ Certifique-se de que seu app está activo na plataforma Base44

❌ Página em branco após login
   ✓ Abra o console do navegador (F12) para ver erros
   ✓ Verifique se todas as entities foram criadas no Base44


📱 PWA (PROGRESSIVE WEB APP)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  IMPORTANTE: Actualmente o BizControl 360 NÃO está configurado como PWA.

Para funcionar como app mobile instalável, seria necessário:
  1. Adicionar um arquivo manifest.json com ícones e configurações
  2. Implementar Service Workers para cache offline
  3. Adicionar meta tags específicas para PWA
  4. Gerar ícones em múltiplos tamanhos (192x192, 512x512, etc.)

FUNCIONAMENTO ACTUAL NO MOBILE:
  ✓ O app funciona perfeitamente no navegador mobile (Chrome, Safari)
  ✓ É totalmente responsivo e adapta-se a telas pequenas
  ✓ Pode ser adicionado à tela inicial como atalho
  ✗ Mas não é um PWA nativo (não funciona offline)


🌐 ACESSO ATRAVÉS DA INTERNET
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

O app pode ser acessado de qualquer lugar através da plataforma Base44:

1. Faça deploy na plataforma Base44
2. Acesse através do URL fornecido pela plataforma
3. Funciona em qualquer dispositivo com navegador (PC, tablet, telemóvel)
4. Não requer instalação - acesso via web


💡 SECTORES DE NEGÓCIO SUPORTADOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

O sistema cria categorias automáticas personalizadas para cada sector:

  1. Ferragem / Ferramentas     → 8 categorias (pregos, parafusos, tintas...)
  2. Bebidas                    → 7 categorias (refrigerantes, cervejas...)
  3. Farmácia                   → 6 categorias (medicamentos, suplementos...)
  4. Supermercado               → 8 categorias (mercearia, congelados...)
  5. Restaurante / Café         → 6 categorias (entradas, pratos, sobremesas...)
  6. Loja de Roupa              → 6 categorias (homem, mulher, criança...)
  7. Electrónica                → 6 categorias (telemóveis, computadores...)
  8. Papelaria                  → 6 categorias (cadernos, canetas...)
  9. Materiais de Construção    → 6 categorias (cimento, madeira...)
  10. Agropecuária              → 6 categorias (sementes, ração...)
  11. Cosméticos e Beleza       → 6 categorias (faciais, maquilhagem...)
  12. Livraria                  → 6 categorias (ficção, infantis...)
  13. Outro                     → Permite CATEGORIAS PERSONALIZADAS!

✨ NOVO: Quando escolher "Outro" como sector, você pode criar suas próprias
         categorias personalizadas separadas por vírgula!


📧 SUPORTE E DOCUMENTAÇÃO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• Documentação Base44: docs.base44.com
• Email de suporte: support@base44.com
• Community: base44.com/community


📝 ESTRUTURA DO PROJETO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BizControl360/
├── entities/              # Entidades do banco de dados (JSON schemas)
│   ├── Company.json
│   ├── Product.json
│   ├── Category.json
│   ├── Sale.json
│   ├── Reservation.json
│   └── Employee.json
│
├── pages/                 # Páginas da aplicação
│   ├── Setup.jsx
│   ├── Dashboard.jsx
│   ├── AdminDashboard.jsx
│   ├── AdminCompanies.jsx
│   ├── PointOfSale.jsx
│   ├── Products.jsx
│   ├── Categories.jsx
│   ├── Reservations.jsx
│   ├── Reports.jsx
│   ├── Team.jsx
│   └── Settings.jsx
│
├── components/            # Componentes reutilizáveis
│   ├── common/           # Componentes comuns
│   └── admin/            # Componentes admin (templates de categorias)
│
├── Layout.js             # Layout principal (sidebar, header)
├── .env                  # Variáveis de ambiente (não versionar!)
├── package.json          # Dependências do projeto
└── vite.config.js        # Configuração do Vite


🎨 TECNOLOGIAS UTILIZADAS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• React 18            - Framework JavaScript
• TailwindCSS         - Estilização
• Base44 SDK          - Backend as a Service
• Shadcn/ui           - Componentes UI
• Recharts            - Gráficos e visualizações
• Lucide React        - Ícones
• React Router DOM    - Navegação
• Moment.js           - Formatação de datas
• React Query         - Gestão de estado de servidor


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                  Desenvolvido com ❤️ para Moçambique
                         BizControl 360 v1.0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

*/

export default function GuiaInstalacao() {
  return null;
}