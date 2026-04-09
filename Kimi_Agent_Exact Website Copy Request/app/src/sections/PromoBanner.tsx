import { Button } from '@/components/ui/button';

export function PromoBanner() {
  return (
    <section className="w-full py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Orange Gradient Banner */}
        <div 
          className="relative rounded-3xl overflow-hidden"
          style={{ 
            background: 'linear-gradient(135deg, #F7C948 0%, #F5C4B6 45%, #D8E8D8 100%)' 
          }}
        >
          <div className="grid lg:grid-cols-2 gap-8 items-center p-8 lg:p-16">
            {/* Left Content */}
            <div className="space-y-6">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black leading-tight">
                Open House Saturday, 1-4 PM
              </h2>
              <p className="text-lg text-black/80">
                Reserve a preferred arrival window now if you want first access to disclosures, comps, and a quieter walkthrough.
              </p>
              <Button
                type="button"
                className="bg-black hover:bg-black/80 text-white font-bold text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all"
              >
                Reserve Your Time Slot
              </Button>
            </div>

            {/* Right - Listing Image */}
            <div className="flex justify-center lg:justify-end">
              <img
                src="https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1000&q=80"
                alt="Outdoor living space"
                className="w-full max-w-sm rounded-3xl object-cover shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
