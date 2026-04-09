import { AnnouncementBar } from '@/sections/AnnouncementBar';
import { CTASection } from '@/sections/CTASection';
import { CustomerReviews } from '@/sections/CustomerReviews';
import { FAQSection } from '@/sections/FAQSection';
import { Footer } from '@/sections/Footer';
import { IngredientsScience } from '@/sections/IngredientsScience';
import { Navigation } from '@/sections/Navigation';
import { ProductOrder } from '@/sections/ProductOrder';
import { PromoBanner } from '@/sections/PromoBanner';
import { ShaunWhite } from '@/sections/ShaunWhite';
import { UsVsThem } from '@/sections/UsVsThem';
import { WhyGruns } from '@/sections/WhyGruns';
import { MediaGallery } from '@/components/ui/MediaGallery';
import type { TemplateRenderProps } from '@/templates/types';

export function KimiExactTemplate({ funnel }: TemplateRenderProps) {
  return (
    <div className="min-h-screen bg-white" data-template-key={funnel.templateKey}>
      <AnnouncementBar />
      <Navigation />
      <main>
        <section className="border-b border-slate-200 bg-[#f5f8f0] px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_0.42fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#00853E]">Tenant-branded template</p>
              <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">{funnel.headline}</h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-700">{funnel.subheadline}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 shadow-sm">{funnel.propertyAddress}</span>
                <span className="rounded-full bg-[#00853E] px-4 py-2 text-sm font-semibold text-white">{funnel.propertyPrice}</span>
              </div>
              <button
                type="button"
                className="mt-8 rounded-full bg-[#003D1F] px-6 py-3 text-sm font-semibold text-white"
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
            </div>
            <div className="rounded-[2rem] bg-white p-6 shadow-xl">
              {funnel.branding.logoUrl ? (
                <img alt={`${funnel.tenantName} logo`} className="h-12 w-auto object-contain" src={funnel.branding.logoUrl} />
              ) : (
                <div className="inline-flex rounded-full bg-[#D8E8D8] px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#003D1F]">
                  {funnel.tenantName}
                </div>
              )}
              <p className="mt-5 text-sm text-slate-600">This template preserves the original page sections while letting the tenant swap branding and key conversion copy without changing the unique link.</p>
            </div>
          </div>
        </section>

        {/* Media Gallery */}
        {funnel.media && funnel.media.length > 0 ? (
          <section className="border-b border-slate-200 bg-white px-4 py-12 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#00853E]">Property gallery</p>
              <MediaGallery media={funnel.media} />
            </div>
          </section>
        ) : null}

        {/* Custom Fields */}
        {funnel.customFields && funnel.customFields.length > 0 ? (
          <section className="border-b border-slate-200 bg-[#f5f8f0] px-4 py-12 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#00853E]">Property details</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {funnel.customFields.map((field) => (
                  <div key={field.id ?? field.label} className="rounded-2xl border border-slate-200 bg-white p-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{field.label}</p>
                    <p className="mt-2 text-lg font-bold text-slate-900">{field.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <ProductOrder />
        <WhyGruns />
        <IngredientsScience />
        <CustomerReviews />
        <UsVsThem />
        <PromoBanner />
        <ShaunWhite />
        <CTASection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
}
