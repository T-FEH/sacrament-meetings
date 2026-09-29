'use client';

import { deleteMeeting } from '@/lib/actions';

interface DeleteMeetingButtonProps {
  id: number;
  /** Used in the confirm prompt and the button's accessible name. */
  label: string;
  className?: string;
}

/**
 * Submits a tiny form to the deleteMeeting Server Action.
 * The confirm() guard needs JavaScript, but the form still posts without it,
 * so deletion degrades gracefully rather than breaking.
 */
export default function DeleteMeetingButton({ id, label, className }: DeleteMeetingButtonProps) {
  return (
    <form
      action={deleteMeeting}
      onSubmit={(event) => {
        if (!window.confirm(`Delete the meeting for ${label}? This cannot be undone.`)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className={
          className ??
          'rounded-md border border-red-700 bg-white px-3 py-1.5 text-sm font-semibold text-red-800 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700'
        }
      >
        Delete<span className="sr-only"> meeting for {label}</span>
      </button>
    </form>
  );
}
