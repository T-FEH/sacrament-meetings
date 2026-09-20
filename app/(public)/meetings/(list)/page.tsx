import type { Metadata } from 'next';
import MeetingCard from '@/components/MeetingCard';
import MeetingSearch from '@/components/MeetingSearch';
import Pagination from '@/components/Pagination';
import { getMeetings, getMeetingsTotalPages } from '@/lib/meetings-db';

export const metadata: Metadata = {
  title: 'All Meetings',
};

interface MeetingsPageProps {
  searchParams?: Promise<{ query?: string; page?: string }>;
}

export default async function MeetingsPage(props: MeetingsPageProps) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query ?? '';
  const currentPage = Number(searchParams?.page) || 1;

  const [meetings, totalPages] = await Promise.all([
    getMeetings(query, currentPage),
    getMeetingsTotalPages(query),
  ]);

  return (
    <main id="main-content">
      <h1 className="font-serif text-3xl font-bold text-slate-900">Sacrament Meetings</h1>
      <p className="mt-2 mb-6 text-slate-700">
        Search past and upcoming programs by speaker, leader, or meeting type.
      </p>

      <MeetingSearch />

      <p aria-live="polite" className="mb-4 text-sm text-slate-700">
        {query
          ? `Showing results for "${query}" — page ${currentPage} of ${totalPages}.`
          : `Showing page ${currentPage} of ${totalPages}, most recent first.`}
      </p>

      {meetings.length === 0 ? (
        <p className="rounded-lg border border-slate-300 bg-white p-6 text-slate-700">
          No meetings match that search. Try a speaker name, a leader, or a meeting type such as
          &ldquo;testimony&rdquo;.
        </p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {meetings.map((meeting) => (
            <li key={meeting.id}>
              <MeetingCard meeting={meeting} />
            </li>
          ))}
        </ul>
      )}

      <Pagination totalPages={totalPages} />
    </main>
  );
}
