'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavLink {
  href: string;
  label: string;
}

interface NavLinksProps {
  links: NavLink[];
  /** Extra classes applied to the wrapping list. */
  className?: string;
}

/**
 * Client Component: highlights the link matching the current route.
 * `usePathname` requires client-side rendering, which is why this is the
 * only interactive component in the app.
 */
export default function NavLinks({ links, className = '' }: NavLinksProps) {
  const pathname = usePathname();

  return (
    <ul className={`flex flex-wrap items-center gap-2 ${className}`}>
      {links.map((link) => {
        const isActive =
          link.href === '/' ? pathname === '/' : pathname === link.href || pathname.startsWith(`${link.href}/`);

        return (
          <li key={link.href}>
            <Link
              href={link.href}
              aria-current={isActive ? 'page' : undefined}
              className={`inline-block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-100 hover:bg-white/15 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
