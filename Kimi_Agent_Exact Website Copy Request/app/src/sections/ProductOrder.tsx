import { useState } from 'react';
import { Bath, BedDouble, CalendarDays, Check, Clock3, Home, MapPin, PhoneCall, Ruler, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

const listingPhotos = [
  {
    id: 'front-exterior',
    name: 'Front Exterior',
    description: 'Curb appeal with mature oaks, limestone detailing, and a private driveway approach.',
    image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'living-room',
    name: 'Living Room',
    description: 'Vaulted ceilings, wide-plank floors, and oversized glass doors that open to the terrace.',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'kitchen',
    name: 'Kitchen',
    description: 'A chef-forward kitchen with slab backsplash, integrated appliances, and an oversized island.',
    image: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'primary-suite',
    name: 'Primary Suite',
    description: 'A quiet primary retreat with spa bath, soaking tub, and custom wardrobe storage.',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
  },
];

const highlights = [
  'Four-bedroom layout with a dedicated office and guest suite on the main level',
  '12-foot sliding doors connect the kitchen, living room, and shaded outdoor lounge',
  'Designer kitchen with panel-ready appliances, limestone counters, and custom oak cabinetry',
  'Minutes to Barton Creek Greenbelt, South Lamar dining, and downtown Austin',
];

export function ProductOrder() {
  const [selectedPhoto, setSelectedPhoto] = useState('front-exterior');
  const [tourType, setTourType] = useState<'in-person' | 'virtual'>('in-person');
  const [tourWindow, setTourWindow] = useState<'this-week' | 'weekend'>('this-week');
  const [showingPlan, setShowingPlan] = useState<'private' | 'open-house'>('private');

  const selectedPhotoData = listingPhotos.find((photo) => photo.id === selectedPhoto) ?? listingPhotos[0];

  return (
    <section id="gallery" className="w-full bg-white py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-block bg-gruns-yellow text-black text-sm font-bold px-4 py-2 rounded-full mb-4">
            New Listing in Barton Hills
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-black">
            Tour this home before the weekend crowd discovers it.
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="space-y-6">
            <div className="bg-gruns-light-green/30 rounded-3xl p-8 flex items-center justify-center">
              <img
                src={selectedPhotoData.image}
                alt={selectedPhotoData.name}
                className="w-full max-w-2xl rounded-2xl object-cover aspect-[4/3]"
              />
            </div>

            <div className="flex gap-3 justify-center">
              {listingPhotos.map((photo) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setSelectedPhoto(photo.id)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedPhoto === photo.id
                      ? 'border-gruns-green ring-2 ring-gruns-green/20'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={photo.image} alt={photo.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            <p className="text-sm text-center text-black/60 max-w-xl mx-auto">
              {selectedPhotoData.description}
            </p>
          </div>

          <div id="book-showing" className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-gruns-light-green/50 px-4 py-2 text-sm font-semibold text-black">
                <MapPin className="h-4 w-4 text-gruns-green" />
                Barton Hills, Austin
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-gruns-light-green/50 px-4 py-2 text-sm font-semibold text-black">
                <CalendarDays className="h-4 w-4 text-gruns-green" />
                Showings This Week
              </span>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gruns-green mb-3">
                1848 Laurel Ridge Drive, Austin, TX 78704
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-black mb-3">
                1848 Laurel Ridge Drive
              </h1>
              <div className="flex flex-wrap items-end gap-4 mb-3">
                <span className="text-4xl sm:text-5xl font-black text-gruns-green">$1,485,000</span>
                <span className="text-sm font-medium text-black/60">4 beds | 3 baths | 3,120 sq ft | 0.27 acre</span>
              </div>
              <p className="text-black/70">
                A light-filled contemporary home with strong indoor-outdoor flow, a resort-style primary suite, and the rare mix of privacy and walkability buyers want in Barton Hills.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-gray-200 p-4">
                <div className="flex items-center gap-2 text-black font-semibold mb-1">
                  <BedDouble className="h-4 w-4 text-gruns-green" />
                  Bedrooms
                </div>
                <p className="text-2xl font-bold text-black">4</p>
              </div>
              <div className="rounded-2xl border border-gray-200 p-4">
                <div className="flex items-center gap-2 text-black font-semibold mb-1">
                  <Bath className="h-4 w-4 text-gruns-green" />
                  Bathrooms
                </div>
                <p className="text-2xl font-bold text-black">3</p>
              </div>
              <div className="rounded-2xl border border-gray-200 p-4">
                <div className="flex items-center gap-2 text-black font-semibold mb-1">
                  <Ruler className="h-4 w-4 text-gruns-green" />
                  Interior
                </div>
                <p className="text-2xl font-bold text-black">3,120</p>
              </div>
              <div className="rounded-2xl border border-gray-200 p-4">
                <div className="flex items-center gap-2 text-black font-semibold mb-1">
                  <Home className="h-4 w-4 text-gruns-green" />
                  Lot Size
                </div>
                <p className="text-2xl font-bold text-black">0.27 ac</p>
              </div>
            </div>

            <ul className="space-y-2">
              {highlights.map((highlight, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-black/80">
                  <Check className="h-4 w-4 text-gruns-green mt-0.5" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>

            <div>
              <label className="text-sm font-semibold text-black mb-3 block">
                Tour Format <span className="font-normal text-black/70">{tourType === 'in-person' ? 'In-Person' : 'Virtual Tour'}</span>
              </label>
              <div className="flex gap-3">
                {[
                  { id: 'in-person', label: 'In-Person' },
                  { id: 'virtual', label: 'Virtual Tour' },
                ].map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setTourType(option.id as 'in-person' | 'virtual')}
                    className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all ${
                      tourType === option.id
                        ? 'border-gruns-green bg-gruns-green/10 text-gruns-green'
                        : 'border-gray-200 text-black/70 hover:border-gray-300'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-black mb-3 block">Preferred Timing</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setTourWindow('this-week')}
                  className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all ${
                    tourWindow === 'this-week'
                      ? 'border-gruns-green bg-gruns-green/10 text-gruns-green'
                      : 'border-gray-200 text-black/70 hover:border-gray-300'
                  }`}
                >
                  This Week
                </button>
                <button
                  type="button"
                  onClick={() => setTourWindow('weekend')}
                  className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all ${
                    tourWindow === 'weekend'
                      ? 'border-gruns-green bg-gruns-green/10 text-gruns-green'
                      : 'border-gray-200 text-black/70 hover:border-gray-300'
                  }`}
                >
                  Weekend
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-black mb-3 block">Choose Your Next Step</label>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setShowingPlan('private')}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    showingPlan === 'private'
                      ? 'border-gruns-green bg-gruns-green/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full border-2 ${showingPlan === 'private' ? 'border-gruns-green bg-gruns-green' : 'border-gray-300'}`} />
                      <span className="font-semibold text-black">Private Showing</span>
                    </div>
                    <span className="text-xs bg-gruns-green text-white px-2 py-1 rounded-full">Most Requested</span>
                  </div>
                  <p className="text-xs text-black/60 ml-6">45-minute guided walkthrough with Maya plus disclosures on arrival.</p>
                  <div className="flex items-center gap-2 ml-6 mt-2">
                    <span className="text-2xl font-bold text-gruns-green">Available</span>
                    <span className="text-sm text-black/40">as early as Thursday</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setShowingPlan('open-house')}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    showingPlan === 'open-house'
                      ? 'border-gruns-green bg-gruns-green/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full border-2 ${showingPlan === 'open-house' ? 'border-gruns-green bg-gruns-green' : 'border-gray-300'}`} />
                      <span className="font-semibold text-black">Open House RSVP</span>
                    </div>
                    <span className="text-xs bg-black text-white px-2 py-1 rounded-full">Saturday</span>
                  </div>
                  <p className="text-xs text-black/60 ml-6">Drop in Saturday 1-4 PM and get a local market packet at check-in.</p>
                  <div className="flex items-center gap-2 ml-6 mt-2">
                    <span className="text-2xl font-bold text-black">2-day window</span>
                    <span className="text-sm text-black/40">to claim a preferred arrival time</span>
                  </div>
                </button>
              </div>
            </div>

            <Button
              type="button"
              className="w-full bg-gruns-green hover:bg-gruns-dark-green text-white font-bold text-lg py-6 rounded-full shadow-lg hover:shadow-xl transition-all"
            >
              Book a Showing
            </Button>

            <div className="grid grid-cols-2 gap-3 text-xs text-black/60">
              <div className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-gruns-green" />
                <span>Weekend + weekday tours</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock3 className="h-3.5 w-3.5 text-gruns-green" />
                <span>Reply in under 10 minutes</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-gruns-green" />
                <span>Disclosures ready to review</span>
              </div>
              <div className="flex items-center gap-1.5">
                <PhoneCall className="h-3.5 w-3.5 text-gruns-green" />
                <span>Call or text Maya directly</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
