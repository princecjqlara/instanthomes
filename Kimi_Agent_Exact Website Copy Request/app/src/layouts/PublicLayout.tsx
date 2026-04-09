import { Link, Outlet } from 'react-router-dom';

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-white/10 bg-slate-950/95 px-4 py-4 text-white backdrop-blur sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">Instant Homes</p>
            <p className="mt-1 text-sm text-white/70">Public funnel previews, subscription recovery, and one shared sign-in flow.</p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link className="rounded-full border border-white/15 px-4 py-2 text-white/85 transition hover:bg-white/5" to="/">
              View offer
            </Link>
            <Link className="rounded-full bg-emerald-300 px-4 py-2 font-semibold text-slate-950 transition hover:bg-emerald-200" to="/login">
              Sign in
            </Link>
          </div>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
