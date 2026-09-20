import Link from 'next/link';

export default function MeetingNotFound() {
  return (
    <main id="main-content" className="rounded-lg border border-slate-300 bg-white p-8 text-center">
      <h1 className="font-serif text-2xl font-bold text-slate-900">Meeting not found</h1>
      <p className="mt-2 text-slate-700">
        No sacrament meeting matches that id. It may have been removed, or the link may be
        incorrect.
      </p>
      <p className="mt-6">
        <Link
          href="/meetings"
          className="rounded-md bg-sky-800 px-5 py-2.5 font-semibold text-white hover:bg-sky-900"
        >
          View all meetings
        </Link>
      </p>
    </main>
  );
}
