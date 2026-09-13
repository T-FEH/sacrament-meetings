import type { Hymn, SacramentMeeting, SpeakerItem } from '@/lib/types';
import { MEETING_TYPE_LABELS, isSacramentMeeting } from '@/lib/types';
import { formatMeetingDate } from '@/lib/format';

interface MeetingDetailProps {
  meeting: SacramentMeeting;
}

function HymnLine({ hymn }: { hymn: Hymn }) {
  return (
    <span>
      {hymn.title}
      <span className="text-slate-600"> (no. {hymn.number})</span>
    </span>
  );
}

function AgendaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 border-b border-slate-200 py-3 sm:grid-cols-[12rem_1fr] sm:gap-4">
      <dt className="font-semibold text-slate-900">{label}</dt>
      <dd className="text-slate-800">{children}</dd>
    </div>
  );
}

function ProgramItems({ items }: { items: SpeakerItem[] }) {
  if (items.length === 0) {
    return <p className="text-slate-600">Open time for the bearing of testimonies.</p>;
  }

  return (
    <ol className="space-y-2">
      {items.map((item, index) => (
        <li key={`${item.type}-${item.name}-${index}`}>
          <span className="font-medium">{item.name}</span>
          {item.type === 'musical-number' && (
            <span className="ml-2 rounded bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-900">
              Musical number
            </span>
          )}
          {item.topic && <span className="block text-sm text-slate-600">{item.topic}</span>}
        </li>
      ))}
    </ol>
  );
}

export default function MeetingDetail({ meeting }: MeetingDetailProps) {
  const showsSacrament = isSacramentMeeting(meeting.meetingType);

  return (
    <article className="rounded-lg border border-slate-300 bg-white p-6 shadow-sm print:border-0 print:shadow-none">
      <header className="mb-6 border-b border-slate-300 pb-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-sky-800">
          {MEETING_TYPE_LABELS[meeting.meetingType]}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
          <time dateTime={meeting.date}>{formatMeetingDate(meeting.date)}</time>
        </h1>
        {!showsSacrament && (
          <p className="mt-2 text-sm text-slate-700">
            This is not a sacrament meeting, so the sacrament hymn and ordinance are not part of the
            program.
          </p>
        )}
      </header>

      {meeting.announcements && meeting.announcements.length > 0 && (
        <section aria-labelledby="announcements-heading" className="mb-6">
          <h2 id="announcements-heading" className="mb-2 text-lg font-bold text-slate-900">
            Announcements
          </h2>
          <ul className="list-disc space-y-1 pl-5 text-slate-800">
            {meeting.announcements.map((announcement) => (
              <li key={announcement}>{announcement}</li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="agenda-heading">
        <h2 id="agenda-heading" className="mb-2 text-lg font-bold text-slate-900">
          Program
        </h2>
        <dl>
          <AgendaRow label="Presiding">{meeting.presiding}</AgendaRow>
          <AgendaRow label="Conducting">{meeting.conducting}</AgendaRow>
          <AgendaRow label="Opening Hymn">
            <HymnLine hymn={meeting.openingHymn} />
          </AgendaRow>
          <AgendaRow label="Opening Prayer">{meeting.openingPrayer}</AgendaRow>

          <AgendaRow label="Ward Business">
            {meeting.wardBusiness.length > 0 ? (
              <ul className="list-disc space-y-1 pl-5">
                {meeting.wardBusiness.map((item) => (
                  <li key={item.description}>{item.description}</li>
                ))}
              </ul>
            ) : (
              <span className="text-slate-600">None</span>
            )}
          </AgendaRow>

          <AgendaRow label="Stake Business">
            {meeting.stakeBusiness ? 'Yes' : 'No'}
          </AgendaRow>

          {showsSacrament && (
            <AgendaRow label="Sacrament Hymn">
              <HymnLine hymn={meeting.sacramentHymn} />
            </AgendaRow>
          )}

          <AgendaRow label="Speakers and Music">
            <ProgramItems items={meeting.speakers} />
          </AgendaRow>

          <AgendaRow label="Closing Hymn">
            <HymnLine hymn={meeting.closingHymn} />
          </AgendaRow>
          <AgendaRow label="Closing Prayer">{meeting.closingPrayer}</AgendaRow>
        </dl>
      </section>
    </article>
  );
}
