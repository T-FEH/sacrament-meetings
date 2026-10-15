import type { Metadata } from 'next';
import Link from 'next/link';
import SignUpForm from '@/components/SignUpForm';

export const metadata: Metadata = {
  title: 'Create account',
  description:
    'Register a bishopric account for the Sacrament Meeting Planner to create, edit, and remove meeting agendas.',
  robots: { index: false, follow: false },
};

export default function SignUpPage() {
  return (
    <main id="main-content" className="mx-auto max-w-md px-4 py-12">
      <h1 className="font-serif text-3xl font-bold text-slate-900">Create a bishopric account</h1>
      <p className="mt-2 mb-6 text-slate-700">
        Accounts are for ward leaders who plan the schedule. Members can browse and print programs
        without one.
      </p>

      <div className="rounded-lg border border-slate-300 bg-white p-6 shadow-sm">
        <SignUpForm />
      </div>

      <p className="mt-6 text-sm text-slate-700">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-sky-800 hover:underline">
          Sign in instead
        </Link>
      </p>
    </main>
  );
}
