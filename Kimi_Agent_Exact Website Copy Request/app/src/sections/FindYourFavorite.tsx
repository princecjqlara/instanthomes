import { useState } from 'react';

const products = [
  {
    id: 'adults-original',
    name: 'Adults Original',
    image: '/gruns-pouch.png',
    isNew: false,
  },
  {
    id: 'kids-original',
    name: 'Kids Original',
    image: '/gruns-pouch.png',
    isNew: false,
  },
  {
    id: 'adults-olipop',
    name: 'Adults OLIPOP®',
    image: '/gruns-strawberry.png',
    isNew: true,
  },
  {
    id: 'kids-olipop',
    name: 'Kids OLIPOP®',
    image: '/gruns-strawberry.png',
    isNew: true,
  },
];

export function FindYourFavorite() {
  const [activeProduct, setActiveProduct] = useState('adults-original');

  return (
    <section className="w-full bg-white py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-black mb-10">
          Find Your Favorite
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {products.map((product) => (
            <button
              key={product.id}
              onClick={() => setActiveProduct(product.id)}
              className={`relative group rounded-2xl overflow-hidden transition-all duration-300 ${
                activeProduct === product.id 
                  ? 'ring-2 ring-gruns-green ring-offset-2' 
                  : 'hover:shadow-lg'
              }`}
            >
              {/* New Badge */}
              {product.isNew && (
                <div className="absolute top-3 left-3 z-10 bg-gruns-green text-white text-xs font-bold px-2 py-1 rounded-full">
                  New!
                </div>
              )}

              {/* Product Image */}
              <div className="aspect-square bg-gruns-light-green/30 p-6 flex items-center justify-center">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Product Name */}
              <div className="p-4 bg-white">
                <h3 className="text-sm sm:text-base font-semibold text-black text-center">
                  {product.name}
                </h3>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
