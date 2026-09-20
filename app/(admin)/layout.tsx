import Link from 'next/link';

/**
 * Layout for leader-facing (admin) routes.
 * Authentication is scaffolded in Week 05; for now this only marks the area
 * visually so it is obvious these pages are not member-facing.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <aside
        aria-label="Admin area notice"
        className="mb-6 rounded-md border border-amber-300 bg-amber-50 px-4 py-3"
      >
        <p className="text-sm font-semibold text-amber-900">
          Leader tools &mdash; not visible to members. Authentication is added in Week 05.
        </p>
      </aside>

      <nav aria-label="Admin" className="mb-6 text-sm">
        <ul className="flex flex-wrap gap-4">
          <li>
            <Link href="/meetings" className="text-sky-800 hover:underline">
              Back to meetings
            </Link>
          </li>
          <li>
            <Link href="/meetings/new" className="text-sky-800 hover:underline">
              Create meeting
            </Link>
          </li>
        </ul>
      </nav>

      {children}
    </div>
  );
}
