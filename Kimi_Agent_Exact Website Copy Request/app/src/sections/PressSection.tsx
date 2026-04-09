import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const pressQuotes = [
  {
    quote: '"A multivitamin that doesn\'t taste bad? Count us in."',
    publication: 'theSkimm',
  },
  {
    quote: '"If you know you\'re not getting all of the vitamins and nutrients you need from your diet, adding Grüns in is a no-brainer."',
    publication: 'GLAMOUR',
  },
  {
    quote: '"In eight years of testing powders, pills, and potions, there\'s only one that I liked enough to then spend my own money on: Grüns superfood gummies."',
    publication: 'pétit',
  },
];

export function PressSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % pressQuotes.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + pressQuotes.length) % pressQuotes.length);
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="w-full bg-white py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative">
          {/* Carousel */}
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {pressQuotes.map((item, index) => (
                <div 
                  key={index} 
                  className="w-full flex-shrink-0 px-4"
                >
                  <div className="text-center max-w-3xl mx-auto">
                    <p className="text-xl sm:text-2xl lg:text-3xl font-medium text-black mb-6">
                      {item.quote}
                    </p>
                    <p className="text-lg font-semibold text-black/60 italic">
                      {item.publication}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <Button
            variant="outline"
            size="icon"
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 lg:-translate-x-12 rounded-full border-2 border-black hover:bg-black hover:text-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 lg:translate-x-12 rounded-full border-2 border-black hover:bg-black hover:text-white"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {pressQuotes.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  index === currentIndex ? 'bg-black w-6' : 'bg-black/30'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
