import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTenantFunnels } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { listTemplates } from '@/templates/registry';
import type { TenantFunnelsResponse } from '@/types/api';

export function TenantFunnelsPage() {
  const { user } = useAuth();
  const templates = listTemplates();
  const [workspace, setWorkspace] = useState<TenantFunnelsResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    if (!user?.tenantSlug) {
      setWorkspace(null);
      setIsLoading(false);
      return () => {
        isMounted = false;
      };
    }

    void getTenantFunnels(user.tenantSlug)
      .then((response) => {
        if (!isMounted) {
          return;
        }

        setWorkspace(response);
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
  }, [user?.tenantSlug]);

  if (!workspace && !isLoading && !errorMessage) {
    return <p className="text-sm text-slate-600">This account is not attached to a tenant workspace.</p>;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-slate-950 px-6 py-8 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">Tenant dashboard</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">Your funnels</h1>
        <p className="mt-3 max-w-3xl text-sm text-white/70">
          {workspace?.tenant.name ?? 'This tenant'} can keep multiple funnels active, assign templates per funnel, and publish each one with its own shareable tenant-scoped URL.
        </p>
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <span className="rounded-full border border-white/10 px-4 py-2 text-white/80">Tenant slug: {workspace?.tenant.slug ?? 'loading'}</span>
          <span className="rounded-full border border-white/10 px-4 py-2 text-white/80">Templates available: {templates.length}</span>
        </div>
      </section>
      {isLoading ? <p className="text-sm text-slate-600">Loading funnels...</p> : null}
      {errorMessage ? <p className="text-sm text-rose-600">{errorMessage}</p> : null}
      <div className="grid gap-4">
        {workspace?.funnels.map((funnel) => (
          <article key={funnel.id} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700">{funnel.status}</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-950">{funnel.name}</h2>
                <p className="mt-2 text-sm text-slate-600">{funnel.propertyAddress}</p>
                <p className="mt-1 text-sm font-medium text-slate-950">Template: {funnel.templateKey}</p>
              </div>
              <div className="rounded-3xl bg-slate-950 px-5 py-4 text-white lg:min-w-[360px]">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">Unique public link</p>
                <p className="mt-3 break-all text-sm text-emerald-100">{funnel.publicUrl}</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <a
                    className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
                    href={funnel.publicUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Open public funnel
                  </a>
                  <Link
                    className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white/85 transition hover:bg-white/5"
                    to={`/tenant/funnels/${funnel.slug}/edit`}
                  >
                    Edit funnel
                  </Link>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
