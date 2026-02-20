'use client';
import React from 'react';
import { useEditorStore, EXTENDED_LAYERS, type ExtendedLayer } from '@/store/editor-store';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Slider } from '@/components/ui/slider';
import {
  Eye, EyeOff, Lock, Unlock,
  Image, Building2, Store, SquareDashed, Armchair, StickyNote, Thermometer, Compass,
} from 'lucide-react';

const LAYER_CONFIG: Record<string, { label: string; icon: React.ReactNode }> = {
  background: { label: 'Background', icon: <Image size={14} /> },
  structure: { label: 'Structure', icon: <Building2 size={14} /> },
  booths: { label: 'Booths', icon: <Store size={14} /> },
  zones: { label: 'Zones', icon: <SquareDashed size={14} /> },
  furniture: { label: 'Furniture', icon: <Armchair size={14} /> },
  annotations: { label: 'Annotations', icon: <StickyNote size={14} /> },
  heatmap: { label: 'Heatmap', icon: <Thermometer size={14} /> },
  wayfinding: { label: 'Wayfinding', icon: <Compass size={14} /> },
};

export default function LayerPanel() {
  const { layers, setLayerVisibility, setLayerLocked, setLayerOpacity, objects } = useEditorStore();

  const countForLayer = (layer: ExtendedLayer) => {
    let c = 0;
    objects.forEach((o) => {
      const ol = o.layer === 'default' ? 'annotations' : o.layer;
      if (ol === layer) c++;
    });
    return c;
  };

  return (
    <div className="w-56 bg-[#0a0f1a] border-r border-white/10 overflow-hidden flex flex-col">
      <div className="px-3 py-2.5 border-b border-white/10">
        <h3 className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Layers</h3>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent p-2">
        <div className="space-y-1">
          {EXTENDED_LAYERS.map((layer) => {
            const s = layers[layer];
            const count = countForLayer(layer);
            const cfg = LAYER_CONFIG[layer] || { label: layer, icon: null };
            return (
              <div key={layer} className="rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/10 transition-all duration-150 p-2">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-white/30">{cfg.icon}</span>
                  <span className="text-xs font-medium text-white/70 flex-1">{cfg.label}</span>
                  <span className="text-[10px] text-white/30 bg-white/5 px-1.5 py-0.5 rounded-full tabular-nums">{count}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className={`p-1 rounded transition-all duration-150 ${s.visible ? 'text-blue-400 hover:bg-blue-500/10' : 'text-white/20 hover:bg-white/5'}`}
                        onClick={() => setLayerVisibility(layer, !s.visible)}
                      >
                        {s.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#1e293b] border-white/10 text-white text-xs">{s.visible ? 'Hide' : 'Show'}</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className={`p-1 rounded transition-all duration-150 ${s.locked ? 'text-red-400 hover:bg-red-500/10' : 'text-white/20 hover:bg-white/5'}`}
                        onClick={() => setLayerLocked(layer, !s.locked)}
                      >
                        {s.locked ? <Lock size={14} /> : <Unlock size={14} />}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#1e293b] border-white/10 text-white text-xs">{s.locked ? 'Unlock' : 'Lock'}</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex-1 px-1">
                        <Slider
                          value={[s.opacity]}
                          onValueChange={([v]) => setLayerOpacity(layer, v)}
                          min={0} max={1} step={0.05}
                          className="w-full"
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#1e293b] border-white/10 text-white text-xs">Opacity: {Math.round(s.opacity * 100)}%</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
