'use client';

import { useAuth } from '@/components/providers/auth-provider';
import StatCard from '@/components/dashboard/StatCard';
import {
  Calendar,
  LayoutDashboard,
  Boxes,
  Users,
  Plus,
  CalendarDays,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const stats = [
  { icon: Calendar, label: 'Total Events', value: 12, trend: { value: 8, positive: true } },
  { icon: LayoutDashboard, label: 'Active Events', value: 3 },
  { icon: Boxes, label: 'Total Booths', value: 248, trend: { value: 12, positive: true } },
  { icon: Users, label: 'Total Exhibitors', value: 89, trend: { value: 5, positive: true } },
];

interface RecentEvent {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'completed';
  date: string;
  boothCount: number;
}

const recentEvents: RecentEvent[] = [
  { id: '1', name: 'Tech Summit 2026', status: 'active', date: 'Mar 15 – 17, 2026', boothCount: 84 },
  { id: '2', name: 'Design Expo Spring', status: 'active', date: 'Apr 2 – 4, 2026', boothCount: 56 },
  { id: '3', name: 'Startup Fest', status: 'draft', date: 'May 10 – 12, 2026', boothCount: 32 },
  { id: '4', name: 'Innovation Week', status: 'completed', date: 'Jan 20 – 22, 2026', boothCount: 76 },
];

const statusColors: Record<string, string> = {
  draft: 'bg-yellow-400/10 text-yellow-400',
  active: 'bg-emerald-400/10 text-emerald-400',
  completed: 'bg-white/10 text-white/50',
};

export default function DashboardPage() {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  const hasEvents = recentEvents.length > 0;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}
          </h2>
          <p className="mt-1 text-white/60">Here&apos;s what&apos;s happening with your events.</p>
        </div>
        <Link
          href="/dashboard/events/new"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-600"
        >
          <Plus className="h-4 w-4" /> Create Event
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Recent Events */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-white">Recent Events</h3>
        {hasEvents ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {recentEvents.map((event) => (
              <div
                key={event.id}
                className="rounded-xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/[0.07]"
              >
                <div className="flex items-start justify-between">
                  <h4 className="font-medium text-white">{event.name}</h4>
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-0.5 text-xs font-medium',
                      statusColors[event.status]
                    )}
                  >
                    {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-4 text-sm text-white/50">
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" /> {event.date}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Boxes className="h-3.5 w-3.5" /> {event.boothCount} booths
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 bg-white/5 py-16 text-center">
            <CalendarDays className="mx-auto h-12 w-12 text-white/20" />
            <h4 className="mt-4 text-lg font-medium text-white">No events yet</h4>
            <p className="mt-2 text-sm text-white/50">Create your first event to get started.</p>
            <Link
              href="/dashboard/events/new"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-600"
            >
              <Plus className="h-4 w-4" /> Create your first event
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
