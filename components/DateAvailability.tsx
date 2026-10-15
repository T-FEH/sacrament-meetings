'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { SacramentMeeting } from '@/lib/types';

interface DateAvailabilityProps {
  /** ISO date currently entered in the form. */
  date: string;
  /** When editing, the meeting being edited should not count as a conflict. */
  excludeId?: number;
}

type Status =
  | { kind: 'idle' }
  | { kind: 'checking' }
  | { kind: 'free' }
  | { kind: 'taken'; meeting: SacramentMeeting }
  | { kind: 'error' };

/**
 * Client -> route handler -> database.
 *
 * As the leader picks a date this calls GET /api/meetings?date=..., which runs
 * a parameterised query against PostgreSQL and returns JSON. Surfacing the
 * clash here means the duplicate-date unique violation is caught before the
 * form is ever submitted.
 */
export default function DateAvailability({ date, excludeId }: DateAvailabilityProps) {
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  useEffect(() => {
    const controller = new AbortController();

    // Every state update happens inside the debounce timer: calling setState
    // synchronously in an effect body triggers cascading renders.
    const timer = setTimeout(async () => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        setStatus({ kind: 'idle' });
        return;
      }

      setStatus({ kind: 'checking' });

      try {
        const response = await fetch(`/api/meetings?date=${encodeURIComponent(date)}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`Request failed (${response.status})`);

        const meetings = (await response.json()) as SacramentMeeting[];
        const clash = meetings.find((meeting) => meeting.id !== excludeId);

        setStatus(clash ? { kind: 'taken', meeting: clash } : { kind: 'free' });
      } catch (error) {
        if ((error as Error).name === 'AbortError') return;
        setStatus({ kind: 'error' });
      }
    }, 350);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [date, excludeId]);

  return (
    <div aria-live="polite" className="min-h-5 text-sm">
      {status.kind === 'checking' && <p className="text-slate-700">Checking that date…</p>}

      {status.kind === 'free' && (
        <p className="font-medium text-emerald-900">That Sunday is free.</p>
      )}

      {status.kind === 'taken' && (
        <p className="font-medium text-amber-900">
          A meeting is already scheduled for this date.{' '}
          <Link
            href={`/meetings/${status.meeting.id}`}
            className="font-semibold text-sky-900 underline"
          >
            View it
          </Link>
          . Saving will be rejected unless you choose another date.
        </p>
      )}

      {status.kind === 'error' && (
        <p className="text-slate-700">Could not check that date right now.</p>
      )}
    </div>
  );
}
