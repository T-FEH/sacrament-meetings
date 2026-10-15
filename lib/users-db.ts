import { neon } from '@neondatabase/serverless';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  /** bcrypt hash — never send this to the client. */
  password: string;
  isActive: boolean;
}

/** A user safe to expose to the UI. */
export type PublicUser = Omit<AuthUser, 'password'>;

let client: ReturnType<typeof neon> | null = null;

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

async function queryRows<T>(text: string, params: unknown[] = []): Promise<T[]> {
  const rows = await sql().query(text, params);
  return rows as unknown as T[];
}

const USER_COLUMNS = 'id, name, email, password, is_active AS "isActive"';
const PUBLIC_COLUMNS = 'id, name, email, is_active AS "isActive"';

/** Thrown when an email is already registered. */
export class DuplicateEmailError extends Error {
  constructor(email: string) {
    super(`An account already exists for ${email}.`);
    this.name = 'DuplicateEmailError';
  }
}

function isUniqueViolation(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === '23505';
}

/** Looks up an active user by email. Deactivated accounts cannot sign in. */
export async function getUserByEmail(email: string): Promise<AuthUser | null> {
  const rows = await queryRows<AuthUser>(
    `SELECT ${USER_COLUMNS} FROM users WHERE email = $1 AND is_active = true`,
    [email.toLowerCase()]
  );
  return rows[0] ?? null;
}

/** Looks up a user by id, including deactivated ones. */
export async function getUserById(id: number): Promise<PublicUser | null> {
  const rows = await queryRows<PublicUser>(`SELECT ${PUBLIC_COLUMNS} FROM users WHERE id = $1`, [
    id,
  ]);
  return rows[0] ?? null;
}

/** CREATE — registers a new bishopric account with a hashed password. */
export async function createUser(data: {
  name: string;
  email: string;
  passwordHash: string;
}): Promise<PublicUser> {
  try {
    const rows = await queryRows<PublicUser>(
      `INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING ${PUBLIC_COLUMNS}`,
      [data.name, data.email.toLowerCase(), data.passwordHash]
    );
    return rows[0];
  } catch (error) {
    if (isUniqueViolation(error)) throw new DuplicateEmailError(data.email);
    throw error;
  }
}

/** UPDATE — changes the display name, email, and optionally the password. */
export async function updateUser(
  id: number,
  updates: { name?: string; email?: string; passwordHash?: string }
): Promise<PublicUser | null> {
  const assignments: string[] = [];
  const params: unknown[] = [];

  if (updates.name !== undefined) {
    params.push(updates.name);
    assignments.push(`name = $${params.length}`);
  }
  if (updates.email !== undefined) {
    params.push(updates.email.toLowerCase());
    assignments.push(`email = $${params.length}`);
  }
  if (updates.passwordHash !== undefined) {
    params.push(updates.passwordHash);
    assignments.push(`password = $${params.length}`);
  }

  if (assignments.length === 0) return getUserById(id);

  params.push(id);

  try {
    const rows = await queryRows<PublicUser>(
      `UPDATE users SET ${assignments.join(', ')} WHERE id = $${params.length} RETURNING ${PUBLIC_COLUMNS}`,
      params
    );
    return rows[0] ?? null;
  } catch (error) {
    if (isUniqueViolation(error) && updates.email) throw new DuplicateEmailError(updates.email);
    throw error;
  }
}

/**
 * DELETE — soft delete.
 * The row is kept so the unique email and any audit trail survive; the account
 * simply stops being able to sign in.
 */
export async function deactivateUser(id: number): Promise<boolean> {
  const rows = await queryRows<{ id: number }>(
    'UPDATE users SET is_active = false WHERE id = $1 AND is_active = true RETURNING id',
    [id]
  );
  return rows.length > 0;
}
