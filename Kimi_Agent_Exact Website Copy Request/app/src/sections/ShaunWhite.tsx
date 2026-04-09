import { Button } from '@/components/ui/button';

export function ShaunWhite() {
  return (
    <section id="agent" className="w-full bg-white py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left - Image */}
          <div className="relative flex justify-center">
            <div className="relative rounded-3xl overflow-hidden bg-gray-100">
              <img
                src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=900&q=80"
                alt="Maya Bennett"
                className="w-full max-w-md object-cover"
              />
            </div>
          </div>

          {/* Right - Quote */}
          <div className="space-y-6">
            <blockquote className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black leading-tight">
              "The right showing should answer the real buying questions before you ever write the offer."
            </blockquote>
            <p className="text-lg text-black/70 leading-relaxed">
              "I market each listing like a premium launch, but I guide buyers like an advisor. For 1848 Laurel Ridge Drive, that means a sharp property story, transparent comps, and fast follow-up so serious buyers can move with confidence."
            </p>
            <div>
              <p className="font-bold text-black">Maya Bennett</p>
              <p className="text-sm text-black/60">Listing Agent | Barton Hills + Central Austin Specialist</p>
            </div>
            <Button
              type="button"
              className="bg-gruns-green hover:bg-gruns-dark-green text-white font-bold text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all"
            >
              Talk to Maya
            </Button>
            <p className="text-xs text-black/40">
              Listing presented by Maya Bennett. Property details are believed accurate but should be independently verified by buyers.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
