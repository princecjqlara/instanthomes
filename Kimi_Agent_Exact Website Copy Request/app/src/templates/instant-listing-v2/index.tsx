import { useCallback } from 'react';
import { MediaGallery } from '@/components/ui/MediaGallery';
import { useBooking } from '@/components/meeting/BookingProvider';
import type { TemplateRenderProps } from '@/templates/types';

function InstantMeetingPanel({ funnel }: TemplateRenderProps) {
  const im = funnel.instantMeeting;
  const booking = useBooking();

  if (!im?.enabled) {
    return null;
  }

  return (
    <article id="instant-meeting" className="rounded-[2rem] border border-emerald-300/20 bg-gradient-to-b from-[#0c1d17] to-[#081410] p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-300">Instant Meeting</p>
      <h3 className="mt-3 text-xl font-bold text-white">{im.headline}</h3>
      <p className="mt-2 text-sm leading-6 text-white/70">{im.description}</p>

      {/* Embed placeholder — click to open popup */}
      <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-1.5">
        <div
          className="flex h-[280px] cursor-pointer flex-col items-center justify-center rounded-xl bg-slate-950/40 text-center transition hover:bg-slate-950/60"
          onClick={() => booking.openBooking()}
        >
          <div className="rounded-full bg-emerald-300/10 p-3">
            <svg className="h-8 w-8 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          </div>
          <p className="mt-3 text-sm font-bold text-white">Schedule a Meeting</p>
          <p className="mt-1 max-w-[200px] text-xs text-white/50">Click to open the booking calendar and choose your slot.</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="rounded-full bg-emerald-300 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-200"
          onClick={() => booking.openBooking()}
        >
          {im.ctaLabel}
        </button>
        <span className="rounded-full border border-white/20 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-white/50">
          {im.mode === 'sticky' ? '📌 Sticky' : '📋 Inline'}
        </span>
        {im.liveBroadcast ? (
          <span className="rounded-full border border-rose-400/30 bg-rose-500/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-rose-300">
            🔴 Live
          </span>
        ) : null}
      </div>

      {/* Feature pills */}
      <div className="mt-4 flex flex-wrap gap-2">
        {im.autoBooking ? (
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-emerald-300/80">Auto-booking</span>
        ) : null}
        {im.showWidget ? (
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-emerald-300/80">Widget active</span>
        ) : null}
      </div>
    </article>
  );
}

export function InstantListingTemplate({ funnel }: TemplateRenderProps) {
  const booking = useBooking();

  const handlePrimaryCta = useCallback(() => {
    if (funnel.instantMeeting?.enabled) {
      booking.openBooking();
      return;
    }
  }, [funnel.instantMeeting, booking]);

  return (
    <div className="min-h-screen bg-[#08140f] px-4 py-16 text-white sm:px-6 lg:px-8" data-template-key={funnel.templateKey}>
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <section className="rounded-[2rem] border border-emerald-300/20 bg-white/5 p-8 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-300">Market-ready listing funnel</p>
            <div className="mt-5 flex items-center gap-4">
              {funnel.branding.logoUrl ? (
                <img alt={`${funnel.tenantName} logo`} className="h-12 w-auto object-contain" src={funnel.branding.logoUrl} />
              ) : null}
              <p className="text-sm font-medium text-white/70">{funnel.tenantName}</p>
            </div>
            <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl">{funnel.headline}</h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-white/75">{funnel.subheadline}</p>
            <div className="mt-8 flex flex-wrap gap-3 text-sm">
              <span className="rounded-full border border-white/10 px-4 py-2 text-white/85">{funnel.propertyAddress}</span>
              <span className="rounded-full bg-emerald-300 px-4 py-2 font-semibold text-slate-950">{funnel.propertyPrice}</span>
            </div>
            <button
              type="button"
              className="mt-8 rounded-full bg-emerald-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-200"
              onClick={handlePrimaryCta}
            >
              {funnel.primaryCtaLabel}
            </button>

            {/* Media Gallery */}
            {funnel.media && funnel.media.length > 0 ? (
              <div className="mt-10">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">Gallery</p>
                <MediaGallery media={funnel.media} />
              </div>
            ) : null}
          </section>

          <section className="space-y-4">
            {/* Instant Meeting Panel */}
            <InstantMeetingPanel funnel={funnel} />

            {/* Custom Fields */}
            {funnel.customFields && funnel.customFields.length > 0 ? (
              <article className="rounded-[2rem] border border-white/10 bg-[#0c1d17] p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">Property details</p>
                <div className="mt-4 space-y-3">
                  {funnel.customFields.map((field) => (
                    <div key={field.id ?? field.label} className="flex items-baseline justify-between border-b border-white/5 pb-3 last:border-0">
                      <span className="text-xs font-semibold uppercase tracking-wider text-white/50">{field.label}</span>
                      <span className="text-sm font-medium text-white/90">{field.value}</span>
                    </div>
                  ))}
                </div>
              </article>
            ) : null}

            <article className="rounded-[2rem] border border-white/10 bg-[#0c1d17] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">Why this layout</p>
              <p className="mt-3 text-sm leading-7 text-white/70">Built for focused property launches where the tenant wants a cleaner editorial page, faster template switching, and branded conversion points around one property story.</p>
            </article>
            <article className="rounded-[2rem] border border-white/10 bg-[#0c1d17] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">Conversion path</p>
              <ul className="mt-3 space-y-3 text-sm text-white/75">
                <li>Single headline-driven hero</li>
                <li>Property details and pricing above the fold</li>
                <li>Brand colors and logo carried through the full page</li>
              </ul>
            </article>
          </section>
        </div>
      </div>
    </div>
  );
}
