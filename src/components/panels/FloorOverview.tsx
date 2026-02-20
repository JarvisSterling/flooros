'use client';
import React from 'react';
import { useEditorStore } from '@/store/editor-store';
import type { FloorPlan } from '@/types/database';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Star, Layers } from 'lucide-react';

interface FloorThumbnailProps {
  floor: FloorPlan; isActive: boolean; isDefault: boolean;
  onSelect: () => void; onSetDefault: () => void;
}

function FloorThumbnail({ floor, isActive, isDefault, onSelect, onSetDefault }: FloorThumbnailProps) {
  return (
    <div className={`relative group border rounded-xl overflow-hidden cursor-pointer transition-all duration-200 ${
      isActive
        ? 'border-blue-500/50 bg-blue-500/5 shadow-lg shadow-blue-500/10'
        : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]'
    }`}>
      <div onClick={onSelect} className="aspect-square w-32 flex items-center justify-center relative bg-[#0a0f1a]">
        <div className="w-24 h-24 border border-white/10 rounded-lg relative bg-white/[0.03]">
          <div className={`absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${
            isActive ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/50 border border-white/10'
          }`}>
            {floor.floor_number}
          </div>

          {isDefault && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center shadow-sm">
                  <Star size={8} className="text-white fill-white" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-[#1e293b] border-white/10 text-white text-xs">Default floor</TooltipContent>
            </Tooltip>
          )}

          <div className="absolute inset-2 opacity-5">
            <div className="grid grid-cols-4 grid-rows-4 gap-1 h-full">
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className="border border-white/30"></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="p-2 border-t border-white/5">
        <div className="font-medium text-xs text-white/80 truncate" title={floor.name}>{floor.name}</div>
        <div className="text-[10px] text-white/30">{floor.width_m}×{floor.height_m}m</div>
      </div>

      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                isDefault ? 'bg-amber-500 text-white' : 'bg-white/10 text-white/40 hover:bg-white/20 border border-white/10'
              }`}
              onClick={(e) => { e.stopPropagation(); onSetDefault(); }}
            >
              <Star size={10} className={isDefault ? 'fill-white' : ''} />
            </button>
          </TooltipTrigger>
          <TooltipContent className="bg-[#1e293b] border-white/10 text-white text-xs">{isDefault ? 'Default floor' : 'Set as default'}</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

export default function FloorOverview() {
  const { floors, currentFloorId, switchFloor, setDefaultFloor } = useEditorStore();

  const handleSetDefault = async (floorId: string) => {
    try { await setDefaultFloor(floorId); } catch (error) { console.error('Failed to set default floor:', error); }
  };

  if (floors.length === 0) {
    return (
      <div className="p-8 text-center flex flex-col items-center">
        <Layers size={32} className="text-white/15 mb-3" />
        <div className="text-sm text-white/50 mb-1">No floors available</div>
        <div className="text-xs text-white/30">Create a floor to get started</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h3 className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-4">Floor Overview</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {floors
          .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
          .map((floor) => {
            const isDefault = !!(floor.metadata && (floor.metadata as Record<string, unknown>).is_default);
            return (
              <FloorThumbnail
                key={floor.id} floor={floor} isActive={floor.id === currentFloorId} isDefault={isDefault}
                onSelect={() => switchFloor(floor.id)} onSetDefault={() => handleSetDefault(floor.id)}
              />
            );
          })}
      </div>
    </div>
  );
}
