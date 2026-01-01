# Plano de Migração: Substituição do Base44 por um Backend Próprio

Este documento descreve o plano para substituir o backend Base44 por uma solução de backend própria, garantindo que a aplicação frontend continue funcionando como esperado, mas com total independência de serviços de terceiros.

## Visão Geral

O objetivo é criar um backend customizado que forneça as mesmas funcionalidades que a aplicação frontend consumia do Base44, incluindo autenticação de usuários e operações de banco de dados (CRUD) para as entidades do sistema.

---

## Plano do Backend

### 1. Stack de Tecnologia

Para manter a consistência com o ecossistema JavaScript/TypeScript do seu projeto, a seguinte stack é recomendada:

*   **Framework:** **Node.js com Express.js** ou **NestJS**. Ambos são robustos, mas **NestJS** é recomendado por sua arquitetura organizada e uso de TypeScript, o que combina bem com seu frontend.
*   **Banco de Dados:** **PostgreSQL**. É um banco de dados relacional poderoso e de código aberto.
*   **ORM (Object-Relational Mapper):** **Prisma**. É moderno, seguro e facilita muito a interação com o banco de dados de forma type-safe.

### 2. Esquema do Banco de Dados

O banco de dados precisará de tabelas que correspondam às suas `Entidades` em `src/Entities`. Com base na análise do seu código, o esquema inicial seria:

*   **`User`**:
    *   `id` (PK)
    *   `full_name` (String)
    *   `email` (String, Unique)
    *   `password` (String, hashed)
    *   `role` (String, e.g., 'admin', 'gestor', 'vendedor')
    *   `created_at`, `updated_at`

*   **`Company`**:
    *   `id` (PK)
    *   `name` (String)
    *   `nuit` (String, opcional)
    *   `address` (String, opcional)
    *   `phone` (String, opcional)
    *   `email` (String, opcional)
    *   `owner_id` (FK para `User.id`)
    *   `created_at`, `updated_at`

*   **`Employee`**:
    *   `id` (PK)
    *   `full_name` (String)
    *   `email` (String)
    *   `role` (String, 'gestor' ou 'vendedor')
    *   `company_id` (FK para `Company.id`)
    *   `user_id` (FK para `User.id`, opcional se o login for centralizado)
    *   `created_at`, `updated_at`

*   **`Category`**:
    *   `id` (PK)
    *   `name` (String)
    *   `company_id` (FK para `Company.id`)
    *   `created_at`, `updated_at`

*   **`Product`**:
    *   `id` (PK)
    *   `name` (String)
    *   `description` (String, opcional)
    *   `price` (Float)
    *   `quantity` (Integer)
    *   `min_stock` (Integer)
    *   `category_id` (FK para `Category.id`)
    *   `company_id` (FK para `Company.id`)
    *   `created_at`, `updated_at`

*   **`Sale`**:
    *   `id` (PK)
    *   `total` (Float)
    *   `total_profit` (Float)
    *   `payment_method` (String)
    *   `company_id` (FK para `Company.id`)
    *   `employee_id` (FK para `Employee.id`)
    *   `created_at`, `updated_at`

*   **`SaleItem`** (Itens de uma venda):
    *   `id` (PK)
    *   `quantity` (Integer)
    *   `price` (Float)
    *   `sale_id` (FK para `Sale.id`)
    *   `product_id` (FK para `Product.id`)

### 3. API Endpoints

O backend precisará expor uma API RESTful para o frontend. Os endpoints substituirão as chamadas `base44.entities...`:

*   **Autenticação:**
    *   `POST /api/auth/login`: Para autenticar um usuário e retornar um token.
    *   `POST /api/auth/logout`: Para invalidar a sessão do usuário.
    *   `GET /api/auth/me`: Para obter os dados do usuário logado (substitui `base44.auth.me()`).

*   **Endpoints CRUD (Create, Read, Update, Delete):**
    *   `GET, POST /api/companies`
    *   `GET, PUT, DELETE /api/companies/:id`
    *   `GET, POST /api/employees` (com suporte para filtros, ex: `GET /api/employees?email=...`)
    *   `GET, PUT, DELETE /api/employees/:id`
    *   E assim por diante para `products`, `categories`, `sales`, etc.

### 4. Autenticação

A autenticação será implementada usando **JWT (JSON Web Tokens)**.
1.  O usuário faz login com email e senha.
2.  O backend valida as credenciais e gera um JWT.
3.  O token é enviado para o frontend e armazenado de forma segura (e.g., em um cookie HttpOnly).
4.  Para cada requisição subsequente, o frontend envia o token no cabeçalho, e o backend o valida para autorizar o acesso.

---

## Plano de Refatoração do Frontend

### 1. Novo Cliente de API

Será criado um novo arquivo, `src/api/apiClient.ts`, que centralizará todas as chamadas HTTP para o novo backend. Ele usará uma biblioteca como `axios` para facilitar as requisições.

Exemplo de uma função no `apiClient`:
```typescript
import axios from 'axios';

const apiClient = axios.create({ baseURL: '/api' });

export const getMe = async () => {
  const response = await apiClient.get('/auth/me');
  return response.data;
};

export const getEmployees = async (filters) => {
  const response = await apiClient.get('/employees', { params: filters });
  return response.data;
};
```

### 2. Substituição das Chamadas `base44`

Todo o código que atualmente chama `base44...` será refatorado para usar o novo `apiClient`.

*   **Antes:** `const userData = await base44.auth.me();`
    *   **Depois:** `const userData = await apiClient.getMe();`

*   **Antes:** `const employees = await base44.entities.Employee.filter({ user_email: userData.email });`
    *   **Depois:** `const employees = await apiClient.getEmployees({ user_email: userData.email });`

Isso será feito em todos os componentes e páginas que interagem com o backend.

---

## Passos para o Desenvolvimento

1.  **Configurar o Backend:**
    *   Criar um novo diretório `backend/` na raiz do projeto.
    *   Inicializar um projeto Node.js (`npm init`).
    *   Instalar Express/NestJS, Prisma, e as dependências necessárias.
    *   Configurar a conexão com o banco de dados PostgreSQL.

2.  **Desenvolver o Backend:**
    *   Criar os modelos do Prisma com base no esquema definido.
    *   Gerar as migrações do banco de dados com `prisma migrate`.
    *   Implementar os endpoints de autenticação (`/auth/login`, `/auth/me`).
    *   Implementar todos os endpoints CRUD para cada entidade.

3.  **Refatorar o Frontend:**
    *   Criar o `apiClient.ts`.
    *   Substituir, arquivo por arquivo, todas as chamadas ao `base44` pelas chamadas ao `apiClient`.
    *   Ajustar a lógica de login e de verificação de sessão para usar o novo sistema de autenticação.

4.  **Testes e Validação:**
    *   Testar cada funcionalidade da aplicação (login, cadastro de produtos, vendas, etc.) para garantir que a comunicação com o novo backend está funcionando perfeitamente.
