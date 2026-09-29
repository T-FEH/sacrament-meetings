import Link from 'next/link';

export default function EditMeetingNotFound() {
  return (
    <main id="main-content" className="rounded-lg border border-slate-300 bg-white p-8 text-center">
      <h1 className="font-serif text-2xl font-bold text-slate-900">Meeting not found</h1>
      <p className="mt-2 text-slate-700">
        There is no meeting with that id, so there is nothing to edit. It may have been deleted.
      </p>
      <p className="mt-6">
        <Link
          href="/meetings"
          className="rounded-md bg-sky-800 px-5 py-2.5 font-semibold text-white hover:bg-sky-900"
        >
          Back to all meetings
        </Link>
      </p>
    </main>
  );
}
