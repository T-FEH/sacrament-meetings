'use client';

import { useActionState } from 'react';
import { authenticate } from '@/lib/auth-actions';

interface LoginFormProps {
  /** Where to send the user after a successful sign-in. */
  callbackUrl: string;
}

const labelClasses = 'mb-1 block text-sm font-semibold text-slate-900';
const inputClasses =
  'w-full rounded-md border border-slate-400 bg-white px-3 py-2 text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-800';

export default function LoginForm({ callbackUrl }: LoginFormProps) {
  const [errorMessage, formAction, isPending] = useActionState(authenticate, null);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />

      <div>
        <label htmlFor="email" className={labelClasses}>
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          aria-describedby="login-error"
          className={inputClasses}
        />
      </div>

      <div>
        <label htmlFor="password" className={labelClasses}>
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={1}
          aria-describedby="login-error"
          className={inputClasses}
        />
      </div>

      <div id="login-error" aria-live="polite" className="min-h-6">
        {errorMessage && (
          <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-900">
            {errorMessage}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-sky-800 px-5 py-2.5 font-semibold text-white hover:bg-sky-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
