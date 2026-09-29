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

/**
 * Maps SacramentMeeting properties to their columns, and marks which ones are
 * stored as JSONB so the value is stringified and cast. The keys of this map
 * are the only column names ever interpolated into SQL — values always travel
 * as bound parameters.
 */
const COLUMN_MAP: Record<keyof Omit<SacramentMeeting, 'id'>, { column: string; json?: boolean }> = {
  date: { column: 'date' },
  meetingType: { column: 'meeting_type' },
  presiding: { column: 'presiding' },
  conducting: { column: 'conducting' },
  announcements: { column: 'announcements' },
  openingHymn: { column: 'opening_hymn', json: true },
  openingPrayer: { column: 'opening_prayer' },
  wardBusiness: { column: 'ward_business', json: true },
  stakeBusiness: { column: 'stake_business' },
  sacramentHymn: { column: 'sacrament_hymn', json: true },
  speakers: { column: 'speakers', json: true },
  closingHymn: { column: 'closing_hymn', json: true },
  closingPrayer: { column: 'closing_prayer' },
};

type MeetingInput = Omit<SacramentMeeting, 'id'>;

/** Thrown when a meeting already exists for the requested date. */
export class DuplicateMeetingDateError extends Error {
  constructor(date: string) {
    super(`A meeting already exists for ${date}.`);
    this.name = 'DuplicateMeetingDateError';
  }
}

function isUniqueViolation(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === '23505';
}

function toParam(key: keyof MeetingInput, value: unknown): unknown {
  return COLUMN_MAP[key].json ? JSON.stringify(value) : value;
}

/** Inserts a meeting and returns the stored row. */
export async function addMeeting(data: MeetingInput): Promise<SacramentMeeting> {
  const keys = Object.keys(COLUMN_MAP) as (keyof MeetingInput)[];
  const columns = keys.map((k) => COLUMN_MAP[k].column).join(', ');
  const placeholders = keys
    .map((k, i) => (COLUMN_MAP[k].json ? `$${i + 1}::jsonb` : `$${i + 1}`))
    .join(', ');
  const params = keys.map((k) => toParam(k, data[k]));

  try {
    const rows = await queryRows<SacramentMeeting>(
      `INSERT INTO meetings (${columns}) VALUES (${placeholders}) RETURNING ${MEETING_COLUMNS}`,
      params
    );
    return rows[0];
  } catch (error) {
    if (isUniqueViolation(error)) throw new DuplicateMeetingDateError(data.date);
    throw error;
  }
}

/** Updates the supplied fields and returns the row, or null when the id is unknown. */
export async function updateMeeting(
  id: number,
  updates: Partial<MeetingInput>
): Promise<SacramentMeeting | null> {
  const keys = (Object.keys(updates) as (keyof MeetingInput)[]).filter(
    (k) => k in COLUMN_MAP && updates[k] !== undefined
  );

  if (keys.length === 0) return getMeetingById(id);

  const assignments = keys
    .map((k, i) => `${COLUMN_MAP[k].column} = $${i + 1}${COLUMN_MAP[k].json ? '::jsonb' : ''}`)
    .join(', ');
  const params = [...keys.map((k) => toParam(k, updates[k])), id];

  try {
    const rows = await queryRows<SacramentMeeting>(
      `UPDATE meetings SET ${assignments} WHERE id = $${keys.length + 1} RETURNING ${MEETING_COLUMNS}`,
      params
    );
    return rows[0] ?? null;
  } catch (error) {
    if (isUniqueViolation(error) && updates.date) throw new DuplicateMeetingDateError(updates.date);
    throw error;
  }
}

/** Deletes a meeting, returning false when no row matched. */
export async function deleteMeeting(id: number): Promise<boolean> {
  const rows = await queryRows<{ id: number }>('DELETE FROM meetings WHERE id = $1 RETURNING id', [
    id,
  ]);
  return rows.length > 0;
}
