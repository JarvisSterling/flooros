'use client';
import React, { useState, useMemo } from 'react';
import { useEditorStore } from '@/store/editor-store';
import type { BoothStatus } from '@/types/database';
import { BOOTH_STATUS_BORDER, BOOTH_STATUS_LABELS } from '@/lib/booth-helpers';
import { Search, Store, ChevronDown, Check } from 'lucide-react';

const STATUS_OPTIONS: BoothStatus[] = ['available', 'reserved', 'sold', 'blocked'];

function StatusBadge({ status }: { status: BoothStatus }) {
  return (
    <span
      className="px-1.5 py-0.5 rounded text-[10px] font-medium border"
      style={{
        color: BOOTH_STATUS_BORDER[status],
        borderColor: BOOTH_STATUS_BORDER[status],
        backgroundColor: `${BOOTH_STATUS_BORDER[status]}15`,
      }}
    >
      {BOOTH_STATUS_LABELS[status]}
    </span>
  );
}

export default function BoothPanel() {
  const { booths, objects, selectObject, updateBoothStatus } = useEditorStore();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<BoothStatus | 'all'>('all');
  const [selectedBoothIds, setSelectedBoothIds] = useState<Set<string>>(new Set());
  const [bulkMenuOpen, setBulkMenuOpen] = useState(false);

  const boothList = useMemo(() => {
    const list = Array.from(booths.entries()).map(([objectId, booth]) => {
      const obj = objects.get(objectId);
      return { objectId, booth, obj };
    });

    return list.filter(({ booth }) => {
      if (filterStatus !== 'all' && booth.status !== filterStatus) return false;
      if (search) {
        const q = search.toLowerCase();
        const matchNum = booth.booth_number.toLowerCase().includes(q);
        const matchName = (booth.name || '').toLowerCase().includes(q);
        if (!matchNum && !matchName) return false;
      }
      return true;
    });
  }, [booths, objects, search, filterStatus]);

  const stats = useMemo(() => {
    const counts: Record<string, number> = { available: 0, reserved: 0, sold: 0, blocked: 0 };
    booths.forEach((b) => {
      if (counts[b.status] !== undefined) counts[b.status]++;
    });
    return counts;
  }, [booths]);

  const toggleSelect = (objectId: string) => {
    setSelectedBoothIds((prev) => {
      const next = new Set(prev);
      if (next.has(objectId)) next.delete(objectId);
      else next.add(objectId);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedBoothIds.size === boothList.length) {
      setSelectedBoothIds(new Set());
    } else {
      setSelectedBoothIds(new Set(boothList.map((b) => b.objectId)));
    }
  };

  const bulkChangeStatus = (status: BoothStatus) => {
    selectedBoothIds.forEach((objectId) => {
      updateBoothStatus(objectId, status);
    });
    setSelectedBoothIds(new Set());
    setBulkMenuOpen(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Summary Stats */}
      <div className="px-3 py-2 border-b border-white/5">
        <div className="grid grid-cols-4 gap-1">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(filterStatus === s ? 'all' : s)}
              className={`text-center py-1 rounded text-[10px] border transition-all ${
                filterStatus === s ? 'ring-1 ring-white/30' : ''
              }`}
              style={{
                color: BOOTH_STATUS_BORDER[s],
                borderColor: `${BOOTH_STATUS_BORDER[s]}40`,
                backgroundColor: `${BOOTH_STATUS_BORDER[s]}10`,
              }}
            >
              <div className="text-sm font-bold tabular-nums">{stats[s] || 0}</div>
              <div className="truncate">{BOOTH_STATUS_LABELS[s]}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b border-white/5">
        <div className="relative">
          <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Search booths..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-7 pl-7 pr-2 text-xs bg-white/5 border border-white/10 rounded-md text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
          />
        </div>
      </div>

      {/* Bulk actions */}
      {selectedBoothIds.size > 0 && (
        <div className="px-3 py-2 border-b border-white/5 flex items-center gap-2">
          <span className="text-[10px] text-white/50">{selectedBoothIds.size} selected</span>
          <div className="relative ml-auto">
            <button
              onClick={() => setBulkMenuOpen(!bulkMenuOpen)}
              className="flex items-center gap-1 px-2 py-1 text-[10px] bg-white/5 border border-white/10 rounded-md text-white/70 hover:bg-white/10"
            >
              Change Status <ChevronDown size={10} />
            </button>
            {bulkMenuOpen && (
              <div className="absolute right-0 top-full mt-1 z-50 bg-[#1e293b] border border-white/10 rounded-lg shadow-xl py-1 min-w-[120px]">
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => bulkChangeStatus(s)}
                    className="w-full px-3 py-1.5 text-left text-xs text-white/70 hover:bg-white/10 flex items-center gap-2"
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: BOOTH_STATUS_BORDER[s] }}
                    />
                    {BOOTH_STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Booth list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {boothList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <Store size={24} className="text-white/15 mb-2" />
            <p className="text-xs text-white/30 text-center">
              {booths.size === 0 ? 'No booths yet. Select a shape and convert it to a booth.' : 'No booths match filters.'}
            </p>
          </div>
        ) : (
          <div>
            {/* Select all header */}
            <div className="px-3 py-1.5 border-b border-white/5 flex items-center gap-2">
              <button
                onClick={toggleSelectAll}
                className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${
                  selectedBoothIds.size === boothList.length
                    ? 'bg-blue-500 border-blue-500'
                    : 'border-white/20 hover:border-white/40'
                }`}
              >
                {selectedBoothIds.size === boothList.length && <Check size={10} className="text-white" />}
              </button>
              <span className="text-[10px] text-white/30 uppercase tracking-wider">
                {boothList.length} booth{boothList.length !== 1 ? 's' : ''}
              </span>
            </div>

            {boothList.map(({ objectId, booth }) => (
              <div
                key={objectId}
                className="px-3 py-2 border-b border-white/5 hover:bg-white/5 transition-colors flex items-center gap-2 cursor-pointer group"
              >
                <button
                  onClick={(e) => { e.stopPropagation(); toggleSelect(objectId); }}
                  className={`w-3.5 h-3.5 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
                    selectedBoothIds.has(objectId)
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-white/20 group-hover:border-white/40'
                  }`}
                >
                  {selectedBoothIds.has(objectId) && <Check size={10} className="text-white" />}
                </button>

                <div
                  className="flex-1 min-w-0"
                  onClick={() => selectObject(objectId)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-white/80">{booth.booth_number}</span>
                    <StatusBadge status={booth.status} />
                  </div>
                  {booth.name && (
                    <p className="text-[10px] text-white/40 truncate mt-0.5">{booth.name}</p>
                  )}
                  <div className="flex items-center gap-2 mt-0.5">
                    {booth.size_category && (
                      <span className="text-[10px] text-white/30 capitalize">{booth.size_category}</span>
                    )}
                    {booth.price != null && (
                      <span className="text-[10px] text-white/30">${booth.price.toLocaleString()}</span>
                    )}
                  </div>
                </div>

                <div
                  className="w-3 h-3 rounded-full flex-shrink-0 border"
                  style={{
                    backgroundColor: BOOTH_STATUS_BORDER[booth.status],
                    borderColor: BOOTH_STATUS_BORDER[booth.status],
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
