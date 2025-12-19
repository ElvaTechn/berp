// APENAS PARA DESENVOLVIMENTO - Resetar rate limiting
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST() {
  // Apenas em desenvolvimento
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 });
  }

  try {
    // Limpar TODAS as entradas de rate limit
    const rateLimitResult = await prisma.rateLimitEntry.deleteMany({});
    
    // Limpar TODAS as tentativas de login
    const loginAttemptResult = await prisma.loginAttempt.deleteMany({});

    return NextResponse.json({
      success: true,
      message: 'Rate limiting resetado com sucesso!',
      deleted: {
        rateLimitEntries: rateLimitResult.count,
        loginAttempts: loginAttemptResult.count
      }
    });
  } catch (error) {
    console.error('Erro ao resetar rate limit:', error);
    return NextResponse.json({ 
      error: 'Falha ao resetar', 
      details: error instanceof Error ? error.message : 'Unknown'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Use POST para resetar o rate limiting',
    endpoint: '/api/dev/reset-rate-limit',
    method: 'POST'
  });
}
