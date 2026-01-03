/**
 * ================================================================
 * CONFLICTS API - BIZCONTROL 360 ERP
 * ================================================================
 * API endpoint to list stock conflicts
 *
 * GET /api/conflicts/list
 * Returns all pending conflicts that need resolution
 * ================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import type { Conflict } from '@/lib/pwa/conflictResolution';

export async function GET() {
  try {
    // Fetch conflicts from database
    // This would normally query the database for stock conflicts
    // For now, return empty array as conflicts are resolved in backend
    const conflicts: Conflict[] = [];

    return NextResponse.json({
      success: true,
      conflicts,
      count: conflicts.length,
    });
  } catch (error) {
    console.error('[API:Conflicts:list] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch conflicts',
      },
      { status: 500 }
    );
  }
}
