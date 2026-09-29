import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import MeetingForm from '@/components/MeetingForm';
import { updateMeeting } from '@/lib/actions';
import { getMeetingById } from '@/lib/meetings-db';
import { formatShortDate } from '@/lib/format';

interface EditMeetingPageProps {
  params: Promise<{ id: string }>;
}

/** Parses the id segment, returning null for anything that is not a positive integer. */
function parseMeetingId(id: string): number | null {
  return /^\d+$/.test(id) ? Number(id) : null;
}

export async function generateMetadata({ params }: EditMeetingPageProps): Promise<Metadata> {
  const { id } = await params;
  const meetingId = parseMeetingId(id);
  const meeting = meetingId === null ? null : await getMeetingById(meetingId);

  return { title: meeting ? `Edit ${formatShortDate(meeting.date)}` : 'Meeting not found' };
}

export default async function EditMeetingPage({ params }: EditMeetingPageProps) {
  const { id } = await params;
  const meetingId = parseMeetingId(id);
  const meeting = meetingId === null ? null : await getMeetingById(meetingId);

  if (!meeting) notFound();

  return (
    <main id="main-content">
      <h1 className="font-serif text-3xl font-bold text-slate-900">
        Edit meeting &mdash; {formatShortDate(meeting.date)}
      </h1>
      <p className="mt-2 mb-6 text-slate-700">
        Update this agenda. Changes are validated on the server before saving.
      </p>

      <MeetingForm
        action={updateMeeting.bind(null, meeting.id)}
        meeting={meeting}
        submitLabel="Save changes"
        cancelHref={`/meetings/${meeting.id}`}
      />
    </main>
  );
}
