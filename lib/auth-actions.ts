'use server';

import bcrypt from 'bcryptjs';
import { AuthError } from 'next-auth';
import { z } from 'zod';
import { signIn, signOut } from '@/auth';
import type { AccountFormState } from './account-state';
import { DuplicateEmailError, createUser } from './users-db';

const SignUpSchema = z
  .object({
    name: z.string().trim().min(2, 'Enter your full name.'),
    email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
    password: z
      .string()
      .min(8, 'Use at least 8 characters.')
      .regex(/[A-Za-z]/, 'Include at least one letter.')
      .regex(/[0-9]/, 'Include at least one number.'),
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ['confirmPassword'],
    message: 'The two passwords do not match.',
  });

/**
 * CREATE for the user model: registers a bishopric account.
 * The password is hashed with bcrypt before it reaches the database, and the
 * new account is signed in immediately on success.
 */
export async function registerUser(
  _prevState: AccountFormState,
  formData: FormData
): Promise<AccountFormState> {
  const parsed = SignUpSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  });

  if (!parsed.success) {
    return {
      message: 'Please correct the highlighted fields.',
      errors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  try {
    const passwordHash = await bcrypt.hash(parsed.data.password, 10);
    await createUser({ name: parsed.data.name, email: parsed.data.email, passwordHash });
  } catch (error) {
    if (error instanceof DuplicateEmailError) {
      return {
        message: 'Please correct the highlighted fields.',
        errors: { email: [error.message] },
      };
    }
    console.error('registerUser failed:', error);
    throw new Error('The account could not be created. Please try again.');
  }

  // signIn throws a redirect on success, which Next.js must handle.
  await signIn('credentials', {
    email: parsed.data.email,
    password: parsed.data.password,
    redirectTo: '/meetings',
  });

  return { message: null, errors: {} };
}

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
