import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import Pricing from '@/components/landing/Pricing';

const trustedBy = ['EventCorp', 'ExpoWorld', 'ConventionPro', 'TradeShow.io', 'MeetupHQ'];

export default function LandingPage() {
  return (
    <>
      <Hero />

      {/* Trusted By */}
      <section className="bg-[#0f172a] py-16 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-white/30">
            Trusted by event organizers worldwide
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {trustedBy.map((name) => (
              <span
                key={name}
                className="text-lg font-semibold text-white/20 transition-colors hover:text-white/40"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      <Features />
      <Pricing />
    </>
  );
}
