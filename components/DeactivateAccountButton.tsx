'use client';

import { deactivateAccount } from '@/lib/account-actions';

/**
 * Soft-deletes the signed-in account.
 * The confirm() guard needs JavaScript, but the form still posts without it.
 */
export default function DeactivateAccountButton() {
  return (
    <form
      action={deactivateAccount}
      onSubmit={(event) => {
        if (
          !window.confirm(
            'Deactivate your account? You will be signed out and will no longer be able to sign in.'
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="rounded-md border border-red-700 bg-white px-4 py-2 text-sm font-semibold text-red-800 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
      >
        Deactivate my account
      </button>
    </form>
  );
}
