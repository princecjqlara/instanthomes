import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ApiError, createPaymentSubmission } from '@/lib/api';
import { homePathForUser, useAuth } from '@/lib/auth';
import type { PaymentSubmissionSummary } from '@/types/api';

const FACEBOOK_PAGE_URL = 'https://www.facebook.com/aresmediaph';
const OFFER_WINDOW_MS = 3 * 24 * 60 * 60 * 1000;
const OFFER_STORAGE_KEY = 'instanthomes-offer-started-at';
const ORIGINAL_PRICE = 'P3499/month';
const SLOT_COUNT = 7;

const planPerks = [
  'Unlimited template usage',
  'Higher property limits for active listings',
  'Free instant meeting access',
  'Unlimited visitors',
  'Advanced funnel access',
  'Manual onboarding and approval support',
  'Branded public funnel sharing',
  'Tenant dashboard access after approval',
];

const packageInclusions = [
  'Faster launch setup for each property campaign',
  'Reusable funnel templates across multiple listings',
  'Priority support through Facebook Messenger',
  'Custom branding, CTA, and unique share links',
  'Manual review for payment proof before account activation',
  'Growth-ready visitor capacity with no view caps',
];

interface SignupFormState {
  tenantName: string;
  ownerName: string;
  email: string;
  password: string;
  messengerHandle: string;
}

function formatRemainingTime(remainingMs: number) {
  const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds };
}

function QrGlyph() {
  return (
    <span aria-hidden="true" className="grid h-8 w-8 grid-cols-3 gap-[2px] rounded-lg bg-slate-950/15 p-1.5">
      <span className="rounded-sm bg-slate-950/90" />
      <span className="rounded-sm bg-slate-950/20" />
      <span className="rounded-sm bg-slate-950/90" />
      <span className="rounded-sm bg-slate-950/20" />
      <span className="rounded-sm bg-slate-950/90" />
      <span className="rounded-sm bg-slate-950/20" />
      <span className="rounded-sm bg-slate-950/90" />
      <span className="rounded-sm bg-slate-950/20" />
      <span className="rounded-sm bg-slate-950/90" />
    </span>
  );
}

export function HomePage() {
  const { status, user } = useAuth();
  const storage = typeof window !== 'undefined' && window.localStorage && typeof window.localStorage.getItem === 'function' ? window.localStorage : null;
  const [formState, setFormState] = useState<SignupFormState>({
    tenantName: 'Ares Prime Realty',
    ownerName: '',
    email: 'sales@aresprime.com',
    password: 'aresprime123',
    messengerHandle: 'Ares Prime Sales',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isJoinNowOpen, setIsJoinNowOpen] = useState(false);
  const [submission, setSubmission] = useState<PaymentSubmissionSummary | null>(null);
  const [remainingMs, setRemainingMs] = useState(OFFER_WINDOW_MS);

  useEffect(() => {
    const now = Date.now();
    const storedStart = Number(storage?.getItem(OFFER_STORAGE_KEY) ?? now);
    const startTime = Number.isNaN(storedStart) ? now : storedStart;

    if (!storage?.getItem(OFFER_STORAGE_KEY) || Number.isNaN(storedStart)) {
      storage?.setItem(OFFER_STORAGE_KEY, String(now));
    }

    const offerEndsAt = startTime + OFFER_WINDOW_MS;

    const updateRemaining = () => {
      setRemainingMs(Math.max(offerEndsAt - Date.now(), 0));
    };

    updateRemaining();

    const intervalId = window.setInterval(updateRemaining, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [storage]);

  if (status === 'loading') {
    return null;
  }

  if (user) {
    return <Navigate replace to={homePathForUser(user)} />;
  }

  const countdown = formatRemainingTime(remainingMs);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSubmitting(true);
    setErrorMessage('');

    const payload = new FormData();
    payload.append('tenantName', formState.tenantName);
    payload.append('ownerName', formState.ownerName);
    payload.append('email', formState.email);
    payload.append('password', formState.password);
    payload.append('messengerHandle', formState.messengerHandle);

    try {
      const response = await createPaymentSubmission(payload);
      setSubmission(response.submission);
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Unable to submit payment proof right now.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function updateField(field: keyof SignupFormState) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      setFormState((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    };
  }

  return (
    <div className="min-h-screen bg-[#07111f] text-white">
      <section className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_top_right,_rgba(52,211,153,0.18),_transparent_30%),radial-gradient(circle_at_left,_rgba(14,165,233,0.16),_transparent_35%),linear-gradient(180deg,_#07111f_0%,_#0d1728_100%)] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-5 rounded-[1.25rem] border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 backdrop-blur">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-200">Offer ends in</p>
                <p className="mt-1 text-sm text-white/70">Your 3-day launch discount is running on this device right now.</p>
              </div>
              <div className="grid w-full max-w-[320px] grid-cols-4 gap-2 text-center md:w-auto">
                <div className="rounded-2xl border border-white/10 bg-slate-950/70 px-2 py-2">
                  <p className="text-xl font-black text-white">{countdown.days}</p>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/55">Days</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/70 px-2 py-2">
                  <p className="text-xl font-black text-white">{countdown.hours}</p>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/55">Hours</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/70 px-2 py-2">
                  <p className="text-xl font-black text-white">{countdown.minutes}</p>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/55">Minutes</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/70 px-2 py-2">
                  <p className="text-xl font-black text-white">{countdown.seconds}</p>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/55">Seconds</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-300">Instant Homes</p>
              <p className="mt-2 max-w-xl text-sm text-white/65">Launch more property funnels without paying agency-sized monthly fees.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button className="inline-flex items-center gap-2 rounded-full bg-emerald-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-200" onClick={() => setIsJoinNowOpen(true)} type="button">
                <QrGlyph />
                <span>Join now</span>
              </button>
              <Link className="rounded-full border border-white/15 px-5 py-3 text-sm font-medium text-white/85 transition hover:bg-white/5" to="/login">
                Sign in
              </Link>
              <Link className="rounded-full border border-emerald-300/35 bg-emerald-300/12 px-5 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-300/18" to="/bennett-local-group/laurel-ridge-drive-001">
                View public funnel
              </Link>
            </div>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
            <div className="space-y-6">
              <h1 className="max-w-4xl text-[clamp(2.6rem,9vw,5.25rem)] font-black leading-[0.95] tracking-tight">
                Turn one monthly payment into a full property-funnel engine for your real estate team.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-white/72 sm:text-lg">
                Get more funnel capacity, unlimited traffic, instant meeting access, and advanced templates for a launch price that is built to convert fast-moving property teams.
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex min-h-[220px] flex-col justify-between rounded-[1.75rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">Launch price</p>
                  <div className="mt-5 space-y-3">
                    <div className="flex flex-wrap items-end gap-2 text-white">
                      <span className="text-[clamp(3rem,7vw,5rem)] font-black leading-none">P699</span>
                      <span className="pb-2 text-[clamp(1.5rem,3vw,2.25rem)] font-bold text-white/90">/month</span>
                    </div>
                    <p className="text-lg text-white/65 line-through">{ORIGINAL_PRICE}</p>
                  </div>
                </div>
                <div className="flex min-h-[220px] flex-col justify-between rounded-[1.75rem] border border-white/10 bg-white/5 p-6 backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">Slots left</p>
                  <div className="mt-5 space-y-3">
                    <p className="text-[clamp(2.5rem,6vw,4.75rem)] font-black leading-none text-white">{SLOT_COUNT}</p>
                    <p className="text-lg text-white/65">Priority onboarding this cycle</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {planPerks.map((perk) => (
                  <div key={perk} className="rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-3 text-sm text-white/82">
                    {perk}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-emerald-300/20 bg-white/8 p-6 shadow-[0_24px_80px_rgba(8,15,30,0.45)] backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">Subscribe now</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight">Reserve your account and send the receipt in Messenger</h2>
              <p className="mt-3 text-sm leading-6 text-white/70">
                Fill out your account details, tap Join now to open the GCash QR, then send your receipt manually to the Facebook page so we can approve your access.
              </p>

              <button
                className="mt-6 flex w-full items-center justify-center gap-3 rounded-[1.75rem] bg-[linear-gradient(135deg,#6ee7b7_0%,#34d399_45%,#22d3ee_100%)] px-8 py-6 text-2xl font-black tracking-tight text-slate-950 shadow-[0_0_35px_rgba(110,231,183,0.42)] transition hover:scale-[1.01] hover:shadow-[0_0_55px_rgba(110,231,183,0.58)] animate-pulse"
                onClick={() => setIsJoinNowOpen(true)}
                type="button"
              >
                <QrGlyph />
                <span>Join now</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {isJoinNowOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/80 px-4 py-4 backdrop-blur-sm sm:items-center sm:py-6">
          <div aria-label="Join now payment form" aria-modal="true" className="my-auto w-full max-w-lg max-h-[calc(100vh-2rem)] overflow-y-auto rounded-[2rem] border border-white/10 bg-[#07111f] p-6 shadow-[0_24px_80px_rgba(8,15,30,0.55)]" role="dialog">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">GCash payment</p>
                <h3 className="mt-2 text-2xl font-black text-white">Scan the QR and fill out your details here</h3>
              </div>
              <button className="rounded-full border border-white/15 px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/5" onClick={() => setIsJoinNowOpen(false)} type="button">
                Close
              </button>
            </div>

            {submission ? (
              <div className="mt-6 rounded-[1.75rem] border border-emerald-300/35 bg-emerald-300/10 p-5 text-sm text-emerald-50">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-200">Details received</p>
                <h4 className="mt-3 text-2xl font-bold text-white">Manual review started for {submission.tenantName}</h4>
                <ol className="mt-4 space-y-2 leading-6 text-white/80">
                  <li>1. Click the Facebook page link below.</li>
                  <li>2. Send your receipt manually in Messenger together with your business name.</li>
                  <li>3. Keep your submitted email ready for the approval reply.</li>
                  <li>4. Wait for approval to get access to your account.</li>
                </ol>
                <a className="mt-5 inline-flex w-full justify-center rounded-full bg-white px-5 py-3 font-semibold text-slate-950 transition hover:bg-slate-200" href={FACEBOOK_PAGE_URL} rel="noreferrer" target="_blank">
                  Open Facebook page
                </a>
              </div>
            ) : (
              <>
                <p className="mt-3 text-sm leading-6 text-white/70">After paying, send the receipt manually to the Facebook page with your business name and email.</p>
                <img alt="GCash QR code" className="mt-5 w-full rounded-[1.5rem] border border-white/10 bg-white object-cover" src="/gcash-qr.jpg" />
                <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                  <label className="block text-sm font-medium text-white/85">
                    Business or tenant name
                    <input className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-emerald-300" onChange={updateField('tenantName')} value={formState.tenantName} />
                  </label>
                  <label className="block text-sm font-medium text-white/85">
                    Your name
                    <input className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-emerald-300" onChange={updateField('ownerName')} value={formState.ownerName} />
                  </label>
                  <label className="block text-sm font-medium text-white/85">
                    Email
                    <input className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-emerald-300" onChange={updateField('email')} type="email" value={formState.email} />
                  </label>
                  <label className="block text-sm font-medium text-white/85">
                    Password
                    <input className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-emerald-300" onChange={updateField('password')} type="password" value={formState.password} />
                  </label>
                  <label className="block text-sm font-medium text-white/85">
                    Facebook name
                    <input className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-emerald-300" onChange={updateField('messengerHandle')} value={formState.messengerHandle} />
                  </label>
                  {errorMessage ? <p className="text-sm text-rose-300">{errorMessage}</p> : null}
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <a className="inline-flex flex-1 items-center justify-center rounded-full border border-white/15 px-5 py-3 text-sm font-medium text-white/85 transition hover:bg-white/5" href={FACEBOOK_PAGE_URL} rel="noreferrer" target="_blank">
                      Message in Facebook
                    </a>
                    <button className="flex-1 rounded-full bg-emerald-300 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-200" disabled={isSubmitting} type="submit">
                      {isSubmitting ? 'Saving details...' : 'Continue to Messenger instructions'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      ) : null}

      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">Why this package closes</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight">Built for teams that need more listings live without slowing down approvals</h2>
            <p className="mt-4 text-sm leading-7 text-white/70">
              This promo package gives you a bigger funnel ceiling, faster campaign turnover, and a simpler approval path so your next property can go live without waiting on custom rebuilds every time.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {packageInclusions.map((item) => (
              <div key={item} className="rounded-[1.75rem] border border-white/10 bg-slate-950/70 p-5">
                <p className="text-base font-semibold text-white">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
