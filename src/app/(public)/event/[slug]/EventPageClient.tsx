'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import FloorSelector from '@/components/viewer/FloorSelector';
import BoothPopup from '@/components/viewer/BoothPopup';
import {
  getPublicFloorPlans,
  getPublicFloors,
  getPublicObjects,
  getPublicBooths,
  getPublicExhibitors,
  type PublicFloorPlan,
  type PublicFloor,
  type PublicObject,
  type PublicBooth,
  type PublicExhibitor,
} from '@/lib/api/public';

const PublicViewer = dynamic(() => import('@/components/viewer/PublicViewer'), { ssr: false });

interface Props {
  eventId: string;
  brandColor: string;
}

export default function EventPageClient({ eventId, brandColor }: Props) {
  const [plans, setPlans] = useState<PublicFloorPlan[]>([]);
  const [floors, setFloors] = useState<PublicFloor[]>([]);
  const [activeFloorId, setActiveFloorId] = useState<string | null>(null);
  const [objects, setObjects] = useState<PublicObject[]>([]);
  const [booths, setBooths] = useState<PublicBooth[]>([]);
  const [selectedBooth, setSelectedBooth] = useState<PublicBooth | null>(null);
  const [popupPos, setPopupPos] = useState({ x: 0, y: 0 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [activePlan, setActivePlan] = useState<PublicFloorPlan | null>(null);

  useEffect(() => {
    (async () => {
      const [p] = await Promise.all([
        getPublicFloorPlans(eventId),
        getPublicExhibitors(eventId),
      ]);
      setPlans(p);
      if (p.length > 0) {
        setActivePlan(p[0]);
        const f = await getPublicFloors(p[0].id);
        setFloors(f);
        if (f.length > 0) setActiveFloorId(f[0].id);
      }
      setLoading(false);
    })();
  }, [eventId]);

  useEffect(() => {
    if (!activeFloorId) return;
    (async () => {
      const [obj, b] = await Promise.all([
        getPublicObjects(activeFloorId),
        getPublicBooths(eventId, activeFloorId),
      ]);
      setObjects(obj);
      setBooths(b);
    })();
  }, [activeFloorId, eventId]);

  const handleFloorChange = useCallback((floorId: string) => {
    setActiveFloorId(floorId);
    setSelectedBooth(null);
  }, []);

  const handleBoothClick = useCallback((booth: PublicBooth, screenX: number, screenY: number) => {
    setSelectedBooth(booth);
    setPopupPos({ x: screenX, y: screenY });
  }, []);

  const handleClosePopup = useCallback(() => setSelectedBooth(null), []);

  const filteredBooths = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.toLowerCase();
    return booths.filter(b => {
      const name = (b.name || '').toLowerCase();
      const number = (b.number || '').toLowerCase();
      const company = (b.exhibitor?.company_name || '').toLowerCase();
      return name.includes(q) || number.includes(q) || company.includes(q);
    });
  }, [search, booths]);

  const highlightedObjectIds = useMemo(() => {
    if (!filteredBooths) return new Set<string>();
    return new Set(filteredBooths.map(b => b.object_id).filter(Boolean) as string[]);
  }, [filteredBooths]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/20 border-t-blue-500" />
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="text-center py-20 text-white/40">
        <p className="text-lg">No floor plans available yet.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <div className="relative max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Find an exhibitor or booth..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
        </div>
        {filteredBooths && (
          <p className="text-xs text-white/40 mt-2">{filteredBooths.length} result{filteredBooths.length !== 1 ? 's' : ''} found</p>
        )}
      </div>

      {floors.length > 1 && (
        <FloorSelector floors={floors} activeFloorId={activeFloorId} onSelect={handleFloorChange} brandColor={brandColor} />
      )}

      <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-gray-900">
        <PublicViewer
          objects={objects}
          booths={booths}
          planWidth={activePlan?.width ?? 1200}
          planHeight={activePlan?.height ?? 800}
          brandColor={brandColor}
          highlightedObjectIds={highlightedObjectIds}
          onBoothClick={handleBoothClick}
        />
      </div>

      {selectedBooth && (
        <BoothPopup booth={selectedBooth} position={popupPos} onClose={handleClosePopup} brandColor={brandColor} />
      )}
    </div>
  );
}
