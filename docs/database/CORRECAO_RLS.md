# 🔧 Correção RLS - Erro de Permissão Resolvido

**Erro Original:**
```
ERROR: 42501: permission denied for schema auth
```

---

## ❌ **O QUE ESTAVA ERRADO:**

O SQL tentava criar funções no schema `auth`:

```sql
-- ❌ ERRADO
CREATE FUNCTION auth.current_company_id() ...
```

**Problema:** O schema `auth` é gerenciado pelo Supabase e usuários não têm permissão para criar objetos lá.

---

## ✅ **CORREÇÃO APLICADA:**

Movemos as funções para o schema `public`:

```sql
-- ✅ CORRETO
CREATE FUNCTION public.current_company_id() ...
CREATE FUNCTION public.current_user_role() ...
CREATE FUNCTION public.is_admin() ...
```

**Todas as políticas agora usam:** `public.is_admin()` ao invés de `auth.is_admin()`

---

## 🚀 **COMO APLICAR (AGORA):**

### **PASSO 1: Usar o SQL Corrigido**

Arquivo: **`supabase-rls-policies-fixed.sql`** ✅

---

### **PASSO 2: Executar no Supabase**

1. Abra o Supabase SQL Editor
2. Copie TODO o conteúdo de: `supabase-rls-policies-fixed.sql`
3. Cole no SQL Editor
4. Execute (Run)

---

### **PASSO 3: Verificar Resultado**

Após executar, você deve ver no final:

**Funções criadas:**
```
public | current_company_id | FUNCTION
public | current_user_role  | FUNCTION
public | is_admin           | FUNCTION
```

**Tabelas com RLS:**
```
companies      | true
employees      | true
categories     | true
products       | true
... (14 total)
```

**Políticas criadas:**
```
25+ políticas RLS
```

---

## 🧪 **TESTAR RLS:**

Após aplicar, teste no SQL Editor:

```sql
-- Teste 1: Sem contexto
SELECT * FROM products;
-- Resultado: 0 linhas (RLS bloqueou)

-- Teste 2: Com contexto
SELECT set_config('app.company_id', 'teste-id', TRUE);
SELECT set_config('app.user_role', 'VENDEDOR', TRUE);
SELECT * FROM products;
-- Resultado: Produtos filtrados por empresa
```

---

## ✅ **DIFERENÇAS ENTRE ARQUIVOS:**

| Arquivo | Status | Usar? |
|---------|--------|-------|
| `supabase-rls-policies.sql` | ❌ Com erro | NÃO |
| `supabase-rls-policies-fixed.sql` | ✅ Corrigido | SIM ✅ |

---

## 📊 **O QUE MUDOU:**

### **Antes (com erro):**
```sql
CREATE FUNCTION auth.current_company_id() ...
                ^^^^ Schema auth (sem permissão)

CREATE POLICY "..." USING (auth.is_admin() OR ...)
                          ^^^^ Chama auth.is_admin()
```

### **Depois (corrigido):**
```sql
CREATE FUNCTION public.current_company_id() ...
                ^^^^^^ Schema public (tem permissão)

CREATE POLICY "..." USING (public.is_admin() OR ...)
                          ^^^^^^ Chama public.is_admin()
```

---

## 🎯 **PRÓXIMO PASSO:**

```bash
# 1. Abrir Supabase SQL Editor
# 2. Copiar: supabase-rls-policies-fixed.sql
# 3. Executar (Run)
# 4. Verificar resultado
# 5. Testar com queries
```

---

**AGORA DEVE FUNCIONAR!** ✅

Execute o SQL corrigido e me avise o resultado! 🚀
