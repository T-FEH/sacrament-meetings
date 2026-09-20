'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

/**
 * Client Component: keeps the search term in the URL rather than in component
 * state, so a filtered list survives a refresh, a shared link, and the browser
 * back button. Input is debounced to avoid a database round-trip per keystroke.
 */
export default function MeetingSearch() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1'); // a new search always restarts at page 1
    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    <div className="mb-6">
      <label htmlFor="meeting-search" className="mb-1 block text-sm font-semibold text-slate-900">
        Search meetings
      </label>
      <input
        id="meeting-search"
        type="search"
        name="query"
        placeholder="Search by speaker, leader, or meeting type..."
        defaultValue={searchParams.get('query')?.toString()}
        onChange={(event) => handleSearch(event.target.value)}
        aria-label="Search meetings"
        className="w-full rounded-md border border-slate-400 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-800"
      />
    </div>
  );
}
