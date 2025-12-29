/**
 * ================================================================
 * SALES API ROUTE - BIZCONTROL 360 ERP v2.0.0
 * ================================================================
 * O "Porteiro" - Apenas valida requests e delega ao SaleService
 * 
 * RESPONSABILIDADES:
 * - Rate Limiting
 * - Validação de Input (Zod)
 * - Autenticação (getSession)
 * - Autorização (verificar employee)
 * - Delegar para SaleService
 * - Auditoria (AuditLog)
 * - Retornar respostas HTTP apropriadas
 * 
 * A LÓGICA DE NEGÓCIO ESTÁ EM: src/services/sale-service.ts
 * ================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { enhancedRateLimit, getClientIP, addToBlacklist } from '@/lib/rateLimit';
import { validateCreateSale } from '@/lib/validations';
import { getSession } from '@/lib/auth-server';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { SaleService } from '@/services/sale-service';
import { PaymentMethod } from '@prisma/client';

// ================================================================
// POST /api/sales - Criar Nova Venda
// ================================================================

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const ip = getClientIP(request);

  // ============================================================
  // 1. RATE LIMITING (Proteção contra abuso)
  // ============================================================
  const rateLimitResult = await enhancedRateLimit(request, 'sales');
  
  if (!rateLimitResult.allowed) {
    // Se muitas tentativas, adicionar à blacklist
    if (rateLimitResult.retryAfter && rateLimitResult.retryAfter > 60) {
      await addToBlacklist(request, 30 * 60 * 1000); // 30 minutos
    }

    logger.warn('Rate limit exceeded', { ip, retryAfter: rateLimitResult.retryAfter });

    return NextResponse.json(
      { 
        success: false, 
        error: rateLimitResult.message,
        retryAfter: rateLimitResult.retryAfter 
      },
      { 
        status: 429,
        headers: {
          'Retry-After': rateLimitResult.retryAfter?.toString() || '60',
        }
      }
    );
  }

  // ============================================================
  // 2. PARSE REQUEST BODY
  // ============================================================
  let body: unknown;
  try {
    body = await request.json();
  } catch (error) {
    logger.error('Invalid JSON body', { ip });
    return NextResponse.json(
      { success: false, error: 'JSON inválido no corpo da requisição' },
      { status: 400 }
    );
  }

  // ============================================================
  // 3. VALIDAÇÃO DE INPUT (Zod)
  // ============================================================
  const validation = validateCreateSale(body);
  
  if (!validation.success) {
    logger.warn('Validation failed', { 
      error: validation.error,
      ip 
    });

    return NextResponse.json(
      { success: false, error: validation.error },
      { status: 400 }
    );
  }

  const saleData = validation.data!;

  // ============================================================
  // 4. AUTENTICAÇÃO (Verificar sessão)
  // ============================================================
  const session = await getSession();
  
  if (!session) {
    logger.warn('Unauthenticated sale attempt', { ip });
    return NextResponse.json(
      { success: false, error: 'Não autenticado' },
      { status: 401 }
    );
  }

  // ============================================================
  // 5. AUTORIZAÇÃO (Verificar employee e company)
  // ============================================================
  let employee = await prisma.employee.findFirst({
    where: {
      user_id: session.userId,
      is_active: true  // Apenas funcionários ativos
    },
    select: {
      id: true,
      company_id: true,
      role: true,
      full_name: true
    }
  });

  // Se não encontrou employee, verifica se é dono de alguma empresa
  let companyId: string | null = null;
  if (!employee) {
    const company = await prisma.company.findFirst({
      where: { owner_id: session.userId },
      select: { id: true }
    });

    if (company) {
      companyId = company.id;
      // Para donos sem employee, criar um employee temporário no formato
      const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { full_name: true, email: true }
      });

      if (user) {
        employee = {
          id: 'owner-' + session.userId,
          company_id: company.id,
          role: 'GESTOR' as any,
          full_name: user.full_name
        };
      }
    }
  }

  if (!employee) {
    logger.warn('Employee not found', {
      user_id: session.userId,
      ip
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Configuração incompleta',
        requiresSetup: true,
        message: 'Sua conta não está configurada como funcionário. Vá para a configuração da empresa.'
      },
      { status: 404 }
    );
  }

  // Verificar permissão (apenas GESTOR e VENDEDOR podem vender)
  if (!['GESTOR', 'VENDEDOR'].includes(employee.role.toString())) {
    logger.warn('Insufficient permissions', {
      user_id: session.userId,
      role: employee.role,
      ip
    });

    return NextResponse.json(
      { success: false, error: 'Permissão insuficiente para realizar vendas' },
      { status: 403 }
    );
  }

  // ============================================================
  // 6. DELEGAR PARA SALESERVICE (O Cérebro)
  // ============================================================
  try {
    const result = await SaleService.createSale({
      items: saleData.items,
      payment_method: saleData.payment_method as PaymentMethod,
      discount_code: saleData.discount_code,
      company_id: employee.company_id,
      employee_id: employee.id
    });

    const duration = Date.now() - startTime;

    logger.info('Sale created successfully', {
      sale_id: result.sale_id,
      employee_id: employee.id,
      employee_name: employee.full_name,
      company_id: employee.company_id,
      total: result.total,
      items_count: result.items_count,
      duration_ms: duration,
      ip
    });

    // ============================================================
    // 7. AUDITORIA (Log da ação)
    // ============================================================
    await prisma.auditLog.create({
      data: {
        action: 'SALE_CREATE',
        resource: 'Sale',
        resource_id: result.sale_id,
        ip_address: ip,
        user_agent: request.headers.get('user-agent') || 'unknown',
        success: true,
        details: JSON.stringify({
          total: result.total,
          items_count: result.items_count,
          payment_method: result.payment_method,
          discount_applied: result.discount_amount !== '0.00'
        }),
        new_values: JSON.stringify({
          subtotal: result.subtotal,
          discount_amount: result.discount_amount,
          tax_amount: result.tax_amount,
          total: result.total,
          total_profit: result.total_profit
        }),
        user_id: session.userId,
        employee_id: employee.id,
        company_id: employee.company_id
      }
    }).catch(err => {
      // Não bloquear venda se auditoria falhar
      logger.error('Audit log failed', { error: err.message });
    });

    // ============================================================
    // 8. RESPOSTA DE SUCESSO
    // ============================================================
    const response = NextResponse.json({
      success: true,
      data: SaleService.formatSaleForAPI(result),
      message: 'Venda registrada com sucesso'
    }, { 
      status: 201 
    });

    // Security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    
    return response;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    const duration = Date.now() - startTime;
    
    logger.error('Sale creation failed', {
      error: errorMessage,
      employee_id: employee.id,
      company_id: employee.company_id,
      duration_ms: duration,
      ip
    });

    // ============================================================
    // 9. AUDITORIA DE FALHA
    // ============================================================
    await prisma.auditLog.create({
      data: {
        action: 'SALE_CREATE',
        resource: 'Sale',
        ip_address: ip,
        user_agent: request.headers.get('user-agent') || 'unknown',
        success: false,
        error: errorMessage,
        details: JSON.stringify({
          items_count: saleData.items.length,
          payment_method: saleData.payment_method
        }),
        user_id: session.userId,
        employee_id: employee.id,
        company_id: employee.company_id
      }
    }).catch(err => {
      logger.error('Audit log failed', { error: err.message });
    });

    // ============================================================
    // 10. TRATAMENTO DE ERROS ESPECÍFICOS
    // ============================================================

    // Stock insuficiente
    if (errorMessage.includes('Stock insuficiente')) {
      return NextResponse.json(
        { 
          success: false, 
          error: errorMessage,
          error_type: 'INSUFFICIENT_STOCK'
        },
        { status: 422 }  // Unprocessable Entity
      );
    }

    // Produto não encontrado, desativado ou expirado
    if (
      errorMessage.includes('não encontrado') ||
      errorMessage.includes('desativado') ||
      errorMessage.includes('vencido')
    ) {
      return NextResponse.json(
        { 
          success: false, 
          error: errorMessage,
          error_type: 'INVALID_PRODUCT'
        },
        { status: 400 }
      );
    }

    // Desconto inválido
    if (errorMessage.includes('desconto')) {
      return NextResponse.json(
        { 
          success: false, 
          error: errorMessage,
          error_type: 'INVALID_DISCOUNT'
        },
        { status: 400 }
      );
    }

    // Empresa inativa
    if (errorMessage.includes('assinatura')) {
      return NextResponse.json(
        { 
          success: false, 
          error: errorMessage,
          error_type: 'COMPANY_INACTIVE'
        },
        { status: 403 }
      );
    }

    // Erro de concorrência (transação)
    if (errorMessage.includes('transaction') || errorMessage.includes('Serialization')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erro de concorrência. Tente novamente.',
          error_type: 'CONCURRENCY_ERROR'
        },
        { status: 409 }
      );
    }

    // Erro genérico
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao processar venda. Tente novamente.',
        error_type: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}

// ================================================================
// GET /api/sales - Listar Vendas (Paginado)
// ================================================================

export async function GET(request: NextRequest) {
  try {
    // 1. Autenticação
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // 2. Buscar employee - primeiro como funcionário
    let companyId: string | null = null;

    const employee = await prisma.employee.findFirst({
      where: { user_id: session.userId, is_active: true },
      select: { company_id: true }
    });

    if (employee) {
      companyId = employee.company_id;
    } else {
      // Se não encontrou como funcionário, verifica se é dono de alguma empresa
      const company = await prisma.company.findFirst({
        where: { owner_id: session.userId },
        select: { id: true }
      });

      if (company) {
        companyId = company.id;
      }
    }

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'Nenhuma empresa configurada', requiresSetup: true },
        { status: 404 }
      );
    }

    // 3. Parse query params
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const skip = (page - 1) * limit;

    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const employeeId = searchParams.get('employee_id');

    // 4. Build filters
    const dateFilter = startDate || endDate ? {
      ...(startDate && { gte: new Date(startDate) }),
      ...(endDate && { lte: new Date(endDate) })
    } : undefined;

    const whereClause: any = {
      company_id: companyId,
      ...(dateFilter && { created_at: dateFilter }),
      ...(employeeId && { employee_id: employeeId })
    };

    // 5. Fetch sales + count (parallel)
    const [sales, total] = await Promise.all([
      prisma.sale.findMany({
        where: whereClause,
        include: {
          sale_items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  category: {
                    select: {
                      name: true,
                      color: true
                    }
                  }
                }
              }
            }
          },
          employee: {
            select: {
              id: true,
              full_name: true
            }
          },
          discount: {
            select: {
              code: true,
              type: true
            }
          }
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit
      }),
      prisma.sale.count({ where: whereClause })
    ]);

    // 6. Format response
    return NextResponse.json({
      success: true,
      sales: sales,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: skip + limit < total,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    logger.error('Failed to fetch sales', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return NextResponse.json(
      { success: false, error: 'Erro ao buscar vendas' },
      { status: 500 }
    );
  }
}
