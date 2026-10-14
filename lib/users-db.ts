import { neon } from '@neondatabase/serverless';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  /** bcrypt hash — never send this to the client. */
  password: string;
}

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

/** Looks up a user by email. Returns null when no account matches. */
export async function getUserByEmail(email: string): Promise<AuthUser | null> {
  const rows = await sql().query('SELECT id, name, email, password FROM users WHERE email = $1', [
    email.toLowerCase(),
  ]);
  return (rows as unknown as AuthUser[])[0] ?? null;
}
