import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ApiError, getTenantFunnelDetail, updateTenantFunnel, uploadTenantFunnelLogo, getIntegrationStatus, type IntegrationStatusResponse } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { createBrandStyle } from '@/lib/theme';
import { getTemplateDefinition, listTemplates } from '@/templates/registry';
import { MediaGalleryEditor } from '@/components/editor/MediaGalleryEditor';
import { CustomFieldsEditor } from '@/components/editor/CustomFieldsEditor';
import { TemplatePickerModal } from '@/components/editor/TemplatePickerModal';
import type { BrandTheme, FunnelCustomField, FunnelMediaItem, InstantMeetingConfig } from '@/types/platform';

interface EditorState {
  name: string;
  templateKey: string;
  status: 'draft' | 'published';
  headline: string;
  subheadline: string;
  primaryCtaLabel: string;
  propertyAddress: string;
  propertyPrice: string;
  publicUrl: string;
  branding: BrandTheme;
  instantMeeting: InstantMeetingConfig;
  media: FunnelMediaItem[];
  customFields: FunnelCustomField[];
}

type PreviewDevice = 'phone' | 'tablet' | 'laptop';
type EditorTab = 'content' | 'media' | 'properties' | 'branding' | 'meeting' | 'publish';

function colorField(label: string, value: string, onChange: (value: string) => void) {
  return (
    <label className="block rounded-2xl border border-slate-200 bg-white p-4 text-sm font-medium text-slate-700">
      {label}
      <div className="mt-3 flex items-center gap-3">
        <input className="h-10 w-14 rounded-lg border border-slate-200 bg-transparent" type="color" value={value} onChange={(event) => onChange(event.target.value)} />
        <input className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900" type="text" value={value} onChange={(event) => onChange(event.target.value)} />
      </div>
    </label>
  );
}

const TAB_CONFIG: Array<{ key: EditorTab; label: string; icon: string }> = [
  { key: 'content', label: 'Content', icon: '✏️' },
  { key: 'media', label: 'Media', icon: '📷' },
  { key: 'properties', label: 'Properties', icon: '🏠' },
  { key: 'branding', label: 'Branding', icon: '🎨' },
  { key: 'meeting', label: 'Meeting', icon: '📅' },
  { key: 'publish', label: 'Publish', icon: '🚀' },
];

export function TenantFunnelEditorPage() {
  const { user } = useAuth();
  const { funnelSlug = '' } = useParams();
  const templates = listTemplates();
  const [editorState, setEditorState] = useState<EditorState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('laptop');
  const [activeTab, setActiveTab] = useState<EditorTab>('content');
  const [isTemplatePickerOpen, setIsTemplatePickerOpen] = useState(false);
  const [integrationStatus, setIntegrationStatus] = useState<IntegrationStatusResponse | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!user?.tenantSlug) {
      setIsLoading(false);
      return () => {
        isMounted = false;
      };
    }

    void getTenantFunnelDetail(user.tenantSlug, funnelSlug)
      .then((response) => {
        if (!isMounted || !response.branding || !response.instantMeeting) {
          return;
        }

        setEditorState({
          name: response.funnel.name,
          templateKey: response.funnel.templateKey,
          status: response.funnel.status,
          headline: response.funnel.headline,
          subheadline: response.funnel.subheadline,
          primaryCtaLabel: response.funnel.primaryCtaLabel,
          propertyAddress: response.funnel.propertyAddress,
          propertyPrice: response.funnel.propertyPrice,
          publicUrl: response.funnel.publicUrl,
          branding: response.branding,
          instantMeeting: response.instantMeeting,
          media: response.media ?? [],
          customFields: response.customFields ?? [],
        });
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
  }, [funnelSlug, user?.tenantSlug]);

  // Load integration status
  useEffect(() => {
    void getIntegrationStatus()
      .then((data) => setIntegrationStatus(data))
      .catch(() => { /* silent — not linked or network error */ });
  }, []);

  const activeTemplate = useMemo(() => (editorState ? getTemplateDefinition(editorState.templateKey) : undefined), [editorState]);
  const PreviewTemplate = activeTemplate?.component;
  const previewWidthClass = previewDevice === 'phone' ? 'max-w-[390px]' : previewDevice === 'tablet' ? 'max-w-[768px]' : 'max-w-full';

  function updateField<K extends keyof EditorState>(key: K, value: EditorState[K]) {
    setEditorState((current) => (current ? { ...current, [key]: value } : current));
  }

  function updateBranding<K extends keyof BrandTheme>(key: K, value: BrandTheme[K]) {
    setEditorState((current) => (current ? { ...current, branding: { ...current.branding, [key]: value } } : current));
  }

  function updateMeeting<K extends keyof InstantMeetingConfig>(key: K, value: InstantMeetingConfig[K]) {
    setEditorState((current) => (current ? { ...current, instantMeeting: { ...current.instantMeeting, [key]: value } } : current));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editorState || !user?.tenantSlug) {
      return;
    }

    setIsSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await updateTenantFunnel(user.tenantSlug, funnelSlug, {
        name: editorState.name,
        templateKey: editorState.templateKey,
        status: editorState.status,
        headline: editorState.headline,
        subheadline: editorState.subheadline,
        primaryCtaLabel: editorState.primaryCtaLabel,
        propertyAddress: editorState.propertyAddress,
        propertyPrice: editorState.propertyPrice,
        branding: {
          primaryColor: editorState.branding.primaryColor,
          lightColor: editorState.branding.lightColor,
          darkColor: editorState.branding.darkColor,
          accentColor: editorState.branding.accentColor,
          backgroundColor: editorState.branding.backgroundColor,
        },
        instantMeeting: editorState.instantMeeting,
        customFields: editorState.customFields,
      });

      if (response.branding && response.instantMeeting) {
        setEditorState({
          name: response.funnel.name,
          templateKey: response.funnel.templateKey,
          status: response.funnel.status,
          headline: response.funnel.headline,
          subheadline: response.funnel.subheadline,
          primaryCtaLabel: response.funnel.primaryCtaLabel,
          propertyAddress: response.funnel.propertyAddress,
          propertyPrice: response.funnel.propertyPrice,
          publicUrl: response.funnel.publicUrl,
          branding: response.branding,
          instantMeeting: response.instantMeeting,
          media: response.media ?? editorState.media,
          customFields: response.customFields ?? editorState.customFields,
        });
      }

      setSuccessMessage('Funnel saved.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Unable to save funnel right now.');
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function handleLogoUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file || !user?.tenantSlug) {
      return;
    }

    setIsUploadingLogo(true);
    setErrorMessage('');

    try {
      const response = await uploadTenantFunnelLogo(user.tenantSlug, funnelSlug, file);
      updateBranding('logoUrl', response.logoUrl);
      setSuccessMessage('Logo uploaded.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Unable to upload logo right now.');
      }
    } finally {
      setIsUploadingLogo(false);
      event.target.value = '';
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">Loading funnel editor...</div>
      </div>
    );
  }

  if (!editorState || !activeTemplate) {
    return <p className="text-sm text-rose-600">{errorMessage || 'Unable to load this funnel.'}</p>;
  }

  return (
    <>
      <form className="flex h-[calc(100vh-64px)] flex-col" onSubmit={handleSubmit}>
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
          <div className="flex items-center gap-4">
            <Link className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50" to="/tenant/funnels">
              ← Back
            </Link>
            <div>
              <h1 className="text-sm font-bold text-slate-950">{editorState.name}</h1>
              <p className="text-[11px] text-slate-500">{activeTemplate.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {successMessage ? <span className="text-xs font-medium text-emerald-600">{successMessage}</span> : null}
            {errorMessage ? <span className="text-xs font-medium text-rose-600">{errorMessage}</span> : null}
            <a className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50" href={editorState.publicUrl} rel="noreferrer" target="_blank">
              Open live
            </a>
            <button className="rounded-full bg-slate-950 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50" disabled={isSaving} type="submit">
              {isSaving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>

        {/* Main editor area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Editor panel */}
          <div className="flex w-[420px] min-w-[380px] flex-col border-r border-slate-200 bg-slate-50">
            {/* Tabs */}
            <div className="flex gap-0.5 overflow-x-auto border-b border-slate-200 bg-white px-2 pt-2">
              {TAB_CONFIG.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  className={`whitespace-nowrap rounded-t-lg px-3 py-2 text-[11px] font-medium transition ${
                    activeTab === tab.key
                      ? 'border-b-2 border-emerald-600 bg-white text-emerald-700'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                  }`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  <span className="mr-1">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* Content tab */}
              {activeTab === 'content' ? (
                <div className="space-y-4">
                  {/* Template picker */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Template</p>
                        <p className="mt-1 text-sm font-bold text-slate-900">{activeTemplate.name}</p>
                      </div>
                      <button
                        type="button"
                        className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-200"
                        onClick={() => setIsTemplatePickerOpen(true)}
                      >
                        Change
                      </button>
                    </div>
                  </div>

                  {/* Core fields */}
                  {activeTemplate.editorFields.map((field) => (
                    <label key={field.key} className="block text-sm font-medium text-slate-700">
                      {field.label}
                      {field.type === 'textarea' ? (
                        <textarea
                          className="mt-1.5 min-h-[100px] w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950"
                          placeholder={field.placeholder}
                          value={editorState[field.key]}
                          onChange={(event) => updateField(field.key, event.target.value as EditorState[typeof field.key])}
                        />
                      ) : (
                        <input
                          className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950"
                          placeholder={field.placeholder}
                          type="text"
                          value={editorState[field.key]}
                          onChange={(event) => updateField(field.key, event.target.value as EditorState[typeof field.key])}
                        />
                      )}
                      {field.helperText ? <span className="mt-1 block text-xs text-slate-400">{field.helperText}</span> : null}
                    </label>
                  ))}
                </div>
              ) : null}

              {/* Media tab */}
              {activeTab === 'media' ? (
                <MediaGalleryEditor
                  tenantSlug={user?.tenantSlug ?? ''}
                  funnelSlug={funnelSlug}
                  media={editorState.media}
                  onMediaChange={(media) => updateField('media', media)}
                />
              ) : null}

              {/* Properties tab */}
              {activeTab === 'properties' ? (
                <CustomFieldsEditor
                  fields={editorState.customFields}
                  onChange={(fields) => updateField('customFields', fields)}
                />
              ) : null}

              {/* Branding tab */}
              {activeTab === 'branding' ? (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Colors</p>
                    <div className="mt-3 space-y-3">
                      {colorField('Primary color', editorState.branding.primaryColor, (value) => updateBranding('primaryColor', value))}
                      {colorField('Light color', editorState.branding.lightColor, (value) => updateBranding('lightColor', value))}
                      {colorField('Dark color', editorState.branding.darkColor, (value) => updateBranding('darkColor', value))}
                      {colorField('Accent color', editorState.branding.accentColor, (value) => updateBranding('accentColor', value))}
                      {colorField('Background color', editorState.branding.backgroundColor, (value) => updateBranding('backgroundColor', value))}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Logo</p>
                    <label className="mt-3 block">
                      <input className="block w-full text-sm text-slate-600" type="file" accept="image/*" onChange={handleLogoUpload} />
                      <span className="mt-1 block text-xs text-slate-400">
                        {isUploadingLogo ? 'Uploading…' : editorState.branding.logoUrl ? 'Logo uploaded' : 'No logo yet'}
                      </span>
                    </label>
                    {editorState.branding.logoUrl ? (
                      <img src={editorState.branding.logoUrl} alt="Current logo" className="mt-3 h-10 w-auto rounded-lg border border-slate-200 object-contain p-1" />
                    ) : null}
                  </div>
                </div>
              ) : null}

              {/* Meeting tab */}
              {activeTab === 'meeting' ? (
                <div className="space-y-4">
                  {/* IM Connection Status Badge */}
                  {integrationStatus?.linked ? (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span className="text-xs font-semibold text-emerald-700">Connected to Instant Meeting</span>
                      </div>
                      <p className="mt-1 text-xs text-emerald-600">
                        {integrationStatus.imEmail} · @{integrationStatus.imUsername}
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                      <p className="text-xs font-semibold text-amber-700">Instant Meeting not connected</p>
                      <p className="mt-1 text-xs text-amber-600">
                        <a href="/tenant/settings" className="underline hover:text-amber-800">Connect your account in Settings</a> to unlock live meeting features.
                      </p>
                    </div>
                  )}

                  {/* Core meeting config */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Meeting Embed</p>
                    <label className="mt-4 flex items-center gap-3 text-sm font-medium text-slate-700">
                      <input checked={editorState.instantMeeting.enabled} type="checkbox" onChange={(event) => updateMeeting('enabled', event.target.checked)} />
                      Enable meeting widget
                    </label>
                    <label className="mt-4 block text-sm font-medium text-slate-700">
                      Mode
                      <select className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-950" value={editorState.instantMeeting.mode} onChange={(event) => updateMeeting('mode', event.target.value as InstantMeetingConfig['mode'])}>
                        <option value="inline">Inline (in page)</option>
                        <option value="sticky">Sticky (bottom-right)</option>
                      </select>
                    </label>
                  </div>

                  {/* IM-Linked Enhanced Controls */}
                  {integrationStatus?.linked ? (
                    <>
                      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">CTA Routing</p>
                        <p className="mt-2 text-xs text-slate-500">Where should the "Book Now" button send visitors?</p>
                        <div className="mt-3 space-y-2">
                          {(['booking', 'live', 'both'] as const).map((type) => (
                            <label key={type} className="flex items-center gap-2 text-sm text-slate-700">
                              <input
                                type="radio"
                                name="embedType"
                                value={type}
                                checked={(editorState.instantMeeting.embedType ?? 'booking') === type}
                                onChange={() => updateMeeting('embedType', type)}
                              />
                              {type === 'booking' ? 'Embedded booking form (in-page)' : type === 'live' ? 'Direct meeting link (new tab)' : 'Both — booking form + live option'}
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Website Widget</p>
                        <label className="mt-3 flex items-center gap-3 text-sm font-medium text-slate-700">
                          <input
                            type="checkbox"
                            checked={editorState.instantMeeting.showWidget ?? true}
                            onChange={(event) => updateMeeting('showWidget', event.target.checked)}
                          />
                          Attach widget to this funnel's public pages
                        </label>
                        <p className="mt-2 text-xs text-slate-400">Features available on published funnels:</p>
                        <div className="mt-2 space-y-1.5 pl-1">
                          <label className="flex items-center gap-2 text-xs text-slate-600">
                            <input type="checkbox" checked readOnly className="rounded" />
                            Visitor presence (see who's browsing)
                          </label>
                          <label className="flex items-center gap-2 text-xs text-slate-600">
                            <input type="checkbox" checked readOnly className="rounded" />
                            Chat with visitors
                          </label>
                          <label className="flex items-center gap-2 text-xs text-slate-600">
                            <input type="checkbox" checked readOnly className="rounded" />
                            Invite visitor to live meeting
                          </label>
                          <label className="flex items-center gap-2 text-xs text-slate-600">
                            <input
                              type="checkbox"
                              checked={editorState.instantMeeting.liveBroadcast ?? false}
                              onChange={(event) => updateMeeting('liveBroadcast', event.target.checked)}
                            />
                            Live broadcast overlay
                          </label>
                        </div>
                      </div>
                    </>
                  ) : null}

                  {/* Text fields (always visible) */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Display</p>
                    <label className="mt-4 block text-sm font-medium text-slate-700">
                      Headline
                      <input className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-950" type="text" value={editorState.instantMeeting.headline} onChange={(event) => updateMeeting('headline', event.target.value)} />
                    </label>
                    <label className="mt-4 block text-sm font-medium text-slate-700">
                      Description
                      <textarea className="mt-1.5 min-h-[90px] w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-950" value={editorState.instantMeeting.description} onChange={(event) => updateMeeting('description', event.target.value)} />
                    </label>
                    <label className="mt-4 block text-sm font-medium text-slate-700">
                      CTA label
                      <input className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-950" type="text" value={editorState.instantMeeting.ctaLabel} onChange={(event) => updateMeeting('ctaLabel', event.target.value)} />
                    </label>
                  </div>
                </div>
              ) : null}

              {/* Publish tab */}
              {activeTab === 'publish' ? (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Status</p>
                    <select className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-950" value={editorState.status} onChange={(event) => updateField('status', event.target.value as EditorState['status'])}>
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Public URL</p>
                    <p className="mt-2 break-all rounded-xl bg-slate-950 px-4 py-3 text-xs text-emerald-100">{editorState.publicUrl}</p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Right: Live preview */}
          <div className="flex flex-1 flex-col bg-slate-100">
            {/* Preview controls */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Live preview</p>
              <div className="flex gap-1">
                {(['phone', 'tablet', 'laptop'] as const).map((device) => (
                  <button
                    key={device}
                    className={`rounded-lg px-3 py-1 text-[11px] font-medium transition ${
                      previewDevice === device ? 'bg-slate-950 text-white' : 'text-slate-500 hover:bg-slate-100'
                    }`}
                    onClick={() => setPreviewDevice(device)}
                    type="button"
                  >
                    {device === 'phone' ? '📱' : device === 'tablet' ? '📋' : '💻'} {device}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview iframe area */}
            <div className="flex-1 overflow-auto p-4">
              <div className={`mx-auto ${previewWidthClass} overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg`}>
                <div className="pointer-events-none" style={createBrandStyle(editorState.branding)}>
                  {PreviewTemplate ? (
                    <PreviewTemplate
                      funnel={{
                        id: 'preview-funnel',
                        uniqueId: 'preview-funnel',
                        tenantId: 'preview-tenant',
                        tenantName: user?.tenantSlug ?? 'tenant-preview',
                        tenantSlug: user?.tenantSlug ?? 'tenant-preview',
                        slug: funnelSlug,
                        name: editorState.name,
                        templateKey: editorState.templateKey,
                        status: editorState.status,
                        headline: editorState.headline,
                        subheadline: editorState.subheadline,
                        primaryCtaLabel: editorState.primaryCtaLabel,
                        propertyAddress: editorState.propertyAddress,
                        propertyPrice: editorState.propertyPrice,
                        branding: editorState.branding,
                        instantMeeting: editorState.instantMeeting,
                        media: editorState.media,
                        customFields: editorState.customFields,
                      }}
                    />
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Template picker modal */}
      <TemplatePickerModal
        isOpen={isTemplatePickerOpen}
        currentTemplateKey={editorState.templateKey}
        previewData={{
          name: editorState.name,
          headline: editorState.headline,
          subheadline: editorState.subheadline,
          primaryCtaLabel: editorState.primaryCtaLabel,
          propertyAddress: editorState.propertyAddress,
          propertyPrice: editorState.propertyPrice,
          branding: editorState.branding,
          instantMeeting: editorState.instantMeeting,
          media: editorState.media,
          customFields: editorState.customFields,
          tenantSlug: user?.tenantSlug ?? '',
          funnelSlug,
        }}
        onSelect={(key) => updateField('templateKey', key)}
        onClose={() => setIsTemplatePickerOpen(false)}
      />
    </>
  );
}
