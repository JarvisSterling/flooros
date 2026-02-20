import Link from 'next/link';
import { Check } from 'lucide-react';

interface Tier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  highlighted: boolean;
}

const tiers: Tier[] = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Perfect for trying things out',
    features: ['1 event', '50 booths', 'Public viewer', 'Basic analytics', 'Email support'],
    cta: 'Get Started Free',
    href: '/signup',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$49',
    period: '/month',
    description: 'For professional event organizers',
    features: ['Unlimited events', '500 booths per event', 'Exhibitor portal', 'Wayfinding', 'Advanced analytics', 'Priority support', 'Custom branding'],
    cta: 'Start Pro Trial',
    href: '/signup?plan=pro',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large-scale operations',
    features: ['Unlimited everything', 'SSO & SAML', 'Dedicated account manager', 'Custom integrations', 'SLA guarantee', 'On-premise option', 'White-label solution'],
    cta: 'Contact Sales',
    href: '/contact',
    highlighted: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="bg-[#0f172a] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/50">
            Start free, upgrade when you&apos;re ready.
          </p>
        </div>
        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl border p-8 backdrop-blur transition-all ${
                tier.highlighted
                  ? 'border-blue-500/50 bg-blue-500/10 shadow-lg shadow-blue-500/10'
                  : 'border-white/10 bg-white/5'
              }`}
            >
              {tier.highlighted && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-blue-500 px-4 py-1 text-xs font-semibold text-white">
                  Most Popular
                </span>
              )}
              <h3 className="text-lg font-semibold text-white">{tier.name}</h3>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-bold text-white">{tier.price}</span>
                <span className="ml-1 text-white/50">{tier.period}</span>
              </div>
              <p className="mt-2 text-sm text-white/50">{tier.description}</p>
              <ul className="mt-8 space-y-3" role="list">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-white/70">
                    <Check size={16} className="shrink-0 text-blue-400" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href={tier.href}
                className={`mt-8 block rounded-xl py-3 text-center text-sm font-semibold transition-all ${
                  tier.highlighted
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25 hover:bg-blue-600'
                    : 'border border-white/10 bg-white/5 text-white hover:bg-white/10'
                }`}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
