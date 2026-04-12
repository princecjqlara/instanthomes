import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { InstantMeetingConfig } from '@/types/platform';
import { BookingModal } from '@/components/meeting/BookingModal';

interface BookingContextValue {
  openBooking: () => void;
  closeBooking: () => void;
  isOpen: boolean;
}

const BookingContext = createContext<BookingContextValue>({
  openBooking: () => {},
  closeBooking: () => {},
  isOpen: false,
});

export function useBooking() {
  return useContext(BookingContext);
}

interface BookingProviderProps {
  config: InstantMeetingConfig | null | undefined;
  children: ReactNode;
}

/**
 * Provides a booking modal context to the entire public funnel page tree.
 * Any descendant can call `useBooking().openBooking()` to show the modal.
 *
 * Also listens for the custom DOM event 'im:open-booking' so legacy
 * template code that dispatches events still works.
 */
export function BookingProvider({ config, children }: BookingProviderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const openBooking = useCallback(() => setIsOpen(true), []);
  const closeBooking = useCallback(() => setIsOpen(false), []);

  // Listen for the custom 'im:open-booking' event
  useEffect(() => {
    function handleCustomEvent() {
      setIsOpen(true);
    }

    window.addEventListener('im:open-booking', handleCustomEvent);

    return () => {
      window.removeEventListener('im:open-booking', handleCustomEvent);
    };
  }, []);

  return (
    <BookingContext.Provider value={{ openBooking, closeBooking, isOpen }}>
      {children}
      <BookingModal config={config} isOpen={isOpen} onClose={closeBooking} />
    </BookingContext.Provider>
  );
}
