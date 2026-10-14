import { auth } from '@/auth';

/**
 * Guards a Server Action.
 *
 * Middleware alone is not enough: a Server Action is a POST to whatever route
 * rendered it, so the delete form on /meetings would pass a middleware check
 * for "/meetings" even though the action mutates data. Every mutation
 * therefore re-checks the session on the server.
 */
export async function requireUser(): Promise<{ name?: string | null; email?: string | null }> {
  const session = await auth();

  if (!session?.user) {
    throw new Error('You must be signed in as a bishopric member to manage meetings.');
  }

  return session.user;
}
