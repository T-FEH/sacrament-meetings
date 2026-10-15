import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { authConfig } from './auth.config';
import { getUserByEmail } from './lib/users-db';

const CredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const {
  auth,
  signIn,
  signOut,
  handlers,
  unstable_update: updateSession,
} = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    /**
     * Sessions are JWTs minted at sign-in, so a later profile change is
     * invisible until the token is refreshed. The `update` trigger lets
     * updateProfile push the new name and email into the existing token
     * instead of forcing the user to sign out and back in.
     */
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.name = user.name;
        token.email = user.email;
      }

      if (trigger === 'update' && session && typeof session === 'object') {
        const next = (session as { user?: { name?: string; email?: string } }).user;
        if (next?.name) token.name = next.name;
        if (next?.email) token.email = next.email;
      }

      return token;
    },
    async session({ session, token }) {
      if (token.name) session.user.name = token.name;
      if (token.email) session.user.email = token.email;
      return session;
    },
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = CredentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await getUserByEmail(parsed.data.email);
        if (!user) return null;

        const passwordMatches = await bcrypt.compare(parsed.data.password, user.password);
        if (!passwordMatches) return null;

        // Never return the password hash — this object becomes the session user.
        return { id: String(user.id), name: user.name, email: user.email };
      },
    }),
  ],
});
