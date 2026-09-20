'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

interface PaginationProps {
  totalPages: number;
}

/**
 * Client Component: previous/next links that preserve the active search term
 * by rebuilding the existing query string rather than replacing it.
 */
export default function Pagination({ totalPages }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get('page')) || 1;

  function createPageURL(page: number): string {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(page));
    return `${pathname}?${params.toString()}`;
  }

  if (totalPages <= 1) return null;

  const linkClasses =
    'rounded-md border border-slate-400 bg-white px-4 py-2 text-sm font-semibold text-sky-800 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-800';

  return (
    <nav aria-label="Pagination" className="mt-8 flex items-center justify-between gap-4">
      {currentPage > 1 ? (
        <Link href={createPageURL(currentPage - 1)} rel="prev" className={linkClasses}>
          <span aria-hidden="true">&larr; </span>Previous
        </Link>
      ) : (
        <span aria-hidden="true" />
      )}

      <p aria-live="polite" className="text-sm font-medium text-slate-800">
        Page {currentPage} of {totalPages}
      </p>

      {currentPage < totalPages ? (
        <Link href={createPageURL(currentPage + 1)} rel="next" className={linkClasses}>
          Next<span aria-hidden="true"> &rarr;</span>
        </Link>
      ) : (
        <span aria-hidden="true" />
      )}
    </nav>
  );
}
