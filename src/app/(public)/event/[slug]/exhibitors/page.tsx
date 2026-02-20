import React from 'react';
import { notFound } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import type { Metadata } from 'next';
import ExhibitorDirectoryClient from './ExhibitorDirectoryClient';

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

interface ExhibitorRow {
  id: string;
  company_name: string;
  description: string | null;
  logo_url: string | null;
  category: string | null;
}

interface BoothRow {
  id: string;
  number: string | null;
  exhibitor_id: string | null;
}

async function getExhibitorsWithBooths(eventId: string) {
  const supabase = await getSupabase();
  const [exResult, boothResult] = await Promise.all([
    supabase
      .from('exhibitors')
      .select('id, company_name, description, logo_url, category')
      .eq('event_id', eventId),
    supabase
      .from('booths')
      .select('id, number, exhibitor_id')
      .eq('event_id', eventId)
      .not('exhibitor_id', 'is', null),
  ]);

  const exhibitors: ExhibitorRow[] = exResult.data ?? [];
  const booths: BoothRow[] = boothResult.data ?? [];

  const boothMap = new Map<string, { number: string | null; id: string }>();
  for (const b of booths) {
    if (b.exhibitor_id) {
      boothMap.set(b.exhibitor_id, { number: b.number, id: b.id });
    }
  }

  return exhibitors.map((ex) => {
    const booth = boothMap.get(ex.id);
    return {
      ...ex,
      booth_number: booth?.number ?? null,
      booth_id: booth?.id ?? null,
    };
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) return { title: 'Event Not Found' };
  return {
    title: `Exhibitors | ${event.name} | FloorOS`,
    description: `Browse all exhibitors at ${event.name}. Find companies, booth locations, and more.`,
    openGraph: {
      title: `Exhibitors - ${event.name}`,
      description: `Browse all exhibitors at ${event.name}`,
      type: 'website',
    },
  };
}

export default async function ExhibitorDirectoryPage({ params }: PageProps) {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) notFound();

  const exhibitors = await getExhibitorsWithBooths(event.id);

  const categories = Array.from(
    new Set(exhibitors.map((e) => e.category).filter((c): c is string => c !== null))
  ).sort();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      {/* Back link */}
      <Link
        href={`/event/${slug}`}
        className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors mb-6"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to {event.name}
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-4xl font-bold tracking-tight mb-2">Exhibitors</h1>
        <p className="text-white/50 text-sm md:text-base">
          Browse all exhibitors at {event.name}
        </p>
      </div>

      {exhibitors.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
            <svg className="w-10 h-10 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
          </div>
          <p className="text-white/40">No exhibitors registered yet</p>
        </div>
      ) : (
        <ExhibitorDirectoryClient
          exhibitors={exhibitors}
          categories={categories}
          eventSlug={slug}
        />
      )}
    </div>
  );
}