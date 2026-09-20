import { redirect } from 'next/navigation';
import { getMeetingsByDate } from '@/lib/meetings-db';
import { getCurrentSunday } from '@/lib/format';

/**
 * Redirects to the meeting held on the most recent Sunday.
 * Falls back to the full list when no meeting exists for that date.
 *
 * The current Sunday changes over time, so this route must never be baked into
 * the build output.
 *
 * `redirect()` signals by throwing, so it is never wrapped in a try/catch.
 */
export const dynamic = 'force-dynamic';

export default async function CurrentMeetingPage() {
  const sunday = getCurrentSunday();
  const [meeting] = await getMeetingsByDate(sunday);

  redirect(meeting ? `/meetings/${meeting.id}` : '/meetings');
}
