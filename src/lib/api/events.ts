import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database';

type Event = Database['public']['Tables']['events']['Row'];
type EventInsert = Database['public']['Tables']['events']['Insert'];
type EventUpdate = Database['public']['Tables']['events']['Update'];

const supabase = createClient();

export interface EventWithCounts extends Event {
  booth_count?: number;
}

export async function getEvents(orgId: string): Promise<{ data: EventWithCounts[]; error: string | null }> {
  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false });

  if (error) return { data: [], error: error.message };

  // Get booth counts per event
  const eventIds = (events || []).map(e => e.id);
  const withCounts: EventWithCounts[] = [];

  for (const event of events || []) {
    const { count } = await supabase
      .from('booths')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', event.id);
    withCounts.push({ ...event, booth_count: count ?? 0 });
  }

  return { data: withCounts, error: null };
}

export async function getEvent(eventId: string): Promise<{ data: EventWithCounts | null; error: string | null }> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .single();

  if (error) return { data: null, error: error.message };

  const { count } = await supabase
    .from('booths')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', eventId);

  return { data: { ...data, booth_count: count ?? 0 }, error: null };
}

export async function createEvent(data: EventInsert): Promise<{ data: Event | null; error: string | null }> {
  const { data: event, error } = await supabase
    .from('events')
    .insert(data)
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: event, error: null };
}

export async function updateEvent(eventId: string, data: EventUpdate): Promise<{ data: Event | null; error: string | null }> {
  const { data: event, error } = await supabase
    .from('events')
    .update(data)
    .eq('id', eventId)
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: event, error: null };
}

export async function deleteEvent(eventId: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', eventId);

  return { error: error?.message ?? null };
}

export async function duplicateEvent(eventId: string): Promise<{ data: Event | null; error: string | null }> {
  const { data: original, error: fetchError } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .single();

  if (fetchError || !original) return { data: null, error: fetchError?.message ?? 'Event not found' };

  const newSlug = original.slug + '-copy-' + Date.now().toString(36);
  const { data: event, error } = await supabase
    .from('events')
    .insert({
      org_id: original.org_id,
      name: original.name + ' (Copy)',
      slug: newSlug,
      description: original.description,
      start_date: original.start_date,
      end_date: original.end_date,
      venue: original.venue,
      status: 'draft' as const,
      settings: original.settings,
      logo_url: original.logo_url,
    })
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: event, error: null };
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}
