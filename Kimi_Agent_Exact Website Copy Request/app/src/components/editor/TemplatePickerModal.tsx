import { useMemo } from 'react';
import { listTemplates, getTemplateDefinition } from '@/templates/registry';
import { createBrandStyle } from '@/lib/theme';
import type { BrandTheme, FunnelCustomField, FunnelMediaItem, InstantMeetingConfig } from '@/types/platform';

interface TemplatePickerModalProps {
  isOpen: boolean;
  currentTemplateKey: string;
  previewData: {
    name: string;
    headline: string;
    subheadline: string;
    primaryCtaLabel: string;
    propertyAddress: string;
    propertyPrice: string;
    branding: BrandTheme;
    instantMeeting: InstantMeetingConfig;
    media: FunnelMediaItem[];
    customFields: FunnelCustomField[];
    tenantSlug: string;
    funnelSlug: string;
  };
  onSelect: (templateKey: string) => void;
  onClose: () => void;
}

export function TemplatePickerModal({ isOpen, currentTemplateKey, previewData, onSelect, onClose }: TemplatePickerModalProps) {
  const templates = useMemo(() => listTemplates(), []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-8 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700">Choose a template</p>
            <h2 className="mt-1 text-xl font-bold text-slate-950">Select how your funnel looks</h2>
          </div>
          <button
            type="button"
            className="rounded-full border border-slate-200 p-2 text-slate-400 transition hover:bg-slate-50 hover:text-slate-600"
            onClick={onClose}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Template grid */}
        <div className="overflow-y-auto p-8" style={{ maxHeight: 'calc(90vh - 90px)' }}>
          <div className="grid gap-6 md:grid-cols-2">
            {templates.map((template) => {
              const isActive = template.key === currentTemplateKey;
              const def = getTemplateDefinition(template.key);
              const PreviewComponent = def?.component;

              return (
                <div
                  key={template.key}
                  className={`group relative overflow-hidden rounded-2xl border-2 transition ${
                    isActive
                      ? 'border-emerald-500 ring-2 ring-emerald-200'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Live mini preview */}
                  <div className="relative h-[280px] overflow-hidden bg-slate-100">
                    <div
                      className="pointer-events-none origin-top-left"
                      style={{
                        transform: 'scale(0.35)',
                        width: '1180px',
                        height: '800px',
                        ...createBrandStyle(previewData.branding),
                      }}
                    >
                      {PreviewComponent ? (
                        <PreviewComponent
                          funnel={{
                            id: 'preview',
                            uniqueId: 'preview',
                            tenantId: 'preview',
                            tenantName: previewData.tenantSlug,
                            tenantSlug: previewData.tenantSlug,
                            slug: previewData.funnelSlug,
                            name: previewData.name,
                            templateKey: template.key,
                            status: 'draft',
                            headline: previewData.headline,
                            subheadline: previewData.subheadline,
                            primaryCtaLabel: previewData.primaryCtaLabel,
                            propertyAddress: previewData.propertyAddress,
                            propertyPrice: previewData.propertyPrice,
                            branding: previewData.branding,
                            instantMeeting: previewData.instantMeeting,
                            media: previewData.media,
                            customFields: previewData.customFields,
                          }}
                        />
                      ) : null}
                    </div>
                  </div>

                  {/* Info + select */}
                  <div className="flex items-center justify-between border-t border-slate-100 bg-white px-5 py-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{template.name}</h3>
                      <p className="mt-0.5 text-xs text-slate-500">{template.description}</p>
                    </div>
                    {isActive ? (
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Active</span>
                    ) : (
                      <button
                        type="button"
                        className="rounded-full bg-slate-950 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800"
                        onClick={() => {
                          onSelect(template.key);
                          onClose();
                        }}
                      >
                        Select
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
