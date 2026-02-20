'use client';

import React, { useEffect, useRef } from 'react';
import type { PublicBooth } from '@/lib/api/public';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  available: { label: 'Available', color: '#22c55e' },
  reserved: { label: 'Reserved', color: '#eab308' },
  sold: { label: 'Occupied', color: '#3b82f6' },
  blocked: { label: 'Unavailable', color: '#ef4444' },
};

interface Props {
  booth: PublicBooth;
  position: { x: number; y: number };
  onClose: () => void;
  brandColor: string;
}

export default function BoothPopup({ booth, position, onClose, brandColor }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  const style: React.CSSProperties = {
    position: 'fixed',
    left: Math.min(position.x, window.innerWidth - 320),
    top: Math.min(position.y + 10, window.innerHeight - 300),
    zIndex: 100,
  };

  const status = STATUS_LABELS[booth.status] ?? { label: booth.status, color: '#888' };
  const exhibitor = booth.exhibitor;

  return (
    <div ref={ref} style={style} className="w-72">
      <div className="rounded-2xl bg-gray-900/95 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden">
        <div className="px-4 pt-4 pb-3 border-b border-white/5">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              {booth.number && <span className="text-base font-bold text-white">#{booth.number}</span>}
              {booth.name && <span className="text-sm text-white/60">{booth.name}</span>}
            </div>
            <button onClick={onClose} className="text-white/30 hover:text-white/60 transition-colors p-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: status.color + '20', color: status.color }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: status.color }} />
            {status.label}
          </span>
        </div>

        {exhibitor ? (
          <div className="px-4 py-3">
            <div className="flex items-start gap-3">
              {exhibitor.logo_url ? (
                <img src={exhibitor.logo_url} alt={exhibitor.company_name} className="w-10 h-10 rounded-lg object-cover border border-white/10 flex-shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ backgroundColor: brandColor + '30' }}>
                  {exhibitor.company_name.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{exhibitor.company_name}</p>
                {exhibitor.category && <p className="text-xs text-white/40 mt-0.5">{exhibitor.category}</p>}
                {exhibitor.description && <p className="text-xs text-white/50 mt-1 line-clamp-2">{exhibitor.description}</p>}
              </div>
            </div>
            {exhibitor.website && (
              <a href={exhibitor.website} target="_blank" rel="noopener noreferrer"
                className="mt-3 flex items-center justify-center gap-1.5 w-full py-2 rounded-lg text-xs font-medium transition-colors"
                style={{ backgroundColor: brandColor + '20', color: brandColor }}>
                Visit Website
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              </a>
            )}
          </div>
        ) : (
          <div className="px-4 py-3 text-center">
            <p className="text-xs text-white/40">No exhibitor assigned</p>
          </div>
        )}
      </div>
    </div>
  );
}
