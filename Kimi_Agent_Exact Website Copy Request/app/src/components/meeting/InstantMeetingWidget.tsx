import type { InstantMeetingConfig } from '@/types/platform';

interface InstantMeetingWidgetProps {
  config: InstantMeetingConfig;
  publicUrl: string;
}

export function InstantMeetingWidget({ config, publicUrl }: InstantMeetingWidgetProps) {
  if (!config.enabled) {
    return null;
  }

  return (
    <section
      aria-label="Instant Meeting Widget"
      className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white backdrop-blur"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">Instant Meeting Widget</p>
      <h2 className="mt-3 text-2xl font-bold">{config.headline}</h2>
      <p className="mt-2 max-w-2xl text-sm text-white/75">{config.description}</p>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-white/90"
        >
          {config.ctaLabel}
        </button>
        <span className="rounded-full border border-white/20 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-white/65">
          Auto mode: {config.mode}
        </span>
      </div>
      <p className="mt-4 text-xs text-white/55">Attached automatically to {publicUrl}</p>
    </section>
  );
}
