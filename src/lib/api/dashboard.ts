import { createClient } from '@/lib/supabase/client';

interface DashboardStats {
  totalEvents: number;
  activeEvents: number;
  totalBooths: number;
  totalExhibitors: number;
}

interface RecentEvent {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'completed';
  start_date: string | null;
  end_date: string | null;
  boothCount: number;
}

export async function getDashboardStats(orgId: string): Promise<DashboardStats> {
  const supabase = createClient();

  const [eventsRes, boothsRes, exhibitorsRes] = await Promise.all([
    supabase.from('events').select('id, start_date, end_date', { count: 'exact' }).eq('organizer_id', orgId),
    supabase.from('booths').select('id', { count: 'exact' }).in(
      'event_id',
      (await supabase.from('events').select('id').eq('organizer_id', orgId)).data?.map(e => e.id) || []
    ),
    supabase.from('exhibitors').select('id', { count: 'exact' }).in(
      'event_id',
      (await supabase.from('events').select('id').eq('organizer_id', orgId)).data?.map(e => e.id) || []
    ),
  ]);

  const now = new Date().toISOString();
  const activeEvents = (eventsRes.data || []).filter(
    e => e.start_date && e.end_date && e.start_date <= now && e.end_date >= now
  ).length;

  return {
    totalEvents: eventsRes.count || 0,
    activeEvents,
    totalBooths: boothsRes.count || 0,
    totalExhibitors: exhibitorsRes.count || 0,
  };
}

export async function getRecentEvents(orgId: string, limit = 4): Promise<RecentEvent[]> {
  const supabase = createClient();
  const { data: events } = await supabase
    .from('events')
    .select('id, name, start_date, end_date')
    .eq('organizer_id', orgId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (!events) return [];

  const now = new Date().toISOString();
  const results: RecentEvent[] = [];

  for (const event of events) {
    const { count } = await supabase
      .from('booths')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', event.id);

    let status: 'draft' | 'active' | 'completed' = 'draft';
    if (event.start_date && event.end_date) {
      if (event.end_date < now) status = 'completed';
      else if (event.start_date <= now) status = 'active';
    }

    results.push({
      id: event.id,
      name: event.name,
      status,
      start_date: event.start_date,
      end_date: event.end_date,
      boothCount: count || 0,
    });
  }

  return results;
}
