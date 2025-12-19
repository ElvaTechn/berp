import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { logger } from '@/lib/logger';

export async function POST() {
  try {
    const cookieStore = await cookies();
    
    // Deletar o cookie de autenticação
    cookieStore.delete('auth_token');
    
    logger.info('User logged out successfully');
    
    return NextResponse.json({ 
      success: true,
      message: 'Logout realizado com sucesso' 
    });
  } catch (error) {
    logger.error('Logout error', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    
    return NextResponse.json(
      { error: 'Erro ao fazer logout' },
      { status: 500 }
    );
  }
}
