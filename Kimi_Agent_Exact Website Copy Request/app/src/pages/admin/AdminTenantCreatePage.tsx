import { useState } from 'react';
import type { FormEvent } from 'react';
import { createTenant } from '@/lib/api';
import type { CreateTenantResponse } from '@/types/api';

export function AdminTenantCreatePage() {
  const [tenantName, setTenantName] = useState('Sunrise Advisory');
  const [ownerEmail, setOwnerEmail] = useState('hello@sunriseadvisory.com');
  const [password, setPassword] = useState('welcome123');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdTenant, setCreatedTenant] = useState<CreateTenantResponse | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await createTenant(tenantName, ownerEmail, password);
      setCreatedTenant(response);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Unable to create tenant right now.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">Provision tenant</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">Create tenant</h1>
        <p className="mt-3 text-sm text-white/70">
          Admins provision the tenant owner account here, and the server assigns the unique tenant slug plus the first funnel link.
        </p>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-white/85">
            Tenant name
            <input
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-emerald-300"
              value={tenantName}
              onChange={(event) => setTenantName(event.target.value)}
            />
          </label>
          <label className="block text-sm font-medium text-white/85">
            Owner email
            <input
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-emerald-300"
              type="email"
              value={ownerEmail}
              onChange={(event) => setOwnerEmail(event.target.value)}
            />
          </label>
          <label className="block text-sm font-medium text-white/85">
            Temporary password
            <input
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-emerald-300"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {errorMessage ? <p className="text-sm text-rose-300">{errorMessage}</p> : null}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-white px-5 py-3 font-semibold text-slate-950 transition hover:bg-slate-200"
          >
            {isSubmitting ? 'Provisioning...' : 'Provision tenant'}
          </button>
        </form>
      </section>
      <section className="rounded-[2rem] border border-emerald-300/30 bg-emerald-300/10 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-200">Provision preview</p>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-white">Unique link outcome</h2>
        <div className="mt-6 grid gap-4">
          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">Tenant slug</p>
            <p className="mt-3 text-lg font-semibold text-white">{createdTenant?.tenant.slug ?? 'Assigned after create'}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">Default funnel slug</p>
            <p className="mt-3 text-lg font-semibold text-white">{createdTenant?.funnel.slug ?? 'welcome-offer'}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">Preview link</p>
            <p className="mt-3 break-all text-sm text-emerald-100">{createdTenant?.funnel.publicUrl ?? 'Created links appear here after provisioning.'}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">Entered owner</p>
            <p className="mt-3 text-sm text-white/80">{createdTenant?.tenant.ownerEmail ?? ownerEmail}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
