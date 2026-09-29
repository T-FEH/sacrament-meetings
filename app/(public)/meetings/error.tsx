'use client';

import Link from 'next/link';
import { useEffect } from 'react';

/**
 * Error boundary for the member-facing meetings routes.
 * `notFound()` and `redirect()` are not caught here — Next.js re-throws those
 * past error boundaries — so this only handles genuine failures such as the
 * database being unreachable.
 */
export default function MeetingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Meetings route error:', error);
  }, [error]);

  return (
    <main id="main-content" className="rounded-lg border border-red-300 bg-white p-8">
      <h1 className="font-serif text-2xl font-bold text-slate-900">Something went wrong</h1>
      <p className="mt-2 text-slate-700">
        {error.message || 'The meeting information could not be loaded.'}
      </p>
      {error.digest && <p className="mt-1 text-sm text-slate-600">Reference: {error.digest}</p>}

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-md bg-sky-800 px-5 py-2.5 font-semibold text-white hover:bg-sky-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-800"
        >
          Try again
        </button>
        <Link
          href="/meetings"
          className="rounded-md border border-slate-400 bg-white px-5 py-2.5 font-semibold text-slate-900 hover:bg-slate-100"
        >
          Back to all meetings
        </Link>
      </div>
    </main>
  );
}
