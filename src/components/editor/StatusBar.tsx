'use client';

import React from 'react';
import { useEditorStore } from '@/store/editor-store';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { ZoomIn, ZoomOut } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

export default function StatusBar() {
  const {
    zoom, setZoom, setPan,
    unit, setUnit,
    gridSize, setGridSize,
    selectedObjectIds, objects,
    backgroundOpacity, setBackgroundOpacity,
    backgroundImageUrl,
  } = useEditorStore();

  const selectedCount = selectedObjectIds.size;
  const totalCount = objects.size;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 h-8 bg-[#080c16]/90 backdrop-blur-xl border-t border-white/[0.06] flex items-center px-3 gap-3 text-[11px]">
      {/* Zoom controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => setZoom(zoom / 1.2)}
          className="w-6 h-6 flex items-center justify-center rounded-md text-white/40 hover:text-white hover:bg-white/[0.06] transition-all"
        >
          <ZoomOut size={13} />
        </button>
        <button
          onClick={() => { setZoom(1); setPan(0, 0); }}
          className="w-12 text-center text-white/50 hover:text-white/80 font-mono tabular-nums cursor-pointer transition-colors"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          onClick={() => setZoom(zoom * 1.2)}
          className="w-6 h-6 flex items-center justify-center rounded-md text-white/40 hover:text-white hover:bg-white/[0.06] transition-all"
        >
          <ZoomIn size={13} />
        </button>
      </div>

      <div className="w-px h-4 bg-white/[0.08]" />

      {/* Unit */}
      <Select value={unit} onValueChange={(v) => setUnit(v as 'm' | 'ft')}>
        <SelectTrigger className="h-6 w-16 text-[10px] bg-transparent border-white/10 text-white/50 focus:ring-0 px-2">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-[#1a2035] border-white/10">
          <SelectItem value="m" className="text-white/80 text-xs focus:bg-white/10 focus:text-white">Meters</SelectItem>
          <SelectItem value="ft" className="text-white/80 text-xs focus:bg-white/10 focus:text-white">Feet</SelectItem>
        </SelectContent>
      </Select>

      {/* Grid size */}
      <Select value={String(gridSize)} onValueChange={(v) => setGridSize(Number(v))}>
        <SelectTrigger className="h-6 w-14 text-[10px] bg-transparent border-white/10 text-white/50 focus:ring-0 px-2">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-[#1a2035] border-white/10">
          {[0.5, 1, 2, 5].map((s) => (
            <SelectItem key={s} value={String(s)} className="text-white/80 text-xs focus:bg-white/10 focus:text-white">{s}m grid</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="w-px h-4 bg-white/[0.08]" />

      {/* Background opacity */}
      {backgroundImageUrl && (
        <>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 w-24">
                <span className="text-white/30 text-[10px] whitespace-nowrap">BG</span>
                <Slider
                  value={[backgroundOpacity]}
                  onValueChange={([v]) => setBackgroundOpacity(v ?? backgroundOpacity)}
                  min={0} max={1} step={0.05}
                  className="w-full"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-[#1a2035] border-white/10 text-white text-xs">
              Background opacity: {Math.round(backgroundOpacity * 100)}%
            </TooltipContent>
          </Tooltip>
          <div className="w-px h-4 bg-white/[0.08]" />
        </>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Selection info */}
      <span className="text-white/30">
        {selectedCount > 0 ? (
          <span className="text-blue-400/70">{selectedCount} selected</span>
        ) : (
          <>{totalCount} objects</>
        )}
      </span>
    </div>
  );
}
