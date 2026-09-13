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
