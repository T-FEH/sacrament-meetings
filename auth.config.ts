import type { NextAuthConfig } from 'next-auth';

/** Routes only signed-in bishopric members may open. */
function isProtectedRoute(pathname: string): boolean {
  return pathname === '/meetings/new' || /^\/meetings\/\d+\/edit\/?$/.test(pathname);
}

/**
 * Edge-safe half of the Auth.js setup.
 *
 * `providers` is deliberately empty here: the Credentials provider needs
 * bcryptjs and a database client, neither of which belongs in the Edge
 * middleware bundle. middleware.ts builds on this config alone, while auth.ts
 * spreads it and adds the real provider for the Node runtime.
 */
export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = Boolean(auth?.user);

      if (isProtectedRoute(nextUrl.pathname)) {
        // Returning false sends the visitor to pages.signIn with a callbackUrl.
        return isLoggedIn;
      }

      if ((nextUrl.pathname === '/login' || nextUrl.pathname === '/signup') && isLoggedIn) {
        return Response.redirect(new URL('/meetings', nextUrl));
      }

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
