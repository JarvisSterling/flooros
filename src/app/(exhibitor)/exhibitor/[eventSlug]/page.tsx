'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useExhibitor } from '../../layout';
import { getMyReservation, type BoothReservation } from '@/lib/api/exhibitor';

export default function ExhibitorDashboard() {
  const { exhibitor, eventSlug } = useExhibitor();
  const [reservation, setReservation] = useState<BoothReservation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyReservation(exhibitor.id).then(({ data }) => {
      setReservation(data);
      setLoading(false);
    });
  }, [exhibitor.id]);

  const profileFields = [
    exhibitor.company_name,
    exhibitor.description,
    exhibitor.logo_url,
    exhibitor.website,
    exhibitor.contact_email,
    exhibitor.contact_phone,
    exhibitor.category,
  ];
  const filled = profileFields.filter(Boolean).length;
  const completionPct = Math.round((filled / profileFields.length) * 100);

  const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 ${className}`}>
      {children}
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Welcome back, {exhibitor.company_name}!</h1>
      <p className="text-gray-400 mb-8">Manage your exhibitor presence</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Booth Status */}
        <Card>
          <p className="text-sm text-gray-400 mb-2">Booth Status</p>
          {loading ? (
            <div className="h-6 w-24 bg-white/10 rounded animate-pulse" />
          ) : reservation ? (
            <div>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                reservation.status === 'confirmed'
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-yellow-500/20 text-yellow-400'
              }`}>
                {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
              </span>
              {reservation.booth && (
                <p className="text-white mt-2 text-sm">Booth #{reservation.booth.booth_number}</p>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No booth reserved yet</p>
          )}
        </Card>

        {/* Profile Completion */}
        <Card>
          <p className="text-sm text-gray-400 mb-2">Profile Completion</p>
          <p className="text-3xl font-bold text-white">{completionPct}%</p>
          <div className="w-full bg-white/10 rounded-full h-2 mt-3">
            <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${completionPct}%` }} />
          </div>
        </Card>

        {/* Quick Stats placeholder */}
        <Card>
          <p className="text-sm text-gray-400 mb-2">Event</p>
          <p className="text-white font-medium">{eventSlug}</p>
        </Card>
      </div>

      {/* Quick Actions */}
      <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href={`/exhibitor/${eventSlug}/profile`}
          className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-5 text-center transition-colors"
        >
          <span className="text-2xl mb-2 block">✏️</span>
          <span className="text-white font-medium text-sm">Edit Profile</span>
        </Link>
        <Link
          href={`/exhibitor/${eventSlug}/booths`}
          className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-5 text-center transition-colors"
        >
          <span className="text-2xl mb-2 block">🗺️</span>
          <span className="text-white font-medium text-sm">{reservation ? 'View Booth' : 'Browse Booths'}</span>
        </Link>
        <Link
          href={`/exhibitor/${eventSlug}/analytics`}
          className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-5 text-center transition-colors"
        >
          <span className="text-2xl mb-2 block">📈</span>
          <span className="text-white font-medium text-sm">View Analytics</span>
        </Link>
      </div>
    </div>
  );
}
