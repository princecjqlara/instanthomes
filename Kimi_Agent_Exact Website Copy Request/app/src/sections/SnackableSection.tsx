import { X } from 'lucide-react';

const customerStats = [
  {
    percentage: '95%',
    description: 'of users take Grüns at least 4-6x per week with 80% taking Grüns daily.*',
  },
  {
    percentage: '67%',
    description: 'say their overall health and well-being have improved.*',
  },
  {
    percentage: '67%',
    description: 'experienced better, more regular digestion.*',
  },
  {
    percentage: '52%',
    description: 'feel more energized throughout the day.*',
  },
];

const contaminants = [
  '70 Different pesticides',
  '4 types of heavy metals',
  '16 different contaminants',
  '9 Microbial contaminants',
];

export function SnackableSection() {
  return (
    <section className="w-full bg-gruns-cream py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gruns-green mb-4">
            Snackable, Packable, Tested
          </h2>
          <p className="text-lg text-black/70 max-w-3xl mx-auto">
            We know Grüns is delicious and convenient, but we wanted to understand what happens after the honeymoon. 
            Here's what thousands of customers reported after 3 months of Grüns.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-16">
          {customerStats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl sm:text-5xl lg:text-6xl font-black text-gruns-green mb-3">
                {stat.percentage}
              </div>
              <p className="text-sm text-black/70 leading-relaxed">
                {stat.description}
              </p>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-black/50 text-center mb-16">
          *In a post purchase survey of 3k+ customers who've been using Grüns daily
        </p>

        {/* Quality Section */}
        <div className="border-t border-black/10 pt-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl sm:text-3xl font-bold text-gruns-green mb-4">
              Quality You Can Trust
            </h3>
            <p className="text-base text-black/70 max-w-3xl mx-auto">
              Our gummies are regularly tested for all 21 vitamins & minerals to ensure label claims are accurate and clear of contaminants including:
            </p>
          </div>

          {/* Contaminants Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {contaminants.map((item, index) => (
              <div key={index} className="flex items-center gap-2 justify-center">
                <X className="h-4 w-4 text-red-500" />
                <span className="text-sm text-black/70">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
