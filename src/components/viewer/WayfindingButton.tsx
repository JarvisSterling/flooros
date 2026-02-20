'use client';

import { Compass } from 'lucide-react';

interface WayfindingButtonProps {
  onClick: () => void;
  isActive?: boolean;
}

export default function WayfindingButton({ onClick, isActive = false }: WayfindingButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label="Get directions"
      title="Get Directions"
      className={[
        'fixed z-30 flex items-center justify-center',
        'w-12 h-12 rounded-full shadow-lg',
        'transition-all duration-200',
        // Position: bottom-right, above where a legend would typically be
        'bottom-20 right-4 md:bottom-24 md:right-6',
        isActive
          ? 'bg-blue-600 text-white ring-2 ring-blue-400/50 scale-105'
          : 'bg-gray-900/90 backdrop-blur-sm text-white border border-white/10 hover:bg-gray-800 hover:scale-105',
      ].join(' ')}
    >
      <Compass className={`w-5 h-5 ${isActive ? 'animate-pulse' : ''}`} />
    </button>
  );
}
