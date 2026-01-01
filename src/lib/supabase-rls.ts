/**
 * ================================================================
 * SUPABASE RLS INTEGRATION - BIZCONTROL 360 ERP
 * ================================================================
 * Integração com Row Level Security do Supabase
 * 
 * Como funciona:
 * 1. Antes de cada query, define company_id e user_role no contexto
 * 2. RLS no PostgreSQL usa essas variáveis para filtrar automaticamente
 * 3. Camada extra de segurança além da aplicação
 * ================================================================
 */

import { PrismaClient } from '@prisma/client';

/**
 * Interface para contexto RLS
 */
export interface RLSContext {
  company_id: string;
  user_role: 'ADMIN' | 'GESTOR' | 'VENDEDOR';
  user_id?: string;
  employee_id?: string;
}

/**
 * Cria cliente Prisma com contexto RLS
 * 
 * Uso:
 * ```typescript
 * const prisma = createPrismaWithRLS({
 *   company_id: user.company_id,
 *   user_role: user.role
 * });
 * 
 * // Todas as queries agora respeitam RLS
 * const products = await prisma.product.findMany();
 * // RLS garante: apenas produtos da empresa do usuário
 * ```
 */
export function createPrismaWithRLS(context: RLSContext): PrismaClient {
  const prisma = new PrismaClient();

  // Extend Prisma para adicionar contexto RLS antes de cada query
  return prisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ operation, model, args, query }) {
          // Define contexto RLS antes da query
          await prisma.$executeRaw`
            SELECT set_config('app.company_id', ${context.company_id}, TRUE);
          `;
          
          await prisma.$executeRaw`
            SELECT set_config('app.user_role', ${context.user_role}, TRUE);
          `;

          if (context.user_id) {
            await prisma.$executeRaw`
              SELECT set_config('app.user_id', ${context.user_id}, TRUE);
            `;
          }

          if (context.employee_id) {
            await prisma.$executeRaw`
              SELECT set_config('app.employee_id', ${context.employee_id}, TRUE);
            `;
          }

          // Executa a query (RLS vai filtrar automaticamente)
          return query(args);
        },
      },
    },
  }) as any as PrismaClient;
}

/**
 * Middleware Prisma para adicionar contexto RLS automaticamente
 * 
 * Uso no prisma/client:
 * ```typescript
 * import { withRLS } from '@/lib/supabase-rls';
 * 
 * const prisma = new PrismaClient();
 * prisma.$use(withRLS);
 * ```
 */
export function withRLS(params: any, next: any) {
  // TODO: Extrair contexto do request/session atual
  // Por enquanto, isso é apenas um exemplo
  
  // O contexto real deve vir da sessão JWT do usuário
  // Implementar isso nas API routes específicas
  
  return next(params);
}

/**
 * Helper para executar query com contexto RLS temporário
 * 
 * Uso:
 * ```typescript
 * const products = await withRLSContext(prisma, {
 *   company_id: 'company-123',
 *   user_role: 'VENDEDOR'
 * }, async (client) => {
 *   return client.product.findMany();
 * });
 * ```
 */
export async function withRLSContext<T>(
  prisma: PrismaClient,
  context: RLSContext,
  callback: (client: PrismaClient) => Promise<T>
): Promise<T> {
  // Define contexto
  await prisma.$executeRaw`
    SELECT set_config('app.company_id', ${context.company_id}, TRUE);
  `;
  
  await prisma.$executeRaw`
    SELECT set_config('app.user_role', ${context.user_role}, TRUE);
  `;

  if (context.user_id) {
    await prisma.$executeRaw`
      SELECT set_config('app.user_id', ${context.user_id}, TRUE);
    `;
  }

  if (context.employee_id) {
    await prisma.$executeRaw`
      SELECT set_config('app.employee_id', ${context.employee_id}, TRUE);
    `;
  }

  try {
    // Executa callback com contexto RLS ativo
    return await callback(prisma);
  } finally {
    // Limpa contexto
    await prisma.$executeRaw`
      SELECT set_config('app.company_id', NULL, TRUE);
    `;
    await prisma.$executeRaw`
      SELECT set_config('app.user_role', NULL, TRUE);
    `;
    await prisma.$executeRaw`
      SELECT set_config('app.user_id', NULL, TRUE);
    `;
    await prisma.$executeRaw`
      SELECT set_config('app.employee_id', NULL, TRUE);
    `;
  }
}

/**
 * Helper para criar contexto RLS a partir da sessão do usuário
 */
export function createRLSContextFromSession(session: {
  user: {
    id: string;
    role: 'ADMIN' | 'GESTOR' | 'VENDEDOR';
  };
  employee?: {
    id: string;
    company_id: string;
  };
}): RLSContext {
  return {
    company_id: session.employee?.company_id || '',
    user_role: session.user.role,
    user_id: session.user.id,
    employee_id: session.employee?.id,
  };
}

/**
 * Verifica se RLS está habilitado em uma tabela
 */
export async function checkRLSEnabled(
  prisma: PrismaClient,
  tableName: string
): Promise<boolean> {
  const result = await prisma.$queryRaw<Array<{ rowsecurity: boolean }>>`
    SELECT rowsecurity 
    FROM pg_tables 
    WHERE schemaname = 'public' 
      AND tablename = ${tableName};
  `;

  return result[0]?.rowsecurity || false;
}

/**
 * Lista todas as políticas RLS de uma tabela
 */
export async function listRLSPolicies(
  prisma: PrismaClient,
  tableName: string
) {
  return await prisma.$queryRaw`
    SELECT 
      policyname,
      permissive,
      roles,
      cmd,
      qual,
      with_check
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = ${tableName}
    ORDER BY policyname;
  `;
}

/**
 * Testa RLS executando query com e sem contexto
 */
export async function testRLS(prisma: PrismaClient) {
  console.log('🧪 Testando RLS...\n');

  // Teste 1: Sem contexto (deve retornar 0 ou dar erro)
  try {
    const productsWithoutContext = await prisma.product.findMany();
    console.log('❌ SEM CONTEXTO:', productsWithoutContext.length, 'produtos');
    console.log('⚠️  RLS pode não estar funcionando!\n');
  } catch (error: any) {
    console.log('✅ SEM CONTEXTO: Erro (esperado)', error.message, '\n');
  }

  // Teste 2: Com contexto empresa 1
  await prisma.$executeRaw`
    SELECT set_config('app.company_id', 'company-1', TRUE);
  `;
  await prisma.$executeRaw`
    SELECT set_config('app.user_role', 'VENDEDOR', TRUE);
  `;
  
  const productsCompany1 = await prisma.product.findMany();
  console.log('✅ COM CONTEXTO (empresa 1):', productsCompany1.length, 'produtos\n');

  // Teste 3: Com contexto empresa 2
  await prisma.$executeRaw`
    SELECT set_config('app.company_id', 'company-2', TRUE);
  `;
  
  const productsCompany2 = await prisma.product.findMany();
  console.log('✅ COM CONTEXTO (empresa 2):', productsCompany2.length, 'produtos\n');

  // Limpar contexto
  await prisma.$executeRaw`
    SELECT set_config('app.company_id', NULL, TRUE);
  `;
  await prisma.$executeRaw`
    SELECT set_config('app.user_role', NULL, TRUE);
  `;

  console.log('✅ Teste RLS concluído!');
}
