import { NextResponse } from 'next/server';
import { getAllMeetings, getMeetings, getMeetingsByDate } from '@/lib/meetings-db';
import type { SacramentMeeting } from '@/lib/types';

/**
 * GET /api/meetings
 * GET /api/meetings?date=2026-03-01   exact-date filter
 * GET /api/meetings?query=smith       search across leaders, type, and speakers
 * GET /api/meetings?page=2            paginated (5 per page), combinable with query
 *
 * Without a `page` parameter the endpoint returns every match rather than a
 * single page, so the collection route stays a complete data source while the
 * meetings list page drives its own pagination.
 */
export async function GET(request: Request): Promise<NextResponse<SacramentMeeting[]>> {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const query = searchParams.get('query') ?? '';
  const pageParam = searchParams.get('page');

  if (date) {
    return NextResponse.json(await getMeetingsByDate(date));
  }

  if (pageParam) {
    const page = Number(pageParam) || 1;
    return NextResponse.json(await getMeetings(query, page));
  }

  return NextResponse.json(await getAllMeetings(query));
}
