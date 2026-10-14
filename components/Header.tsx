import Link from 'next/link';
import NavLinks from './NavLinks';
import SignOutButton from './SignOutButton';
import { auth } from '@/auth';
import { formatMeetingDate, getToday } from '@/lib/format';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/meetings', label: 'All Meetings' },
  { href: '/meetings/current', label: 'This Sunday' },
];

interface HeaderProps {
  wardName?: string;
}

export default async function Header({ wardName = 'Maple Hills Ward' }: HeaderProps) {
  const today = getToday();
  const session = await auth();

  return (
    <header className="bg-slate-800 text-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/" className="text-xl font-bold tracking-tight hover:underline">
            {wardName}
          </Link>
          <p className="text-sm text-slate-300">
            Sacrament Meeting Planner &middot;{' '}
            <time dateTime={today}>{formatMeetingDate(today)}</time>
          </p>
        </div>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
          <nav aria-label="Main navigation">
            <NavLinks links={NAV_LINKS} />
          </nav>

          {session?.user ? (
            <div className="flex items-center gap-3">
              <p className="text-sm text-slate-200">
                <span className="sr-only">Signed in as </span>
                {session.user.name ?? session.user.email}
              </p>
              <SignOutButton />
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-white hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
