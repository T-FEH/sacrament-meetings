import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import MeetingDetail from '@/components/MeetingDetail';
import PrintButton from '@/components/PrintButton';
import { getMeetingById } from '@/lib/meetings-db';
import { formatShortDate } from '@/lib/format';

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

  return {
    title: meeting ? `Program for ${formatShortDate(meeting.date)}` : 'Meeting not found',
  };
}

export default async function MeetingPage({ params }: MeetingPageProps) {
  const { id } = await params;
  const meetingId = parseMeetingId(id);
  const meeting = meetingId === null ? null : await getMeetingById(meetingId);

  if (!meeting) notFound();

  return (
    <main id="main-content">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href="/meetings" className="text-sm font-semibold text-sky-800 hover:underline">
          <span aria-hidden="true">&larr; </span>Back to all meetings
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href={`/meetings/${meeting.id}/edit`}
            className="rounded-md border border-slate-400 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100"
          >
            Edit
          </Link>
          <PrintButton />
        </div>
      </div>

      <MeetingDetail meeting={meeting} />
    </main>
  );
}
