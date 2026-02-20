'use client';
import React, { useState, useMemo } from 'react';
import { useEditorStore } from '@/store/editor-store';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Link2, Unlink, Plus } from 'lucide-react';

const LINKABLE_LABELS = ['stairs', 'elevator', 'escalator'];

export default function CrossFloorLinkPanel() {
  const {
    objects, selectedObjectIds, floors, currentFloorId, updateObject,
  } = useEditorStore();

  const [targetFloorId, setTargetFloorId] = useState<string>('');
  const [targetObjectId, setTargetObjectId] = useState<string>('');
  const [showPanel, setShowPanel] = useState(false);

  const selectedObj = useMemo(() => {
    if (selectedObjectIds.size !== 1) return null;
    const id = Array.from(selectedObjectIds)[0];
    const obj = objects.get(id);
    if (!obj) return null;
    if (obj.type === 'infrastructure') return obj;
    const label = (obj.label || '').toLowerCase();
    if (LINKABLE_LABELS.some((l) => label.includes(l))) return obj;
    return null;
  }, [selectedObjectIds, objects]);

  const currentLink = useMemo(() => {
    if (!selectedObj) return null;
    const meta = selectedObj.metadata as Record<string, unknown>;
    if (meta.linked_floor_id && meta.linked_object_id) {
      return { floorId: meta.linked_floor_id as string, objectId: meta.linked_object_id as string };
    }
    return null;
  }, [selectedObj]);

  const otherFloors = floors.filter((f) => f.id !== currentFloorId);

  const targetFloorObjects = useMemo(() => {
    if (!targetFloorId) return [];
    return Array.from(objects.values()).filter(obj => {
      if (obj.type === 'infrastructure') return true;
      const label = (obj.label || '').toLowerCase();
      return LINKABLE_LABELS.some((l) => label.includes(l));
    });
  }, [targetFloorId, objects]);

  if (!selectedObj) return null;

  const handleLink = () => {
    if (!targetFloorId || !targetObjectId) return;
    updateObject(selectedObj.id, {
      metadata: { ...selectedObj.metadata, linked_floor_id: targetFloorId, linked_object_id: targetObjectId },
    });
    setShowPanel(false);
  };

  const handleUnlink = () => {
    const meta = { ...selectedObj.metadata } as Record<string, unknown>;
    delete meta.linked_floor_id;
    delete meta.linked_object_id;
    updateObject(selectedObj.id, { metadata: meta });
  };

  return (
    <div className="border-t border-white/5 px-3 py-2">
      <h4 className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2">Cross-Floor Link</h4>

      {currentLink ? (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2.5 py-1.5">
            <Link2 size={12} />
            <span>Linked to {floors.find((f) => f.id === currentLink.floorId)?.name || 'Unknown'}</span>
          </div>
          <button
            className="text-[11px] text-red-400/70 hover:text-red-400 flex items-center gap-1 transition-colors"
            onClick={handleUnlink}
          >
            <Unlink size={10} /> Remove link
          </button>
        </div>
      ) : showPanel ? (
        <div className="space-y-2">
          <Select value={targetFloorId} onValueChange={(v) => { setTargetFloorId(v); setTargetObjectId(''); }}>
            <SelectTrigger className="h-7 text-xs bg-white/5 border-white/10 text-white/70">
              <SelectValue placeholder="Select target floor..." />
            </SelectTrigger>
            <SelectContent className="bg-[#1e293b] border-white/10">
              {otherFloors.map((f) => (
                <SelectItem key={f.id} value={f.id} className="text-white/80 text-xs focus:bg-white/10">{f.name} (L{f.floor_number})</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {targetFloorId && (
            <Select value={targetObjectId} onValueChange={setTargetObjectId}>
              <SelectTrigger className="h-7 text-xs bg-white/5 border-white/10 text-white/70">
                <SelectValue placeholder="Select target object..." />
              </SelectTrigger>
              <SelectContent className="bg-[#1e293b] border-white/10">
                {targetFloorObjects.map((obj) => (
                  <SelectItem key={obj.id} value={obj.id} className="text-white/80 text-xs focus:bg-white/10">
                    {obj.label || obj.type} ({obj.x.toFixed(1)}, {obj.y.toFixed(1)})
                  </SelectItem>
                ))}
                {targetFloorObjects.length === 0 && (
                  <SelectItem value="" disabled>No linkable objects found</SelectItem>
                )}
              </SelectContent>
            </Select>
          )}
          <div className="flex gap-1">
            <button
              className="h-7 px-3 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-medium hover:bg-blue-500/25 transition-all disabled:opacity-40"
              onClick={handleLink}
              disabled={!targetFloorId || !targetObjectId}
            >
              Link
            </button>
            <button
              className="h-7 px-3 rounded-lg bg-white/5 border border-white/10 text-white/50 text-xs hover:bg-white/10 transition-all"
              onClick={() => setShowPanel(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          className="flex items-center gap-1 text-[11px] text-white/40 hover:text-blue-400 transition-colors disabled:opacity-30"
          onClick={() => setShowPanel(true)}
          disabled={otherFloors.length === 0}
        >
          <Plus size={12} /> Link to another floor
        </button>
      )}
    </div>
  );
}
