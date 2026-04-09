import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { InstantMeetingWidget } from '@/components/meeting/InstantMeetingWidget';
import { WidgetScriptInjector } from '@/components/WidgetScriptInjector';
import { getPublicFunnel } from '@/lib/api';
import { createBrandStyle } from '@/lib/theme';
import { getTemplateDefinition } from '@/templates/registry';
import type { PublicFunnelResponse } from '@/types/api';

export function FunnelPage() {
  const { tenantSlug = '', funnelSlug = '', publicFunnelSlug = '' } = useParams();
  const resolvedFunnelSlug = publicFunnelSlug || funnelSlug;
  const [payload, setPayload] = useState<PublicFunnelResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    void getPublicFunnel(tenantSlug, resolvedFunnelSlug)
      .then((response) => {
        if (!isMounted) {
          return;
        }

        setPayload(response);
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
  }, [resolvedFunnelSlug, tenantSlug]);

  const funnelPayload = payload && 'funnel' in payload ? payload : null;
  const funnel = funnelPayload?.funnel;

  if (payload && 'expired' in payload && payload.expired) {
    return (
      <div className="px-4 py-16 text-white sm:px-6 lg:px-8" style={createBrandStyle(payload.branding)}>
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-amber-300/25 bg-white/5 p-8 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-300">Subscription expired</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight">Subscription expired</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75">
              {payload.tenant.name} currently has this public funnel unavailable because the tenant subscription has ended. Contact support to send payment proof and reactivate access.
            </p>
            <a className="mt-6 inline-flex rounded-full bg-emerald-300 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-200" href={payload.supportUrl} rel="noreferrer" target="_blank">
              Contact support
            </a>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">GCash</p>
            <h2 className="mt-3 text-2xl font-bold">Send your receipt after payment</h2>
            <p className="mt-3 text-sm leading-7 text-white/72">
              Open the Facebook page, send your receipt, and wait for manual approval to restore the account.
            </p>
            <img alt="GCash QR code" className="mt-6 w-full rounded-[1.5rem] border border-white/10 bg-white object-cover" src={payload.paymentQrUrl} />
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <div className="px-4 py-16 text-white sm:px-6 lg:px-8">Loading funnel...</div>;
  }

  if (!funnel) {
    return (
      <div className="px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-300">Not found</p>
          <h1 className="mt-4 text-3xl font-black">This funnel link does not resolve to a tenant.</h1>
          <p className="mt-3 text-sm text-white/70">{errorMessage || 'Unique links stay tenant-scoped, so both the tenant slug and funnel slug have to match.'}</p>
          <Link className="mt-6 inline-flex rounded-full bg-white px-5 py-3 font-semibold text-slate-950" to="/tenant/funnels">
            Back to tenant dashboard
          </Link>
        </div>
      </div>
    );
  }

  const template = getTemplateDefinition(funnel.templateKey);

  if (!template) {
    return (
      <div className="px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-300">Missing template</p>
          <h1 className="mt-4 text-3xl font-black">The assigned template is not registered.</h1>
        </div>
      </div>
    );
  }

  const TemplateComponent = template.component;

  return (
    <div>
      <section className="border-b border-white/10 bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">Unique funnel link</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight">{funnel.name}</h1>
            <p className="mt-2 max-w-3xl text-sm text-white/75">
              Tenant `{funnel.tenantSlug}` owns this funnel, and the URL stays unique by combining the tenant slug with the funnel slug.
            </p>
            <p className="mt-5 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-emerald-200">{funnel.publicUrl}</p>
          </div>
          <InstantMeetingWidget config={funnelPayload?.instantMeeting} publicUrl={funnel.publicUrl} />
        </div>
      </section>
      <div style={createBrandStyle(funnel.branding)}>
        <TemplateComponent funnel={{ ...funnel, instantMeeting: funnelPayload?.instantMeeting }} />
      </div>
      {funnelPayload?.instantMeeting?.showWidget && funnelPayload?.instantMeeting?.widgetKey ? (
        <WidgetScriptInjector
          widgetKey={funnelPayload.instantMeeting.widgetKey}
          funnelId={funnel.id}
          funnelSlug={funnel.slug}
          tenantSlug={funnel.tenantSlug}
          propertyAddress={funnel.propertyAddress}
          propertyPrice={funnel.propertyPrice}
        />
      ) : null}
    </div>
  );
}
