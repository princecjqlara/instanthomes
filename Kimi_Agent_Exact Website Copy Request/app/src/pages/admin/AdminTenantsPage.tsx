import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  approvePaymentSubmission,
  deletePaymentSubmission,
  deleteTenant,
  forceLogoutTenant,
  getAdminPaymentSubmissions,
  getAdminTenants,
  rejectPaymentSubmission,
  updateAdminTenantStatus,
} from '@/lib/api';
import type { AdminTenantSummary, PaymentSubmissionSummary } from '@/types/api';

export function AdminTenantsPage() {
  const [tenants, setTenants] = useState<AdminTenantSummary[]>([]);
  const [submissions, setSubmissions] = useState<PaymentSubmissionSummary[]>([]);
  const [subscriptionDrafts, setSubscriptionDrafts] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeAction, setActiveAction] = useState('');

  async function loadDashboard() {
    const [tenantResponse, submissionResponse] = await Promise.all([getAdminTenants(), getAdminPaymentSubmissions()]);

    setTenants(tenantResponse.tenants);
    setSubmissions(submissionResponse.submissions);
    setSubscriptionDrafts(
      Object.fromEntries(
        tenantResponse.tenants.map((tenant) => [tenant.slug, tenant.subscriptionEndsAt ? tenant.subscriptionEndsAt.slice(0, 10) : ''])
      )
    );
  }

  useEffect(() => {
    let isMounted = true;

    void loadDashboard()
      .then(() => {
        if (!isMounted) {
          return;
        }

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

  async function runAction(actionKey: string, action: () => Promise<void>) {
    setActiveAction(actionKey);
    setErrorMessage('');

    try {
      await action();
      await loadDashboard();
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Unable to complete that tenant action right now.');
      }
    } finally {
      setActiveAction('');
    }
  }

  const pendingSubmissions = submissions.filter((submission) => submission.status === 'pending');

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">Tenant control</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight">All tenants</h1>
            <p className="mt-3 max-w-3xl text-sm text-white/70">
              Pause access, force sign-out, delete inactive accounts, and manually approve paid signups from a single admin workspace.
            </p>
          </div>
          <Link className="inline-flex rounded-full bg-white px-5 py-3 font-semibold text-slate-950 transition hover:bg-slate-200" to="/admin/tenants/new">
            Create tenant
          </Link>
        </div>
      </section>
      {isLoading ? <p className="text-sm text-white/70">Loading tenants...</p> : null}
      {errorMessage ? <p className="text-sm text-rose-300">{errorMessage}</p> : null}
      <div className="grid gap-4">
        {tenants.map((tenant) => {
          const actionPrefix = `tenant:${tenant.slug}`;
          const subscriptionDraft = subscriptionDrafts[tenant.slug] ?? '';
          const nextStatus = tenant.status === 'paused' || tenant.status === 'expired' ? 'active' : 'paused';
          const statusButtonLabel = tenant.status === 'paused' || tenant.status === 'expired' ? 'Resume tenant' : 'Pause tenant';

          return (
            <article key={tenant.id} className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">{tenant.status}</p>
                  <h2 className="text-2xl font-bold">{tenant.name}</h2>
                  <p className="text-sm text-white/70">Owner: {tenant.ownerName} • {tenant.ownerEmail}</p>
                  <p className="text-sm text-white/70">Tenant slug: {tenant.slug}</p>
                  <label className="block text-sm font-medium text-white/80">
                    Subscription end date
                    <input
                      className="mt-2 w-full max-w-xs rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-emerald-300"
                      onChange={(event) =>
                        setSubscriptionDrafts((current) => ({
                          ...current,
                          [tenant.slug]: event.target.value,
                        }))
                      }
                      type="date"
                      value={subscriptionDraft}
                    />
                  </label>
                  <div className="flex flex-wrap gap-3 pt-2 text-sm">
                    <button
                      className="rounded-full bg-emerald-300 px-4 py-2 font-semibold text-slate-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={activeAction === `${actionPrefix}:status`}
                      onClick={() =>
                        void runAction(`${actionPrefix}:status`, async () => {
                          await updateAdminTenantStatus(
                            tenant.slug,
                            nextStatus,
                            subscriptionDraft ? new Date(`${subscriptionDraft}T00:00:00.000Z`).toISOString() : null
                          );
                        })
                      }
                      type="button"
                    >
                      {statusButtonLabel}
                    </button>
                    <button
                      className="rounded-full border border-white/15 px-4 py-2 font-medium text-white/85 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={activeAction === `${actionPrefix}:save-date`}
                      onClick={() =>
                        void runAction(`${actionPrefix}:save-date`, async () => {
                          await updateAdminTenantStatus(
                            tenant.slug,
                            tenant.status,
                            subscriptionDraft ? new Date(`${subscriptionDraft}T00:00:00.000Z`).toISOString() : null
                          );
                        })
                      }
                      type="button"
                    >
                      Save end date
                    </button>
                    <button
                      className="rounded-full border border-white/15 px-4 py-2 font-medium text-white/85 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={activeAction === `${actionPrefix}:logout`}
                      onClick={() => void runAction(`${actionPrefix}:logout`, async () => forceLogoutTenant(tenant.slug).then(() => undefined))}
                      type="button"
                    >
                      Force sign out
                    </button>
                    <button
                      className="rounded-full border border-rose-400/35 px-4 py-2 font-medium text-rose-200 transition hover:bg-rose-400/10 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={activeAction === `${actionPrefix}:delete`}
                      onClick={() => void runAction(`${actionPrefix}:delete`, async () => deleteTenant(tenant.slug).then(() => undefined))}
                      type="button"
                    >
                      Delete tenant
                    </button>
                  </div>
                </div>
                <div className="min-w-[320px] rounded-3xl border border-white/10 bg-slate-950/80 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">Default published link</p>
                  <p className="mt-3 break-all text-sm text-emerald-100">{tenant.funnels[0]?.publicUrl ?? 'No funnel yet'}</p>
                  <p className="mt-4 text-sm text-white/70">
                    Ends: {tenant.subscriptionEndsAt ? new Date(tenant.subscriptionEndsAt).toLocaleDateString() : 'Not set'}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <section className="rounded-[2rem] border border-emerald-300/20 bg-emerald-300/10 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-200">Manual approvals</p>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-white">Pending payment approvals</h2>
        <p className="mt-3 max-w-3xl text-sm text-white/75">Review the submitted account details, confirm the receipt in Messenger, and approve the account once payment has been verified.</p>
        <div className="mt-6 grid gap-4">
          {pendingSubmissions.length === 0 ? <p className="text-sm text-white/70">No pending payment proofs right now.</p> : null}
          {pendingSubmissions.map((submission) => (
            <article key={submission.id} className="rounded-[1.75rem] border border-white/10 bg-slate-950/70 p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">{submission.status}</p>
                  <h3 className="mt-2 text-2xl font-bold text-white">{submission.tenantName}</h3>
                  <p className="mt-2 text-sm text-white/75">Owner: {submission.ownerName}</p>
                  <p className="text-sm text-white/75">Email: {submission.email}</p>
                  {submission.messengerHandle ? <p className="text-sm text-white/75">Facebook name: {submission.messengerHandle}</p> : null}
                </div>
                <div className="flex flex-wrap gap-3 text-sm">
                  {submission.receiptUrl ? (
                    <a className="rounded-full border border-white/15 px-4 py-2 font-medium text-white/85 transition hover:bg-white/5" href={submission.receiptUrl} rel="noreferrer" target="_blank">
                      View receipt
                    </a>
                  ) : (
                    <p className="rounded-full border border-white/10 px-4 py-2 font-medium text-white/60">Receipt sent manually in Messenger</p>
                  )}
                  <a className="rounded-full border border-white/15 px-4 py-2 font-medium text-white/85 transition hover:bg-white/5" href={submission.supportUrl} rel="noreferrer" target="_blank">
                    Open Messenger page
                  </a>
                  {submission.status === 'pending' ? (
                    <>
                      <button
                        className="rounded-full bg-emerald-300 px-4 py-2 font-semibold text-slate-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={activeAction === `submission:${submission.id}:approve`}
                        onClick={() => void runAction(`submission:${submission.id}:approve`, async () => approvePaymentSubmission(submission.id).then(() => undefined))}
                        type="button"
                      >
                        Approve account
                      </button>
                      <button
                        className="rounded-full border border-amber-300/35 px-4 py-2 font-medium text-amber-100 transition hover:bg-amber-300/10 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={activeAction === `submission:${submission.id}:reject`}
                        onClick={() => void runAction(`submission:${submission.id}:reject`, async () => rejectPaymentSubmission(submission.id).then(() => undefined))}
                        type="button"
                      >
                        Reject request
                      </button>
                      <button
                        className="rounded-full border border-rose-400/35 px-4 py-2 font-medium text-rose-200 transition hover:bg-rose-400/10 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={activeAction === `submission:${submission.id}:delete`}
                        onClick={() => void runAction(`submission:${submission.id}:delete`, async () => deletePaymentSubmission(submission.id).then(() => undefined))}
                        type="button"
                      >
                        Delete request
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
