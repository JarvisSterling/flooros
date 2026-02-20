'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase/client';
import { useEditorStore } from '@/store/editor-store';
import Toolbar from '@/components/toolbar/Toolbar';
import LayerPanel from '@/components/panels/LayerPanel';
import PropertiesPanel from '@/components/panels/PropertiesPanel';
import ObjectLibrary from '@/components/panels/ObjectLibrary';
import FloorPanel from '@/components/panels/FloorPanel';
import FloorOverview from '@/components/panels/FloorOverview';
import WayfindingPanel from '@/components/panels/WayfindingPanel';
import AnchorPanel from '@/components/panels/AnchorPanel';
import CrossFloorLinkPanel from '@/components/panels/CrossFloorLinkPanel';
import BoothPanel from '@/components/panels/BoothPanel';
import useKeyboardShortcuts from '@/hooks/useKeyboardShortcuts';
import useAutoSave from '@/hooks/useAutoSave';

const Canvas = dynamic(() => import('@/components/editor/Canvas'), { ssr: false });

type PanelType = 'layers' | 'library' | 'floors' | 'booths';

export default function EventEditorPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<PanelType>('layers');

  const { loadFloors, loadBooths, floorPlanId } = useEditorStore();

  useKeyboardShortcuts();
  useAutoSave();

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4" />
          <p>Loading editor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950 text-white">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => router.push('/dashboard/events/' + eventId)}
            className="text-blue-400 hover:underline"
          >
             Back to event
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-white overflow-hidden">
      <Toolbar />

      <div className="flex flex-1 overflow-hidden">
        <div className="w-72 border-r border-gray-800 overflow-y-auto">
          <div className="flex border-b border-gray-800">
            <button
              className={'flex-1 px-2 py-2 text-xs ' + (activePanel === 'layers' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white')}
              onClick={() => setActivePanel('layers')}
            >
              Layers
            </button>
            <button
              className={'flex-1 px-2 py-2 text-xs ' + (activePanel === 'library' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white')}
              onClick={() => setActivePanel('library')}
            >
              Library
            </button>
            <button
              className={'flex-1 px-2 py-2 text-xs ' + (activePanel === 'floors' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white')}
              onClick={() => setActivePanel('floors')}
            >
              Floors
            </button>
            <button
              className={'flex-1 px-2 py-2 text-xs ' + (activePanel === 'booths' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white')}
              onClick={() => setActivePanel('booths')}
            >
              Booths
            </button>
          </div>
          {activePanel === 'layers' && <LayerPanel />}
          {activePanel === 'library' && <ObjectLibrary />}
          {activePanel === 'floors' && <FloorPanel />}
          {activePanel === 'booths' && <BoothPanel />}
        </div>

        <div className="flex-1 relative">
          <Canvas />
        </div>

        <div className="w-80 border-l border-gray-800 overflow-y-auto">
          <PropertiesPanel />
        </div>
      </div>
    </div>
  );
}
