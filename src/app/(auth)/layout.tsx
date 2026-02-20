'use client';

import { Suspense } from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-white">Floor</span>
            <span className="text-blue-500">OS</span>
          </h1>
          <p className="mt-2 text-sm text-white/50">Event Floor Plan Platform</p>
        </div>
        <Suspense fallback={<div className="text-center text-white/50">Loading...</div>}>
          {children}
        </Suspense>
      </div>
    </div>
  );
}
