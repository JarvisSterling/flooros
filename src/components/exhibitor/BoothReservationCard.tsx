'use client';

import type { AvailableBooth } from '@/lib/api/exhibitor';

interface Props {
  booth: AvailableBooth;
  onReserve: () => void;
  onClose: () => void;
  reserving: boolean;
}

export default function BoothReservationCard({ booth, onReserve, onClose, reserving }: Props) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-white">Booth #{booth.booth_number}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-lg">&times;</button>
        </div>

        <div className="space-y-3 text-sm mb-6">
          {booth.name && (
            <div className="flex justify-between">
              <span className="text-gray-400">Name</span>
              <span className="text-white">{booth.name}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-400">Size</span>
            <span className="text-white capitalize">{booth.size_category ?? 'Standard'}</span>
          </div>
          {booth.category && (
            <div className="flex justify-between">
              <span className="text-gray-400">Type</span>
              <span className="text-white capitalize">{booth.category}</span>
            </div>
          )}
          {booth.price != null && (
            <div className="flex justify-between">
              <span className="text-gray-400">Price</span>
              <span className="text-blue-400 font-semibold">${booth.price.toLocaleString()}</span>
            </div>
          )}
        </div>

        <button
          onClick={onReserve}
          disabled={reserving}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
        >
          {reserving ? 'Reserving...' : 'Reserve This Booth'}
        </button>

        <p className="text-gray-500 text-xs text-center mt-3">
          Reservation is pending until approved by the organizer
        </p>
      </div>
    </div>
  );
}
