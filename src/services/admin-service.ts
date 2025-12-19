// src/services/admin-service.ts
// Serviço de Administração - Torre de Controlo do Super Admin

import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createAuditLog, AUDIT_ACTIONS, AUDIT_RESOURCES } from '@/lib/audit-log';
import { logger } from '@/lib/logger';
import { Prisma } from '@prisma/client';

// ================================================================
// VALIDAÇÕES
// ================================================================

/**
 * Valida formato de email rigoroso
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
    if (!email || typeof email !== 'string') {
        return { valid: false, error: 'Email é obrigatório' };
    }

    const trimmed = email.trim().toLowerCase();
    
    // Regex rigorosa para email
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    if (!emailRegex.test(trimmed)) {
        return { valid: false, error: 'Formato de email inválido' };
    }

    // Verificar domínio tem pelo menos um ponto
    const [, domain] = trimmed.split('@');
    if (!domain.includes('.')) {
        return { valid: false, error: 'Domínio de email inválido' };
    }

    // Verificar TLD mínimo de 2 caracteres
    const tld = domain.split('.').pop();
    if (!tld || tld.length < 2) {
        return { valid: false, error: 'TLD de email inválido' };
    }

    return { valid: true };
}

/**
 * Valida NUIT de Moçambique (9 dígitos)
 */
export function validateNUIT(nuit: string): { valid: boolean; error?: string } {
    if (!nuit || typeof nuit !== 'string') {
        return { valid: false, error: 'NUIT é obrigatório' };
    }

    const cleaned = nuit.replace(/\s/g, '');
    
    // NUIT deve ter exatamente 9 dígitos
    if (!/^\d{9}$/.test(cleaned)) {
        return { valid: false, error: 'NUIT deve ter exatamente 9 dígitos' };
    }

    return { valid: true };
}

/**
 * Valida senha forte
 */
export function validatePassword(password: string): { valid: boolean; error?: string } {
    if (!password || password.length < 8) {
        return { valid: false, error: 'Senha deve ter pelo menos 8 caracteres' };
    }

    // Pelo menos uma letra maiúscula, uma minúscula e um número
    if (!/[A-Z]/.test(password)) {
        return { valid: false, error: 'Senha deve conter pelo menos uma letra maiúscula' };
    }
    if (!/[a-z]/.test(password)) {
        return { valid: false, error: 'Senha deve conter pelo menos uma letra minúscula' };
    }
    if (!/\d/.test(password)) {
        return { valid: false, error: 'Senha deve conter pelo menos um número' };
    }

    return { valid: true };
}

// ================================================================
// INTERFACES
// ================================================================

export interface RegisterCompanyInput {
    // Dados da Empresa
    companyName: string;
    nuit: string;
    address?: string;
    phone?: string;
    companyEmail?: string;
    businessSector?: string;
    
    // Dados do Proprietário
    ownerName: string;
    ownerEmail: string;
    ownerPassword: string;
    
    // Subscrição
    subscriptionType?: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL' | 'LIFETIME';
    trialDays?: number;
}

export interface RegisterCompanyResult {
    success: boolean;
    company?: {
        id: string;
        name: string;
        nuit: string;
        subscriptionEnd: Date;
    };
    user?: {
        id: string;
        email: string;
        fullName: string;
    };
    error?: string;
}

// ================================================================
// SERVIÇOS PRINCIPAIS
// ================================================================

/**
 * Registar uma nova empresa com proprietário
 * Usa transação atómica para garantir consistência
 */
export async function registerNewCompany(
    input: RegisterCompanyInput,
    adminUserId: string,
    ipAddress: string,
    userAgent: string
): Promise<RegisterCompanyResult> {
    // 1. VALIDAÇÕES
    const emailValidation = validateEmail(input.ownerEmail);
    if (!emailValidation.valid) {
        return { success: false, error: emailValidation.error };
    }

    const nuitValidation = validateNUIT(input.nuit);
    if (!nuitValidation.valid) {
        return { success: false, error: nuitValidation.error };
    }

    const passwordValidation = validatePassword(input.ownerPassword);
    if (!passwordValidation.valid) {
        return { success: false, error: passwordValidation.error };
    }

    if (!input.companyName || input.companyName.trim().length < 2) {
        return { success: false, error: 'Nome da empresa deve ter pelo menos 2 caracteres' };
    }

    if (!input.ownerName || input.ownerName.trim().length < 2) {
        return { success: false, error: 'Nome do proprietário deve ter pelo menos 2 caracteres' };
    }

    // 2. VERIFICAR DUPLICADOS
    const cleanedEmail = input.ownerEmail.trim().toLowerCase();
    const cleanedNuit = input.nuit.replace(/\s/g, '');

    const [existingEmail, existingNuit] = await Promise.all([
        prisma.user.findUnique({ where: { email: cleanedEmail } }),
        prisma.company.findUnique({ where: { nuit: cleanedNuit } }),
    ]);

    if (existingEmail) {
        return { success: false, error: 'Este email já está registado no sistema' };
    }

    if (existingNuit) {
        return { success: false, error: 'Este NUIT já está registado no sistema' };
    }

    // 3. PREPARAR DADOS
    const hashedPassword = await bcrypt.hash(input.ownerPassword, 12);
    const trialDays = input.trialDays ?? 30;
    const subscriptionEnd = new Date();
    subscriptionEnd.setDate(subscriptionEnd.getDate() + trialDays);

    try {
        // 4. TRANSAÇÃO ATÓMICA
        const result = await prisma.$transaction(async (tx) => {
            // 4.1 Criar User (proprietário)
            const user = await tx.user.create({
                data: {
                    full_name: input.ownerName.trim(),
                    email: cleanedEmail,
                    password: hashedPassword,
                    role: 'GESTOR',
                    is_active: true,
                },
            });

            // 4.2 Criar Company
            const company = await tx.company.create({
                data: {
                    name: input.companyName.trim(),
                    nuit: cleanedNuit,
                    address: input.address?.trim() || null,
                    phone: input.phone?.trim() || null,
                    email: input.companyEmail?.trim() || cleanedEmail,
                    business_sector: input.businessSector?.trim() || null,
                    subscription_status: 'TRIAL',
                    subscription_type: input.subscriptionType || 'MONTHLY',
                    subscription_start: new Date(),
                    subscription_end: subscriptionEnd,
                    owner_id: user.id,
                },
            });

            // 4.3 Criar Employee (vínculo do proprietário à empresa)
            await tx.employee.create({
                data: {
                    full_name: user.full_name,
                    email: user.email,
                    role: 'GESTOR',
                    is_active: true,
                    company_id: company.id,
                    user_id: user.id,
                },
            });

            // 4.4 Criar categoria padrão
            await tx.category.create({
                data: {
                    name: 'Geral',
                    description: 'Categoria padrão',
                    color: '#3b82f6',
                    company_id: company.id,
                },
            });

            return { user, company };
        });

        // 5. AUDIT LOG
        await createAuditLog({
            userId: adminUserId,
            action: AUDIT_ACTIONS.COMPANY_CREATE,
            resource: AUDIT_RESOURCES.COMPANY,
            resourceId: result.company.id,
            ipAddress,
            userAgent,
            success: true,
            newValues: {
                companyName: result.company.name,
                nuit: result.company.nuit,
                ownerEmail: result.user.email,
                subscriptionEnd: subscriptionEnd.toISOString(),
            },
            details: {
                ownerId: result.user.id,
                subscriptionType: input.subscriptionType || 'MONTHLY',
                trialDays,
            },
        });

        logger.info('New company registered', {
            companyId: result.company.id,
            companyName: result.company.name,
            ownerId: result.user.id,
            adminId: adminUserId,
        });

        return {
            success: true,
            company: {
                id: result.company.id,
                name: result.company.name,
                nuit: result.company.nuit ?? '',
                subscriptionEnd,
            },
            user: {
                id: result.user.id,
                email: result.user.email,
                fullName: result.user.full_name,
            },
        };
    } catch (error) {
        logger.error('Failed to register company', {
            error: error instanceof Error ? error.message : 'Unknown error',
            input: { companyName: input.companyName, ownerEmail: input.ownerEmail },
        });

        // Audit log de falha
        await createAuditLog({
            userId: adminUserId,
            action: AUDIT_ACTIONS.COMPANY_CREATE,
            resource: AUDIT_RESOURCES.COMPANY,
            ipAddress,
            userAgent,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            details: {
                companyName: input.companyName,
                ownerEmail: input.ownerEmail,
            },
        });

        return {
            success: false,
            error: 'Erro ao criar empresa. Por favor, tente novamente.',
        };
    }
}

/**
 * Suspender uma empresa
 */
export async function suspendCompany(
    companyId: string,
    adminUserId: string,
    ipAddress: string,
    userAgent: string,
    reason?: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const company = await prisma.company.findUnique({
            where: { id: companyId },
        });

        if (!company) {
            return { success: false, error: 'Empresa não encontrada' };
        }

        const oldStatus = company.subscription_status;

        await prisma.company.update({
            where: { id: companyId },
            data: { subscription_status: 'SUSPENDED' },
        });

        await createAuditLog({
            userId: adminUserId,
            companyId,
            action: AUDIT_ACTIONS.SUBSCRIPTION_SUSPEND,
            resource: AUDIT_RESOURCES.COMPANY,
            resourceId: companyId,
            ipAddress,
            userAgent,
            success: true,
            oldValues: { subscription_status: oldStatus },
            newValues: { subscription_status: 'SUSPENDED' },
            details: { reason },
        });

        return { success: true };
    } catch (error) {
        logger.error('Failed to suspend company', { companyId, error });
        return { success: false, error: 'Erro ao suspender empresa' };
    }
}

/**
 * Renovar subscrição de uma empresa
 */
export async function renewSubscription(
    companyId: string,
    days: number,
    adminUserId: string,
    ipAddress: string,
    userAgent: string
): Promise<{ success: boolean; newEndDate?: Date; error?: string }> {
    try {
        const company = await prisma.company.findUnique({
            where: { id: companyId },
        });

        if (!company) {
            return { success: false, error: 'Empresa não encontrada' };
        }

        // Calcular nova data de expiração
        const currentEnd = company.subscription_end || new Date();
        const newEndDate = new Date(Math.max(currentEnd.getTime(), Date.now()));
        newEndDate.setDate(newEndDate.getDate() + days);

        await prisma.company.update({
            where: { id: companyId },
            data: {
                subscription_status: 'ACTIVE',
                subscription_end: newEndDate,
            },
        });

        await createAuditLog({
            userId: adminUserId,
            companyId,
            action: AUDIT_ACTIONS.SUBSCRIPTION_RENEW,
            resource: AUDIT_RESOURCES.COMPANY,
            resourceId: companyId,
            ipAddress,
            userAgent,
            success: true,
            oldValues: {
                subscription_status: company.subscription_status,
                subscription_end: company.subscription_end?.toISOString(),
            },
            newValues: {
                subscription_status: 'ACTIVE',
                subscription_end: newEndDate.toISOString(),
            },
            details: { daysAdded: days },
        });

        return { success: true, newEndDate };
    } catch (error) {
        logger.error('Failed to renew subscription', { companyId, error });
        return { success: false, error: 'Erro ao renovar subscrição' };
    }
}

/**
 * Obter estatísticas para o dashboard admin
 */
export async function getAdminStats() {
    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
        totalCompanies,
        activeCompanies,
        expiringCompanies,
        monthlyRevenue,
        recentCompanies,
    ] = await Promise.all([
        // Total de empresas
        prisma.company.count(),
        
        // Empresas ativas
        prisma.company.count({
            where: { subscription_status: 'ACTIVE' },
        }),
        
        // Empresas a expirar em 7 dias
        prisma.company.count({
            where: {
                subscription_status: { in: ['ACTIVE', 'TRIAL'] },
                subscription_end: {
                    gte: now,
                    lte: sevenDaysFromNow,
                },
            },
        }),
        
        // Faturação total do mês (soma de todas as vendas)
        prisma.sale.aggregate({
            _sum: { total: true },
            where: {
                created_at: { gte: thisMonthStart },
            },
        }),
        
        // 5 empresas mais recentes
        prisma.company.findMany({
            take: 5,
            orderBy: { created_at: 'desc' },
            include: {
                owner: {
                    select: { full_name: true, email: true },
                },
                _count: {
                    select: { sales: true, employees: true },
                },
            },
        }),
    ]);

    return {
        totalCompanies,
        activeCompanies,
        expiringCompanies,
        monthlyRevenue: monthlyRevenue._sum.total?.toNumber() || 0,
        recentCompanies,
    };
}

/**
 * Listar todas as empresas com filtros
 */
export async function listCompanies(params: {
    search?: string;
    status?: string;
    limit?: number;
    offset?: number;
}) {
    const where: Prisma.CompanyWhereInput = {};

    if (params.search) {
        where.OR = [
            { name: { contains: params.search, mode: 'insensitive' } },
            { nuit: { contains: params.search, mode: 'insensitive' } },
            { owner: { email: { contains: params.search, mode: 'insensitive' } } },
        ];
    }

    if (params.status && params.status !== 'all') {
        where.subscription_status = params.status as Prisma.EnumSubscriptionStatusFilter;
    }

    const [companies, total] = await Promise.all([
        prisma.company.findMany({
            where,
            orderBy: { created_at: 'desc' },
            take: params.limit || 20,
            skip: params.offset || 0,
            include: {
                owner: {
                    select: {
                        id: true,
                        full_name: true,
                        email: true,
                    },
                },
                _count: {
                    select: {
                        employees: true,
                        products: true,
                        sales: true,
                    },
                },
            },
        }),
        prisma.company.count({ where }),
    ]);

    return { companies, total };
}

/**
 * Criar token de impersonação para acesso de suporte
 */
export async function createImpersonationToken(
    targetUserId: string,
    adminUserId: string,
    ipAddress: string,
    userAgent: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const targetUser = await prisma.user.findUnique({
            where: { id: targetUserId },
            include: {
                employees: {
                    include: { company: true },
                    take: 1,
                },
            },
        });

        if (!targetUser) {
            return { success: false, error: 'Utilizador não encontrado' };
        }

        // Audit log de impersonação
        await createAuditLog({
            userId: adminUserId,
            companyId: targetUser.employees[0]?.company_id,
            action: AUDIT_ACTIONS.ADMIN_IMPERSONATE,
            resource: AUDIT_RESOURCES.USER,
            resourceId: targetUserId,
            ipAddress,
            userAgent,
            success: true,
            details: {
                targetUserEmail: targetUser.email,
                targetUserName: targetUser.full_name,
                targetCompany: targetUser.employees[0]?.company?.name,
            },
        });

        return { success: true };
    } catch (error) {
        logger.error('Failed to create impersonation token', { targetUserId, error });
        return { success: false, error: 'Erro ao criar acesso de suporte' };
    }
}
