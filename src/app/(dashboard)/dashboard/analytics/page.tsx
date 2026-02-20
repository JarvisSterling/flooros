'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { createClient } from '@/lib/supabase/client';
import {
  getEventAnalytics,
  getTopBooths,
  getTrafficOverTime,
  exportAnalyticsCSV,
  type DateRange,
} from '@/lib/api/analytics';
import {
  Eye,
  Users,
  Navigation,
  Bookmark,
  Download,
  BarChart3,
  Search,
  TrendingUp,
} from 'lucide-react';

interface EventOption {
  id: string;
  name: string;
}

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

export default function AnalyticsPage() {
  const { organization } = useAuth();
  const [events, setEvents] = useState<EventOption[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [topBooths, setTopBooths] = useState<TopBooth[]>([]);
  const [traffic, setTraffic] = useState<DailyTraffic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organization) return;
    const supabase = createClient();
    supabase
      .from('events')
      .select('id, name')
      .eq('organizer_id', organization.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        const evts = data || [];
        setEvents(evts);
        if (evts.length > 0) setSelectedEvent(evts[0].id);
      });
  }, [organization]);

  const loadAnalytics = useCallback(async () => {
    if (!selectedEvent) return;
    setLoading(true);
    const [s, tb, tr] = await Promise.all([
      getEventAnalytics(selectedEvent, dateRange),
      getTopBooths(selectedEvent),
      getTrafficOverTime(selectedEvent, dateRange),
    ]);
    setStats(s);
    setTopBooths(tb);
    setTraffic(tr);
    setLoading(false);
  }, [selectedEvent, dateRange]);

  useEffect(() => { loadAnalytics(); }, [loadAnalytics]);

  const handleExport = async () => {
    if (!selectedEvent) return;
    const csv = await exportAnalyticsCSV(selectedEvent);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${selectedEvent}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const maxTraffic = Math.max(...traffic.map(t => t.count), 1);

  const statCards = stats ? [
    { icon: Eye, label: 'Total Views', value: stats.totalViews, color: 'text-blue-400' },
    { icon: Users, label: 'Unique Visitors', value: stats.uniqueVisitors, color: 'text-emerald-400' },
    { icon: Navigation, label: 'Direction Requests', value: stats.totalDirections, color: 'text-purple-400' },
    { icon: Bookmark, label: 'Bookmarks', value: stats.totalBookmarks, color: 'text-amber-400' },
  ] : [];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Analytics</h2>
          <p className="mt-1 text-white/60">Track engagement across your events.</p>
        </div>
        <div className="flex items-center gap-3">
          {events.length > 1 && (
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id} className="bg-gray-900">{ev.name}</option>
              ))}
            </select>
          )}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as DateRange)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
          >
            <option value="7d" className="bg-gray-900">Last 7 days</option>
            <option value="30d" className="bg-gray-900">Last 30 days</option>
            <option value="all" className="bg-gray-900">All time</option>
          </select>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        </div>
      ) : !selectedEvent ? (
        <div className="rounded-xl border border-white/10 bg-white/5 py-16 text-center">
          <BarChart3 className="mx-auto h-12 w-12 text-white/20" />
          <h4 className="mt-4 text-lg font-medium text-white">No events found</h4>
          <p className="mt-2 text-sm text-white/50">Create an event to start tracking analytics.</p>
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((card) => (
              <div
                key={card.label}
                className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
              >
                <div className="flex items-center gap-3">
                  <div className={`rounded-lg bg-white/5 p-2.5 ${card.color}`}>
                    <card.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-white/50">{card.label}</p>
                    <p className="text-2xl font-bold text-white">{card.value.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Top Booths */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
              <TrendingUp className="h-5 w-5 text-blue-400" /> Top Booths
            </h3>
            {topBooths.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-white/50">
                      <th className="pb-3 pr-4 font-medium">#</th>
                      <th className="pb-3 pr-4 font-medium">Booth</th>
                      <th className="pb-3 pr-4 font-medium">Exhibitor</th>
                      <th className="pb-3 pr-4 font-medium text-right">Views</th>
                      <th className="pb-3 pr-4 font-medium text-right">Clicks</th>
                      <th className="pb-3 font-medium text-right">Directions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topBooths.map((booth, i) => (
                      <tr key={booth.booth_id} className="border-b border-white/5">
                        <td className="py-3 pr-4 text-white/40">{i + 1}</td>
                        <td className="py-3 pr-4 font-medium text-white">{booth.booth_number}</td>
                        <td className="py-3 pr-4 text-white/70">{booth.exhibitor_name}</td>
                        <td className="py-3 pr-4 text-right text-white">{booth.views}</td>
                        <td className="py-3 pr-4 text-right text-white">{booth.clicks}</td>
                        <td className="py-3 text-right text-white">{booth.directions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-white/40">No booth engagement data yet.</p>
            )}
          </div>

          {/* Traffic Over Time */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
              <BarChart3 className="h-5 w-5 text-emerald-400" /> Traffic Over Time
            </h3>
            {traffic.length > 0 ? (
              <div className="space-y-2">
                {traffic.map((day) => (
                  <div key={day.date} className="flex items-center gap-3">
                    <span className="w-24 shrink-0 text-xs text-white/50">{day.date}</span>
                    <div className="flex-1">
                      <div
                        className="h-7 rounded-md bg-gradient-to-r from-blue-500/80 to-blue-400/60 transition-all"
                        style={{ width: `${Math.max((day.count / maxTraffic) * 100, 2)}%` }}
                      />
                    </div>
                    <span className="w-12 text-right text-xs font-medium text-white">{day.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/40">No traffic data yet.</p>
            )}
          </div>

          {/* Search Terms Placeholder */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold text-white">
              <Search className="h-5 w-5 text-purple-400" /> Search Terms
            </h3>
            <p className="text-sm text-white/40">
              Search term analytics will be available in a future update. This requires a dedicated search analytics table
              to capture and aggregate visitor search queries.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
