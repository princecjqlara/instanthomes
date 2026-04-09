import { Button } from '@/components/ui/button';

export function CTASection() {
  return (
    <section className="w-full bg-gruns-green py-16 lg:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-8 leading-tight">
          Ready to walk through 1848 Laurel Ridge Drive?
        </h2>
        <Button
          type="button"
          className="bg-gruns-yellow hover:bg-gruns-yellow/90 text-black font-bold text-lg px-10 py-6 rounded-full shadow-lg hover:shadow-xl transition-all"
        >
          Book a Showing
        </Button>
      </div>
    </section>
  );
}
