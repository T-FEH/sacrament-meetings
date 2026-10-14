import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

/**
 * Route protection runs in Edge middleware using the provider-free config, so
 * bcryptjs and the database client never enter the middleware bundle.
 */
export default NextAuth(authConfig).auth;

export const config = {
  // Skip API routes, Next internals, and static assets.
  matcher: ['/((?!api|_next/static|_next/image|.*\\.(?:png|jpg|jpeg|svg|ico|webp)$).*)'],
};
