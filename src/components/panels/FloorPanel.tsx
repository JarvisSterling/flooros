'use client';
import React, { useState, useCallback } from 'react';
import { useEditorStore } from '@/store/editor-store';
import type { FloorPlan } from '@/types/database';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus, GripVertical, MoreHorizontal, Pencil, Copy, Star, Trash2, Link2, Layers,
} from 'lucide-react';

function FloorItem({
  floor, isActive, isDefault, onSelect, onDelete, onDuplicate, onRename, onSetDefault, dragHandlers,
}: {
  floor: FloorPlan; isActive: boolean; isDefault: boolean;
  onSelect: () => void; onDelete: () => void; onDuplicate: () => void;
  onRename: (name: string) => void; onSetDefault: () => void;
  dragHandlers: { onDragStart: (e: React.DragEvent) => void; onDragOver: (e: React.DragEvent) => void; onDrop: (e: React.DragEvent) => void; };
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(floor.name);

  const handleRename = () => {
    if (name.trim() && name !== floor.name) onRename(name.trim());
    setEditing(false);
  };

  const hasLinks = !!(floor.metadata && (floor.metadata as Record<string, unknown>).has_cross_floor_links);

  return (
    <div
      draggable
      {...dragHandlers}
      onClick={onSelect}
      className={`group relative flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer border transition-all duration-150 ${
        isActive
          ? 'bg-blue-500/10 border-blue-500/30 shadow-[0_0_12px_rgba(59,130,246,0.08)]'
          : 'border-transparent hover:bg-white/5 hover:border-white/10'
      }`}
    >
      <span className="text-white/20 group-hover:text-white/40 cursor-grab transition-colors"><GripVertical size={14} /></span>

      <div className="flex-1 min-w-0">
        {editing ? (
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename();
              if (e.key === 'Escape') { setName(floor.name); setEditing(false); }
            }}
            className="w-full h-6 px-1.5 text-xs bg-white/10 border border-blue-500/50 rounded text-white focus:outline-none"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div className="flex items-center gap-1.5">
            <span className={`text-xs font-medium truncate ${isActive ? 'text-blue-400' : 'text-white/70'}`}>
              {floor.name}
            </span>
            {isDefault && (
              <Tooltip>
                <TooltipTrigger asChild><Star size={10} className="text-amber-400 fill-amber-400" /></TooltipTrigger>
                <TooltipContent className="bg-[#1e293b] border-white/10 text-white text-xs">Default floor</TooltipContent>
              </Tooltip>
            )}
            {hasLinks && (
              <Tooltip>
                <TooltipTrigger asChild><Link2 size={10} className="text-white/30" /></TooltipTrigger>
                <TooltipContent className="bg-[#1e293b] border-white/10 text-white text-xs">Has cross-floor links</TooltipContent>
              </Tooltip>
            )}
          </div>
        )}
        <div className="text-[10px] text-white/30 mt-0.5">
          L{floor.floor_number} · {floor.width_m}×{floor.height_m}m
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="p-1 rounded opacity-0 group-hover:opacity-100 text-white/40 hover:text-white hover:bg-white/10 transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal size={14} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-36 bg-[#1e293b] border-white/10">
          <DropdownMenuItem className="text-white/80 text-xs focus:bg-white/10 focus:text-white gap-2" onClick={(e) => { e.stopPropagation(); setEditing(true); }}>
            <Pencil size={12} /> Rename
          </DropdownMenuItem>
          <DropdownMenuItem className="text-white/80 text-xs focus:bg-white/10 focus:text-white gap-2" onClick={(e) => { e.stopPropagation(); onDuplicate(); }}>
            <Copy size={12} /> Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem className="text-white/80 text-xs focus:bg-white/10 focus:text-white gap-2" onClick={(e) => { e.stopPropagation(); onSetDefault(); }}>
            <Star size={12} /> {isDefault ? 'Default' : 'Set default'}
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-white/10" />
          <DropdownMenuItem className="text-red-400 text-xs focus:bg-red-500/10 focus:text-red-400 gap-2" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
            <Trash2 size={12} /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default function FloorPanel() {
  const {
    floors, currentFloorId, switchFloor, addFloor, deleteFloor,
    duplicateFloor, updateFloor, reorderFloors, setDefaultFloor,
  } = useEditorStore();

  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const handleAdd = useCallback(async () => {
    const newFloor = await addFloor({});
    if (newFloor) await switchFloor(newFloor.id);
  }, [addFloor, switchFloor]);

  const handleDelete = useCallback(async (floorId: string) => {
    if (floors.length <= 1) return;
    if (!confirm('Delete this floor and all its objects?')) return;
    await deleteFloor(floorId);
  }, [floors.length, deleteFloor]);

  const handleDuplicate = useCallback(async (floorId: string) => {
    const newFloor = await duplicateFloor(floorId);
    if (newFloor) await switchFloor(newFloor.id);
  }, [duplicateFloor, switchFloor]);

  const handleRename = useCallback(async (floorId: string, name: string) => {
    await updateFloor(floorId, { name });
  }, [updateFloor]);

  const handleSetDefault = useCallback(async (floorId: string) => {
    try { await setDefaultFloor(floorId); } catch (error) { console.error('Failed to set default floor:', error); }
  }, [setDefaultFloor]);

  const makeDragHandlers = (index: number) => ({
    onDragStart: (e: React.DragEvent) => { setDragIdx(index); e.dataTransfer.effectAllowed = 'move'; },
    onDragOver: (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      if (dragIdx === null || dragIdx === index) return;
      const newOrder = [...floors];
      const [moved] = newOrder.splice(dragIdx, 1);
      newOrder.splice(index, 0, moved);
      reorderFloors(newOrder.map((f) => f.id));
      setDragIdx(null);
    },
  });

  return (
    <div className="w-52 bg-[#0a0f1a] border-r border-white/10 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/10">
        <h3 className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Floors</h3>
        <button
          onClick={handleAdd}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium bg-blue-500/15 border border-blue-500/30 text-blue-400 hover:bg-blue-500/25 transition-all duration-150"
        >
          <Plus size={12} /> Add
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent p-2">
        {floors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Layers size={24} className="text-white/15 mb-2" />
            <p className="text-xs text-white/30 text-center">No floors yet.<br />Click &quot;+ Add&quot; to create one.</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {floors.map((floor, idx) => {
              const isDefault = !!(floor.metadata && (floor.metadata as Record<string, unknown>).is_default);
              return (
                <FloorItem
                  key={floor.id} floor={floor} isActive={floor.id === currentFloorId} isDefault={isDefault}
                  onSelect={() => switchFloor(floor.id)} onDelete={() => handleDelete(floor.id)}
                  onDuplicate={() => handleDuplicate(floor.id)} onRename={(name) => handleRename(floor.id, name)}
                  onSetDefault={() => handleSetDefault(floor.id)} dragHandlers={makeDragHandlers(idx)}
                />
              );
            })}
          </div>
        )}
      </div>

      {currentFloorId && <FloorSettings floorId={currentFloorId} />}
    </div>
  );
}

function FloorSettings({ floorId }: { floorId: string }) {
  const { floors, updateFloor } = useEditorStore();
  const floor = floors.find((f) => f.id === floorId);
  if (!floor) return null;

  const SettingInput = ({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
    <div>
      <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-0.5">{label}</label>
      <input
        {...props}
        className="w-full h-7 px-2 text-xs bg-white/5 border border-white/10 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all duration-150"
      />
    </div>
  );

  return (
    <div className="border-t border-white/10 bg-white/[0.02] p-3 space-y-2">
      <h4 className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Floor Settings</h4>
      <div className="grid grid-cols-2 gap-1.5">
        <SettingInput label="Grid (m)" type="number" value={floor.grid_size_m} min={0.1} step={0.1}
          onChange={(e) => updateFloor(floorId, { grid_size_m: Number(e.target.value) })} />
        <SettingInput label="Scale (px/m)" type="number" value={floor.scale_px_per_m} min={1}
          onChange={(e) => updateFloor(floorId, { scale_px_per_m: Number(e.target.value) })} />
        <SettingInput label="Width (m)" type="number" value={floor.width_m} min={1}
          onChange={(e) => updateFloor(floorId, { width_m: Number(e.target.value) })} />
        <SettingInput label="Height (m)" type="number" value={floor.height_m} min={1}
          onChange={(e) => updateFloor(floorId, { height_m: Number(e.target.value) })} />
      </div>
      <SettingInput label="Background URL" type="text" value={floor.background_image_url || ''} placeholder="https://..."
        onChange={(e) => updateFloor(floorId, { background_image_url: e.target.value || null })} />
    </div>
  );
}
