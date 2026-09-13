import Link from 'next/link';
import NavLinks from './NavLinks';
import { formatMeetingDate } from '@/lib/format';
import { getCurrentSunday } from '@/lib/meetings-db';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/meetings', label: 'All Meetings' },
  { href: '/meetings/current', label: 'This Sunday' },
];

interface HeaderProps {
  wardName?: string;
}

export default function Header({ wardName = 'Maple Hills Ward' }: HeaderProps) {
  const today = getCurrentSunday();

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
        <nav aria-label="Main navigation">
          <NavLinks links={NAV_LINKS} />
        </nav>
      </div>
    </header>
  );
}
