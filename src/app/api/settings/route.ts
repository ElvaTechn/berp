import { NextRequest, NextResponse } from 'next/server';
import { apiRateLimit, getClientIP } from '@/lib/rateLimit';
import { getSettings, updateSettings, type GlobalSettings } from '@/lib/settings';
import { logger } from '@/lib/logger';
import { z } from 'zod';

function getUserFromRequest(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  const userEmail = request.headers.get('x-user-email');
  const userRole = request.headers.get('x-user-role');
  return { userId, userEmail, userRole };
}

const settingsUpdateSchema = z.object({
  currency: z.string().min(1).max(10).optional(),
  dateFormat: z.string().min(1).max(20).optional(),
  lowStockThreshold: z.number().int().min(0).max(10000).optional(),
  enableEmailNotifications: z.boolean().optional(),
  enableSmsNotifications: z.boolean().optional(),
  backupFrequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
  companyName: z.string().max(200).optional(),
  companyLogo: z.string().url().max(500).or(z.literal('')).optional(),
});

export async function GET(request: NextRequest) {
  try {
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

    const settings = getSettings();

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    logger.error('Failed to fetch settings:', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const ip = await getClientIP(request);
    const { success } = await apiRateLimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    const { userId, userRole } = getUserFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (userRole?.toUpperCase() !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validationResult = settingsUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid input',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const updatedSettings = updateSettings(validationResult.data as Partial<GlobalSettings>);

    logger.info('Settings updated', {
      userId,
      updates: Object.keys(validationResult.data),
    });

    return NextResponse.json({
      success: true,
      data: updatedSettings,
    });
  } catch (error) {
    logger.error('Failed to update settings:', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
