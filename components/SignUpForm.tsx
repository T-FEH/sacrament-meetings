'use client';

import { useActionState } from 'react';
import { registerUser } from '@/lib/auth-actions';
import { emptyAccountFormState } from '@/lib/account-state';
import { TextField } from './AccountFields';

export default function SignUpForm() {
  const [state, formAction, isPending] = useActionState(registerUser, emptyAccountFormState);

  return (
    <form action={formAction} noValidate className="space-y-4">
      {state.message && (
        <div
          role="alert"
          className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-900"
        >
          {state.message}
        </div>
      )}

      <TextField id="name" label="Full name" autoComplete="name" errors={state.errors.name} />
      <TextField
        id="email"
        label="Email address"
        type="email"
        autoComplete="username"
        errors={state.errors.email}
      />
      <TextField
        id="password"
        label="Password"
        type="password"
        autoComplete="new-password"
        hint="At least 8 characters, including a letter and a number."
        errors={state.errors.password}
      />
      <TextField
        id="confirmPassword"
        label="Confirm password"
        type="password"
        autoComplete="new-password"
        errors={state.errors.confirmPassword}
      />

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-sky-800 px-5 py-2.5 font-semibold text-white hover:bg-sky-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? 'Creating account…' : 'Create account'}
      </button>
    </form>
  );
}
