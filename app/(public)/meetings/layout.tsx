import Link from 'next/link';

export default function MeetingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm print:hidden">
        <ol className="flex flex-wrap items-center gap-2 text-slate-600">
          <li>
            <Link href="/" className="hover:underline">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/meetings" className="hover:underline">
              Meetings
            </Link>
          </li>
        </ol>
      </nav>
      {children}
    </div>
  );
}
