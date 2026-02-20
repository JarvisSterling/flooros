import { createBrowserClient } from '@supabase/ssr';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export interface PublicEvent {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  venue: string | null;
  status: string;
  settings: Record<string, unknown>;
  logo_url: string | null;
}

export interface PublicFloorPlan {
  id: string;
  event_id: string;
  name: string;
  order: number;
  width: number;
  height: number;
  background_url: string | null;
  settings: Record<string, unknown>;
}

export interface PublicFloor {
  id: string;
  plan_id: string;
  name: string;
  level: number;
  order: number;
}

export interface PublicObject {
  id: string;
  floor_id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  properties: Record<string, unknown>;
  layer: string;
  z_index: number;
}

export interface PublicBooth {
  id: string;
  object_id: string | null;
  floor_id: string;
  event_id: string;
  number: string | null;
  name: string | null;
  status: string;
  exhibitor_id: string | null;
  exhibitor?: PublicExhibitor | null;
}

export interface PublicExhibitor {
  id: string;
  company_name: string;
  description: string | null;
  logo_url: string | null;
  website: string | null;
  category: string | null;
}

export async function getPublicEvent(slug: string): Promise<PublicEvent | null> {
  const { data } = await supabase
    .from('events')
    .select('id, name, slug, description, start_date, end_date, venue, status, settings, logo_url')
    .eq('slug', slug)
    .in('status', ['published', 'live'])
    .limit(1)
    .maybeSingle();
  return data;
}

export async function getPublicFloorPlans(eventId: string): Promise<PublicFloorPlan[]> {
  const { data } = await supabase
    .from('floor_plans')
    .select('id, event_id, name, order, width, height, background_url, settings')
    .eq('event_id', eventId)
    .order('order');
  return data ?? [];
}

export async function getPublicFloors(planId: string): Promise<PublicFloor[]> {
  const { data } = await supabase
    .from('floors')
    .select('id, plan_id, name, level, order')
    .eq('plan_id', planId)
    .order('order');
  return data ?? [];
}

export async function getPublicObjects(floorId: string): Promise<PublicObject[]> {
  const { data } = await supabase
    .from('objects')
    .select('id, floor_id, type, x, y, width, height, rotation, properties, layer, z_index')
    .eq('floor_id', floorId)
    .order('z_index');
  return data ?? [];
}

export async function getPublicBooths(eventId: string, floorId: string): Promise<PublicBooth[]> {
  const { data } = await supabase
    .from('booths')
    .select(`
      id, object_id, floor_id, event_id, number, name, status, exhibitor_id,
      exhibitors ( id, company_name, description, logo_url, website, category )
    `)
    .eq('event_id', eventId)
    .eq('floor_id', floorId);
  
  return (data ?? []).map((b) => ({
    ...b,
    exhibitor: b.exhibitors ?? null,
  }));
}

export async function getPublicExhibitors(eventId: string): Promise<PublicExhibitor[]> {
  const { data } = await supabase
    .from('exhibitors')
    .select('id, company_name, description, logo_url, website, category')
    .eq('event_id', eventId);
  return data ?? [];
}
