import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const faqs = [
  {
    question: 'How do private showings work?',
    answer: 'Private showings are available by appointment throughout the week. Maya will confirm a 45-minute tour window, share parking instructions, and provide a digital packet with disclosures and neighborhood comps before you arrive.',
  },
  {
    question: 'When is the seller planning to review offers?',
    answer: 'The current plan is to review strong offers after the weekend open house. If the seller receives a compelling preemptive offer, Maya will communicate timing updates to active buyers immediately.',
  },
  {
    question: 'Is there an HOA?',
    answer: 'No formal HOA is currently in place for this property. Buyers should still review all disclosures and title materials for any deed restrictions or neighborhood considerations.',
  },
  {
    question: 'Can I review disclosures before I tour?',
    answer: 'Yes. Buyers who book a confirmed showing can request disclosures, the seller\'s survey, and recent comparable sales before stepping into the home.',
  },
  {
    question: 'Do you have lender recommendations?',
    answer: 'Yes. If you need a pre-approval refresh or a local jumbo-lender referral, Maya can connect you with financing partners familiar with this price point and neighborhood.',
  },
  {
    question: 'What should I prepare if I want to move quickly?',
    answer: 'Have proof of funds or a current pre-approval ready, know your preferred close timeline, and let Maya know what questions you want answered during the showing so the visit can stay focused and productive.',
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="w-full bg-gruns-light-green py-16 lg:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Left - Title */}
          <div className="lg:col-span-2">
            <h2 className="text-3xl sm:text-4xl font-bold text-black">
              Questions before you book?
            </h2>
          </div>

          {/* Right - FAQs */}
          <div className="lg:col-span-3 space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="border-b border-black/10"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between py-4 text-left hover:opacity-70 transition-opacity"
                >
                  <span className="font-semibold text-black pr-4">{faq.question}</span>
                  {openIndex === index ? (
                    <Minus className="h-5 w-5 text-black flex-shrink-0" />
                  ) : (
                    <Plus className="h-5 w-5 text-black flex-shrink-0" />
                  )}
                </button>
                {openIndex === index && (
                  <div className="pb-4">
                    <p className="text-sm text-black/70 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
