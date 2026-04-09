import { useEffect, useState } from 'react';
import {
  ApiError,
  getIntegrationStatus,
  linkInstantMeeting,
  disconnectInstantMeeting,
  refreshInstantMeetingConnection,
  type IntegrationStatusResponse,
} from '@/lib/api';

export function TenantSettingsPage() {
  const [integration, setIntegration] = useState<IntegrationStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLinking, setIsLinking] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkEmail, setLinkEmail] = useState('');
  const [linkPassword, setLinkPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    void getIntegrationStatus()
      .then((data) => {
        setIntegration(data);
      })
      .catch((error: Error) => {
        console.error('Failed to load integration status:', error);
      })
      .finally(() => setIsLoading(false));
  }, []);

  async function handleLink() {
    if (!linkEmail || !linkPassword) {
      setErrorMessage('Email and password are required.');
      return;
    }

    setIsLinking(true);
    setErrorMessage('');

    try {
      const result = await linkInstantMeeting(linkEmail, linkPassword);
      setIntegration(result);
      setShowLinkModal(false);
      setLinkEmail('');
      setLinkPassword('');
      setSuccessMessage('InstantMeeting account linked successfully!');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Unable to connect to InstantMeeting right now.');
      }
    } finally {
      setIsLinking(false);
    }
  }

  async function handleDisconnect() {
    if (!confirm('Are you sure you want to disconnect your InstantMeeting account? This will disable meeting widgets on all your funnels.')) {
      return;
    }

    setIsDisconnecting(true);
    setErrorMessage('');

    try {
      await disconnectInstantMeeting();
      setIntegration({
        linked: false,
        features: {
          meetingEmbed: false,
          websiteWidget: false,
          liveBroadcast: false,
          visitorPresence: false,
        },
      });
      setSuccessMessage('InstantMeeting account disconnected.');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Unable to disconnect right now.');
      }
    } finally {
      setIsDisconnecting(false);
    }
  }

  async function handleRefresh() {
    setIsRefreshing(true);
    setErrorMessage('');

    try {
      const result = await refreshInstantMeetingConnection();
      setIntegration(result);
      setSuccessMessage('Connection refreshed.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Unable to refresh connection right now.');
      }
    } finally {
      setIsRefreshing(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your integrations and account preferences.</p>
      </div>

      {successMessage ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {successMessage}
        </div>
      ) : null}

      {errorMessage && !showLinkModal ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {errorMessage}
        </div>
      ) : null}

      {/* Integrations section */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Integrations</h2>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-lg text-white">
                📹
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-950">Instant Meeting</h3>
                <p className="text-xs text-slate-500">Live meetings, booking widgets, and visitor tracking</p>
              </div>
            </div>
            {integration?.linked ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Connected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                Not connected
              </span>
            )}
          </div>

          {integration?.linked ? (
            <div className="mt-5 space-y-4">
              {/* Account info */}
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-xs font-medium text-slate-400">Account</span>
                    <p className="mt-0.5 font-medium text-slate-900">{integration.imEmail}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-400">Username</span>
                    <p className="mt-0.5 font-medium text-slate-900">@{integration.imUsername}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-400">Connected</span>
                    <p className="mt-0.5 font-medium text-slate-900">
                      {integration.linkedAt ? new Date(integration.linkedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Features enabled</p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-slate-700">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={integration.features.meetingEmbed} readOnly className="rounded" />
                    Meeting embed in funnels
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={integration.features.websiteWidget} readOnly className="rounded" />
                    Website widget on published funnels
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={integration.features.liveBroadcast} readOnly className="rounded" />
                    Live broadcast on funnel pages
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={integration.features.visitorPresence} readOnly className="rounded" />
                    Visitor presence tracking
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => void handleRefresh()}
                  disabled={isRefreshing}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  {isRefreshing ? '🔄 Refreshing…' : '🔄 Refresh Connection'}
                </button>
                <button
                  type="button"
                  onClick={() => void handleDisconnect()}
                  disabled={isDisconnecting}
                  className="rounded-full border border-rose-200 bg-white px-4 py-2 text-xs font-medium text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
                >
                  {isDisconnecting ? '❌ Disconnecting…' : '❌ Disconnect'}
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              <p className="text-sm leading-relaxed text-slate-600">
                Connect your Instant Meeting account to enable live meetings, booking widgets, and visitor tracking on your funnels. Once connected, you'll be able to toggle these features per-funnel in the editor.
              </p>
              <button
                type="button"
                onClick={() => {
                  setShowLinkModal(true);
                  setErrorMessage('');
                }}
                className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                🔗 Link Instant Meeting Account
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Link Modal */}
      {showLinkModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-950">Link Instant Meeting</h2>
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <p className="mt-3 text-sm text-slate-500">
              Enter your Instant Meeting credentials to connect your accounts. Your credentials are verified securely and never stored in plain text.
            </p>

            {errorMessage ? (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {errorMessage}
              </div>
            ) : null}

            <div className="mt-5 space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                Email
                <input
                  type="email"
                  value={linkEmail}
                  onChange={(e) => setLinkEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-950"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Password
                <input
                  type="password"
                  value={linkPassword}
                  onChange={(e) => setLinkPassword(e.target.value)}
                  placeholder="Your Instant Meeting password"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-950"
                />
              </label>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="flex-1 rounded-full border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleLink()}
                disabled={isLinking}
                className="flex-1 rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
              >
                {isLinking ? 'Connecting…' : 'Connect Account'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
