/**
 * Route-level loading UI for the /meetings list.
 *
 * It lives in a `(list)` route group — which does not affect the URL — so the
 * Suspense boundary it creates wraps only /meetings. Placing it directly in
 * app/meetings/ would also wrap /meetings/[id] and /meetings/current, and a
 * boundary above those routes makes Next.js flush the document shell before
 * the page resolves. That downgrades `redirect()` from a 307 to a one-second
 * `<meta http-equiv="refresh">` and makes `notFound()` respond 200 instead of
 * 404. Scoping the boundary keeps both of those correct.
 *
 * In-memory reads resolve instantly, so this rarely paints today; it becomes
 * meaningful once a real database introduces latency.
 */
export default function Loading() {
  return (
    <div role="status" aria-live="polite" className="space-y-4">
      <span className="sr-only">Loading meetings…</span>
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="animate-pulse rounded-lg border border-slate-300 bg-white p-5 shadow-sm"
          aria-hidden="true"
        >
          <div className="mb-3 h-5 w-48 rounded bg-slate-200" />
          <div className="mb-2 h-4 w-64 rounded bg-slate-200" />
          <div className="h-4 w-40 rounded bg-slate-200" />
        </div>
      ))}
    </div>
  );
}
