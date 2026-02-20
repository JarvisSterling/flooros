'use client';

import Link from 'next/link';
import StatusBadge from './StatusBadge';
import type { EventWithCounts } from '@/lib/api/events';

interface EventCardProps {
  event: EventWithCounts;
}

// M6: Validate logo_url to prevent XSS
function isSafeImageUrl(url: string | null): boolean {
  if (!url) return false;
  return url.startsWith('https://') || url.startsWith('/');
}

export default function EventCard({ event }: EventCardProps) {
  const formatDate = (date: string | null) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Link href={`/dashboard/events/${event.id}`}>
      <div className="group relative rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 hover:bg-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {isSafeImageUrl(event.logo_url) ? (
              <img
                src={event.logo_url!}
                alt={event.name}
                className="w-10 h-10 rounded-lg object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white/40">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            <div>
              <h3 className="text-white font-semibold text-sm group-hover:text-blue-400 transition-colors">
                {event.name}
              </h3>
              {event.venue && (
                <p className="text-white/50 text-xs mt-0.5">{event.venue}</p>
              )}
            </div>
          </div>
          <StatusBadge status={event.status} />
        </div>

        <div className="flex items-center gap-4 text-xs text-white/40">
          <div className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formatDate(event.start_date)}</span>
            {event.end_date && (
              <>
                <span>→</span>
                <span>{formatDate(event.end_date)}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
            <span>{event.booth_count ?? 0} booths</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
