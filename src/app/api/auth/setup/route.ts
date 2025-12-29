import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import prisma from '@/lib/prisma';
import { CATEGORY_TEMPLATES } from '@/components/admin/CategoryTemplates';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const { name, nuit, address, phone, business_sector, custom_categories } = body;

    // Validações
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Nome da empresa é obrigatório' }, { status: 400 });
    }

    if (!phone || !phone.trim()) {
      return NextResponse.json({ error: 'Telefone é obrigatório' }, { status: 400 });
    }

    if (!business_sector) {
      return NextResponse.json({ error: 'Sector de negócio é obrigatório' }, { status: 400 });
    }

    if (business_sector === 'outro' && (!custom_categories || !custom_categories.trim())) {
      return NextResponse.json({ error: 'Informe pelo menos uma categoria personalizada' }, { status: 400 });
    }

    // Verificar se o usuário já tem uma empresa
    const existingCompany = await prisma.company.findFirst({
      where: { owner_id: session.userId },
      select: { id: true, name: true }
    });

    if (existingCompany) {
      return NextResponse.json({ 
        error: `Você já possui uma empresa registrada: ${existingCompany.name}` 
      }, { status: 409 });
    }

    // Buscar dados do utilizador para usar o nome completo
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { full_name: true, email: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // TRANSAÇÃO ATÓMICA: Ou cria tudo, ou não cria nada.
    const result = await prisma.$transaction(async (tx) => {
      // 1. Criar a Empresa
      const company = await tx.company.create({
        data: {
          name: name.trim(),
          nuit: nuit?.trim() || null,
          address: address?.trim() || null,
          phone: phone.trim(),
          email: session.email,
          owner_id: session.userId,
          business_sector: business_sector || null,
        }
      });

      // 2. Criar o registro de Employee para o dono (Gestor)
      await tx.employee.create({
        data: {
          company_id: company.id,
          email: session.email,
          full_name: user.full_name,
          role: 'GESTOR',
          user_id: session.userId,
          is_active: true,  // Explicitly set as active
        }
      });

      // 3. Preparar e criar Categorias
      let categoriesData: { name: string; color: string; company_id: string }[] = [];
      
      if (business_sector === 'outro' && custom_categories) {
        const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#64748b'];
        categoriesData = custom_categories.split(',')
          .map((cat: string) => cat.trim())
          .filter((cat: string) => cat.length > 0)
          .map((cat: string, idx: number) => ({
            name: cat,
            color: colors[idx % colors.length],
            company_id: company.id
          }));
      } else {
        const templates = CATEGORY_TEMPLATES[business_sector as keyof typeof CATEGORY_TEMPLATES] || CATEGORY_TEMPLATES.outro;
        categoriesData = templates.map(cat => ({
          name: cat.name,
          color: cat.color,
          company_id: company.id
        }));
      }

      // Validar que temos categorias para criar
      if (categoriesData.length === 0) {
        throw new Error('Nenhuma categoria foi definida');
      }

      // Criar categorias em lote
      await tx.category.createMany({ data: categoriesData });

      return {
        company,
        categoryCount: categoriesData.length
      };
    }, {
      maxWait: 10000, // Tempo máximo de espera: 10s
      timeout: 20000, // Timeout da transação: 20s
    });

    return NextResponse.json({ 
      success: true, 
      company: {
        id: result.company.id,
        name: result.company.name,
        business_sector: result.company.business_sector
      },
      categories_created: result.categoryCount
    });

  } catch (error: any) {
    console.error('Setup error:', error);
    
    // Erros específicos do Prisma
    if (error.code === 'P2002') {
      return NextResponse.json({ 
        error: 'Uma empresa com este nome ou NUIT já existe' 
      }, { status: 409 });
    }

    if (error.code === 'P2025') {
      return NextResponse.json({ 
        error: 'Dados relacionados não foram encontrados' 
      }, { status: 404 });
    }

    // Erros de timeout
    if (error.message?.includes('timeout') || error.message?.includes('deadlock')) {
      return NextResponse.json({ 
        error: 'Operação demorou muito tempo. Tente novamente.' 
      }, { status: 504 });
    }

    // Erro genérico
    return NextResponse.json({ 
      error: 'Falha ao configurar empresa: ' + (error.message || 'Erro desconhecido')
    }, { status: 500 });
  }
}
