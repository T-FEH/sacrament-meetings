import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Edit Meeting',
};

export default async function EditMeetingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main id="main-content">
      <h1 className="font-serif text-3xl font-bold text-slate-900">
        Edit Meeting &mdash; Coming in Week 04
      </h1>
      <p className="mt-3 text-slate-700">
        Editing meeting <span className="font-semibold">#{id}</span>. The edit form and its
        server action are implemented in Week 04.
      </p>
    </main>
  );
}
