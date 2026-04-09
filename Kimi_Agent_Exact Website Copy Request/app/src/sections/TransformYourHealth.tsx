import { Brain, Heart, Zap, Shield } from 'lucide-react';

const benefits = [
  {
    icon: Heart,
    title: 'Gut Health',
    description: 'Prebiotics feed good bacteria to boost nutrient absorption and digestion.',
    position: 'top-left',
  },
  {
    icon: Shield,
    title: 'Immunity',
    description: 'Immune support and occasional stress support from Vitamin C, D, Zinc, antioxidants, and adaptogens.',
    position: 'top-right',
  },
  {
    icon: Zap,
    title: 'Energy & Body',
    description: 'Support recovery, strength, weight management, and metabolism.',
    position: 'bottom-left',
  },
  {
    icon: Brain,
    title: 'Brain Health',
    description: 'B-Vitamins, Vitamin C, and Vitamin D support brain health.',
    position: 'bottom-right',
  },
];

export function TransformYourHealth() {
  return (
    <section className="w-full bg-white py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-4">
            Transform Your Health
          </h2>
          <p className="text-lg text-black/70 max-w-2xl mx-auto">
            Over 35,000 research publications support the ingredients in Grüns.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="relative">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-center">
            {/* Left Benefits */}
            <div className="space-y-8 lg:space-y-16">
              {benefits.slice(0, 2).map((benefit, index) => (
                <div key={index} className="text-center lg:text-right">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gruns-light-green mb-4">
                    <benefit.icon className="h-6 w-6 text-gruns-green" />
                  </div>
                  <h3 className="text-xl font-bold text-gruns-green mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-black/70 max-w-xs ml-auto">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Center - Gummy Bear */}
            <div className="flex justify-center order-first lg:order-none">
              <img 
                src="/gummy-bear.png" 
                alt="Grüns Gummy Bear" 
                className="w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 object-contain animate-float"
              />
            </div>

            {/* Right Benefits */}
            <div className="space-y-8 lg:space-y-16">
              {benefits.slice(2, 4).map((benefit, index) => (
                <div key={index} className="text-center lg:text-left">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gruns-light-green mb-4">
                    <benefit.icon className="h-6 w-6 text-gruns-green" />
                  </div>
                  <h3 className="text-xl font-bold text-gruns-green mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-black/70 max-w-xs">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
