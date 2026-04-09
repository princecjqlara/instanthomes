import { CarFront, Home, Sparkles, Trees } from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    title: 'Designer Kitchen',
    description: 'Panel-ready appliances, custom oak cabinetry, and a statement island create a true entertaining hub.',
  },
  {
    icon: Home,
    title: 'Flexible Floor Plan',
    description: 'A downstairs guest suite plus office make the home work equally well for hosting, working, or multigenerational living.',
  },
  {
    icon: Trees,
    title: 'Indoor-Outdoor Flow',
    description: 'Wide sliders open to a covered terrace and deep backyard that feels private without losing natural light.',
  },
  {
    icon: CarFront,
    title: 'Fast to Everything',
    description: 'Minutes to Barton Creek trails, South Lamar restaurants, downtown employers, and top daily conveniences.',
  },
];

export function WhyGruns() {
  return (
    <section id="details" className="w-full bg-white py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-black mb-10">
          Why This Home Works
          <span className="text-gruns-green ml-2">from the first walkthrough</span>
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="space-y-3">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gruns-light-green">
                <feature.icon className="h-5 w-5 text-gruns-green" />
              </div>
              <h3 className="font-bold text-black">{feature.title}</h3>
              <p className="text-sm text-black/70 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
