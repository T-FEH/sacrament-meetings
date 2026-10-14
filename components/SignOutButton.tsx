import { signOutAction } from '@/lib/auth-actions';

/** Posts to the sign-out Server Action; works without JavaScript. */
export default function SignOutButton() {
  return (
    <form action={signOutAction}>
      <button
        type="submit"
        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-white hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        Sign out
      </button>
    </form>
  );
}
