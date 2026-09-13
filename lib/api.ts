import { headers } from 'next/headers';
import type { SacramentMeeting } from './types';

/**
 * Builds the absolute origin for server-side fetches.
 * Server Components have no notion of a relative base URL, so the incoming
 * request headers are used to reconstruct the origin. This works unchanged
 * for localhost, Vercel preview deployments, and production.
 */
async function getBaseUrl(): Promise<string> {
  const headerList = await headers();
  const host = headerList.get('x-forwarded-host') ?? headerList.get('host');
  if (!host) throw new Error('Unable to determine request host for API fetch.');
  const protocol = headerList.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
  return `${protocol}://${host}`;
}

/** Fetches every meeting, optionally filtered to a single ISO date. */
export async function fetchMeetings(date?: string): Promise<SacramentMeeting[]> {
  const baseUrl = await getBaseUrl();
  const query = date ? `?date=${encodeURIComponent(date)}` : '';
  const response = await fetch(`${baseUrl}/api/meetings${query}`, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`Failed to load meetings (${response.status}).`);
  }

  return (await response.json()) as SacramentMeeting[];
}

/** Fetches one meeting by id, or null when the API reports 404. */
export async function fetchMeetingById(id: string): Promise<SacramentMeeting | null> {
  const baseUrl = await getBaseUrl();
  const response = await fetch(`${baseUrl}/api/meetings/${encodeURIComponent(id)}`, {
    cache: 'no-store',
  });

  if (response.status === 404 || response.status === 400) return null;

  if (!response.ok) {
    throw new Error(`Failed to load meeting ${id} (${response.status}).`);
  }

  return (await response.json()) as SacramentMeeting;
}
