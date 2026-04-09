import { Instagram, Youtube, Facebook } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const exploreLinks = [
  { label: 'Gallery', href: '#gallery' },
  { label: 'Home Highlights', href: '#details' },
  { label: 'Neighborhood', href: '#neighborhood' },
  { label: 'FAQ', href: '#faq' },
];

const connectLinks = [
  { label: 'Call Maya', href: 'tel:5125550142' },
  { label: 'Email Agent', href: 'mailto:maya@bennettlocal.com' },
  { label: 'Book a Showing', href: '#book-showing' },
  { label: 'Download Brochure', href: '#details' },
  { label: 'Ask About Financing', href: '#faq' },
];

const resourceLinks = [
  { label: 'Seller Disclosures', href: '#faq' },
  { label: 'Offer Timeline', href: '#faq' },
  { label: 'Property Snapshot', href: '#gallery' },
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Service', href: '#' },
];

export function Footer() {
  return (
    <footer className="w-full bg-gruns-dark-green">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Sign Up */}
          <div className="col-span-2 lg:col-span-1">
            <h3 className="text-gruns-yellow font-bold text-lg mb-4">
              Get The Brochure + Showing Updates
            </h3>
            <div className="flex gap-2 mb-3">
              <Input 
                type="email"
                placeholder="Email address"
                className="bg-white border-none text-black placeholder:text-black/50"
              />
              <Button className="bg-gruns-yellow hover:bg-gruns-yellow/90 text-black px-4">
                ➝
              </Button>
            </div>
            <p className="text-xs text-white/50 leading-relaxed">
              By requesting updates, you agree to be contacted about this listing and similar properties. Message frequency may vary. You can unsubscribe at any time.
            </p>
          </div>

          {/* Learn */}
          <div>
            <h3 className="text-gruns-yellow font-bold text-lg mb-4">Explore</h3>
            <ul className="space-y-2">
              {exploreLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href}
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-gruns-yellow font-bold text-lg mb-4">Connect</h3>
            <ul className="space-y-2">
              {connectLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href}
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Ü Snacks */}
          <div>
            <h3 className="text-gruns-yellow font-bold text-lg mb-4">Resources</h3>
            <ul className="space-y-2">
              {resourceLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href}
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Logo & Social */}
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold text-gruns-yellow">Maya Bennett</span>
              <div className="flex items-center gap-3">
                <a href="#" className="text-white/70 hover:text-white">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="text-white/70 hover:text-white">
                  <Youtube className="h-5 w-5" />
                </a>
                <a href="#" className="text-white/70 hover:text-white">
                  <Facebook className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Disclaimers */}
            <div className="flex flex-wrap justify-center gap-4 text-xs text-white/50">
              <span>All property information is deemed reliable but not guaranteed.</span>
              <span>Buyers should independently verify schools, taxes, square footage, and restrictions.</span>
            </div>
          </div>

          {/* Copyright & Legal */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-white/10">
            <p className="text-sm text-white/50">
              © Copyright 2026, Bennett Local Group
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-white/50">
              <a href="#" className="hover:text-white transition-colors">Privacy policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of service</a>
              <a href="#" className="hover:text-white transition-colors">Accessibility</a>
            </div>
          </div>
        </div>
      </div>

      {/* Big Text */}
      <div className="overflow-hidden py-8">
        <div className="text-center">
          <h2 className="text-6xl sm:text-8xl lg:text-9xl font-black text-gruns-green/30 tracking-tighter">
            AUSTIN
          </h2>
          <h2 className="text-6xl sm:text-8xl lg:text-9xl font-black text-gruns-green/30 tracking-tighter -mt-4">
            LIVING
          </h2>
        </div>
      </div>
    </footer>
  );
}
