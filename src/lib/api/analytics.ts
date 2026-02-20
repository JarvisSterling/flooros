import { createClient } from '@/lib/supabase/client';

export type DateRange = '7d' | '30d' | 'all';

interface AnalyticsStats {
  totalViews: number;
  uniqueVisitors: number;
  totalDirections: number;
  totalBookmarks: number;
}

interface TopBooth {
  booth_id: string;
  booth_number: string;
  exhibitor_name: string;
  views: number;
  clicks: number;
  directions: number;
}

interface DailyTraffic {
  date: string;
  count: number;
}

function getDateFilter(dateRange: DateRange): string | null {
  if (dateRange === 'all') return null;
  const days = dateRange === '7d' ? 7 : 30;
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

export async function getEventAnalytics(eventId: string, dateRange: DateRange): Promise<AnalyticsStats> {
  const supabase = createClient();
  const since = getDateFilter(dateRange);

  let query = supabase.from('analytics_events').select('event_type, visitor_id').eq('event_id', eventId);
  if (since) query = query.gte('created_at', since);

  const { data } = await query;
  if (!data) return { totalViews: 0, uniqueVisitors: 0, totalDirections: 0, totalBookmarks: 0 };

  const visitors = new Set<string>();
  let views = 0, directions = 0, bookmarks = 0;

  for (const row of data) {
    visitors.add(row.visitor_id);
    if (row.event_type === 'view') views++;
    else if (row.event_type === 'direction') directions++;
    else if (row.event_type === 'bookmark') bookmarks++;
  }

  return { totalViews: views, uniqueVisitors: visitors.size, totalDirections: directions, totalBookmarks: bookmarks };
}

export async function getTopBooths(eventId: string, limit = 10): Promise<TopBooth[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('analytics_events')
    .select('booth_id, event_type')
    .eq('event_id', eventId)
    .not('booth_id', 'is', null);

  if (!data || data.length === 0) return [];

  const boothMap = new Map<string, { views: number; clicks: number; directions: number }>();
  for (const row of data) {
    const id = row.booth_id as string;
    if (!boothMap.has(id)) boothMap.set(id, { views: 0, clicks: 0, directions: 0 });
    const b = boothMap.get(id)!;
    if (row.event_type === 'view') b.views++;
    else if (row.event_type === 'click') b.clicks++;
    else if (row.event_type === 'direction') b.directions++;
  }

  const boothIds = Array.from(boothMap.keys());
  const { data: booths } = await supabase
    .from('booths')
    .select('id, booth_number, exhibitor_id')
    .in('id', boothIds);

  const exhibitorIds = (booths || []).map(b => b.exhibitor_id).filter(Boolean) as string[];
  const { data: exhibitors } = exhibitorIds.length > 0
    ? await supabase.from('exhibitors').select('id, company_name').in('id', exhibitorIds)
    : { data: [] };

  const exhibitorMap = new Map((exhibitors || []).map(e => [e.id, e.company_name]));
  const boothInfo = new Map((booths || []).map(b => [b.id, { number: b.booth_number, exhibitor: exhibitorMap.get(b.exhibitor_id || '') || 'Unassigned' }]));

  return Array.from(boothMap.entries())
    .map(([id, stats]) => ({
      booth_id: id,
      booth_number: boothInfo.get(id)?.number || 'Unknown',
      exhibitor_name: boothInfo.get(id)?.exhibitor || 'Unassigned',
      ...stats,
    }))
    .sort((a, b) => (b.views + b.clicks + b.directions) - (a.views + a.clicks + a.directions))
    .slice(0, limit);
}

export async function getTrafficOverTime(eventId: string, dateRange: DateRange): Promise<DailyTraffic[]> {
  const supabase = createClient();
  const since = getDateFilter(dateRange);

  let query = supabase.from('analytics_events').select('created_at').eq('event_id', eventId).eq('event_type', 'view');
  if (since) query = query.gte('created_at', since);

  const { data } = await query;
  if (!data) return [];

  const dayMap = new Map<string, number>();
  for (const row of data) {
    const day = row.created_at.substring(0, 10);
    dayMap.set(day, (dayMap.get(day) || 0) + 1);
  }

  return Array.from(dayMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function escapeCSV(val: string): string {
  if (val.includes(',') || val.includes('"') || val.includes('\n')) {
    return '"' + val.replace(/"/g, '""') + '"';
  }
  return val;
}

export async function exportAnalyticsCSV(eventId: string): Promise<string> {
  const supabase = createClient();
  const { data } = await supabase
    .from('analytics_events')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });

  if (!data || data.length === 0) return 'No data';

  const headers = ['ID', 'Event ID', 'Booth ID', 'Visitor ID', 'Event Type', 'Metadata', 'Created At'];
  const rows = data.map(r => [
    r.id, r.event_id, r.booth_id || '', r.visitor_id || '', r.event_type,
    JSON.stringify(r.metadata || {}), r.created_at,
  ].map(v => escapeCSV(String(v))).join(','));

  return [headers.join(','), ...rows].join('\n');
}

export async function trackEvent(
  eventId: string,
  boothId: string | null,
  eventType: 'view' | 'click' | 'direction' | 'bookmark',
  metadata: Record<string, unknown> = {},
  visitorId?: string,
): Promise<void> {
  const supabase = createClient();
  await supabase.from('analytics_events').insert({
    event_id: eventId,
    booth_id: boothId,
    visitor_id: visitorId || 'anonymous',
    event_type: eventType,
    metadata,
  });
}
