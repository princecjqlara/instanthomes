import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/auth';

const tenantLinks = [
  { label: 'Funnels', to: '/tenant/funnels' },
  { label: 'Settings', to: '/tenant/settings' },
  { label: 'Public sample', to: '/bennett-local-group/laurel-ridge-drive-001' },
];

export function TenantLayout() {
  const { logout, user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700">Tenant workspace</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-950">Instant Homes</h1>
            <p className="mt-1 text-sm text-slate-500">Signed in as {user?.email}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <nav className="flex flex-wrap gap-2">
              {tenantLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `rounded-full px-4 py-2 text-sm font-medium transition ${
                      isActive ? 'bg-slate-950 text-white' : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
            <button
              type="button"
              onClick={() => void logout()}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
