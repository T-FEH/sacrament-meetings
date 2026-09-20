/**
 * Formats an ISO 'YYYY-MM-DD' string for display.
 * The parts are split manually rather than passed to `new Date(iso)`, which
 * parses bare ISO dates as UTC and can render the previous day in negative
 * time zones.
 */
export function formatMeetingDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** Short form used on summary cards, e.g. "Sun, Sep 13, 2026". */
export function formatShortDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** Formats a Date as 'YYYY-MM-DD' using local time. */
function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * The most recent Sunday (today, when today is Sunday).
 * Lives here rather than in meetings-db so components that only need the date
 * do not pull in the database client — that would force every page importing
 * them to require DATABASE_URL at build time.
 */
export function getCurrentSunday(): string {
  const today = new Date();
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - today.getDay());
  return toIsoDate(sunday);
}
