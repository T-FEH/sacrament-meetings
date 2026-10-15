'use server';

import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { auth, signOut, updateSession } from '@/auth';
import type { AccountFormState } from './account-state';
import { DuplicateEmailError, deactivateUser, getUserByEmail, updateUser } from './users-db';

/** Resolves the signed-in user's database row, or throws. */
async function currentUserId(): Promise<number> {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) throw new Error('You must be signed in to manage your account.');

  const user = await getUserByEmail(email);
  if (!user) throw new Error('Your account could not be found.');
  return user.id;
}

const ProfileSchema = z
  .object({
    name: z.string().trim().min(2, 'Enter your full name.'),
    email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
    password: z.string(),
    confirmPassword: z.string(),
  })
  .superRefine((value, ctx) => {
    // Password is optional on update; validate only when one was typed.
    if (value.password.length === 0) return;

    if (value.password.length < 8) {
      ctx.addIssue({ code: 'custom', path: ['password'], message: 'Use at least 8 characters.' });
    }
    if (!/[A-Za-z]/.test(value.password)) {
      ctx.addIssue({ code: 'custom', path: ['password'], message: 'Include at least one letter.' });
    }
    if (!/[0-9]/.test(value.password)) {
      ctx.addIssue({ code: 'custom', path: ['password'], message: 'Include at least one number.' });
    }
    if (value.password !== value.confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        path: ['confirmPassword'],
        message: 'The two passwords do not match.',
      });
    }
  });

/** UPDATE for the user model: changes name, email, and optionally password. */
export async function updateProfile(
  _prevState: AccountFormState,
  formData: FormData
): Promise<AccountFormState> {
  const id = await currentUserId();

  const parsed = ProfileSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: String(formData.get('password') ?? ''),
    confirmPassword: String(formData.get('confirmPassword') ?? ''),
  });

  if (!parsed.success) {
    return {
      message: 'Please correct the highlighted fields.',
      errors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  try {
    await updateUser(id, {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash:
        parsed.data.password.length > 0 ? await bcrypt.hash(parsed.data.password, 10) : undefined,
    });
  } catch (error) {
    if (error instanceof DuplicateEmailError) {
      return {
        message: 'Please correct the highlighted fields.',
        errors: { email: [error.message] },
      };
    }
    console.error('updateProfile failed:', error);
    throw new Error('Your profile could not be updated. Please try again.');
  }

  // Push the new values into the existing JWT so the header updates at once.
  await updateSession({ user: { name: parsed.data.name, email: parsed.data.email } });

  revalidatePath('/profile');
  revalidatePath('/', 'layout');

  return { message: 'Profile updated.', errors: {} };
}

/**
 * DELETE for the user model, implemented as a soft delete.
 * The row is retained so the unique email and any audit trail survive; the
 * account simply can no longer sign in. The session is ended immediately.
 */
export async function deactivateAccount(): Promise<void> {
  const id = await currentUserId();

  try {
    await deactivateUser(id);
  } catch (error) {
    console.error('deactivateAccount failed:', error);
    throw new Error('Your account could not be deactivated. Please try again.');
  }

  await signOut({ redirectTo: '/meetings' });
}
