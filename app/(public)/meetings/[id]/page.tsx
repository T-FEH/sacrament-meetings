import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import MeetingDetail from '@/components/MeetingDetail';
import PrintButton from '@/components/PrintButton';
import DeleteMeetingButton from '@/components/DeleteMeetingButton';
import { getMeetingById } from '@/lib/meetings-db';
import { formatShortDate } from '@/lib/format';
import { MEETING_TYPE_LABELS } from '@/lib/types';
import { ogImage } from '@/lib/site';
import { auth } from '@/auth';

interface MeetingPageProps {
  params: Promise<{ id: string }>;
}

/** Parses the id segment, returning null for anything that is not a positive integer. */
function parseMeetingId(id: string): number | null {
  return /^\d+$/.test(id) ? Number(id) : null;
}

export async function generateMetadata({ params }: MeetingPageProps): Promise<Metadata> {
  const { id } = await params;
  const meetingId = parseMeetingId(id);
  const meeting = meetingId === null ? null : await getMeetingById(meetingId);

  if (!meeting) {
    return { title: 'Meeting not found', robots: { index: false, follow: true } };
  }

  const speakerNames = meeting.speakers
    .filter((item) => item.type === 'speaker')
    .map((item) => item.name);
  const description = speakerNames.length
    ? `${MEETING_TYPE_LABELS[meeting.meetingType]} on ${formatShortDate(meeting.date)}. Presiding: ${meeting.presiding}. Speakers: ${speakerNames.join(', ')}.`
    : `${MEETING_TYPE_LABELS[meeting.meetingType]} on ${formatShortDate(meeting.date)}. Presiding: ${meeting.presiding}. Conducting: ${meeting.conducting}.`;

  const title = `Program for ${formatShortDate(meeting.date)}`;

  return {
    title,
    description,
    alternates: { canonical: `/meetings/${meeting.id}` },
    openGraph: {
      title: `${title} | Sacrament Meeting Planner`,
      description,
      url: `/meetings/${meeting.id}`,
      type: 'article',
      images: [ogImage],
    },
  };
}

export default async function MeetingPage({ params }: MeetingPageProps) {
  const { id } = await params;
  const meetingId = parseMeetingId(id);
  const meeting = meetingId === null ? null : await getMeetingById(meetingId);

  if (!meeting) notFound();

  const session = await auth();
  const canManage = Boolean(session?.user);

  return (
    <main id="main-content">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href="/meetings" className="text-sm font-semibold text-sky-800 hover:underline">
          <span aria-hidden="true">&larr; </span>Back to all meetings
        </Link>
        <div className="flex items-center gap-3">
          {canManage && (
            <>
              <Link
                href={`/meetings/${meeting.id}/edit`}
                className="rounded-md border border-slate-400 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100"
              >
                Edit
              </Link>
              <DeleteMeetingButton id={meeting.id} label={formatShortDate(meeting.date)} />
            </>
          )}
          <PrintButton />
        </div>
      </div>

      <MeetingDetail meeting={meeting} />
    </main>
  );
}
