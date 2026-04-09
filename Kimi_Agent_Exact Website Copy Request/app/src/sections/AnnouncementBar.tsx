import { CalendarDays } from 'lucide-react';

export function AnnouncementBar() {
  return (
    <div className="w-full bg-gruns-pink py-2.5 px-4 text-center">
      <a href="#book-showing" className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
        <CalendarDays className="h-4 w-4 text-black" />
        <span className="text-sm font-medium text-black">
          <span className="font-bold">Open House Saturday 1-4 PM</span>
          <span className="mx-2">|</span>
          <span>Private showings are available before the weekend.</span>
        </span>
      </a>
    </div>
  );
}
