-- ================================================================
-- ROW LEVEL SECURITY (RLS) - BIZCONTROL 360 ERP
-- ================================================================
-- Execute este SQL no SQL Editor do Supabase
-- 
-- OBJETIVO:
-- Adicionar camada EXTRA de segurança no banco de dados
-- Mesmo se houver bug no código, RLS protege dados entre empresas
-- 
-- ESTRATÉGIA:
-- 1. Políticas baseadas em company_id (multi-tenancy)
-- 2. Suporte a diferentes roles (ADMIN, GESTOR, VENDEDOR)
-- 3. ADMIN vê tudo, outros veem apenas sua empresa
-- ================================================================

-- ================================================================
-- PARTE 1: HABILITAR RLS NAS TABELAS
-- ================================================================

-- Tabelas de negócio (precisam isolamento por empresa)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE return_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Tabelas de autenticação (não precisam RLS - gerenciadas pela app)
-- users: Não habilita RLS (usuários são globais)
-- login_attempts: Não habilita RLS (segurança global)
-- rate_limit_entries: Não habilita RLS (segurança global)

-- ================================================================
-- PARTE 2: CRIAR FUNÇÃO AUXILIAR
-- ================================================================

-- Função para obter company_id do contexto atual
-- A aplicação Server API define isto antes de cada query
CREATE OR REPLACE FUNCTION auth.current_company_id() 
RETURNS TEXT AS $$
  SELECT NULLIF(current_setting('app.company_id', TRUE), '')::TEXT;
$$ LANGUAGE SQL STABLE;

-- Função para obter role do contexto atual
CREATE OR REPLACE FUNCTION auth.current_user_role() 
RETURNS TEXT AS $$
  SELECT NULLIF(current_setting('app.user_role', TRUE), '')::TEXT;
$$ LANGUAGE SQL STABLE;

-- Função para verificar se é ADMIN
CREATE OR REPLACE FUNCTION auth.is_admin() 
RETURNS BOOLEAN AS $$
  SELECT COALESCE(auth.current_user_role() = 'ADMIN', FALSE);
$$ LANGUAGE SQL STABLE;

-- ================================================================
-- PARTE 3: POLÍTICAS RLS PARA COMPANIES
-- ================================================================

-- ADMIN vê todas as empresas, outros veem apenas a sua
CREATE POLICY "companies_select_policy" ON companies
  FOR SELECT
  USING (
    auth.is_admin() OR 
    id = auth.current_company_id()
  );

-- ADMIN pode inserir/atualizar qualquer empresa
-- GESTOR pode atualizar apenas sua empresa
CREATE POLICY "companies_update_policy" ON companies
  FOR UPDATE
  USING (
    auth.is_admin() OR 
    id = auth.current_company_id()
  );

-- Apenas ADMIN pode criar empresas
CREATE POLICY "companies_insert_policy" ON companies
  FOR INSERT
  WITH CHECK (auth.is_admin());

-- Apenas ADMIN pode deletar empresas
CREATE POLICY "companies_delete_policy" ON companies
  FOR DELETE
  USING (auth.is_admin());

-- ================================================================
-- PARTE 4: POLÍTICAS RLS PARA EMPLOYEES
-- ================================================================

-- Ver apenas funcionários da própria empresa
CREATE POLICY "employees_select_policy" ON employees
  FOR SELECT
  USING (
    auth.is_admin() OR 
    company_id = auth.current_company_id()
  );

-- ADMIN e GESTOR podem criar funcionários
CREATE POLICY "employees_insert_policy" ON employees
  FOR INSERT
  WITH CHECK (
    auth.is_admin() OR 
    (auth.current_user_role() IN ('GESTOR') AND company_id = auth.current_company_id())
  );

-- ADMIN e GESTOR podem atualizar funcionários
CREATE POLICY "employees_update_policy" ON employees
  FOR UPDATE
  USING (
    auth.is_admin() OR 
    (auth.current_user_role() IN ('GESTOR') AND company_id = auth.current_company_id())
  );

-- ADMIN e GESTOR podem deletar funcionários
CREATE POLICY "employees_delete_policy" ON employees
  FOR DELETE
  USING (
    auth.is_admin() OR 
    (auth.current_user_role() IN ('GESTOR') AND company_id = auth.current_company_id())
  );

-- ================================================================
-- PARTE 5: POLÍTICAS RLS PARA CATEGORIES
-- ================================================================

CREATE POLICY "categories_all_policy" ON categories
  FOR ALL
  USING (
    auth.is_admin() OR 
    company_id = auth.current_company_id()
  )
  WITH CHECK (
    auth.is_admin() OR 
    company_id = auth.current_company_id()
  );

-- ================================================================
-- PARTE 6: POLÍTICAS RLS PARA PRODUCTS
-- ================================================================

CREATE POLICY "products_all_policy" ON products
  FOR ALL
  USING (
    auth.is_admin() OR 
    company_id = auth.current_company_id()
  )
  WITH CHECK (
    auth.is_admin() OR 
    company_id = auth.current_company_id()
  );

-- ================================================================
-- PARTE 7: POLÍTICAS RLS PARA DISCOUNTS
-- ================================================================

CREATE POLICY "discounts_all_policy" ON discounts
  FOR ALL
  USING (
    auth.is_admin() OR 
    company_id = auth.current_company_id()
  )
  WITH CHECK (
    auth.is_admin() OR 
    company_id = auth.current_company_id()
  );

-- ================================================================
-- PARTE 8: POLÍTICAS RLS PARA SALES
-- ================================================================

-- Todos podem ver vendas da própria empresa
CREATE POLICY "sales_select_policy" ON sales
  FOR SELECT
  USING (
    auth.is_admin() OR 
    company_id = auth.current_company_id()
  );

-- Todos podem criar vendas (apenas para sua empresa)
CREATE POLICY "sales_insert_policy" ON sales
  FOR INSERT
  WITH CHECK (
    auth.is_admin() OR 
    company_id = auth.current_company_id()
  );

-- ADMIN e GESTOR podem atualizar vendas
CREATE POLICY "sales_update_policy" ON sales
  FOR UPDATE
  USING (
    auth.is_admin() OR 
    (auth.current_user_role() IN ('GESTOR') AND company_id = auth.current_company_id())
  );

-- Apenas ADMIN pode deletar vendas
CREATE POLICY "sales_delete_policy" ON sales
  FOR DELETE
  USING (auth.is_admin());

-- ================================================================
-- PARTE 9: POLÍTICAS RLS PARA SALE_ITEMS
-- ================================================================

-- Sale items herdam permissões da sale pai
CREATE POLICY "sale_items_all_policy" ON sale_items
  FOR ALL
  USING (
    auth.is_admin() OR 
    EXISTS (
      SELECT 1 FROM sales 
      WHERE sales.id = sale_items.sale_id 
        AND sales.company_id = auth.current_company_id()
    )
  )
  WITH CHECK (
    auth.is_admin() OR 
    EXISTS (
      SELECT 1 FROM sales 
      WHERE sales.id = sale_items.sale_id 
        AND sales.company_id = auth.current_company_id()
    )
  );

-- ================================================================
-- PARTE 10: POLÍTICAS RLS PARA RETURNS
-- ================================================================

CREATE POLICY "returns_select_policy" ON returns
  FOR SELECT
  USING (
    auth.is_admin() OR 
    company_id = auth.current_company_id()
  );

CREATE POLICY "returns_insert_policy" ON returns
  FOR INSERT
  WITH CHECK (
    auth.is_admin() OR 
    company_id = auth.current_company_id()
  );

-- Apenas ADMIN e GESTOR podem atualizar/deletar devoluções
CREATE POLICY "returns_update_policy" ON returns
  FOR UPDATE
  USING (
    auth.is_admin() OR 
    (auth.current_user_role() IN ('GESTOR') AND company_id = auth.current_company_id())
  );

CREATE POLICY "returns_delete_policy" ON returns
  FOR DELETE
  USING (auth.is_admin());

-- ================================================================
-- PARTE 11: POLÍTICAS RLS PARA RETURN_ITEMS
-- ================================================================

-- Return items herdam permissões do return pai
CREATE POLICY "return_items_all_policy" ON return_items
  FOR ALL
  USING (
    auth.is_admin() OR 
    EXISTS (
      SELECT 1 FROM returns 
      WHERE returns.id = return_items.return_id 
        AND returns.company_id = auth.current_company_id()
    )
  )
  WITH CHECK (
    auth.is_admin() OR 
    EXISTS (
      SELECT 1 FROM returns 
      WHERE returns.id = return_items.return_id 
        AND returns.company_id = auth.current_company_id()
    )
  );

-- ================================================================
-- PARTE 12: POLÍTICAS RLS PARA RESERVATIONS
-- ================================================================

CREATE POLICY "reservations_all_policy" ON reservations
  FOR ALL
  USING (
    auth.is_admin() OR 
    company_id = auth.current_company_id()
  )
  WITH CHECK (
    auth.is_admin() OR 
    company_id = auth.current_company_id()
  );

-- ================================================================
-- PARTE 13: POLÍTICAS RLS PARA AUDIT_LOGS
-- ================================================================

-- Audit logs são read-only
CREATE POLICY "audit_logs_select_policy" ON audit_logs
  FOR SELECT
  USING (
    auth.is_admin() OR 
    company_id = auth.current_company_id()
  );

-- Apenas a aplicação pode inserir logs (via service role)
CREATE POLICY "audit_logs_insert_policy" ON audit_logs
  FOR INSERT
  WITH CHECK (TRUE);  -- App sempre pode inserir

-- Apenas ADMIN pode deletar logs (para compliance)
CREATE POLICY "audit_logs_delete_policy" ON audit_logs
  FOR DELETE
  USING (auth.is_admin());

-- ================================================================
-- PARTE 14: VERIFICAÇÃO
-- ================================================================

-- Ver todas as políticas RLS criadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Ver quais tabelas têm RLS habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = TRUE
ORDER BY tablename;

-- ================================================================
-- FIM DAS POLÍTICAS RLS
-- ================================================================
-- 
-- PRÓXIMO PASSO:
-- Atualizar a aplicação Server API para definir o contexto antes das queries
-- Ver arquivo: supabase-rls-integration.ts (será criado)
-- ================================================================
