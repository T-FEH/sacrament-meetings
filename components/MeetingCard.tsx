import Link from 'next/link';
import type { SacramentMeeting } from '@/lib/types';
import { MEETING_TYPE_LABELS } from '@/lib/types';
import { formatShortDate } from '@/lib/format';

interface MeetingCardProps {
  meeting: SacramentMeeting;
}

const TYPE_BADGE: Record<SacramentMeeting['meetingType'], string> = {
  regular: 'bg-sky-100 text-sky-900',
  testimony: 'bg-emerald-100 text-emerald-900',
  stake: 'bg-amber-100 text-amber-900',
  general: 'bg-violet-100 text-violet-900',
};

export default function MeetingCard({ meeting }: MeetingCardProps) {
  const speakerCount = meeting.speakers.filter((s) => s.type === 'speaker').length;
  const musicalCount = meeting.speakers.filter((s) => s.type === 'musical-number').length;

  return (
    <article className="rounded-lg border border-slate-300 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-slate-900">
          <Link
            href={`/meetings/${meeting.id}`}
            className="rounded hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
          >
            <time dateTime={meeting.date}>{formatShortDate(meeting.date)}</time>
          </Link>
        </h2>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${TYPE_BADGE[meeting.meetingType]}`}>
          {MEETING_TYPE_LABELS[meeting.meetingType]}
        </span>
      </div>

      <dl className="space-y-1 text-sm text-slate-700">
        <div className="flex gap-2">
          <dt className="font-semibold">Presiding:</dt>
          <dd>{meeting.presiding}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="font-semibold">Conducting:</dt>
          <dd>{meeting.conducting}</dd>
        </div>
      </dl>

      <p className="mt-3 text-sm text-slate-600">
        {speakerCount} {speakerCount === 1 ? 'speaker' : 'speakers'}
        {musicalCount > 0 && `, ${musicalCount} musical ${musicalCount === 1 ? 'number' : 'numbers'}`}
        {meeting.stakeBusiness && ' · Stake business'}
      </p>

      <p className="mt-4">
        <Link
          href={`/meetings/${meeting.id}`}
          className="text-sm font-semibold text-sky-800 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
        >
          View agenda
          <span className="sr-only"> for {formatShortDate(meeting.date)}</span>
          <span aria-hidden="true"> &rarr;</span>
        </Link>
      </p>
    </article>
  );
}
