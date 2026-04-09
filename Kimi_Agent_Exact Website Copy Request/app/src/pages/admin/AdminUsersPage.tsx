import { useEffect, useState } from 'react';
import { getAdminUsers } from '@/lib/api';
import type { AdminUsersResponse } from '@/types/api';

export function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUsersResponse['users']>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    void getAdminUsers()
      .then((response) => {
        if (!isMounted) {
          return;
        }

        setUsers(response.users);
        setErrorMessage('');
      })
      .catch((error: Error) => {
        if (!isMounted) {
          return;
        }

        setErrorMessage(error.message);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">User directory</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">All users</h1>
        <p className="mt-3 max-w-3xl text-sm text-white/70">Admins can see every platform user, their role, tenant, and the stored demo credential for local handoff.</p>
      </section>
      {isLoading ? <p className="text-sm text-white/70">Loading users...</p> : null}
      {errorMessage ? <p className="text-sm text-rose-300">{errorMessage}</p> : null}
      <div className="grid gap-4">
        {users.map((user) => (
          <article key={user.id} className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-bold">{user.fullName}</h2>
                <p className="text-sm text-white/70">{user.email}</p>
                {user.demoPassword ? <p className="mt-2 text-sm text-emerald-200">Demo password: {user.demoPassword}</p> : null}
              </div>
              <div className="flex flex-wrap gap-3 text-sm">
                <span className="rounded-full border border-white/15 px-4 py-2 text-white/85">Role: {user.role}</span>
                {user.tenantSlug ? <span className="rounded-full border border-white/15 px-4 py-2 text-white/85">Tenant: {user.tenantSlug}</span> : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
