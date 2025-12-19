import { NextRequest, NextResponse } from 'next/server';
import { apiRateLimit, getClientIP } from '@/lib/rateLimit';
import { logger } from '@/lib/logger';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        // Optional: Verify API key for sensitive environments
        if (process.env.HEALTH_CHECK_API_KEY) {
            const apiKey = request.headers.get('x-health-api-key');
            if (apiKey !== process.env.HEALTH_CHECK_API_KEY) {
                logger.warn('Health check unauthorized access attempt', { 
                    ip: getClientIP(request)
                });
                return NextResponse.json(
                    { error: 'Unauthorized' },
                    { status: 401 }
                );
            }
        }

        // Rate limiting
        const ip = getClientIP(request);
        const { success } = await apiRateLimit.limit(ip);
        
        if (!success) {
            return NextResponse.json(
                { error: 'Too many requests' },
                { status: 429 }
            );
        }

        const userAgent = request.headers.get('user-agent');
        const timestamp = new Date().toISOString();
        
        logger.info('Health check accessed', { 
            ip,
            userAgent,
            timestamp 
        });

        // Basic health check
        const [databaseHealth, redisHealth] = await Promise.all([
            checkDatabaseHealth(),
            checkRedisHealth(),
        ]);

        // Redis is optional, so degraded only if database fails
        const allHealthy = 
            databaseHealth.status === 'connected' &&
            process.uptime() > 0;

        const health = {
            status: allHealthy ? 'healthy' : 'degraded',
            timestamp,
            version: '1.0.0',
            uptime: Math.round(process.uptime()),
            environment: process.env.NODE_ENV || 'development',
            services: {
                database: databaseHealth,
                redis: redisHealth,
                api: 'operational',
            }
        };

        const httpStatus = allHealthy ? 200 : 503;
        return NextResponse.json(health, {
            status: httpStatus,
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Content-Type': 'application/json',
                'X-Health-Status': allHealthy ? 'healthy' : 'degraded',
            }
        });

    } catch (error) {
        logger.error('Health check failed:', { 
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        
        return NextResponse.json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: 'Health check failed',
        }, {
            status: 503,
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Content-Type': 'application/json',
            }
        });
    }
}

// Detailed system metrics
export async function POST(request: NextRequest) {
    try {
        const { detailed = false } = await request.json();
        
        if (!detailed) {
            return GET(request);
        }

        // Detailed health check with system metrics
        const metrics = {
            system: {
                nodeVersion: process.version,
                platform: process.platform,
                arch: process.arch,
                memory: process.memoryUsage(),
                uptime: process.uptime(),
                cpu: process.cpuUsage(),
            },
            services: {
                database: await checkDatabaseHealth(),
                redis: await checkRedisHealth(),
            },
            application: {
                version: '1.0.0',
                environment: process.env.NODE_ENV || 'development',
                lastDeployment: process.env.VERCEL_URL || 'local',
            }
        };

        return NextResponse.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            metrics,
        });

    } catch (error) {
        logger.error('Detailed health check failed:', { 
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        
        return NextResponse.json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: 'Detailed health check failed',
        }, {
            status: 503,
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Content-Type': 'application/json',
            }
        });
    }
}

async function checkDatabaseHealth() {
    try {
        const start = Date.now();
        await prisma.$queryRaw`SELECT 1`;
        const responseTime = Date.now() - start;
        
        return {
            status: 'connected',
            responseTime: `${responseTime}ms`,
            timestamp: new Date().toISOString(),
        };
    } catch (error) {
        logger.error('Database health check failed:', {
            error: error instanceof Error ? error.message : 'Unknown error',
        });
        return {
            status: 'disconnected',
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        };
    }
}

async function checkRedisHealth() {
    return {
        status: 'not configured (using Prisma rate limiting)',
        timestamp: new Date().toISOString(),
    };
}
