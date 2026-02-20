'use client';
import React from 'react';
import { useNavStore, type NavToolMode, type NavNodePlaceType } from '@/store/nav-store';
import { useEditorStore } from '@/store/editor-store';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Eye, Plus, Link2, Trash2, Zap, RefreshCw, MapPin, DoorOpen, ArrowUpDown, Footprints,
} from 'lucide-react';

const NODE_TYPES: { value: NavNodePlaceType; label: string; icon: React.ReactNode; desc: string }[] = [
  { value: 'waypoint', label: 'Waypoint', icon: <MapPin size={14} />, desc: 'General navigation point' },
  { value: 'entrance', label: 'Entrance', icon: <DoorOpen size={14} />, desc: 'Building entrance' },
  { value: 'exit', label: 'Exit', icon: <DoorOpen size={14} />, desc: 'Building exit' },
  { value: 'elevator', label: 'Elevator', icon: <ArrowUpDown size={14} />, desc: 'Elevator access point' },
  { value: 'stairs', label: 'Stairs', icon: <Footprints size={14} />, desc: 'Staircase access point' },
];

const TOOL_MODES: { value: NavToolMode; label: string; icon: React.ReactNode; desc: string }[] = [
  { value: 'none', label: 'View', icon: <Eye size={14} />, desc: 'View navigation graph' },
  { value: 'place-node', label: 'Place', icon: <Plus size={14} />, desc: 'Place navigation nodes' },
  { value: 'connect-edge', label: 'Connect', icon: <Link2 size={14} />, desc: 'Connect two nodes' },
  { value: 'delete', label: 'Delete', icon: <Trash2 size={14} />, desc: 'Delete nodes and edges' },
];

export default function WayfindingPanel() {
  const {
    nodes, edges, toolMode, placeNodeType, selectedNodeId, isLoading,
    setToolMode, setPlaceNodeType, selectNode, deleteNode, deleteEdge,
    generateGraph, loadNavData,
  } = useNavStore();
  const floorPlanId = useEditorStore((s) => s.floorPlanId);
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  return (
    <div className="flex flex-col gap-3 p-3 text-sm">
      <h3 className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Wayfinding</h3>

      <div className="flex gap-1">
        {TOOL_MODES.map((mode) => (
          <Tooltip key={mode.value}>
            <TooltipTrigger asChild>
              <button
                onClick={() => setToolMode(mode.value)}
                className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-150 ${
                  toolMode === mode.value
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                    : 'text-white/50 hover:text-white/70 hover:bg-white/5 border border-transparent'
                }`}
              >
                {mode.icon}
              </button>
            </TooltipTrigger>
            <TooltipContent className="bg-[#1e293b] border-white/10 text-white text-xs">{mode.desc}</TooltipContent>
          </Tooltip>
        ))}
      </div>

      {toolMode === 'place-node' && (
        <div className="space-y-1.5">
          <label className="text-[10px] text-white/40 uppercase tracking-wider">Node Type</label>
          <div className="grid grid-cols-2 gap-1">
            {NODE_TYPES.map((t) => (
              <Tooltip key={t.value}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setPlaceNodeType(t.value)}
                    className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] transition-all duration-150 ${
                      placeNodeType === t.value
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                        : 'text-white/50 hover:text-white/70 hover:bg-white/5 border border-white/[0.06]'
                    }`}
                  >
                    {t.icon} {t.label}
                  </button>
                </TooltipTrigger>
                <TooltipContent className="bg-[#1e293b] border-white/10 text-white text-xs">{t.desc}</TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>
      )}

      <div className="h-px bg-white/10" />

      <div className="space-y-1.5">
        <button
          className="w-full flex items-center justify-center gap-1.5 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-medium hover:bg-emerald-500/25 transition-all duration-150 disabled:opacity-40"
          onClick={() => generateGraph(floorPlanId)}
          disabled={isLoading || floorPlanId === 'demo'}
        >
          {isLoading ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} />}
          {isLoading ? 'Generating...' : 'Auto-Generate Graph'}
        </button>
        <button
          className="w-full flex items-center justify-center gap-1.5 h-7 rounded-lg bg-white/5 border border-white/10 text-white/60 text-xs hover:bg-white/10 transition-all duration-150 disabled:opacity-40"
          onClick={() => loadNavData(floorPlanId)}
          disabled={isLoading || floorPlanId === 'demo'}
        >
          <RefreshCw size={12} /> Reload
        </button>
      </div>

      <div className="h-px bg-white/10" />
      <div className="flex gap-3 text-[11px] text-white/40">
        <span>Nodes: <span className="text-white/60 font-medium">{nodes.length}</span></span>
        <span>Edges: <span className="text-white/60 font-medium">{edges.length}</span></span>
      </div>

      {selectedNode && (
        <>
          <div className="h-px bg-white/10" />
          <div className="space-y-1.5">
            <h4 className="text-[10px] text-white/40 uppercase tracking-wider">Selected Node</h4>
            <div className="bg-white/[0.03] rounded-lg border border-white/[0.06] p-2 space-y-1 text-xs text-white/50">
              <div>Type: <span className="text-white/70">{selectedNode.type}</span></div>
              <div>Position: <span className="text-white/70 font-mono">({selectedNode.x.toFixed(1)}, {selectedNode.y.toFixed(1)})</span></div>
              <div>Accessible: <span className="text-white/70">{selectedNode.accessible ? '✅' : '❌'}</span></div>
            </div>
            <button
              className="w-full h-7 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs hover:bg-red-500/20 transition-all duration-150"
              onClick={() => { deleteNode(selectedNode.id); selectNode(null); }}
            >
              Delete Node
            </button>
          </div>
        </>
      )}

      {edges.length > 0 && (
        <>
          <div className="h-px bg-white/10" />
          <div>
            <h4 className="text-[10px] text-white/40 uppercase tracking-wider mb-1.5">Edges ({edges.length})</h4>
            <ScrollArea className="max-h-32">
              <div className="space-y-0.5">
                {edges.slice(0, 20).map((edge) => (
                  <div key={edge.id} className="flex items-center justify-between text-xs text-white/40 px-2 py-1 rounded hover:bg-white/[0.03]">
                    <span className="font-mono">{edge.distance_m.toFixed(1)}m {edge.accessible ? '♿' : ''}</span>
                    {toolMode === 'delete' && (
                      <button
                        className="p-0.5 rounded text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        onClick={() => deleteEdge(edge.id)}
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                ))}
                {edges.length > 20 && (
                  <div className="text-white/30 text-xs px-2">...and {edges.length - 20} more</div>
                )}
              </div>
            </ScrollArea>
          </div>
        </>
      )}
    </div>
  );
}
