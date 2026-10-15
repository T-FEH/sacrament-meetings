import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Link from 'next/link';
import LoginForm from '@/components/LoginForm';

export const metadata: Metadata = {
  title: 'Sign in',
  description:
    'Bishopric sign-in for the Sacrament Meeting Planner. Leaders sign in here to create, edit, and remove meeting agendas.',
  robots: { index: false, follow: false },
};

interface LoginPageProps {
  searchParams?: Promise<{ callbackUrl?: string }>;
}

/**
 * Resolves ?callbackUrl= to a safe same-origin path.
 *
 * Auth.js middleware supplies an absolute URL (http://host/meetings/new), so a
 * naive `startsWith('/')` check rejects it and the visitor loses the page they
 * asked for. This accepts relative paths and absolute URLs on this origin, and
 * falls back to /meetings for anything pointing at another host, which keeps
 * the parameter from being used as an open redirect.
 */
async function resolveCallbackUrl(requested?: string): Promise<string> {
  const fallback = '/meetings';
  if (!requested) return fallback;

  const headerList = await headers();
  const host = headerList.get('x-forwarded-host') ?? headerList.get('host');
  if (!host) return fallback;
  const protocol =
    headerList.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
  const origin = `${protocol}://${host}`;

  try {
    const url = new URL(requested, origin);
    if (url.origin !== origin) return fallback;
    return `${url.pathname}${url.search}`;
  } catch {
    return fallback;
  }
}

export default async function LoginPage(props: LoginPageProps) {
  const searchParams = await props.searchParams;
  const callbackUrl = await resolveCallbackUrl(searchParams?.callbackUrl);

  return (
    <main id="main-content" className="mx-auto max-w-md px-4 py-12">
      <h1 className="font-serif text-3xl font-bold text-slate-900">Bishopric sign-in</h1>
      <p className="mt-2 mb-6 text-slate-700">
        Signing in lets you create, edit, and remove meeting agendas. Members can browse and print
        programs without an account.
      </p>

      <div className="rounded-lg border border-slate-300 bg-white p-6 shadow-sm">
        <LoginForm callbackUrl={callbackUrl} />
      </div>

      <div className="mt-6 rounded-md border border-slate-300 bg-slate-100 p-4 text-sm text-slate-800">
        <p className="font-semibold">Demo account for reviewers</p>
        <p className="mt-1">
          Email: <code className="font-mono">bishop@maplehills.test</code>
          <br />
          Password: <code className="font-mono">Sacrament2026!</code>
        </p>
      </div>

      <p className="mt-6 text-sm text-slate-700">
        Need an account?{' '}
        <Link href="/signup" className="font-semibold text-sky-900 hover:underline">
          Create one
        </Link>
      </p>

      <p className="mt-4 text-sm">
        <Link href="/meetings" className="font-semibold text-sky-900 hover:underline">
          <span aria-hidden="true">&larr; </span>Back to all meetings
        </Link>
      </p>
    </main>
  );
}
