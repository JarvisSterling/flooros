import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database';

type Event = Database['public']['Tables']['events']['Row'];
type EventInsert = Database['public']['Tables']['events']['Insert'];
type EventUpdate = Database['public']['Tables']['events']['Update'];

const supabase = createClient();

export interface EventWithCounts extends Event {
  booth_count?: number;
}

// M5: Batch booth counts in a single query instead of N+1
export async function getEvents(orgId: string): Promise<{ data: EventWithCounts[]; error: string | null }> {
  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false });

  if (error) return { data: [], error: error.message };
  if (!events || events.length === 0) return { data: [], error: null };

  // Fetch all booths for these events in one query
  const eventIds = events.map(e => e.id);
  const { data: booths } = await supabase
    .from('booths')
    .select('event_id')
    .in('event_id', eventIds);

  // Count client-side
  const countMap: Record<string, number> = {};
  (booths || []).forEach(b => {
    countMap[b.event_id] = (countMap[b.event_id] || 0) + 1;
  });

  const withCounts: EventWithCounts[] = events.map(event => ({
    ...event,
    booth_count: countMap[event.id] || 0,
  }));

  return { data: withCounts, error: null };
}

// B2: Require orgId for org-scoping
export async function getEvent(eventId: string, orgId: string): Promise<{ data: EventWithCounts | null; error: string | null }> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .eq('org_id', orgId)
    .single();

  if (error) return { data: null, error: error.message };

  const { count } = await supabase
    .from('booths')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', eventId);

  return { data: { ...data, booth_count: count ?? 0 }, error: null };
}

// M1: TODO — Add server actions for server-side validation. Currently relies on RLS for protection.
export async function createEvent(data: EventInsert): Promise<{ data: Event | null; error: string | null }> {
  // m2: Validate end_date >= start_date
  if (data.start_date && data.end_date && data.end_date < data.start_date) {
    return { data: null, error: 'End date must be on or after start date' };
  }

  const { data: event, error } = await supabase
    .from('events')
    .insert(data)
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: event, error: null };
}

// B2: Require orgId for org-scoping
export async function updateEvent(eventId: string, orgId: string, data: EventUpdate): Promise<{ data: Event | null; error: string | null }> {
  // m2: Validate end_date >= start_date
  if (data.start_date && data.end_date && data.end_date < data.start_date) {
    return { data: null, error: 'End date must be on or after start date' };
  }

  const { data: event, error } = await supabase
    .from('events')
    .update(data)
    .eq('id', eventId)
    .eq('org_id', orgId)
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: event, error: null };
}

// B2: Require orgId for org-scoping
export async function deleteEvent(eventId: string, orgId: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', eventId)
    .eq('org_id', orgId);

  return { error: error?.message ?? null };
}

// B2: Require orgId — verify source event belongs to org before duplicating
export async function duplicateEvent(eventId: string, orgId: string): Promise<{ data: Event | null; error: string | null }> {
  const { data: original, error: fetchError } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .eq('org_id', orgId)
    .single();

  if (fetchError || !original) return { data: null, error: fetchError?.message ?? 'Event not found or access denied' };

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
