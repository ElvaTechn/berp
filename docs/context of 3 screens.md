 SUPER ADMIN - 3 TELAS DETALHADAS
1️⃣ AdminDashboard - Dashboard Administrativo
🎯 PROPÓSITO
Visão global executiva de TODAS as empresas cadastradas no sistema BizControl 360. O Super Admin vê estatísticas agregadas de múltiplas empresas.

📊 ESTATÍSTICAS PRINCIPAIS (4 Cards)
Total de Empresas

Contador de todas empresas no sistema
Ícone: Building2
Cor: Primary (azul)
Subscrições Activas

Empresas com subscription_status === 'activo'
Mostra percentual do total: (activas / total) * 100
Ícone: CheckCircle
Cor: Success (verde)
Total de Funcionários

Soma de TODOS os Employee records (todas empresas)
Ícone: Users
Cor: Default (cinza)
Total de Produtos

Soma de TODOS os Product records (todas empresas)
Ícone: Activity
Cor: Warning (amarelo)
📈 GRÁFICOS
A) Empresas por Status (Pie Chart)

// Distribui empresas por subscription_status
{
  Activo: 15 empresas,
  Pendente: 8 empresas,
  Inactivo: 3 empresas
}
// Cores: Verde, Amarelo, Vermelho
B) Tipo de Subscrição (Bar Chart)

// Distribui empresas por subscription_type
{
  Mensal: 18 empresas,
  Anual: 8 empresas
}
// Cor: Azul
📋 EMPRESAS RECENTES (Lista)
Mostra 5 empresas mais recentes (ordenadas por created_date DESC)
Para cada empresa:
Ícone: Building2 com gradient azul
Nome da empresa
Email do gestor
Badge de status (activo/pendente/inactivo)
Data de criação (formato DD/MM/YYYY)
🔐 CONTROLE DE ACESSO
if (user.role !== 'admin') {
  // Redireciona para home
  window.location.href = '/';
}
2️⃣ AdminCompanies - Gestão de Empresas
🎯 PROPÓSITO
CRUD completo de empresas. O Super Admin pode criar, visualizar, activar/desactivar empresas.

📊 STATS CARDS (3 Cards com Design Ousado)
Card 1 - Activas

Gradient: Ocean (turquesa → ciano → lime néon)
Ícone com glow: CheckCircle
Contador: Empresas com status 'activo'
Hover: scale(1.05)
Card 2 - Pendentes

Gradient: Sunset (amarelo → coral → terracota)
Ícone com glow: Clock
Contador: Empresas com status 'pendente'
Card 3 - Inactivas

Gradient: Neon (magenta → rosa néon → coral)
Ícone com glow: XCircle
Contador: Empresas com status 'inactivo'
🔍 FILTROS
Busca (Input com ícone Search)

Pesquisa por: Nome, Email, NUIT
Live search (onChange)
Filter por Status (Select)

Opções: Todos, Activo, Pendente, Inactivo
📋 TABELA DE EMPRESAS
Colunas:

Empresa

Ícone: Building2 com gradient
Nome + Endereço (subtitle)
NUIT - Número de contribuinte

Email - Email da empresa

Telefone - Contacto

Tipo (2 linhas)

Badge: subscription_type (Mensal/Anual)
Label: business_sector (ex: "Ferragem")
Status

Badge com ícone: Activo/Pendente/Inactivo
Cores: Verde/Amarelo/Vermelho
Criada em

Ícone: Calendar
Formato: DD/MM/YYYY
Acções

Botão Activar (se inactivo): CheckCircle verde
Botão Desactivar (se activo): XCircle vermelho
Toggle subscription_status entre 'activo' e 'inactivo'
➕ CRIAR NOVA EMPRESA (Dialog)
Formulário:

{
  name: "Nome da Empresa *",
  nuit: "NUIT",
  owner_email: "Email do Gestor *", // Email que será o gestor
  phone: "Telefone",
  address: "Endereço",
  business_sector: "Sector de Negócio *", // Select com BUSINESS_SECTORS
  custom_categories: "Categorias Personalizadas" // Só se sector === 'outro'
}
Lógica de Categorias:

Se sector !== 'outro':

Usa templates pré-definidos (CATEGORY_TEMPLATES[sector])
Ex: "ferragem" → cria automaticamente ["Pregos", "Parafusos", "Ferramentas", ...]
Mostra preview: "8 categorias serão criadas automaticamente"
Se sector === 'outro':

Campo Textarea para categorias personalizadas
Input separado por vírgula: "Electrónica, Acessórios, Peças"
Parse: split(',').map(cat => cat.trim())
Cores atribuídas automaticamente do array colors
Ao Criar:

1. Criar Company record
2. Criar categorias (template OU custom)
3. subscription_status: 'activo' por padrão
3️⃣ Settings - Configurações
🎯 PROPÓSITO
Gestão de dados da empresa e informações de subscrição. Acessível tanto por Super Admin quanto por Gestor.

📐 LAYOUT (Grid 2 colunas)
COLUNA 1 (lg:col-span-2) - Dados da Empresa

Card com formulário editável:

{
  name: "Nome da Empresa",
  nuit: "NUIT",
  phone: "Telefone" (ícone: Phone),
  email: "Email" (ícone: Mail),
  address: "Endereço" (ícone: MapPin)
}
Botão "Guardar Alterações" (ícone: Save)
Loading state: "A guardar..." com Loader2 spinner
Update via: base44.entities.Company.update(company.id, formData)
COLUNA 2 - Sidebar com 2 Cards

💳 CARD 1: SUBSCRIÇÃO
Informações:

Estado

Badge com ícone:
ACTIVO: CheckCircle verde (bg-emerald-100)
INACTIVO: AlertCircle vermelho (bg-red-100)
Plano

Texto capitalizado: "Mensal" ou "Anual"
Válido até (se subscription_end_date existe)

Ícone: Calendar
Formato: DD/MM/YYYY
Botão: "Gerir Subscrição" (outline, desabilitado)

📊 CARD 2: INFORMAÇÕES DA CONTA
Quick Stats (3 linhas):

Criada em

Data de criação da empresa
Formato: DD/MM/YYYY
Seu papel

Badge: "Gestor" ou "Vendedor"
Capitalized
Email

Email do employee (truncado se longo)
Max width: 150px
🔄 LÓGICA DE CARREGAMENTO
1. Buscar user atual (base44.auth.me())
2. Buscar employee do user (Employee.filter({ user_email }))
3. Se employee existe:
   - Buscar Company usando employee.company_id
   - Popular formData com dados da empresa
4. Se employee NÃO existe:
   - Não mostra nada (tela vazia)
🎨 DESIGN NOTES
Ícones nos inputs (Phone, Mail, MapPin) - posicionados absolute left
Cards com border-0 shadow-lg
Separators entre stats de subscrição
Badges com cores consistentes (emerald/red)
Form fields com Label + Input structure
Grid responsivo: 1 coluna mobile, 3 colunas desktop
🔑 DIFERENÇA SUPER ADMIN vs GESTOR
SUPER ADMIN
AdminDashboard: Vê TODAS as empresas
AdminCompanies: Gerencia TODAS as empresas, cria novas
Settings: Pode ver, mas não deve ter empresa associada
GESTOR
Dashboard: Vê apenas SUA empresa
Não tem acesso a AdminDashboard/AdminCompanies
Settings: Edita apenas SUA empresa
📊 DADOS AGREGADOS (AdminDashboard)
Promise.all([
  base44.entities.Company.list(),    // TODAS empresas
  base44.entities.Employee.list(),   // TODOS funcionários
  base44.entities.Product.list(),    // TODOS produtos
])

// Cálculos:
totalCompanies: companies.length
activeSubscriptions: companies.filter(c => c.subscription_status === 'activo').length
totalEmployees: employees.length
totalProducts: products.length