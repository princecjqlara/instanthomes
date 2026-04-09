import { useState } from 'react';
import { CalendarDays, Menu, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const navLinks = [
  { label: 'Gallery', href: '#gallery' },
  { label: 'Details', href: '#details' },
  { label: 'Neighborhood', href: '#neighborhood' },
  { label: 'Agent', href: '#agent' },
  { label: 'FAQ', href: '#faq' },
];

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full bg-gruns-green">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-14">
        <div className="hidden md:flex items-center gap-4">
          {navLinks.slice(0, 3).map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-white text-sm font-medium hover:opacity-80 transition-opacity border border-white/30 rounded-full px-4 py-1.5"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-gruns-green border-none">
              <div className="flex flex-col gap-6 mt-8">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-white text-lg font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </a>
                ))}
                <a href="tel:5125550142" className="text-white text-lg font-medium" onClick={() => setIsOpen(false)}>
                  Call Maya
                </a>
                <a href="#book-showing" className="text-gruns-yellow text-lg font-semibold" onClick={() => setIsOpen(false)}>
                  Book a Showing
                </a>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <a href="#gallery" className="absolute left-1/2 transform -translate-x-1/2 whitespace-nowrap">
          <span className="text-gruns-yellow text-lg sm:text-xl font-bold tracking-tight">
            Maya Bennett
          </span>
        </a>

        <div className="flex items-center gap-2">
          <a
            href="tel:5125550142"
            className="md:hidden flex items-center text-white hover:opacity-80 transition-opacity"
            aria-label="Call Maya Bennett"
          >
            <Phone className="h-5 w-5" />
          </a>
          <a
            href="tel:5125550142"
            className="hidden lg:flex items-center gap-1.5 text-white text-sm font-medium hover:opacity-80 transition-opacity"
          >
            <Phone className="h-5 w-5" />
            <span>512.555.0142</span>
          </a>
          <Button asChild size="sm" className="hidden sm:inline-flex rounded-full bg-gruns-yellow hover:bg-gruns-yellow/90 text-black font-semibold px-4">
            <a href="#book-showing">
              <CalendarDays className="h-4 w-4" />
              Book a Showing
            </a>
          </Button>
        </div>
      </div>
    </nav>
  );
}
