/**
 * Shared form state shape for the meeting Server Actions.
 *
 * This lives outside lib/actions.ts because a `'use server'` module may only
 * export async functions — exporting the initial-state constant from there
 * fails the build with "A \"use server\" file can only export async functions".
 */
export interface MeetingFormState {
  message: string | null;
  errors: Record<string, string[]>;
}

export const emptyMeetingFormState: MeetingFormState = { message: null, errors: {} };
