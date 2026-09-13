export default function Footer() {
  return (
    <footer className="mt-12 bg-slate-800 text-slate-200 print:hidden">
      <div className="mx-auto max-w-5xl px-4 py-6 text-center text-sm">
        <p>
          Copyright &copy; {new Date().getFullYear()} Sacrament Meeting Planner. Built for WDD 430.
        </p>
      </div>
    </footer>
  );
}
