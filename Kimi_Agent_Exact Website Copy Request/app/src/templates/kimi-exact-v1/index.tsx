import { useState } from 'react';
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

function InstantMeetingInlineSection({ funnel }: TemplateRenderProps) {
  const im = funnel.instantMeeting;
  const [showEmbed, setShowEmbed] = useState(false);

  if (!im?.enabled) {
    return null;
  }

  const hasEmbed = im.meetingUrl && (im.embedType === 'booking' || im.embedType === 'both');

  return (
    <section id="instant-meeting" className="border-b border-slate-200 bg-gradient-to-b from-[#003D1F] to-[#001a0d] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-start">
          {/* Info panel */}
          <div className="text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-300">Instant Meeting</p>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">{im.headline}</h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-white/75">{im.description}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="rounded-full bg-emerald-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-200"
                onClick={() => {
                  if (hasEmbed) {
                    setShowEmbed(true);
                    window.dispatchEvent(new CustomEvent('im:open-booking'));
                  } else if (im.meetingUrl) {
                    window.open(im.meetingUrl, '_blank', 'noopener');
                  }
                }}
              >
                {im.ctaLabel}
              </button>
              <span className="rounded-full border border-white/20 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-white/60">
                {im.mode === 'sticky' ? '📌 Sticky widget' : '📋 Inline embed'}
              </span>
              {im.liveBroadcast ? (
                <span className="rounded-full border border-rose-400/30 bg-rose-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-rose-300">
                  🔴 Live
                </span>
              ) : null}
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {im.autoBooking ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">Auto-booking</p>
                  <p className="mt-1 text-sm text-white/70">Meeting slots are automatically available for visitors.</p>
                </div>
              ) : null}
              {im.showWidget ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">Widget active</p>
                  <p className="mt-1 text-sm text-white/70">Floating meeting widget is enabled on this funnel.</p>
                </div>
              ) : null}
            </div>
          </div>

          {/* Embed panel */}
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-2 backdrop-blur">
            {showEmbed && im.meetingUrl ? (
              <iframe
                className="h-[520px] w-full rounded-[1.5rem] bg-white"
                src={im.meetingUrl}
                title="Book a meeting"
                allow="camera; microphone"
              />
            ) : (
              <div className="flex h-[520px] flex-col items-center justify-center rounded-[1.5rem] bg-slate-950/40 text-center">
                <div className="rounded-full bg-emerald-300/10 p-4">
                  <svg className="h-10 w-10 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                </div>
                <p className="mt-4 text-lg font-bold text-white">Schedule a Meeting</p>
                <p className="mt-2 max-w-xs text-sm text-white/60">Click the button to open the booking calendar and choose your preferred time slot.</p>
                <button
                  type="button"
                  className="mt-6 rounded-full bg-emerald-300 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-200"
                  onClick={() => {
                    if (hasEmbed) {
                      setShowEmbed(true);
                      window.dispatchEvent(new CustomEvent('im:open-booking'));
                    } else if (im.meetingUrl) {
                      window.open(im.meetingUrl, '_blank', 'noopener');
                    }
                  }}
                >
                  {im.ctaLabel}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

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
                className="mt-8 rounded-full bg-[#003D1F] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#00522a]"
                onClick={() => {
                  if (funnel.instantMeeting?.enabled) {
                    const el = document.getElementById('instant-meeting');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth' });
                      return;
                    }
                  }
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

        {/* Instant Meeting Section */}
        <InstantMeetingInlineSection funnel={funnel} />

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
