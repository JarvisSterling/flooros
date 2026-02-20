'use client';

import { useState, useEffect } from 'react';
import { useExhibitor } from '../../../layout';
import { getExhibitorAnalytics } from '@/lib/api/exhibitor';

interface Stats {
  profileViews: number;
  directionRequests: number;
  bookmarks: number;
}

export default function AnalyticsPage() {
  const { exhibitor } = useExhibitor();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getExhibitorAnalytics(exhibitor.id).then((s) => {
      setStats(s);
      setLoading(false);
    });
  }, [exhibitor.id]);

  const statCards = stats
    ? [
        { label: 'Profile Views', value: stats.profileViews, icon: '👁️', color: 'blue' },
        { label: 'Direction Requests', value: stats.directionRequests, icon: '🧭', color: 'green' },
        { label: 'Bookmarks', value: stats.bookmarks, icon: '⭐', color: 'yellow' },
      ]
    : [];

  const colorMap: Record<string, string> = {
    blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/20',
    green: 'from-green-500/20 to-green-500/5 border-green-500/20',
    yellow: 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/20',
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">Analytics</h1>
      <p className="text-gray-400 mb-8">Track how visitors interact with your exhibitor profile</p>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white/5 rounded-2xl p-6 animate-pulse h-32" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statCards.map((card) => (
            <div
              key={card.label}
              className={`bg-gradient-to-br ${colorMap[card.color]} border rounded-2xl p-6`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">{card.icon}</span>
              </div>
              <p className="text-3xl font-bold text-white">{card.value.toLocaleString()}</p>
              <p className="text-gray-400 text-sm mt-1">{card.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-12 bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
        <p className="text-gray-500">More detailed analytics coming soon — visitor timelines, peak hours, and engagement trends.</p>
      </div>
    </div>
  );
}
