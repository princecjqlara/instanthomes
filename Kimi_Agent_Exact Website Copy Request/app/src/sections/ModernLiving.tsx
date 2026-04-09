import { Button } from '@/components/ui/button';

const stats = [
  {
    percentage: '90%',
    description: 'of U.S. adults don\'t meet recommended daily nutrient intake—including vitamins and minerals found in Grüns.',
    source: '1',
  },
  {
    percentage: '61%',
    description: 'of Americans experience weekly digestive issues like bloating, abdominal pain, or irregularity.',
    source: '2',
  },
];

export function ModernLiving() {
  return (
    <section className="w-full bg-gruns-light-green py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gruns-green leading-tight">
              Modern Living Leaves Our Bodies Deficient
            </h2>
            <p className="text-lg text-black/70">
              Grüns is the first smart gummy that fills the gaps.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6 pt-4">
              {stats.map((stat, index) => (
                <div key={index} className="space-y-2">
                  <div className="text-5xl sm:text-6xl font-black text-gruns-green">
                    {stat.percentage}
                  </div>
                  <p className="text-sm text-black/70 leading-relaxed">
                    {stat.description}
                  </p>
                  <span className="text-xs text-black/40">{stat.source}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="pt-4">
              <Button 
                className="bg-gruns-green hover:bg-gruns-dark-green text-white font-bold text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all"
              >
                Save 52% + Free Shipping
              </Button>
            </div>

            {/* Sources */}
            <div className="flex gap-6 text-xs text-black/40 pt-2">
              <span>1 <a href="#" className="underline hover:text-gruns-green">Source</a></span>
              <span>2 <a href="#" className="underline hover:text-gruns-green">Source</a></span>
            </div>
          </div>

          {/* Right - Image */}
          <div className="relative flex justify-center">
            <div className="relative rounded-3xl overflow-hidden bg-white shadow-2xl">
              <img 
                src="/gruns-pack.png" 
                alt="Grüns Daily Pack" 
                className="w-full max-w-md object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
