import type { Metadata } from 'next';
import MeetingCard from '@/components/MeetingCard';
import { fetchMeetings } from '@/lib/api';

export const metadata: Metadata = {
  title: 'All Meetings',
};

export default async function MeetingsPage() {
  const meetings = await fetchMeetings();

  return (
    <main id="main-content">
      <h1 className="font-serif text-3xl font-bold text-slate-900">Sacrament Meetings</h1>
      <p className="mt-2 text-slate-700">
        {meetings.length} {meetings.length === 1 ? 'meeting' : 'meetings'} on file, most recent
        first.
      </p>

      {meetings.length === 0 ? (
        <p className="mt-8 rounded-lg border border-slate-300 bg-white p-6 text-slate-700">
          No meetings have been scheduled yet.
        </p>
      ) : (
        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {meetings.map((meeting) => (
            <li key={meeting.id}>
              <MeetingCard meeting={meeting} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
