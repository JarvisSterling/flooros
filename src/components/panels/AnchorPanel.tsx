'use client';
import React, { useState, useEffect, useCallback } from 'react';
import type { PositioningAnchor, AnchorType } from '@/types/database';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Radio, Wifi, Smartphone, Tag, RefreshCw, Trash2, AlertTriangle, Battery,
} from 'lucide-react';

interface AnchorPanelProps {
  floorPlanId: string;
}

const ANCHOR_TYPES: { value: AnchorType; label: string; icon: React.ReactNode; desc: string }[] = [
  { value: 'ble', label: 'BLE Beacon', icon: <Radio size={14} />, desc: 'Bluetooth Low Energy beacon' },
  { value: 'uwb', label: 'UWB', icon: <Radio size={14} />, desc: 'Ultra-Wideband positioning' },
  { value: 'wifi', label: 'Wi-Fi AP', icon: <Wifi size={14} />, desc: 'Wi-Fi access point' },
  { value: 'qr', label: 'QR Code', icon: <Smartphone size={14} />, desc: 'QR code marker' },
  { value: 'nfc', label: 'NFC Tag', icon: <Tag size={14} />, desc: 'Near Field Communication tag' },
];

export default function AnchorPanel({ floorPlanId }: AnchorPanelProps) {
  const [anchors, setAnchors] = useState<PositioningAnchor[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAnchor, setSelectedAnchor] = useState<string | null>(null);

  const loadAnchors = useCallback(async () => {
    if (floorPlanId === 'demo') return;
    setLoading(true);
    try {
      const res = await fetch(`/api/positioning/anchors?floor_plan_id=${floorPlanId}`);
      if (res.ok) { const data = await res.json(); setAnchors(data); }
    } catch {} finally { setLoading(false); }
  }, [floorPlanId]);

  useEffect(() => { loadAnchors(); }, [loadAnchors]);

  const deleteAnchor = async (id: string) => {
    const prev = anchors;
    setAnchors((p) => p.filter((a) => a.id !== id));
    try {
      const res = await fetch(`/api/positioning/anchors/${id}`, { method: 'DELETE' });
      if (!res.ok) { setAnchors(prev); console.error('Failed to delete anchor:', res.statusText); }
    } catch { setAnchors(prev); }
  };

  const toggleStatus = async (anchor: PositioningAnchor) => {
    const newStatus = anchor.status === 'active' ? 'inactive' : 'active';
    const prev = anchors;
    setAnchors((p) => p.map((a) => a.id === anchor.id ? { ...a, status: newStatus } : a));
    try {
      const res = await fetch(`/api/positioning/anchors/${anchor.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) { setAnchors(prev); console.error('Failed to toggle anchor status:', res.statusText); }
    } catch { setAnchors(prev); }
  };

  const activeCount = anchors.filter((a) => a.status === 'active').length;
  const lowBattery = anchors.filter((a) => a.battery_level !== null && a.battery_level < 20);

  return (
    <div className="flex flex-col gap-3 p-3 text-sm">
      <h3 className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Positioning Anchors</h3>

      <div className="flex gap-3 text-[11px] text-white/40">
        <span>Total: <span className="text-white/60">{anchors.length}</span></span>
        <span>Active: <span className="text-emerald-400">{activeCount}</span></span>
        {lowBattery.length > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="flex items-center gap-1 text-amber-400"><AlertTriangle size={12} /> {lowBattery.length}</span>
            </TooltipTrigger>
            <TooltipContent className="bg-[#1e293b] border-white/10 text-white text-xs">{lowBattery.length} anchor(s) with battery below 20%</TooltipContent>
          </Tooltip>
        )}
      </div>

      <button
        className="w-full flex items-center justify-center gap-1.5 h-7 rounded-lg bg-white/5 border border-white/10 text-white/60 text-xs hover:bg-white/10 transition-all duration-150 disabled:opacity-40"
        onClick={loadAnchors}
        disabled={loading}
      >
        <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
        {loading ? 'Loading...' : 'Refresh'}
      </button>

      <ScrollArea className="max-h-64">
        <div className="space-y-1">
          {anchors.map((anchor) => {
            const typeInfo = ANCHOR_TYPES.find((t) => t.value === anchor.type);
            const isSelected = selectedAnchor === anchor.id;

            return (
              <div
                key={anchor.id}
                onClick={() => setSelectedAnchor(isSelected ? null : anchor.id)}
                className={`p-2 rounded-lg cursor-pointer transition-all duration-150 border ${
                  isSelected ? 'bg-white/[0.06] border-white/15' : 'border-transparent hover:bg-white/[0.03] hover:border-white/[0.06]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs text-white/70">
                    <span className="text-white/30">{typeInfo?.icon}</span> {typeInfo?.label || anchor.type}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                    anchor.status === 'active' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/10 text-red-400'
                  }`}>
                    {anchor.status === 'active' ? '● Active' : '○ Inactive'}
                  </span>
                </div>

                {anchor.hardware_id && (
                  <div className="text-white/30 text-[10px] mt-0.5 font-mono truncate">{anchor.hardware_id}</div>
                )}

                {isSelected && (
                  <div className="mt-2 space-y-1 border-t border-white/10 pt-2">
                    <div className="text-white/40 text-xs">Position: <span className="font-mono text-white/60">({anchor.x.toFixed(1)}, {anchor.y.toFixed(1)})</span></div>
                    {anchor.battery_level !== null && (
                      <div className={`text-xs flex items-center gap-1 ${anchor.battery_level < 20 ? 'text-amber-400' : 'text-white/40'}`}>
                        <Battery size={12} /> {anchor.battery_level}%
                      </div>
                    )}
                    {anchor.last_seen && (
                      <div className="text-white/30 text-xs">Last seen: {new Date(anchor.last_seen).toLocaleTimeString()}</div>
                    )}
                    <div className="flex gap-1 mt-1">
                      <button
                        className="flex-1 h-7 rounded-lg bg-white/5 border border-white/10 text-white/60 text-xs hover:bg-white/10 transition-all"
                        onClick={(e) => { e.stopPropagation(); toggleStatus(anchor); }}
                      >
                        {anchor.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        className="h-7 px-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all"
                        onClick={(e) => { e.stopPropagation(); deleteAnchor(anchor.id); }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {anchors.length === 0 && !loading && (
        <div className="text-white/30 text-xs text-center py-4">
          No anchors placed on this floor.<br />Use the canvas tools to place beacons.
        </div>
      )}
    </div>
  );
}
