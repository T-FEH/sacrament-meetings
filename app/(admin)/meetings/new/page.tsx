import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Meeting',
};

export default function NewMeetingPage() {
  return (
    <main id="main-content">
      <h1 className="font-serif text-3xl font-bold text-slate-900">
        Create Meeting &mdash; Coming in Week 04
      </h1>
      <p className="mt-3 text-slate-700">
        This route exists so the navigation path is in place. The create form and its
        server action are implemented in Week 04.
      </p>
    </main>
  );
}
