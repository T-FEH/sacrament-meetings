import { neon } from '@neondatabase/serverless';
import type { SacramentMeeting } from './types';

/**
 * Live PostgreSQL (Neon) data access for sacrament meetings.
 *
 * Every query goes through `sql.query(text, params)` with numbered `$1`
 * placeholders, so values are always sent as bound parameters and user input
 * is never concatenated into SQL. The shared column list is a module constant,
 * never user input.
 */
let client: ReturnType<typeof neon> | null = null;

/**
 * Creates the Neon client on first use rather than at module load.
 * Building at module scope would throw during `next build` on any machine
 * without DATABASE_URL set, even though every page that queries is dynamic.
 */
function sql() {
  if (!client) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is not set. Add it to .env.local or the Vercel project.');
    }
    client = neon(connectionString);
  }
  return client;
}

/** Runs a parameterised query and returns the rows typed as T. */
async function queryRows<T>(text: string, params: unknown[] = []): Promise<T[]> {
  const rows = await sql().query(text, params);
  return rows as unknown as T[];
}

export const ITEMS_PER_PAGE = 5;

/**
 * Column list shared by every SELECT. The table uses snake_case while the
 * SacramentMeeting interface uses camelCase, so each column is aliased to the
 * property name the components already expect.
 */
const MEETING_COLUMNS = `
  id,
  to_char(date, 'YYYY-MM-DD') AS "date",
  meeting_type                AS "meetingType",
  presiding,
  conducting,
  announcements,
  opening_hymn                AS "openingHymn",
  opening_prayer              AS "openingPrayer",
  ward_business               AS "wardBusiness",
  stake_business              AS "stakeBusiness",
  sacrament_hymn              AS "sacramentHymn",
  speakers,
  closing_hymn                AS "closingHymn",
  closing_prayer              AS "closingPrayer"
`;

/** Returns one page of meetings matching the search term, newest first. */
export async function getMeetings(
  query: string = '',
  currentPage: number = 1
): Promise<SacramentMeeting[]> {
  const searchTerm = `%${query}%`;
  const page = Number.isFinite(currentPage) && currentPage > 0 ? Math.floor(currentPage) : 1;
  const offset = (page - 1) * ITEMS_PER_PAGE;

  const rows = await queryRows<SacramentMeeting>(
    `SELECT ${MEETING_COLUMNS}
     FROM meetings
     WHERE presiding ILIKE $1
        OR conducting ILIKE $1
        OR meeting_type ILIKE $1
        OR speakers::text ILIKE $1
     ORDER BY date DESC
     LIMIT $2 OFFSET $3`,
    [searchTerm, ITEMS_PER_PAGE, offset]
  );

  return rows;
}

/** Number of pages available for a given search term (minimum 1). */
export async function getMeetingsTotalPages(query: string = ''): Promise<number> {
  const searchTerm = `%${query}%`;

  const rows = await queryRows<{ count: number }>(
    `SELECT COUNT(*)::int AS count
     FROM meetings
     WHERE presiding ILIKE $1
        OR conducting ILIKE $1
        OR meeting_type ILIKE $1
        OR speakers::text ILIKE $1`,
    [searchTerm]
  );

  const total = Number(rows[0]?.count ?? 0);
  return Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
}

/** Every meeting matching the search term, unpaginated. Used by the API route. */
export async function getAllMeetings(query: string = ''): Promise<SacramentMeeting[]> {
  const searchTerm = `%${query}%`;

  const rows = await queryRows<SacramentMeeting>(
    `SELECT ${MEETING_COLUMNS}
     FROM meetings
     WHERE presiding ILIKE $1
        OR conducting ILIKE $1
        OR meeting_type ILIKE $1
        OR speakers::text ILIKE $1
     ORDER BY date DESC`,
    [searchTerm]
  );

  return rows;
}

/** Meetings held on an exact ISO date. Backs /api/meetings?date=YYYY-MM-DD. */
export async function getMeetingsByDate(date: string): Promise<SacramentMeeting[]> {
  const rows = await queryRows<SacramentMeeting>(
    `SELECT ${MEETING_COLUMNS} FROM meetings WHERE date = $1 ORDER BY date DESC`,
    [date]
  );

  return rows;
}

/** A single meeting by id, or null when no row matches. */
export async function getMeetingById(id: number): Promise<SacramentMeeting | null> {
  const rows = await queryRows<SacramentMeeting>(
    `SELECT ${MEETING_COLUMNS} FROM meetings WHERE id = $1`, [id]);

  return rows[0] ?? null;
}

// Mutation stubs — wired to the database in Week 04.

export async function addMeeting(
  _data: Omit<SacramentMeeting, 'id'>
): Promise<SacramentMeeting> {
  throw new Error('addMeeting: database implementation coming in Week 04');
}

export async function updateMeeting(
  _id: number,
  _updates: Partial<SacramentMeeting>
): Promise<SacramentMeeting | null> {
  throw new Error('updateMeeting: database implementation coming in Week 04');
}

export async function deleteMeeting(_id: number): Promise<boolean> {
  throw new Error('deleteMeeting: database implementation coming in Week 04');
}
