'use client';

import React from 'react';
import Link from 'next/link';

interface ExhibitorCardProps {
  id: string;
  companyName: string;
  logoUrl: string | null;
  category: string | null;
  boothNumber: string | null;
  boothId: string | null;
  description: string | null;
  eventSlug: string;
}

const categoryColors: Record<string, string> = {
  technology: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  food: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  health: 'bg-green-500/20 text-green-400 border-green-500/30',
  education: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  entertainment: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  finance: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  default: 'bg-white/10 text-white/70 border-white/20',
};

function getCategoryStyle(category: string | null): string {
  if (!category) return categoryColors.default;
  const key = category.toLowerCase();
  for (const [k, v] of Object.entries(categoryColors)) {
    if (key.includes(k)) return v;
  }
  return categoryColors.default;
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export default function ExhibitorCard({
  id,
  companyName,
  logoUrl,
  category,
  boothNumber,
  boothId,
  description,
  eventSlug,
}: ExhibitorCardProps) {
  return (
    <div className="group relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.08] hover:shadow-lg hover:shadow-white/5 hover:-translate-y-0.5">
      <Link href={`/event/${eventSlug}/exhibitors/${id}`} className="absolute inset-0 z-10" />

      <div className="flex items-start gap-4 mb-3">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={companyName}
            className="w-14 h-14 rounded-xl object-cover border border-white/10 flex-shrink-0"
          />
        ) : (
          <div className="w-14 h-14 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center flex-shrink-0">
            <span className="text-lg font-bold text-white/60">{getInitials(companyName)}</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate group-hover:text-blue-400 transition-colors">
            {companyName}
          </h3>
          {boothNumber && (
            <p className="text-xs text-white/40 mt-0.5">Booth {boothNumber}</p>
          )}
        </div>
      </div>

      {category && (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border mb-3 ${getCategoryStyle(category)}`}>
          {category}
        </span>
      )}

      {description && (
        <p className="text-sm text-white/50 line-clamp-2 mb-4">{description}</p>
      )}

      {boothId && (
        <Link
          href={`/event/${eventSlug}?booth=${boothId}`}
          className="relative z-20 inline-flex items-center gap-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          View on Map
        </Link>
      )}
    </div>
  );
}