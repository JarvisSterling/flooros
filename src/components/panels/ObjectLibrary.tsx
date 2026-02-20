'use client';
import React, { useState, useMemo } from 'react';
import { LIBRARY_CATEGORIES, LIBRARY_ITEMS, type LibraryItem } from '@/lib/object-library';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Search, ChevronRight, ChevronDown, GripVertical } from 'lucide-react';

interface ObjectLibraryProps {
  className?: string;
}

export default function ObjectLibrary({ className }: ObjectLibraryProps) {
  const [search, setSearch] = useState('');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const filtered = useMemo(() => {
    if (!search.trim()) return LIBRARY_ITEMS;
    const q = search.toLowerCase();
    return LIBRARY_ITEMS.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [search]);

  const toggleCategory = (cat: string) => {
    setCollapsed((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const handleDragStart = (e: React.DragEvent, item: LibraryItem) => {
    e.dataTransfer.setData('application/x-library-item', JSON.stringify(item));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className={`h-full bg-transparent flex flex-col overflow-hidden ${className ?? ''}`}>
      <div className="px-4 py-3 border-b border-white/[0.06]">
        <h3 className="text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-2">Object Library</h3>
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Search objects…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-8 pl-8 pr-3 text-xs bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-150"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {LIBRARY_CATEGORIES.map((cat) => {
          const items = filtered.filter((i) => i.category === cat);
          if (items.length === 0) return null;
          const isCollapsed = collapsed[cat];
          return (
            <div key={cat}>
              <button
                onClick={() => toggleCategory(cat)}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-white/70 hover:text-white hover:bg-white/5 border-b border-white/5 transition-all duration-150"
              >
                {isCollapsed ? <ChevronRight size={14} className="text-white/30" /> : <ChevronDown size={14} className="text-white/30" />}
                <span className="flex-1 text-left">{cat}</span>
                <span className="text-[10px] text-white/30 bg-white/5 px-1.5 py-0.5 rounded-full">{items.length}</span>
              </button>
              {!isCollapsed && (
                <div className="grid grid-cols-2 gap-1 p-2">
                  {items.map((item) => (
                    <Tooltip key={item.id}>
                      <TooltipTrigger asChild>
                        <div
                          draggable
                          onDragStart={(e) => handleDragStart(e, item)}
                          className="flex flex-col items-center gap-1 p-2 rounded-lg cursor-grab bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/15 active:cursor-grabbing transition-all duration-150 group"
                        >
                          <span className="text-xl group-hover:scale-110 transition-transform duration-150">{item.icon}</span>
                          <span className="text-[10px] text-white/50 group-hover:text-white/70 truncate w-full text-center leading-tight">{item.name}</span>
                          <span className="text-[9px] text-white/25">{item.widthM}×{item.heightM}m</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="bg-[#1e293b] border-white/10 text-white text-xs">
                        {item.name} — {item.widthM}×{item.heightM}m · Drag to canvas
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
