import { useState } from 'react';
import { Star } from 'lucide-react';

const tabs = ['Buyers', 'Sellers', 'Relocation', 'Negotiation', 'Neighborhood', 'Showing'];

const reviews: Record<string, Array<{rating: number, quote: string, detail: string, author: string}>> = {
  Buyers: [
    {
      rating: 5,
      quote: 'Maya made us feel prepared before we ever stepped inside.',
      detail: 'We saw the full showing packet, understood the neighborhood comps, and knew exactly how this home stacked up before we wrote an offer.',
      author: 'Rachel and Ben C.',
    },
    {
      rating: 5,
      quote: 'The showing itself sold us because the pacing was so thoughtful.',
      detail: 'Maya let the house breathe, answered the right questions, and pointed out value details we would have missed on our own.',
      author: 'Alyssa T.',
    },
    {
      rating: 5,
      quote: 'We toured on Thursday and felt ready by Sunday.',
      detail: 'The entire funnel was clear, calm, and informative. It never felt pushy, just very dialed-in for serious buyers.',
      author: 'Drew M.',
    },
  ],
  Sellers: [
    {
      rating: 5,
      quote: 'Every showing felt qualified and intentional.',
      detail: 'Maya prepped buyers so the conversations inside the home were higher quality from day one.',
      author: 'Tessa R.',
    },
    {
      rating: 5,
      quote: 'She protected our price while still creating momentum.',
      detail: 'The strategy balanced urgency, transparency, and timing. We felt represented every step of the way.',
      author: 'James H.',
    },
    {
      rating: 5,
      quote: 'The marketing looked premium, but the follow-up closed the gap.',
      detail: 'Beautiful visuals brought people in, and Maya converted that traffic into well-informed buyers who were ready to act.',
      author: 'Anita P.',
    },
  ],
  Relocation: [
    {
      rating: 5,
      quote: 'Relocating from Seattle felt less overwhelming with Maya in front.',
      detail: 'She framed the lifestyle, commute, and neighborhood texture in a way that made this home easy to evaluate from out of state.',
      author: 'Chris and Lina V.',
    },
    {
      rating: 5,
      quote: 'The virtual tour still felt curated and high-touch.',
      detail: 'We could tell Maya knew exactly what a relocating buyer would need to see, ask, and compare.',
      author: 'Noah B.',
    },
    {
      rating: 5,
      quote: 'We landed in Austin with zero wasted tours.',
      detail: 'By the time we flew in, this was already one of our top two choices because the pre-showing materials were that strong.',
      author: 'Emily and Sean D.',
    },
  ],
  Negotiation: [
    {
      rating: 5,
      quote: 'Maya told us where to press and where not to overplay.',
      detail: 'Her read on the seller and the local market helped us win without jumping straight to our ceiling.',
      author: 'Kyle W.',
    },
    {
      rating: 5,
      quote: 'She kept the deal moving when the process got emotional.',
      detail: 'Great agent energy: calm, factual, confident, and always a step ahead on paperwork and timing.',
      author: 'Marissa F.',
    },
    {
      rating: 5,
      quote: 'Every number in the offer strategy was backed by logic.',
      detail: 'We never felt like we were guessing. That clarity gave us confidence to move quickly when it mattered.',
      author: 'Omar K.',
    },
  ],
  Neighborhood: [
    {
      rating: 5,
      quote: 'Barton Hills gives you room to breathe without losing the city.',
      detail: 'That balance is hard to find, and Maya explained why this pocket holds value so well.',
      author: 'Sophie N.',
    },
    {
      rating: 5,
      quote: 'The neighborhood tour was almost as helpful as the house tour.',
      detail: 'We understood where we would grab coffee, walk the dog, and get downtown before we ever made a decision.',
      author: 'Daniel C.',
    },
    {
      rating: 5,
      quote: 'This area feels established, not overbuilt.',
      detail: 'That texture is exactly what we wanted, and Maya was able to articulate it with real examples instead of vague marketing.',
      author: 'Priya S.',
    },
  ],
  Showing: [
    {
      rating: 5,
      quote: 'Booking was simple and the response time was fast.',
      detail: 'We asked for a same-week slot and had it locked in almost immediately.',
      author: 'Megan L.',
    },
    {
      rating: 5,
      quote: 'The showing packet answered questions before we had to ask them.',
      detail: 'That made the walkthrough feel focused on how the home lived, not on chasing basic facts.',
      author: 'Julian R.',
    },
    {
      rating: 5,
      quote: 'The follow-up after the tour was sharp and useful.',
      detail: 'We got comps, next steps, and a realistic sense of offer timing without being hounded.',
      author: 'Leah G.',
    },
  ],
};

export function CustomerReviews() {
  const [activeTab, setActiveTab] = useState('Buyers');

  return (
    <section className="w-full bg-gruns-light-green py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-gruns-green text-gruns-green" />
              ))}
              </div>
              <span className="text-lg font-semibold text-black">5.0 client experience</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gruns-green">
              What Buyers and Sellers Say About Working This Market
            </h2>
          </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-gruns-green text-white'
                  : 'bg-white text-black/70 hover:bg-gray-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Reviews Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews[activeTab]?.map((review, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex mb-3">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-gruns-green text-gruns-green" />
                ))}
              </div>
              <p className="font-semibold text-black mb-2">&quot;{review.quote}&quot;</p>
              <p className="text-sm text-black/70 mb-4">{review.detail}</p>
              <p className="text-sm font-medium text-black">{review.author}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
