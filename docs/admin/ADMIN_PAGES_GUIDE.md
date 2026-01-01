# 📚 Guia das Páginas Admin - BizControl 360 ERP

## 🎯 Propósito de Cada Página

### 1. 📊 **Dashboard** (`/admin/dashboard` ou `/admin`)
**Para que serve:**
- Visão geral do sistema inteiro
- Estatísticas globais (empresas, usuários, vendas)
- KPIs principais
- Gráficos de crescimento

**Quem usa:**
- Super Admin para monitorar o negócio
- Ver saúde geral da plataforma

---

### 2. 🏢 **Empresas** (`/admin/companies`)
**Para que serve:**
- Gerenciar TODAS as empresas clientes
- Criar novas empresas
- Ver detalhes de cada cliente
- Impersonar (entrar como suporte)
- Renovar subscrições
- Suspender empresas

**Quem usa:**
- Time de vendas (criar novos clientes)
- Suporte (ajudar clientes)
- Admin (gerenciar contratos)

**Funcionalidades principais:**
- ✅ CRUD completo de empresas
- ✅ Modal de criação com validação
- ✅ Busca e filtros por status
- ✅ Actions: View, Renew, Suspend

---

### 3. 📋 **Auditoria** (`/admin/audit`)
**Para que serve:**
- **Registro de TODAS as ações do sistema**
- Ver quem fez o quê, quando e onde
- Detectar atividades suspeitas
- Compliance (regulamentações)
- Debug de problemas

**O que é registrado:**
- ✅ Logins/Logouts
- ✅ CRUDs (Create, Update, Delete)
- ✅ Alterações em dados sensíveis
- ✅ Tentativas de acesso negadas
- ✅ Erros do sistema

**Informações por log:**
- 👤 **Quem:** Nome + Email + Empresa
- 📅 **Quando:** Data/Hora exata
- 🎯 **O que:** Tipo de ação (CREATE, UPDATE, DELETE, LOGIN, etc.)
- 📦 **Onde:** Recurso afetado (PRODUCT, USER, SALE, etc.)
- 🌐 **IP:** Endereço IP do usuário
- ✅/❌ **Status:** Sucesso ou Falha
- 📝 **Detalhes:** JSON com dados específicos

**Exemplo de uso:**
- Cliente reclama: "Alguém apagou produtos!"
  → Você vai em Auditoria, filtra por DELETE + PRODUCT + Empresa
  → Vê exatamente quem apagou, quando, e quais produtos

**Filtros disponíveis:**
- Por ação (CREATE, UPDATE, DELETE, etc.)
- Por recurso (AUTH, COMPANY, PRODUCT, etc.)
- Por status (Sucesso/Falha)
- Por data (range)
- Por usuário

---

### 4. 🖥️ **Sistema** (`/admin/system`)
**Para que serve:**
- **Monitorar saúde da infraestrutura**
- Status de serviços (Database, API, Storage)
- Uptime do sistema
- Estatísticas técnicas

**Health Checks:**
- 🟢 **Database:** PostgreSQL online?
- 🟢 **API:** Endpoints respondendo?
- 🟢 **Storage:** Espaço disponível?
- 📊 **Uptime:** % de disponibilidade

**Actions:**
- Backup global
- Reiniciar serviços (em desenvolvimento)
- Validar integridade (em desenvolvimento)
- Ver logs de erro (em desenvolvimento)

**Quem usa:**
- DevOps/SysAdmin
- Time técnico

---

### 5. ⚙️ **Configurações** (`/admin/settings`)
**Para que serve:**
- Configurações globais da plataforma
- Políticas de segurança
- Notificações
- Localização (idioma, fuso horário, moeda)
- Branding (logo, cores)

**Categorias:**
- 🛡️ **Segurança:** Políticas de senha, 2FA
- 🗄️ **Base de Dados:** Backup, restore
- 🔔 **Notificações:** Email, SMS
- 🌍 **Localização:** Idioma, timezone
- 🎨 **Aparência:** Logo, cores

**Status:** Em desenvolvimento (cards de navegação prontos)

---

### 6. 💳 **Subscrições** (`/admin/subscriptions`)
**Para que serve:**
- Gerenciar subscrições de TODAS as empresas
- Ver quais estão ativas/expiradas
- Renovar manualmente
- Suspender acesso
- Alertas de expiração

**Stats:**
- Total de subscrições
- Ativas
- A expirar (próximos 7 dias)
- Inativas

**Actions por empresa:**
- ✅ **Activar:** Dar 1 mês de acesso
- 🔄 **Renovar:** +1 mês, +3 meses, etc.
- ❌ **Suspender:** Bloquear acesso

**Quem usa:**
- Financeiro (controlar pagamentos)
- Vendas (renovações)
- Admin (gestão de contratos)

---

### 7. 💾 **Backup** (`/admin/backup`)
**Para que serve:**
- Criar backups manuais do sistema
- Ver histórico de backups
- Download de backups anteriores
- Configurar backup automático

**O que é incluído no backup:**
- ✅ Empresas e proprietários
- ✅ Funcionários
- ✅ Produtos e categorias
- ✅ Vendas e itens
- ✅ Reservas
- ✅ Metadados do sistema

**Formato:** JSON (fácil de importar)

**Backup automático:**
- Toggle para ativar/desativar
- Diariamente às 02:00 AM
- Guardado no storage

**Quando usar:**
- Antes de grandes mudanças
- Antes de updates do sistema
- Regularmente (segurança)
- Compliance (regulamentações)

---

## 🔐 **Segurança e Permissões**

**Todas essas páginas são APENAS para SUPER ADMIN:**
- Role: `ADMIN` (não `OWNER` ou `EMPLOYEE`)
- Requer autenticação especial
- Acesso a TODAS as empresas

**O que um ADMIN pode fazer:**
- ✅ Ver dados de TODAS as empresas
- ✅ Impersonar (entrar como cliente para suporte)
- ✅ Criar/Editar/Deletar empresas
- ✅ Gerenciar subscrições
- ✅ Ver logs de auditoria
- ✅ Fazer backups do sistema

---

## 📊 **Fluxo de Trabalho Típico**

### **Onboarding de novo cliente:**
1. **Empresas** → Criar nova empresa
2. Sistema envia email com credenciais
3. **Subscrições** → Verificar trial ativo
4. **Auditoria** → Confirmar conta criada

### **Suporte a cliente:**
1. **Empresas** → Buscar cliente
2. Click "Ver como cliente" (impersonar)
3. Navegar no sistema como se fosse o cliente
4. Resolver problema
5. **Auditoria** → Registra todas as ações de suporte

### **Renovação de contrato:**
1. **Subscrições** → Ver empresas a expirar
2. Contactar cliente
3. Renovar +X meses
4. **Auditoria** → Registra renovação

### **Investigação de problema:**
1. Cliente reporta: "Meus produtos sumiram!"
2. **Auditoria** → Filtrar por DELETE + PRODUCT + Empresa
3. Ver quem apagou, quando, IP
4. Restaurar de backup se necessário

---

## 🎯 **Métricas e KPIs**

**Dashboard Admin mostra:**
- 📈 Total de empresas ativas
- 💰 Receita mensal recorrente (MRR)
- 👥 Total de usuários no sistema
- 📦 Total de produtos cadastrados
- 🛒 Total de vendas
- ⚠️ Empresas a expirar (alerta)

---

## 🚀 **Roadmap - Próximas Funcionalidades**

**Auditoria:**
- [ ] Exportar logs para CSV/Excel
- [ ] Alertas automáticos (ex: múltiplas tentativas de login)
- [ ] Integração com SIEM

**Subscrições:**
- [ ] Planos (Basic, Pro, Enterprise)
- [ ] Pagamento automático (M-Pesa, e-Mola)
- [ ] Faturação automática

**Sistema:**
- [ ] Métricas de performance (latência, throughput)
- [ ] Logs de erro detalhados
- [ ] Alertas de monitoramento (email/SMS)

**Backup:**
- [ ] Restauração automática
- [ ] Backup incremental (só mudanças)
- [ ] Backup para cloud (S3, Azure)

---

## 📞 **Quando Usar Cada Página**

| Situação | Página |
|----------|--------|
| Novo cliente assinou | **Empresas** (criar) |
| Cliente não consegue pagar | **Subscrições** (renovar/suspender) |
| Investigar atividade suspeita | **Auditoria** (filtrar logs) |
| Cliente reclama que dados sumiram | **Auditoria** + **Backup** |
| Sistema lento/offline | **Sistema** (health check) |
| Mudança de política de senha | **Configurações** |
| Cliente pediu suporte | **Empresas** (impersonar) |
| Fim do dia | **Dashboard** (ver métricas) |
| Antes de update | **Backup** (criar manual) |

---

**Criado:** 28/12/2025  
**Versão:** 1.0.0  
**Status:** Completo ✅
