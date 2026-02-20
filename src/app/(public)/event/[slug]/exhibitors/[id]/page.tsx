import React from 'react';
import { notFound } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ slug: string; id: string }>;
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
    .select('id, name, slug, status')
    .eq('slug', slug)
    .in('status', ['published', 'live'])
    .limit(1)
    .maybeSingle();
  return data;
}

interface ExhibitorDetail {
  id: string;
  company_name: string;
  description: string | null;
  logo_url: string | null;
  website: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  social_links: Record<string, string> | null;
  category: string | null;
  tags: string[];
}

interface BoothInfo {
  id: string;
  number: string | null;
  name: string | null;
}

async function getExhibitor(eventId: string, exhibitorId: string) {
  const supabase = await getSupabase();
  const { data } = await supabase
    .from('exhibitors')
    .select('id, company_name, description, logo_url, website, contact_email, contact_phone, social_links, category, tags')
    .eq('event_id', eventId)
    .eq('id', exhibitorId)
    .maybeSingle();
  return data as ExhibitorDetail | null;
}

async function getExhibitorBooth(eventId: string, exhibitorId: string) {
  const supabase = await getSupabase();
  const { data } = await supabase
    .from('booths')
    .select('id, number, name')
    .eq('event_id', eventId)
    .eq('exhibitor_id', exhibitorId)
    .limit(1)
    .maybeSingle();
  return data as BoothInfo | null;
}

function getInitials(name: string): string {
  return name.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

const socialIcons: Record<string, string> = {
  twitter: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
  linkedin: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  facebook: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
  instagram: 'M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 100 12.324 6.162 6.162 0 100-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 11-2.882 0 1.441 1.441 0 012.882 0z',
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, id } = await params;
  const event = await getEvent(slug);
  if (!event) return { title: 'Event Not Found' };
  const exhibitor = await getExhibitor(event.id, id);
  if (!exhibitor) return { title: 'Exhibitor Not Found' };
  return {
    title: `${exhibitor.company_name} | ${event.name} | FloorOS`,
    description: exhibitor.description ?? `${exhibitor.company_name} at ${event.name}`,
    openGraph: {
      title: `${exhibitor.company_name} - ${event.name}`,
      description: exhibitor.description ?? undefined,
      type: 'website',
      ...(exhibitor.logo_url ? { images: [exhibitor.logo_url] } : {}),
    },
  };
}

export default async function ExhibitorDetailPage({ params }: PageProps) {
  const { slug, id } = await params;
  const event = await getEvent(slug);
  if (!event) notFound();

  const [exhibitor, booth] = await Promise.all([
    getExhibitor(event.id, id),
    getExhibitorBooth(event.id, id),
  ]);

  if (!exhibitor) notFound();

  const socialLinks = (exhibitor.social_links ?? {}) as Record<string, string>;
  const socialEntries = Object.entries(socialLinks).filter(([, v]) => v);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      {/* Back link */}
      <Link
        href={`/event/${slug}/exhibitors`}
        className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors mb-8"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Exhibitors
      </Link>

      {/* Profile header */}
      <div className="flex flex-col sm:flex-row items-start gap-6 mb-8">
        {exhibitor.logo_url ? (
          <img
            src={exhibitor.logo_url}
            alt={exhibitor.company_name}
            className="w-24 h-24 md:w-32 md:h-32 rounded-2xl object-cover border border-white/10 flex-shrink-0"
          />
        ) : (
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center flex-shrink-0">
            <span className="text-3xl font-bold text-white/40">{getInitials(exhibitor.company_name)}</span>
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight mb-2">{exhibitor.company_name}</h1>
          <div className="flex flex-wrap items-center gap-3">
            {exhibitor.category && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white/70 border border-white/20">
                {exhibitor.category}
              </span>
            )}
            {booth && (
              <span className="text-sm text-white/40">
                Booth {booth.number ?? booth.name ?? booth.id.slice(0, 8)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-8">
        {/* Description */}
        {exhibitor.description && (
          <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6">
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">About</h2>
            <p className="text-white/80 leading-relaxed whitespace-pre-line">{exhibitor.description}</p>
          </section>
        )}

        {/* Contact & Links */}
        {(exhibitor.contact_email || exhibitor.contact_phone || exhibitor.website) && (
          <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6">
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Contact</h2>
            <div className="space-y-3">
              {exhibitor.contact_email && (
                <a href={`mailto:${exhibitor.contact_email}`} className="flex items-center gap-3 text-sm text-white/70 hover:text-blue-400 transition-colors">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  {exhibitor.contact_email}
                </a>
              )}
              {exhibitor.contact_phone && (
                <a href={`tel:${exhibitor.contact_phone}`} className="flex items-center gap-3 text-sm text-white/70 hover:text-blue-400 transition-colors">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                  {exhibitor.contact_phone}
                </a>
              )}
              {exhibitor.website && (
                <a href={exhibitor.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-white/70 hover:text-blue-400 transition-colors">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                  </svg>
                  {exhibitor.website}
                </a>
              )}
            </div>
          </section>
        )}

        {/* Social links */}
        {socialEntries.length > 0 && (
          <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6">
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Social</h2>
            <div className="flex gap-3">
              {socialEntries.map(([platform, url]) => (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                  title={platform}
                >
                  {socialIcons[platform.toLowerCase()] ? (
                    <svg className="w-4 h-4 text-white/60" viewBox="0 0 24 24" fill="currentColor">
                      <path d={socialIcons[platform.toLowerCase()]} />
                    </svg>
                  ) : (
                    <span className="text-xs text-white/60 font-medium uppercase">{platform.slice(0, 2)}</span>
                  )}
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Booth info */}
        {booth && (
          <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6">
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">Booth Location</h2>
            <div className="flex items-center justify-between">
              <p className="text-white/80">
                Booth <span className="font-semibold">{booth.number ?? booth.name ?? booth.id.slice(0, 8)}</span>
              </p>
              <Link
                href={`/event/${slug}?booth=${booth.id}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/20 text-blue-400 text-sm font-medium hover:bg-blue-500/30 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                View on Map
              </Link>
            </div>
          </section>
        )}

        {/* Tags */}
        {exhibitor.tags && exhibitor.tags.length > 0 && (
          <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6">
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {exhibitor.tags.map((tag) => (
                <span key={tag} className="px-3 py-1 rounded-full text-xs bg-white/10 text-white/60 border border-white/10">
                  {tag}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}