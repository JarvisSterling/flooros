'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { useEditorStore } from '@/store/editor-store';
import FloatingToolbar from '@/components/toolbar/FloatingToolbar';
import SideRail from '@/components/editor/SideRail';
import StatusBar from '@/components/editor/StatusBar';
import Minimap from '@/components/editor/Minimap';
import LayerPanel from '@/components/panels/LayerPanel';
import PropertiesPanel from '@/components/panels/PropertiesPanel';
import ObjectLibrary from '@/components/panels/ObjectLibrary';
import FloorPanel from '@/components/panels/FloorPanel';
import BoothPanel from '@/components/panels/BoothPanel';
import useKeyboardShortcuts from '@/hooks/useKeyboardShortcuts';
import useAutoSave from '@/hooks/useAutoSave';

const Canvas = dynamic(() => import('@/components/editor/Canvas'), { ssr: false });

export type PanelId = 'layers' | 'library' | 'floors' | 'booths' | 'properties' | null;

export default function EventEditorPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [_event, setEvent] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [leftPanel, setLeftPanel] = useState<PanelId>('layers');
  const [rightPanel, setRightPanel] = useState<PanelId>('properties');

  const { loadFloors, loadBooths, floors, addFloor, selectedObjectIds } = useEditorStore();

  useKeyboardShortcuts();
  useAutoSave();

  // Auto-show properties when something is selected
  useEffect(() => {
    if (selectedObjectIds.size > 0) setRightPanel('properties');
  }, [selectedObjectIds]);

  useEffect(() => {
    async function loadEvent() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*, organizations(*)')
        .eq('id', eventId)
        .single();

      if (eventError || !eventData) {
        setError('Event not found');
        setLoading(false);
        return;
      }

      const { data: member } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', eventData.organization_id)
        .eq('user_id', user.id)
        .single();

      if (!member) {
        setError('Access denied');
        setLoading(false);
        return;
      }

      setEvent(eventData as Record<string, unknown>);
      await loadFloors(eventId);
      await loadBooths(eventId);
      setLoading(false);
    }
    loadEvent();
  }, [eventId, router, loadFloors, loadBooths]);

  const toggleLeftPanel = (id: PanelId) => {
    setLeftPanel(prev => prev === id ? null : id);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0a0e1a]">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-blue-500/20" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 animate-spin" />
          </div>
          <p className="text-sm text-white/50 font-medium">Loading editor…</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0a0e1a]">
        <div className="text-center max-w-sm">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-red-400 text-xl">!</span>
          </div>
          <p className="text-red-400 mb-2 font-medium">{error}</p>
          <button
            onClick={() => router.push('/dashboard/events/' + eventId)}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            ← Back to event
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!loading && !error && floors.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0a0e1a]">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">🏗️</span>
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">No floors yet</h2>
          <p className="text-sm text-white/40 mb-6">Create your first floor to start designing your floor plan</p>
          <button
            onClick={async () => {
              const floor = await addFloor({ name: 'Floor 1', floor_number: 1 });
              if (floor) await useEditorStore.getState().switchFloor(floor.id);
            }}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl font-medium text-sm transition-all duration-200 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
          >
            Create your first floor
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#0a0e1a] text-white overflow-hidden select-none">
      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left: Icon rail + expanding panel */}
        <SideRail activePanel={leftPanel} onPanelChange={toggleLeftPanel} />
        
        <AnimatePresence mode="wait">
          {leftPanel && (
            <motion.div
              key={leftPanel}
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="border-r border-white/[0.06] bg-[#0c1120]/95 backdrop-blur-xl overflow-hidden flex-shrink-0"
            >
              <div className="w-[280px] h-full overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {leftPanel === 'layers' && <LayerPanel />}
                {leftPanel === 'library' && <ObjectLibrary />}
                {leftPanel === 'floors' && <FloorPanel />}
                {leftPanel === 'booths' && <BoothPanel />}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Canvas area */}
        <div className="flex-1 relative overflow-hidden">
          {/* Canvas */}
          <Canvas />

          {/* Floating toolbar */}
          <FloatingToolbar />

          {/* Minimap */}
          <Minimap />

          {/* Status bar */}
          <StatusBar />
        </div>

        {/* Right: Properties panel */}
        <AnimatePresence>
          {rightPanel === 'properties' && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="border-l border-white/[0.06] bg-[#0c1120]/95 backdrop-blur-xl overflow-hidden flex-shrink-0"
            >
              <div className="w-[320px] h-full overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                <PropertiesPanel />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
