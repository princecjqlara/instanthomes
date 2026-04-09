import { Star, Check, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section className="relative w-full bg-gruns-light-green overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-gruns-green text-gruns-green" />
                ))}
              </div>
              <span className="text-sm font-semibold text-gruns-green">4.8</span>
              <span className="text-sm text-gruns-green">stars from</span>
              <span className="text-sm font-bold text-gruns-green">85,000</span>
              <span className="text-sm text-gruns-green">reviews |</span>
              <span className="text-sm font-bold text-gruns-green">1,000,000+</span>
              <span className="text-sm text-gruns-green">members</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-black leading-tight">
              You have nutrition gaps,
              <br />
              <span className="text-gruns-green">Grüns fills them</span>
            </h1>

            {/* Description */}
            <p className="text-lg text-black/80 max-w-lg">
              60 ingredients, 21 vitamins & minerals, and 6g prebiotic fiber in one delicious daily pack of gummy bears.
            </p>

            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Button 
                className="bg-gruns-green hover:bg-gruns-dark-green text-white font-bold text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all"
              >
                Save 52% + Free Shipping
              </Button>
            </div>

            {/* Guarantee */}
            <div className="flex items-center gap-2 text-sm text-black/70">
              <Check className="h-4 w-4 text-gruns-green" />
              <span>30-Day Guarantee</span>
              <Info className="h-4 w-4 text-black/40" />
            </div>
          </div>

          {/* Right Content - Product Images */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative">
              {/* Main Product Image */}
              <img 
                src="/gruns-pouch.png" 
                alt="Grüns Superfoods Greens Gummies" 
                className="w-full max-w-md lg:max-w-lg drop-shadow-2xl"
              />
              
              {/* Floating Gummy Bears */}
              <img 
                src="/gummy-bear.png" 
                alt="Green Gummy Bear" 
                className="absolute -top-4 -right-4 w-20 h-20 animate-float"
              />
              <img 
                src="/gummy-bear.png" 
                alt="Green Gummy Bear" 
                className="absolute bottom-20 -left-8 w-16 h-16 animate-float"
                style={{ animationDelay: '0.5s' }}
              />
              
              {/* Limited Edition Badge */}
              <div className="absolute top-8 left-0 bg-gruns-pink text-black font-bold text-xs px-3 py-1.5 rounded-full transform -rotate-12">
                limited edition
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
