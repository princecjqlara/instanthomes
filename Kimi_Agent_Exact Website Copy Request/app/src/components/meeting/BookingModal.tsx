import { useEffect, useRef } from 'react';
import type { InstantMeetingConfig } from '@/types/platform';

interface BookingModalProps {
  config: InstantMeetingConfig | null | undefined;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Full-screen modal overlay that embeds the InstantMeeting booking iframe.
 * If no meetingUrl is configured, shows a fallback scheduling placeholder.
 *
 * Listens for the custom 'im:open-booking' event so any component on the
 * page can request the modal to open without prop-drilling.
 */
export function BookingModal({ config, isOpen, onClose }: BookingModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const meetingUrl = config?.meetingUrl;
  const headline = config?.headline || 'Schedule a Meeting';
  const description = config?.description || 'Pick a time that works for you.';

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      onClick={(e) => {
        if (e.target === overlayRef.current) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Booking modal"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal panel */}
      <div className="relative mx-4 w-full max-w-2xl animate-[modalSlideIn_0.3s_ease-out] rounded-3xl border border-white/15 bg-slate-950 p-0 shadow-2xl sm:mx-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">
              Instant Meeting
            </p>
            <h2 className="mt-1 text-lg font-bold text-white">{headline}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
            aria-label="Close booking modal"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          {meetingUrl ? (
            <iframe
              className="h-[520px] w-full rounded-2xl bg-white"
              src={meetingUrl}
              title="Book a meeting"
              allow="camera; microphone"
            />
          ) : (
            <div className="flex h-[420px] flex-col items-center justify-center rounded-2xl bg-white/5 text-center">
              <div className="rounded-full bg-emerald-300/10 p-5">
                <svg
                  className="h-12 w-12 text-emerald-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                  />
                </svg>
              </div>
              <p className="mt-5 text-xl font-bold text-white">{headline}</p>
              <p className="mt-2 max-w-sm text-sm leading-6 text-white/60">{description}</p>
              <p className="mt-6 text-xs text-white/40">
                The booking calendar will be available once the agent connects their scheduling account.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Animation keyframes injected via style tag */}
      <style>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
