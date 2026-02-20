'use client';

import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { useEditorStore, type ToolType } from '@/store/editor-store';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import {
  MousePointer2, Square, Circle, Pentagon, Minus, Type, Ruler,
  Undo2, Redo2, Trash2, Grid3X3, Magnet, Image, Save, Loader2,
  AlertCircle, Edit3,
} from 'lucide-react';

const tools: { id: ToolType; label: string; icon: React.ReactNode; shortcut?: string; group: string }[] = [
  { id: 'select', label: 'Select', icon: <MousePointer2 size={18} />, shortcut: 'V', group: 'selection' },
  { id: 'rect', label: 'Rectangle', icon: <Square size={18} />, shortcut: 'R', group: 'shapes' },
  { id: 'circle', label: 'Circle', icon: <Circle size={18} />, shortcut: 'C', group: 'shapes' },
  { id: 'polygon', label: 'Polygon', icon: <Pentagon size={18} />, shortcut: 'P', group: 'shapes' },
  { id: 'line', label: 'Line / Wall', icon: <Minus size={18} />, shortcut: 'L', group: 'shapes' },
  { id: 'text', label: 'Text', icon: <Type size={18} />, shortcut: 'T', group: 'shapes' },
  { id: 'dimension', label: 'Dimension', icon: <Ruler size={18} />, shortcut: 'D', group: 'shapes' },
];

export default function FloatingToolbar() {
  const {
    activeTool, setActiveTool,
    gridVisible, toggleGrid, snapEnabled, toggleSnap,
    undo, redo, undoStack, redoStack,
    removeObjects, selectedObjectIds,
    setBackgroundImage,
    saveStatus,
  } = useEditorStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ToolButton = ({ tool }: { tool: typeof tools[0] }) => {
    const isActive = activeTool === tool.id;
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => setActiveTool(tool.id)}
            className={`relative flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 ${
              isActive
                ? 'bg-blue-500/20 text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.15)]'
                : 'text-white/50 hover:text-white hover:bg-white/[0.08]'
            }`}
          >
            {tool.icon}
            {isActive && (
              <motion.div
                layoutId="activeTool"
                className="absolute inset-0 rounded-xl border border-blue-500/40"
                transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={8} className="bg-[#1a2035] border-white/10 text-white text-xs px-2.5 py-1.5">
          <span>{tool.label}</span>
          {tool.shortcut && <kbd className="ml-2 text-[10px] text-white/30 font-mono bg-white/[0.06] px-1.5 py-0.5 rounded">{tool.shortcut}</kbd>}
        </TooltipContent>
      </Tooltip>
    );
  };

  const IconBtn = ({ icon, label, onClick, disabled, variant }: { icon: React.ReactNode; label: string; onClick: () => void; disabled?: boolean; variant?: 'danger' }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          disabled={disabled}
          className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 disabled:opacity-20 disabled:cursor-not-allowed ${
            variant === 'danger'
              ? 'text-red-400/70 hover:text-red-400 hover:bg-red-500/10'
              : 'text-white/50 hover:text-white hover:bg-white/[0.08]'
          }`}
        >
          {icon}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={8} className="bg-[#1a2035] border-white/10 text-white text-xs">{label}</TooltipContent>
    </Tooltip>
  );

  const Divider = () => <div className="w-px h-6 bg-white/[0.08] mx-0.5" />;

  return (
    <>
      {/* Main floating toolbar — centered at top */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="flex items-center gap-0.5 px-2 py-1.5 rounded-2xl bg-[#0d1321]/90 backdrop-blur-2xl border border-white/[0.08] shadow-2xl shadow-black/40"
        >
          {/* Tool buttons */}
          {tools.filter(t => t.group === 'selection').map(t => <ToolButton key={t.id} tool={t} />)}
          <Divider />
          {tools.filter(t => t.group === 'shapes').map(t => <ToolButton key={t.id} tool={t} />)}
          <Divider />

          {/* Undo/Redo */}
          <IconBtn icon={<Undo2 size={16} />} label="Undo (Ctrl+Z)" onClick={undo} disabled={undoStack.length === 0} />
          <IconBtn icon={<Redo2 size={16} />} label="Redo (Ctrl+Y)" onClick={redo} disabled={redoStack.length === 0} />
          <Divider />

          {/* Delete */}
          <IconBtn
            icon={<Trash2 size={16} />}
            label="Delete (Del)"
            onClick={() => { if (selectedObjectIds.size > 0) removeObjects(Array.from(selectedObjectIds)); }}
            disabled={selectedObjectIds.size === 0}
            variant="danger"
          />
          <Divider />

          {/* Grid/Snap */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => toggleGrid()}
                className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${
                  gridVisible ? 'bg-blue-500/15 text-blue-400' : 'text-white/40 hover:text-white/60 hover:bg-white/[0.06]'
                }`}
              >
                <Grid3X3 size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={8} className="bg-[#1a2035] border-white/10 text-white text-xs">Toggle Grid</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => toggleSnap()}
                className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${
                  snapEnabled ? 'bg-blue-500/15 text-blue-400' : 'text-white/40 hover:text-white/60 hover:bg-white/[0.06]'
                }`}
              >
                <Magnet size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={8} className="bg-[#1a2035] border-white/10 text-white text-xs">Toggle Snap</TooltipContent>
          </Tooltip>

          <Divider />

          {/* Background upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/svg+xml,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => setBackgroundImage(reader.result as string);
              reader.readAsDataURL(file);
              e.target.value = '';
            }}
          />
          <IconBtn icon={<Image size={16} />} label="Upload Background" onClick={() => fileInputRef.current?.click()} />
        </motion.div>
      </div>

      {/* Save status — top right floating */}
      <div className="absolute top-3 right-3 z-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-medium backdrop-blur-xl border transition-all duration-200 ${
            saveStatus === 'saved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
            saveStatus === 'saving' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
            saveStatus === 'error' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
            'bg-amber-500/10 text-amber-400 border-amber-500/20'
          }`}
        >
          {saveStatus === 'saved' && <><Save size={12} /> Saved</>}
          {saveStatus === 'saving' && <><Loader2 size={12} className="animate-spin" /> Saving…</>}
          {saveStatus === 'error' && <><AlertCircle size={12} /> Error</>}
          {saveStatus === 'unsaved' && <><Edit3 size={12} /> Unsaved</>}
        </motion.div>
      </div>
    </>
  );
}
