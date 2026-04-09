import { MediaGallery } from '@/components/ui/MediaGallery';
import type { TemplateRenderProps } from '@/templates/types';

export function InstantListingTemplate({ funnel }: TemplateRenderProps) {
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
              onClick={() => {
                if (funnel.instantMeeting?.autoBooking && funnel.instantMeeting?.meetingUrl) {
                  if (funnel.instantMeeting.embedType === 'booking' || funnel.instantMeeting.embedType === 'both') {
                    window.dispatchEvent(new CustomEvent('im:open-booking'));
                  } else {
                    window.open(funnel.instantMeeting.meetingUrl, '_blank', 'noopener');
                  }
                }
              }}
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
