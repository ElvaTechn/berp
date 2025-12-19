import { NextRequest, NextResponse } from 'next/server';

// Cache simples para métricas (1 minuto)
let metricsCache: {
  data: any;
  timestamp: number;
} | null = null;

const CACHE_TTL = 60 * 1000; // 1 minuto

// Contador de requests em memória
let requestCount = 0;
let errorCount = 0;
let responseTimes: number[] = [];
let activeUsers = new Set<string>();

// Dados mockados para desenvolvimento
function generateMockMetrics() {
  const now = Date.now();
  
  // Simular métricas em tempo real
  const baseResponseTime = 50 + Math.random() * 100;
  const baseThroughput = 80 + Math.random() * 40;
  const baseErrorRate = Math.random() * 0.05; // 0-5%
  
  return {
    responseTime: baseResponseTime,
    throughput: Math.round(baseThroughput),
    errorRate: baseErrorRate,
    activeUsers: 15 + Math.floor(Math.random() * 20),
    requestCount: requestCount + Math.floor(Math.random() * 100),
    cacheHitRate: 0.85 + Math.random() * 0.1, // 85-95%
    timestamp: now,
  };
}

export async function GET(request: NextRequest) {
  const now = Date.now();
  
  // Verificar cache
  if (metricsCache && (now - metricsCache.timestamp) < CACHE_TTL) {
    return NextResponse.json(metricsCache.data, {
      headers: {
        'Cache-Control': 'max-age=60',
        'X-Metrics-Cached': 'true',
      },
    });
  }
  
  // Gerar métricas
  const metrics = generateMockMetrics();
  
  // Atualizar cache
  metricsCache = {
    data: metrics,
    timestamp: now,
  };
  
  return NextResponse.json(metrics, {
    headers: {
      'Cache-Control': 'max-age=60',
      'X-Metrics-Cached': 'false',
      'X-Timestamp': now.toString(),
    },
  });
}

// Endpoint para registrar métricas
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      responseTime, 
      error = false, 
      userId, 
      endpoint,
      method 
    } = body;
    
    // Atualizar contadores
    requestCount++;
    if (error) errorCount++;
    if (responseTime) responseTimes.push(responseTime);
    
    // Manter apenas últimas 1000 medições
    if (responseTimes.length > 1000) {
      responseTimes = responseTimes.slice(-1000);
    }
    
    // Track usuários ativos
    if (userId) {
      activeUsers.add(userId);
      // Cleanup automático após 30 minutos de inatividade
      setTimeout(() => {
        activeUsers.delete(userId);
      }, 30 * 60 * 1000);
    }
    
    // Log opcional para debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('Metrics recorded:', {
        requestCount,
        errorCount,
        avgResponseTime: responseTimes.length > 0 
          ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
          : 0,
        activeUsers: activeUsers.size,
        endpoint,
        method,
      });
    }
    
    return NextResponse.json({ 
      success: true,
      requestCount,
      errorCount,
      activeUsers: activeUsers.size,
    });
    
  } catch (error) {
    console.error('Failed to record metrics:', error);
    return NextResponse.json(
      { error: 'Failed to record metrics' },
      { status: 500 }
    );
  }
}

// Endpoint para reset das métricas
export async function DELETE() {
  requestCount = 0;
  errorCount = 0;
  responseTimes = [];
  activeUsers.clear();
  metricsCache = null;
  
  return NextResponse.json({
    message: 'Metrics reset successfully',
    timestamp: Date.now(),
  });
}