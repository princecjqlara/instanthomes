import type { ReactNode } from 'react';
import { Check, X } from 'lucide-react';

const comparisons: Array<{ feature: string; listing: ReactNode; newBuilds: ReactNode; olderResales: ReactNode }> = [
  {
    feature: 'Price Per Sq Ft',
    listing: '$476',
    newBuilds: '$525+',
    olderResales: '$430',
  },
  {
    feature: 'Updated Kitchen',
    listing: <Check className="mx-auto h-4 w-4 text-green-600" />,
    newBuilds: <Check className="mx-auto h-4 w-4 text-green-600" />,
    olderResales: <X className="mx-auto h-4 w-4 text-red-500" />,
  },
  {
    feature: 'Private Backyard',
    listing: <Check className="mx-auto h-4 w-4 text-green-600" />,
    newBuilds: <X className="mx-auto h-4 w-4 text-red-500" />,
    olderResales: <Check className="mx-auto h-4 w-4 text-green-600" />,
  },
  {
    feature: 'Downtown Drive',
    listing: '12 min',
    newBuilds: '22 min',
    olderResales: '15 min',
  },
  {
    feature: 'Move-In Ready',
    listing: 'Yes',
    newBuilds: 'Builder schedule',
    olderResales: 'Selective',
  },
  {
    feature: 'Natural Light',
    listing: 'Walls of glass',
    newBuilds: 'Standard',
    olderResales: 'Varies',
  },
];

export function UsVsThem() {
  return (
    <section className="w-full bg-white py-16 lg:py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4">
            How This Listing Compares
          </h2>
          <p className="text-lg text-black/70">
            Strong finish level, better privacy, and faster access to central Austin than most buyers see at this price point.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="text-left py-4 px-4 font-semibold text-black"></th>
                <th className="text-center py-4 px-4 font-bold text-gruns-green bg-gruns-light-green/30 rounded-t-lg">
                  This Listing
                </th>
                <th className="text-center py-4 px-4 font-semibold text-black/60">
                  New Builds
                </th>
                <th className="text-center py-4 px-4 font-semibold text-black/60">
                  Older Resales
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisons.map((row, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-4 px-4 text-sm font-medium text-black">
                    {row.feature}
                  </td>
                  <td className="py-4 px-4 text-center bg-gruns-light-green/10 font-bold text-gruns-green">
                    {row.listing}
                  </td>
                  <td className="py-4 px-4 text-center text-black/60">
                    {row.newBuilds}
                  </td>
                  <td className="py-4 px-4 text-center text-black/60">
                    {row.olderResales}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
