'use client';

import { useState, useEffect, useCallback } from 'react';
import { useExhibitor } from '../../../layout';
import {
  getAllBooths,
  getMyReservation,
  reserveBooth,
  type AvailableBooth,
  type BoothReservation,
} from '@/lib/api/exhibitor';
import BoothReservationCard from '@/components/exhibitor/BoothReservationCard';

export default function BoothsPage() {
  const { exhibitor, eventSlug } = useExhibitor();
  const [booths, setBooths] = useState<AvailableBooth[]>([]);
  const [reservation, setReservation] = useState<BoothReservation | null>(null);
  const [selected, setSelected] = useState<AvailableBooth | null>(null);
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Derive eventId from exhibitor
  const eventId = exhibitor.event_id;

  const loadData = useCallback(async () => {
    const [boothRes, resRes] = await Promise.all([
      getAllBooths(eventId),
      getMyReservation(exhibitor.id),
    ]);
    setBooths(boothRes.data);
    setReservation(resRes.data);
    setLoading(false);
  }, [eventId, exhibitor.id]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleReserve = async (boothId: string) => {
    setReserving(true);
    setError('');
    const { data, error: err } = await reserveBooth(boothId, exhibitor.id);
    if (err) { setError(err); setReserving(false); return; }
    setReservation(data);
    setSelected(null);
    setSuccess(true);
    setReserving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  // Already has reservation
  if (reservation && !success) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-white mb-6">My Booth Reservation</h1>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-md">
          <div className="flex items-center gap-3 mb-4">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
              reservation.status === 'confirmed'
                ? 'bg-green-500/20 text-green-400'
                : 'bg-yellow-500/20 text-yellow-400'
            }`}>
              {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
            </span>
          </div>
          {reservation.booth && (
            <div className="space-y-2 text-sm">
              <p className="text-gray-400">Booth <span className="text-white font-medium">#{reservation.booth.booth_number}</span></p>
              {reservation.booth.name && <p className="text-gray-400">Name: <span className="text-white">{reservation.booth.name}</span></p>}
              {reservation.booth.size_category && <p className="text-gray-400">Size: <span className="text-white capitalize">{reservation.booth.size_category}</span></p>}
              {reservation.booth.price != null && <p className="text-gray-400">Price: <span className="text-white">${reservation.booth.price}</span></p>}
            </div>
          )}
          <p className="text-gray-500 text-xs mt-4">Reserved on {new Date(reservation.reserved_at).toLocaleDateString()}</p>
        </div>
      </div>
    );
  }

  // Success state
  if (success && reservation) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-white mb-2">Booth Reserved!</h2>
          <p className="text-gray-400">Booth #{reservation.booth?.booth_number ?? ''} is now pending approval.</p>
          <p className="text-gray-500 text-sm mt-2">The organizer will review and confirm your reservation.</p>
        </div>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    available: 'bg-green-500/30 border-green-500/50 hover:bg-green-500/40 cursor-pointer',
    reserved: 'bg-yellow-500/20 border-yellow-500/30',
    sold: 'bg-red-500/20 border-red-500/30',
    blocked: 'bg-gray-500/20 border-gray-500/30',
    premium: 'bg-purple-500/20 border-purple-500/30',
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">Available Booths</h1>
      <p className="text-gray-400 mb-6">Click an available booth to view details and reserve</p>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm mb-4">{error}</div>
      )}

      {/* Legend */}
      <div className="flex gap-4 mb-6 text-xs text-gray-400">
        {['available', 'reserved', 'sold'].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded ${statusColors[s]?.split(' ')[0] ?? 'bg-gray-500/20'} border ${statusColors[s]?.split(' ')[1] ?? ''}`} />
            <span className="capitalize">{s}</span>
          </div>
        ))}
      </div>

      {/* Booth grid (simplified floor plan) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-8">
        {booths.map((booth) => {
          const isAvailable = booth.status === 'available';
          const colors = statusColors[booth.status] ?? 'bg-gray-500/20 border-gray-500/30';
          return (
            <button
              key={booth.id}
              onClick={() => isAvailable ? setSelected(booth) : undefined}
              disabled={!isAvailable}
              className={`relative p-4 rounded-xl border text-left transition-all ${colors} ${
                isAvailable ? 'animate-pulse-subtle' : 'opacity-60'
              } ${selected?.id === booth.id ? 'ring-2 ring-blue-500' : ''}`}
            >
              <p className="text-white font-semibold text-sm">#{booth.booth_number}</p>
              {booth.name && <p className="text-gray-400 text-xs truncate">{booth.name}</p>}
              <p className="text-gray-500 text-xs mt-1 capitalize">{booth.size_category ?? 'Standard'}</p>
              {booth.price != null && <p className="text-blue-400 text-xs font-medium mt-1">${booth.price}</p>}
            </button>
          );
        })}
      </div>

      {booths.length === 0 && (
        <div className="text-center py-16 text-gray-500">No booths available for this event yet.</div>
      )}

      {/* Selected booth detail */}
      {selected && (
        <BoothReservationCard
          booth={selected}
          onReserve={() => handleReserve(selected.id)}
          onClose={() => setSelected(null)}
          reserving={reserving}
        />
      )}
    </div>
  );
}
