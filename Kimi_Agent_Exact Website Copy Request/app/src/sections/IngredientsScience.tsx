import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const accordions = [
  {
    id: 'layout',
    title: 'Floor Plan & Flow',
    content: `The main level is centered around an open kitchen, dining, and living room that spills onto the covered terrace. A guest bedroom, full bath, and office sit on the first floor, while the upstairs holds the private primary suite plus two secondary bedrooms connected by a shared lounge.`,
  },
  {
    id: 'upgrades',
    title: 'Upgrades & Finishes',
    content: `Recent updates include wide-plank oak flooring, a full kitchen renovation, designer lighting, custom closets, and refreshed landscaping with low-maintenance native planting. The seller also added motorized shades in the main living spaces and EV charging in the garage.`,
  },
  {
    id: 'location',
    title: 'Neighborhood Notes',
    content: `Barton Hills remains one of Austin's most resilient in-town neighborhoods because it pairs leafy streets with quick access to South Lamar, Zilker Park, Barton Springs, and downtown. Buyers love the proximity without giving up a true residential feel.`,
  },
  {
    id: 'showings',
    title: 'Showing + Offer Timeline',
    content: `Private showings are being scheduled this week ahead of the public open house. Seller disclosures are available immediately after a confirmed appointment, and the current plan is to review strong offers the Tuesday after the open house.`,
  },
  {
    id: 'financing',
    title: 'Financing Snapshot',
    content: `At current jumbo rates, buyers typically estimate this home in the mid-$8,000s per month before taxes and insurance with 20% down. If you need a lender introduction, Maya can connect you with a local mortgage partner who already knows the property.`,
  },
];

const insideTheHome = [
  'Dedicated office',
  'Guest suite downstairs',
  'Covered terrace',
  'Walk-in pantry',
  'Spa-style primary bath',
  'Two-car garage',
];

const nearby = [
  'Barton Creek Greenbelt',
  'South Lamar dining',
  'Zilker Park',
  'Downtown Austin',
  'Neighborhood coffee spots',
  'Daily grocery + fitness',
];

export function IngredientsScience() {
  const [openAccordion, setOpenAccordion] = useState<string | null>('layout');

  const toggleAccordion = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  return (
    <section id="neighborhood" className="w-full bg-white py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left - Accordions */}
          <div className="space-y-4">
            {accordions.map((accordion) => (
              <div 
                key={accordion.id}
                className="border border-gray-200 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => toggleAccordion(accordion.id)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-black">{accordion.title}</span>
                  <ChevronDown 
                    className={`h-5 w-5 text-black/50 transition-transform ${
                      openAccordion === accordion.id ? 'rotate-180' : ''
                    }`} 
                  />
                </button>
                {openAccordion === accordion.id && (
                  <div className="px-4 pb-4">
                    <p className="text-sm text-black/70 whitespace-pre-line leading-relaxed">
                      {accordion.content}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right - Home + Neighborhood Tags */}
          <div className="space-y-8">
            {/* Inside the Home */}
            <div>
              <h3 className="text-lg font-bold text-black mb-4">Inside the Home</h3>
              <div className="flex flex-wrap gap-3">
                {insideTheHome.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 bg-gruns-light-green/50 px-4 py-2 rounded-full"
                  >
                    <span className="text-sm font-medium text-black">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Nearby */}
            <div>
              <h3 className="text-lg font-bold text-black mb-4">Nearby</h3>
              <div className="flex flex-wrap gap-3">
                {nearby.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 bg-gruns-light-green/50 px-4 py-2 rounded-full"
                  >
                    <span className="text-sm font-medium text-black">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
