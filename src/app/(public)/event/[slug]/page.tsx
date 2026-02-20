import React from 'react';
import { notFound } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import EventPageClient from './EventPageClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() {},
      },
    },
  );
}

async function getEvent(slug: string) {
  const supabase = await getSupabase();
  const { data } = await supabase
    .from('events')
    .select('id, name, slug, description, start_date, end_date, venue, status, settings, logo_url')
    .eq('slug', slug)
    .in('status', ['published', 'live'])
    .limit(1)
    .maybeSingle();
  return data;
}

async function getStats(eventId: string) {
  const supabase = await getSupabase();
  const [booths, exhibitors] = await Promise.all([
    supabase.from('booths').select('id', { count: 'exact', head: true }).eq('event_id', eventId),
    supabase.from('exhibitors').select('id', { count: 'exact', head: true }).eq('event_id', eventId),
  ]);
  return { boothCount: booths.count ?? 0, exhibitorCount: exhibitors.count ?? 0 };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) return { title: 'Event Not Found' };
  return {
    title: `${event.name} | FloorOS`,
    description: event.description ?? `Explore the floor plan for ${event.name}`,
    openGraph: {
      title: event.name,
      description: event.description ?? undefined,
      type: 'website',
      ...(event.logo_url ? { images: [event.logo_url] } : {}),
    },
  };
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });
}

export default async function PublicEventPage({ params }: PageProps) {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) notFound();

  const stats = await getStats(event.id);
  const settings = (event.settings ?? {}) as Record<string, unknown>;
  const brandColor = (settings.brand_color as string) || '#3b82f6';

  const dateRange = event.start_date
    ? event.end_date && event.end_date !== event.start_date
      ? `${formatDate(event.start_date)} \u2013 ${formatDate(event.end_date)}`
      : formatDate(event.start_date)
    : null;

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(ellipse at 50% 0%, ${brandColor}40 0%, transparent 70%)` }} />
        <div className="relative max-w-7xl mx-auto px-4 py-12 md:py-20">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {event.logo_url && (
              <img src={event.logo_url} alt={event.name} className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover border border-white/10" />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                {event.status === 'live' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    Live Now
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-3">{event.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-white/60 text-sm mb-4">
                {dateRange && (
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                    {dateRange}
                  </span>
                )}
                {event.venue && (
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                    {event.venue}
                  </span>
                )}
              </div>
              {event.description && (
                <p className="text-white/50 max-w-2xl text-sm md:text-base leading-relaxed">{event.description}</p>
              )}
            </div>
          </div>
          <div className="flex gap-6 mt-8">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
              <span className="text-xl font-bold" style={{ color: brandColor }}>{stats.boothCount}</span>
              <span className="text-sm text-white/50">Booths</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
              <span className="text-xl font-bold" style={{ color: brandColor }}>{stats.exhibitorCount}</span>
              <span className="text-sm text-white/50">Exhibitors</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Viewer */}
      <section className="max-w-7xl mx-auto px-4 pb-12">
        <EventPageClient eventId={event.id} brandColor={brandColor} />
      </section>
    </div>
  );
}
