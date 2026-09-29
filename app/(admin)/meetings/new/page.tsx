import type { Metadata } from 'next';
import MeetingForm from '@/components/MeetingForm';
import { createMeeting } from '@/lib/actions';

export const metadata: Metadata = {
  title: 'Create Meeting',
};

/**
 * Stays a Server Component so the Server Action can be passed straight to the
 * form; MeetingForm is the Client Component that calls useActionState.
 */
export default function NewMeetingPage() {
  return (
    <main id="main-content">
      <h1 className="font-serif text-3xl font-bold text-slate-900">Create meeting</h1>
      <p className="mt-2 mb-6 text-slate-700">
        Add a new sacrament meeting agenda. Fields are validated on the server.
      </p>

      <MeetingForm action={createMeeting} submitLabel="Create meeting" cancelHref="/meetings" />
    </main>
  );
}
