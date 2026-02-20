import {
  MousePointerClick,
  Store,
  Globe,
  Navigation,
  BarChart3,
  Layers,
} from 'lucide-react';
import type { ComponentType } from 'react';
import type { LucideProps } from 'lucide-react';

interface Feature {
  icon: ComponentType<LucideProps>;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: MousePointerClick,
    title: 'Interactive Editor',
    description: 'Drag-and-drop floor plan creation with snapping, alignment guides, and real-time collaboration.',
  },
  {
    icon: Store,
    title: 'Exhibitor Portal',
    description: 'Self-service booth reservation so exhibitors can browse, select, and pay — without back-and-forth emails.',
  },
  {
    icon: Globe,
    title: 'Public Viewer',
    description: 'Beautiful interactive maps for attendees with search, filtering, and booth details at a glance.',
  },
  {
    icon: Navigation,
    title: 'Wayfinding',
    description: 'Get turn-by-turn directions to any booth, stage, or amenity within the venue.',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    description: 'Track engagement, booth popularity, and foot traffic patterns with real-time dashboards.',
  },
  {
    icon: Layers,
    title: 'Multi-Event',
    description: 'Manage all your events, venues, and floor plans from one unified dashboard.',
  },
];

export default function Features() {
  return (
    <section id="features" className="bg-[#131c33] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Everything you need to run world-class events
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/50">
            Powerful tools for organizers, exhibitors, and attendees alike.
          </p>
        </div>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur transition-all hover:border-blue-500/30 hover:bg-white/[0.07]"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 transition-colors group-hover:bg-blue-500/20">
                <feature.icon size={24} aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/50">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
