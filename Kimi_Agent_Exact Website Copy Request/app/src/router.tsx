import type { ReactElement } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { homePathForUser, useAuth } from '@/lib/auth';
import { AdminLayout } from '@/layouts/AdminLayout';
import { PublicLayout } from '@/layouts/PublicLayout';
import { TenantLayout } from '@/layouts/TenantLayout';
import { HomePage } from '@/pages/HomePage';
import { AdminTenantCreatePage } from '@/pages/admin/AdminTenantCreatePage';
import { AdminTenantsPage } from '@/pages/admin/AdminTenantsPage';
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { FunnelPage } from '@/pages/public/FunnelPage';
import { TenantFunnelEditorPage } from '@/pages/tenant/TenantFunnelEditorPage';
import { TenantFunnelsPage } from '@/pages/tenant/TenantFunnelsPage';
import { TenantSettingsPage } from '@/pages/tenant/TenantSettingsPage';

function RouteLoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
      <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-5 text-sm font-medium text-white/80">
        Loading session...
      </div>
    </div>
  );
}

function ProtectedRoute({ allowedRoles, children }: { allowedRoles: Array<'admin' | 'tenant_user'>; children: ReactElement }) {
  const { status, user } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return <RouteLoadingScreen />;
  }

  if (!user) {
    return <Navigate replace state={{ from: `${location.pathname}${location.search}` }} to="/login" />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate replace to={homePathForUser(user)} />;
  }

  return children;
}

function LoginRoute() {
  const { status, user } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return <RouteLoadingScreen />;
  }

  if (user) {
    const destination = typeof location.state?.from === 'string' ? location.state.from : homePathForUser(user);
    return <Navigate replace to={destination} />;
  }

  return <LoginPage />;
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginRoute />} />

      <Route
        path="/tenant"
        element={
          <ProtectedRoute allowedRoles={['tenant_user']}>
            <TenantLayout />
          </ProtectedRoute>
        }
      >
        <Route path="funnels" element={<TenantFunnelsPage />} />
        <Route path="funnels/:funnelSlug/edit" element={<TenantFunnelEditorPage />} />
        <Route path="settings" element={<TenantSettingsPage />} />
        <Route index element={<Navigate replace to="funnels" />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="tenants" element={<AdminTenantsPage />} />
        <Route path="tenants/new" element={<AdminTenantCreatePage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route index element={<Navigate replace to="tenants" />} />
      </Route>

      <Route path="/t" element={<PublicLayout />}>
        <Route path=":tenantSlug/f/:funnelSlug" element={<FunnelPage />} />
      </Route>

      <Route path="/:tenantSlug/:publicFunnelSlug" element={<PublicLayout />}>
        <Route index element={<FunnelPage />} />
      </Route>

      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  );
}
