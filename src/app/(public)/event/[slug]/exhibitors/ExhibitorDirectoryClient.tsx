'use client';

import React, { useState, useMemo } from 'react';
import ExhibitorCard from '@/components/viewer/ExhibitorCard';

interface ExhibitorWithBooth {
  id: string;
  company_name: string;
  description: string | null;
  logo_url: string | null;
  category: string | null;
  booth_number: string | null;
  booth_id: string | null;
}

interface ExhibitorDirectoryClientProps {
  exhibitors: ExhibitorWithBooth[];
  categories: string[];
  eventSlug: string;
}

export default function ExhibitorDirectoryClient({
  exhibitors,
  categories,
  eventSlug,
}: ExhibitorDirectoryClientProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  const filtered = useMemo(() => {
    let result = exhibitors;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((e) =>
        e.company_name.toLowerCase().includes(q) ||
        (e.description?.toLowerCase().includes(q))
      );
    }

    if (selectedCategory) {
      result = result.filter((e) => e.category === selectedCategory);
    }

    result = [...result].sort((a, b) => {
      const cmp = a.company_name.localeCompare(b.company_name);
      return sortAsc ? cmp : -cmp;
    });

    return result;
  }, [exhibitors, search, selectedCategory, sortAsc]);

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search exhibitors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/25 transition-colors"
          />
        </div>

        {categories.length > 0 && (
          <select
            value={selectedCategory ?? ''}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
            className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors appearance-none cursor-pointer min-w-[160px]"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        )}

        <button
          onClick={() => setSortAsc(!sortAsc)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-white/70 hover:text-white hover:border-white/20 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
          </svg>
          {sortAsc ? 'A → Z' : 'Z → A'}
        </button>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
            <svg className="w-8 h-8 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-white/40 text-sm">No exhibitors found</p>
          {(search || selectedCategory) && (
            <button
              onClick={() => { setSearch(''); setSelectedCategory(null); }}
              className="mt-3 text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="text-xs text-white/30 mb-4">{filtered.length} exhibitor{filtered.length !== 1 ? 's' : ''}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((ex) => (
              <ExhibitorCard
                key={ex.id}
                id={ex.id}
                companyName={ex.company_name}
                logoUrl={ex.logo_url}
                category={ex.category}
                boothNumber={ex.booth_number}
                boothId={ex.booth_id}
                description={ex.description}
                eventSlug={eventSlug}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}