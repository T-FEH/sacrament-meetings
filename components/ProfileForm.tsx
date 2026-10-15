'use client';

import { useActionState } from 'react';
import { updateProfile } from '@/lib/account-actions';
import { emptyAccountFormState } from '@/lib/account-state';
import type { PublicUser } from '@/lib/users-db';
import { TextField } from './AccountFields';

export default function ProfileForm({ user }: { user: PublicUser }) {
  const [state, formAction, isPending] = useActionState(updateProfile, emptyAccountFormState);
  const isSuccess = state.message?.startsWith('Profile updated');

  return (
    <form action={formAction} noValidate className="space-y-4">
      {state.message && (
        <div
          role="status"
          className={
            isSuccess
              ? 'rounded-md border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900'
              : 'rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-900'
          }
        >
          {state.message}
        </div>
      )}

      <TextField
        id="name"
        label="Full name"
        autoComplete="name"
        defaultValue={user.name}
        errors={state.errors.name}
      />
      <TextField
        id="email"
        label="Email address"
        type="email"
        autoComplete="username"
        defaultValue={user.email}
        errors={state.errors.email}
      />
      <TextField
        id="password"
        label="New password"
        type="password"
        autoComplete="new-password"
        hint="Leave blank to keep your current password."
        errors={state.errors.password}
      />
      <TextField
        id="confirmPassword"
        label="Confirm new password"
        type="password"
        autoComplete="new-password"
        errors={state.errors.confirmPassword}
      />

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-sky-800 px-5 py-2.5 font-semibold text-white hover:bg-sky-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  );
}
