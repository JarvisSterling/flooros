'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getPendingReservations,
  approveReservation,
  rejectReservation,
  type BoothReservation,
  type ExhibitorProfile,
} from '@/lib/api/exhibitor';

interface Props {
  eventId: string;
}

type ReservationWithExhibitor = BoothReservation & { exhibitor?: ExhibitorProfile };

export default function ReservationList({ eventId }: Props) {
  const [reservations, setReservations] = useState<ReservationWithExhibitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data } = await getPendingReservations(eventId);
    setReservations(data);
    setLoading(false);
  }, [eventId]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (id: string) => {
    setActing(id);
    await approveReservation(id);
    await load();
    setActing(null);
  };

  const handleReject = async (id: string) => {
    setActing(id);
    await rejectReservation(id);
    await load();
    setActing(null);
  };

  if (loading) {
    return <div className="animate-pulse bg-white/5 rounded-xl h-32" />;
  }

  if (reservations.length === 0) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center text-gray-500 text-sm">
        No pending booth reservations
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-white/10">
        <h3 className="text-white font-semibold">Pending Reservations ({reservations.length})</h3>
      </div>
      <div className="divide-y divide-white/5">
        {reservations.map((r) => (
          <div key={r.id} className="px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-white font-medium">{r.exhibitor?.company_name ?? 'Unknown'}</p>
              <p className="text-gray-400 text-sm">
                Booth #{r.booth?.booth_number ?? '?'} &middot; Requested {new Date(r.reserved_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleApprove(r.id)}
                disabled={acting === r.id}
                className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Approve
              </button>
              <button
                onClick={() => handleReject(r.id)}
                disabled={acting === r.id}
                className="px-4 py-2 bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 text-red-400 text-sm font-medium rounded-lg transition-colors"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
