import { NextRequest, NextResponse } from 'next/server';
import { apiRateLimit, getClientIP } from '@/lib/rateLimit';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { generateOrganizationData, generateWebsiteData } from '@/lib/metadata';

// Helper to get user info from middleware headers
function getUserFromRequest(request: NextRequest) {
    const userId = request.headers.get('x-user-id');
    const userEmail = request.headers.get('x-user-email');
    const userRole = request.headers.get('x-user-role');
    return { userId, userEmail, userRole };
}

export async function GET(request: NextRequest) {
    try {
        // Rate limiting
        const ip = await getClientIP(request);
        const { success } = await apiRateLimit.limit(ip);
        
        if (!success) {
            return NextResponse.json(
                { error: 'Too many requests' },
                { status: 429 }
            );
        }

        const { userId } = getUserFromRequest(request);
        if (!userId) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        // Get user with employee data
        const user = await prisma.user.findFirst({
            where: { id: userId },
            include: {
                companies: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        address: true,
                        phone: true,
                        nuit: true,
                        created_at: true,
                        _count: {
                            select: {
                                employees: true,
                                products: true,
                                sales: true
                            }
                        }
                    }
                }
            }
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Generate structured data
        const organization = user.companies?.[0] ? generateOrganizationData() : null;
        const website = generateWebsiteData();

        const { userEmail } = getUserFromRequest(request);
        logger.info('Metadata accessed', { userId, userEmail: userEmail || 'unknown' });

        return NextResponse.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    full_name: user.full_name,
                    role: user.role,
                    created_at: user.created_at,
                },
                company: user.companies?.[0] ? {
                    id: user.companies[0].id,
                    name: user.companies[0].name,
                    email: user.companies[0].email,
                    address: user.companies[0].address,
                    phone: user.companies[0].phone,
                    nuit: user.companies[0].nuit,
                    created_at: user.companies[0].created_at,
                    stats: user.companies[0]._count || {
                        employees: 0,
                        products: 0,
                        sales: 0,
                    }
                } : null,
                organization,
                website,
                metadata: {
                    last_updated: new Date().toISOString(),
                    version: '1.0.0',
                }
            }
        });

    } catch (error) {
        logger.error('Failed to fetch metadata:', { 
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        
        return NextResponse.json({ 
            error: 'Failed to fetch metadata' 
        }, { status: 500 });
    }
}

// Sitemap endpoint
export async function SITEMAP() {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const companies = await prisma.company.findMany({
        select: {
            id: true,
            updated_at: true,
        }
    });

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>${baseUrl}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
    </url>
    ${companies.map(company => `
    <url>
        <loc>${baseUrl}/companies/${company.id}</loc>
        <lastmod>${company.updated_at.toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>`).join('')}
</urlset>`;

    return new NextResponse(sitemap, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        }
    });
}

// Robots.txt
export async function ROBOTS() {
    const robots = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /_next/
Sitemap: ${process.env.NEXT_PUBLIC_APP_URL}/sitemap.xml
`;

    return new NextResponse(robots, {
        headers: {
            'Content-Type': 'text/plain',
            'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        }
    });
}