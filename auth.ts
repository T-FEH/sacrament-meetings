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

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
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
