import { redirect } from 'next/navigation';
import { getCurrentSunday, getMeetings } from '@/lib/meetings-db';

/**
 * Redirects to the meeting held on the most recent Sunday.
 * Falls back to the full list when no meeting exists for that date.
 *
 * The lookup reads the data module directly rather than going through
 * /api/meetings on purpose: an awaited fetch lets Next.js begin streaming the
 * document before the redirect is known, which downgrades the response from a
 * 307 to a one-second `<meta http-equiv="refresh">`. Resolving synchronously
 * keeps this a real HTTP redirect with no visible delay.
 *
 * `redirect()` signals by throwing, so it is never wrapped in a try/catch.
 */
/**
 * The current Sunday changes over time, so this route must never be baked
 * into the build output. Without this the route prerenders and would keep
 * redirecting to whichever meeting was current on the day it was built.
 */
export const dynamic = 'force-dynamic';

export default function CurrentMeetingPage() {
  const sunday = getCurrentSunday();
  const meeting = getMeetings(sunday)[0];

  redirect(meeting ? `/meetings/${meeting.id}` : '/meetings');
}
