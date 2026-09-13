import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import MeetingDetail from '@/components/MeetingDetail';
import PrintButton from '@/components/PrintButton';
import { fetchMeetingById } from '@/lib/api';
import { formatShortDate } from '@/lib/format';

interface MeetingPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: MeetingPageProps): Promise<Metadata> {
  const { id } = await params;
  const meeting = await fetchMeetingById(id);

  return {
    title: meeting ? `Program for ${formatShortDate(meeting.date)}` : 'Meeting not found',
  };
}

export default async function MeetingPage({ params }: MeetingPageProps) {
  const { id } = await params;
  const meeting = await fetchMeetingById(id);

  if (!meeting) notFound();

  return (
    <main id="main-content">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href="/meetings" className="text-sm font-semibold text-sky-800 hover:underline">
          <span aria-hidden="true">&larr; </span>Back to all meetings
        </Link>
        <PrintButton />
      </div>

      <MeetingDetail meeting={meeting} />
    </main>
  );
}
