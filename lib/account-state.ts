/**
 * Shared state shape for the account forms.
 * Lives outside the `'use server'` modules, which may only export async
 * functions.
 */
export interface AccountFormState {
  message: string | null;
  errors: Record<string, string[]>;
}

export const emptyAccountFormState: AccountFormState = { message: null, errors: {} };
