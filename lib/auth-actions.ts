'use server';

import { AuthError } from 'next-auth';
import { signIn, signOut } from '@/auth';

/**
 * Signs a bishopric member in.
 *
 * Returns a message instead of throwing so the login form can display it, and
 * deliberately keeps that message generic: telling a visitor which half of the
 * credentials was wrong would confirm whether an email is registered.
 */
export async function authenticate(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const callbackUrl = String(formData.get('callbackUrl') || '/meetings');

  try {
    await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirectTo: callbackUrl,
    });
    return null;
  } catch (error) {
    if (error instanceof AuthError) {
      return error.type === 'CredentialsSignin'
        ? 'Those credentials did not match an account. Check the email and password and try again.'
        : 'Something went wrong signing in. Please try again.';
    }
    // signIn throws a redirect on success; Next.js must be allowed to handle it.
    throw error;
  }
}

/** Ends the session and returns to the public meetings list. */
export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: '/meetings' });
}
