'use client';

import React from 'react';
import Link from 'next/link';

interface ExhibitorDirectoryLinkProps {
  eventSlug: string;
  exhibitorCount: number;
}

export default function ExhibitorDirectoryLink({ eventSlug, exhibitorCount }: ExhibitorDirectoryLinkProps) {
  if (exhibitorCount === 0) return null;

  return (
    <Link
      href={`/event/${eventSlug}/exhibitors`}
      className="group flex items-center gap-3 px-5 py-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/[0.08] hover:border-white/20 transition-all duration-300"
    >
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex-shrink-0">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
          View All Exhibitors
        </p>
        <p className="text-xs text-white/40">{exhibitorCount} exhibitor{exhibitorCount !== 1 ? 's' : ''} registered</p>
      </div>
      <svg className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}