'use client';
import React, { useEffect, useRef } from 'react';
import { useEditorStore } from '@/store/editor-store';
import { Store, X, XCircle } from 'lucide-react';

export default function ContextMenu() {
  const { contextMenu, setContextMenu, objects, booths, convertToBooth, removeBooth } = useEditorStore();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [setContextMenu]);

  if (!contextMenu) return null;

  const obj = objects.get(contextMenu.objectId);
  if (!obj) return null;

  const isBooth = obj.type === 'booth' || booths.has(contextMenu.objectId);

  return (
    <div
      ref={ref}
      className="fixed bg-[#1e293b]/95 backdrop-blur-xl border border-white/15 rounded-xl shadow-2xl shadow-black/40 py-1.5 z-50 min-w-[180px] overflow-hidden"
      style={{ left: contextMenu.x, top: contextMenu.y }}
    >
      {!isBooth && (
        <button
          className="w-full text-left px-3 py-2 text-xs text-white/80 hover:bg-white/10 transition-colors flex items-center gap-2"
          onClick={(e) => {
            e.stopPropagation();
            convertToBooth(contextMenu.objectId);
            setContextMenu(null);
          }}
        >
          <Store size={14} className="text-emerald-400" />
          Convert to Booth
        </button>
      )}
      {isBooth && (
        <button
          className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
          onClick={(e) => {
            e.stopPropagation();
            removeBooth(contextMenu.objectId);
            setContextMenu(null);
          }}
        >
          <XCircle size={14} />
          Remove Booth
        </button>
      )}
      <div className="h-px bg-white/10 mx-2 my-0.5" />
      <button
        className="w-full text-left px-3 py-2 text-xs text-white/40 hover:bg-white/10 hover:text-white/60 transition-colors flex items-center gap-2"
        onClick={(e) => { e.stopPropagation(); setContextMenu(null); }}
      >
        <X size={14} />
        Cancel
        <span className="ml-auto text-white/20 text-[10px] font-mono">Esc</span>
      </button>
    </div>
  );
}
