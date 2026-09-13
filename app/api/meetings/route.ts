import { NextResponse } from 'next/server';
import { getMeetings } from '@/lib/meetings-db';
import type { SacramentMeeting } from '@/lib/types';

/**
 * GET /api/meetings
 * GET /api/meetings?date=2026-05-03
 */
export async function GET(request: Request): Promise<NextResponse<SacramentMeeting[]>> {
  const date = new URL(request.url).searchParams.get('date');
  const meetings = getMeetings(date);
  return NextResponse.json(meetings);
}
