import React from 'react';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <header className="border-b border-white/10 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center">
          <a href="/" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-blue-500">
              <rect x="3" y="3" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.9" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.6" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.6" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.3" />
            </svg>
            <span className="text-sm font-semibold tracking-tight">FloorOS</span>
          </a>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-white/10 py-6">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center">
          <a href="/" className="text-sm text-white/40 hover:text-white/60 transition-colors">
            Powered by <span className="font-semibold text-blue-400">FloorOS</span>
          </a>
        </div>
      </footer>
    </div>
  );
}
