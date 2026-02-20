'use client';
import React, { useRef } from 'react';
import { useEditorStore, GRID_SIZES, type ToolType } from '@/store/editor-store';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  MousePointer2, Square, Circle, Pentagon, Minus, Type, Ruler,
  Undo2, Redo2, Trash2, ZoomIn, ZoomOut, Home, Grid3X3, Magnet,
  Image, Save, Loader2, AlertCircle, Edit3,
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

const groups = ['selection', 'shapes'];

export default function Toolbar() {
  const {
    activeTool, setActiveTool,
    zoom, setZoom, setPan,
    gridSize, setGridSize, gridVisible, toggleGrid, snapEnabled, toggleSnap,
    unit, setUnit, undo, redo, undoStack, redoStack,
    removeObjects, selectedObjectIds,
    setBackgroundImage, backgroundOpacity, setBackgroundOpacity,
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
            className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-150 ${
              isActive
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50 shadow-[0_0_8px_rgba(59,130,246,0.15)]'
                : 'text-white/60 hover:text-white hover:bg-white/10 border border-transparent'
            }`}
          >
            {tool.icon}
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="bg-[#1e293b] border-white/10 text-white text-xs">
          {tool.label}{tool.shortcut ? <span className="ml-2 text-white/40 font-mono text-[10px]">{tool.shortcut}</span> : ''}
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
          className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-150 border border-transparent disabled:opacity-30 disabled:cursor-not-allowed ${
            variant === 'danger'
              ? 'text-red-400 hover:bg-red-500/10 hover:border-red-500/30'
              : 'text-white/60 hover:text-white hover:bg-white/10'
          }`}
        >
          {icon}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="bg-[#1e293b] border-white/10 text-white text-xs">{label}</TooltipContent>
    </Tooltip>
  );

  const Divider = () => <div className="w-px h-6 bg-white/10 mx-1" />;

  return (
    <div className="h-12 bg-[#0d1321]/90 backdrop-blur-xl border-b border-white/10 flex items-center px-3 gap-1 shrink-0">
      {/* Tool groups */}
      {groups.map((group, gi) => (
        <React.Fragment key={group}>
          {gi > 0 && <Divider />}
          <div className="flex items-center gap-0.5">
            {tools.filter(t => t.group === group).map(t => <ToolButton key={t.id} tool={t} />)}
          </div>
        </React.Fragment>
      ))}

      <Divider />

      {/* Undo/Redo */}
      <div className="flex items-center gap-0.5">
        <IconBtn icon={<Undo2 size={16} />} label="Undo (Ctrl+Z)" onClick={undo} disabled={undoStack.length === 0} />
        <IconBtn icon={<Redo2 size={16} />} label="Redo (Ctrl+Y)" onClick={redo} disabled={redoStack.length === 0} />
      </div>

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

      {/* Zoom */}
      <div className="flex items-center gap-0.5">
        <IconBtn icon={<ZoomOut size={16} />} label="Zoom Out" onClick={() => setZoom(zoom / 1.2)} />
        <span className="text-[11px] text-white/50 w-11 text-center font-mono tabular-nums">{Math.round(zoom * 100)}%</span>
        <IconBtn icon={<ZoomIn size={16} />} label="Zoom In" onClick={() => setZoom(zoom * 1.2)} />
        <IconBtn icon={<Home size={16} />} label="Reset View" onClick={() => { setZoom(1); setPan(0, 0); }} />
      </div>

      <Divider />

      {/* Grid/Snap */}
      <div className="flex items-center gap-0.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => toggleGrid()}
              className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-150 ${
                gridVisible ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' : 'text-white/40 hover:text-white/60 hover:bg-white/10 border border-transparent'
              }`}
            >
              <Grid3X3 size={16} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-[#1e293b] border-white/10 text-white text-xs">Toggle Grid</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => toggleSnap()}
              className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-150 ${
                snapEnabled ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' : 'text-white/40 hover:text-white/60 hover:bg-white/10 border border-transparent'
              }`}
            >
              <Magnet size={16} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-[#1e293b] border-white/10 text-white text-xs">Toggle Snap</TooltipContent>
        </Tooltip>
        <Select value={String(gridSize)} onValueChange={(v) => setGridSize(Number(v))}>
          <SelectTrigger className="h-7 w-14 text-[11px] bg-white/5 border-white/10 text-white/70 focus:ring-blue-500/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#1e293b] border-white/10">
            {GRID_SIZES.map((s) => <SelectItem key={s} value={String(s)} className="text-white/80 text-xs focus:bg-white/10 focus:text-white">{s}m</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Unit */}
      <Select value={unit} onValueChange={(v) => setUnit(v as 'm' | 'ft')}>
        <SelectTrigger className="h-7 w-[70px] text-[11px] bg-white/5 border-white/10 text-white/70 focus:ring-blue-500/50">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-[#1e293b] border-white/10">
          <SelectItem value="m" className="text-white/80 text-xs focus:bg-white/10 focus:text-white">Meters</SelectItem>
          <SelectItem value="ft" className="text-white/80 text-xs focus:bg-white/10 focus:text-white">Feet</SelectItem>
        </SelectContent>
      </Select>

      <Divider />

      {/* Background */}
      <div className="flex items-center gap-1.5">
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
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="w-16">
              <Slider
                value={[backgroundOpacity]}
                onValueChange={([v]) => setBackgroundOpacity(v)}
                min={0} max={1} step={0.05}
                className="w-full"
              />
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="bg-[#1e293b] border-white/10 text-white text-xs">Opacity: {Math.round(backgroundOpacity * 100)}%</TooltipContent>
        </Tooltip>
      </div>

      {/* Save Status */}
      <div className="ml-auto flex items-center gap-1.5">
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all duration-150 ${
          saveStatus === 'saved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
          saveStatus === 'saving' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
          saveStatus === 'error' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
          'bg-amber-500/10 text-amber-400 border-amber-500/20'
        }`}>
          {saveStatus === 'saved' && <><Save size={12} /> Saved</>}
          {saveStatus === 'saving' && <><Loader2 size={12} className="animate-spin" /> Saving...</>}
          {saveStatus === 'error' && <><AlertCircle size={12} /> Error</>}
          {saveStatus === 'unsaved' && <><Edit3 size={12} /> Unsaved</>}
        </div>
      </div>
    </div>
  );
}
