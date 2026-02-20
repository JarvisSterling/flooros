'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { X, Navigation, Search, Clock, Ruler, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import type { FloorPlan, FloorPlanObject, NavNode, NavEdge } from '@/types/database';
import {
  computeRoute,
  detectEntrances,
  extractDestinations,
  type WayfindingRoute,
  type EntranceOption,
  type BoothDestination,
} from '@/lib/public-wayfinding';

/* ------------------------------------------------------------------ */
/*  Direction icon helper                                              */
/* ------------------------------------------------------------------ */

function DirectionIcon({ direction }: { direction: string }) {
  const iconMap: Record<string, string> = {
    straight: '↑',
    left: '←',
    right: '→',
    'slight-left': '↖',
    'slight-right': '↗',
    'u-turn': '↓',
    depart: '🚩',
    arrive: '📍',
  };
  return (
    <span className="text-lg leading-none" aria-hidden="true">
      {iconMap[direction] ?? '↑'}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface WayfindingPanelProps {
  floors: FloorPlan[];
  objects: FloorPlanObject[];
  navNodes?: NavNode[];
  navEdges?: NavEdge[];
  isOpen: boolean;
  onClose: () => void;
  onRouteComputed: (route: WayfindingRoute | null) => void;
  /** Called when the user picks a destination floor (for multi-floor) */
  onFloorChange?: (floorPlanId: string) => void;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function WayfindingPanel({
  floors,
  objects,
  navNodes = [],
  navEdges = [],
  isOpen,
  onClose,
  onRouteComputed,
  onFloorChange,
}: WayfindingPanelProps) {
  const [fromId, setFromId] = useState<string>('');
  const [toId, setToId] = useState<string>('');
  const [toSearch, setToSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isComputing, setIsComputing] = useState(false);
  const [route, setRoute] = useState<WayfindingRoute | null>(null);
  const [error, setError] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  /* Entrances & destinations */
  const entrances = useMemo<EntranceOption[]>(
    () => detectEntrances(objects, navNodes),
    [objects, navNodes],
  );

  const destinations = useMemo<BoothDestination[]>(
    () => extractDestinations(objects),
    [objects],
  );

  const filteredDestinations = useMemo(() => {
    if (!toSearch.trim()) return destinations;
    const q = toSearch.toLowerCase();
    return destinations.filter((d) => d.label.toLowerCase().includes(q));
  }, [destinations, toSearch]);

  /* Select destination from list */
  const selectDestination = useCallback((dest: BoothDestination) => {
    setToId(dest.objectId);
    setToSearch(dest.label);
    setIsSearching(false);
  }, []);

  /* Find route */
  const findRoute = useCallback(() => {
    setError(null);
    if (!fromId || !toId) {
      setError('Please select both a starting point and destination.');
      return;
    }

    setIsComputing(true);

    // Use requestAnimationFrame to avoid blocking the UI
    requestAnimationFrame(() => {
      const selectedEntrance = entrances.find(
        (e) => (e.nodeId ?? e.objectId) === fromId,
      );
      if (!selectedEntrance) {
        setError('Invalid starting point.');
        setIsComputing(false);
        return;
      }

      const result = computeRoute(
        floors,
        objects,
        {
          x: selectedEntrance.x,
          y: selectedEntrance.y,
          floorPlanId: selectedEntrance.floorPlanId,
          label: selectedEntrance.label,
        },
        toId,
        navNodes,
        navEdges,
      );

      if (!result) {
        setError('No route found. The destination may not be reachable.');
        setRoute(null);
        onRouteComputed(null);
      } else {
        setRoute(result);
        onRouteComputed(result);
      }
      setIsComputing(false);
    });
  }, [fromId, toId, entrances, floors, objects, navNodes, navEdges, onRouteComputed]);

  /* Clear route */
  const clearRoute = useCallback(() => {
    setRoute(null);
    setError(null);
    setToId('');
    setToSearch('');
    onRouteComputed(null);
  }, [onRouteComputed]);

  /* Close search on outside click */
  useEffect(() => {
    if (!isSearching) return;
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearching(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isSearching]);

  /* Floor name helper */
  const floorName = (id: string) => floors.find((f) => f.id === id)?.name ?? 'Floor';

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop for mobile */}
      <div
        className="fixed inset-0 bg-black/40 z-40 md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-label="Get Directions"
        className={[
          'fixed z-50 flex flex-col',
          'bg-gray-900/95 backdrop-blur-xl border-l border-white/10',
          'shadow-2xl text-white',
          // Desktop: right drawer
          'md:top-0 md:right-0 md:h-full md:w-96',
          // Mobile: bottom sheet
          'top-auto bottom-0 left-0 right-0 md:left-auto',
          'max-h-[85vh] md:max-h-full rounded-t-2xl md:rounded-none',
          'transition-transform duration-300 ease-out',
          isOpen ? 'translate-y-0 md:translate-x-0' : 'translate-y-full md:translate-x-full',
        ].join(' ')}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <Navigation className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold">Get Directions</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close directions panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="px-5 py-4 space-y-4 shrink-0">
          {/* From */}
          <div>
            <label htmlFor="wayfinding-from" className="block text-sm font-medium text-gray-400 mb-1.5">
              From
            </label>
            <select
              id="wayfinding-from"
              value={fromId}
              onChange={(e) => setFromId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50
                         appearance-none cursor-pointer"
            >
              <option value="" className="bg-gray-900">Select starting point…</option>
              {entrances.length === 0 && (
                <option value="" disabled className="bg-gray-900">No entrances detected</option>
              )}
              {entrances.map((e) => (
                <option
                  key={e.nodeId ?? e.objectId ?? `${e.x}-${e.y}`}
                  value={e.nodeId ?? e.objectId ?? ''}
                  className="bg-gray-900"
                >
                  {e.label} ({floorName(e.floorPlanId)})
                </option>
              ))}
            </select>
          </div>

          {/* To */}
          <div className="relative" ref={searchRef}>
            <label htmlFor="wayfinding-to" className="block text-sm font-medium text-gray-400 mb-1.5">
              To
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                id="wayfinding-to"
                type="text"
                value={toSearch}
                onChange={(e) => {
                  setToSearch(e.target.value);
                  setIsSearching(true);
                  setToId('');
                }}
                onFocus={() => setIsSearching(true)}
                placeholder="Search booths & exhibitors…"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm
                           placeholder:text-gray-500
                           focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                autoComplete="off"
              />
            </div>

            {/* Search dropdown */}
            {isSearching && (
              <div className="absolute left-0 right-0 top-full mt-1 max-h-48 overflow-y-auto
                              bg-gray-800 border border-white/10 rounded-lg shadow-xl z-10">
                {filteredDestinations.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-500">No booths found</div>
                ) : (
                  filteredDestinations.map((d) => (
                    <button
                      key={d.objectId}
                      onClick={() => selectDestination(d)}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 transition-colors
                                 flex items-center justify-between"
                    >
                      <span>{d.label}</span>
                      <span className="text-xs text-gray-500">{floorName(d.floorPlanId)}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={findRoute}
              disabled={isComputing || !fromId || !toId}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg
                         bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500
                         text-sm font-medium transition-colors"
            >
              {isComputing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Computing…
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4" />
                  Find Route
                </>
              )}
            </button>
            {route && (
              <button
                onClick={clearRoute}
                className="px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Results */}
        {route && (
          <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-4">
            {/* Stats */}
            <div className="flex gap-4 p-3 rounded-lg bg-white/5">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium">{route.formattedTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <Ruler className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium">
                  {route.totalDistanceM < 1000
                    ? `${Math.round(route.totalDistanceM)} m`
                    : `${(route.totalDistanceM / 1000).toFixed(1)} km`}
                </span>
              </div>
            </div>

            {/* Floor transitions */}
            {route.floorTransitions.length > 0 && (
              <div className="space-y-1">
                {route.floorTransitions.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => onFloorChange?.(t.toFloorId)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20
                               text-sm text-amber-400 hover:bg-amber-500/20 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                    <span>
                      Take {t.viaType} to {floorName(t.toFloorId)}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Turn-by-turn directions */}
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Directions</h3>
              <ol className="space-y-1" aria-label="Turn-by-turn directions">
                {route.directions.map((step, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white/5 shrink-0 text-sm font-medium">
                      <DirectionIcon direction={step.direction} />
                    </span>
                    <span className="text-sm leading-relaxed">{step.instruction}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
