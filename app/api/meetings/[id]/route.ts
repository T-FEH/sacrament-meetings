import { NextResponse } from 'next/server';
import { getMeetingById } from '@/lib/meetings-db';
import type { ApiError, SacramentMeeting } from '@/lib/types';

/**
 * GET /api/meetings/[id]
 *  200 - the matching meeting
 *  400 - the id segment is not a positive integer
 *  404 - no meeting exists with that id
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<SacramentMeeting | ApiError>> {
  const { id } = await params;

  if (!/^\d+$/.test(id)) {
    return NextResponse.json(
      { error: `Invalid meeting id '${id}'. The id must be a positive integer.` },
      { status: 400 }
    );
  }

  const meeting = getMeetingById(Number(id));

  if (!meeting) {
    return NextResponse.json({ error: `No meeting found with id ${id}.` }, { status: 404 });
  }

  return NextResponse.json(meeting);
}
