import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import DeactivateAccountButton from '@/components/DeactivateAccountButton';
import ProfileForm from '@/components/ProfileForm';
import { auth } from '@/auth';
import { getUserByEmail } from '@/lib/users-db';

export const metadata: Metadata = {
  title: 'Your profile',
  description: 'Update your bishopric account details or deactivate your account.',
  robots: { index: false, follow: false },
};

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.email) redirect('/login?callbackUrl=/profile');

  const user = await getUserByEmail(session.user.email);
  if (!user) redirect('/login');

  return (
    <main id="main-content" className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-serif text-3xl font-bold text-slate-900">Your profile</h1>
      <p className="mt-2 mb-6 text-slate-700">
        Update the details shown alongside the meetings you plan.
      </p>

      <section
        aria-labelledby="details-heading"
        className="rounded-lg border border-slate-300 bg-white p-6 shadow-sm"
      >
        <h2 id="details-heading" className="mb-4 text-lg font-bold text-slate-900">
          Account details
        </h2>
        <ProfileForm
          user={{ id: user.id, name: user.name, email: user.email, isActive: user.isActive }}
        />
      </section>

      <section
        aria-labelledby="danger-heading"
        className="mt-8 rounded-lg border border-red-300 bg-red-50 p-6"
      >
        <h2 id="danger-heading" className="text-lg font-bold text-slate-900">
          Deactivate account
        </h2>
        <p className="mt-2 mb-4 text-sm text-slate-800">
          Deactivating signs you out and prevents future sign-ins. Your record is kept so the
          meetings you planned keep their history, and an administrator can restore access later.
        </p>
        <DeactivateAccountButton />
      </section>

      <p className="mt-8 text-sm">
        <Link href="/meetings" className="font-semibold text-sky-800 hover:underline">
          <span aria-hidden="true">&larr; </span>Back to all meetings
        </Link>
      </p>
    </main>
  );
}
