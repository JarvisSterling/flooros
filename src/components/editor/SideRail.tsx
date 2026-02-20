'use client';

import React from 'react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import {
  Layers, Package, Building2, Store,
} from 'lucide-react';
import type { PanelId } from '@/app/(dashboard)/dashboard/events/[id]/editor/page';

interface SideRailProps {
  activePanel: PanelId;
  onPanelChange: (id: PanelId) => void;
}

const railItems: { id: PanelId; label: string; icon: React.ReactNode; shortcut?: string }[] = [
  { id: 'layers', label: 'Layers', icon: <Layers size={20} />, shortcut: '1' },
  { id: 'library', label: 'Object Library', icon: <Package size={20} />, shortcut: '2' },
  { id: 'floors', label: 'Floors', icon: <Building2 size={20} />, shortcut: '3' },
  { id: 'booths', label: 'Booths', icon: <Store size={20} />, shortcut: '4' },
];

export default function SideRail({ activePanel, onPanelChange }: SideRailProps) {
  return (
    <div className="w-12 bg-[#080c16]/95 backdrop-blur-xl border-r border-white/[0.06] flex flex-col items-center py-3 gap-1 flex-shrink-0">
      {railItems.map((item) => {
        const isActive = activePanel === item.id;
        return (
          <Tooltip key={item.id}>
            <TooltipTrigger asChild>
              <button
                onClick={() => onPanelChange(item.id)}
                className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-500/15 text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.1)]'
                    : 'text-white/40 hover:text-white/70 hover:bg-white/[0.06]'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[2px] w-[3px] h-4 bg-blue-500 rounded-r-full" />
                )}
                {item.icon}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-[#1a2035] border-white/10 text-white text-xs">
              {item.label}
              {item.shortcut && <span className="ml-2 text-white/30 font-mono text-[10px]">Alt+{item.shortcut}</span>}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
