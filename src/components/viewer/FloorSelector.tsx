'use client';

import React from 'react';
import type { PublicFloor } from '@/lib/api/public';

interface Props {
  floors: PublicFloor[];
  activeFloorId: string | null;
  onSelect: (floorId: string) => void;
  brandColor: string;
}

export default function FloorSelector({ floors, activeFloorId, onSelect, brandColor }: Props) {
  return (
    <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1">
      {floors.map(floor => {
        const isActive = floor.id === activeFloorId;
        return (
          <button
            key={floor.id}
            onClick={() => onSelect(floor.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              isActive ? 'text-white shadow-lg' : 'text-white/50 bg-white/5 hover:bg-white/10 hover:text-white/70'
            }`}
            style={isActive ? { backgroundColor: brandColor, boxShadow: `0 4px 14px ${brandColor}40` } : undefined}
          >
            {floor.name}
          </button>
        );
      })}
    </div>
  );
}
