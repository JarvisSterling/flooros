'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { ExhibitorProfile } from '@/lib/api/exhibitor';
import Link from 'next/link';

const supabase = createClient();

interface ExhibitorCtx {
  user: User;
  exhibitor: ExhibitorProfile;
  eventSlug: string;
  eventName: string;
}

const ExhibitorContext = createContext<ExhibitorCtx | null>(null);
export const useExhibitor = () => {
  const ctx = useContext(ExhibitorContext);
  if (!ctx) throw new Error('useExhibitor must be used within ExhibitorLayout');
  return ctx;
};

const NAV_ITEMS = [
  { label: 'Dashboard', icon: '📊', path: '' },
  { label: 'My Booth', icon: '🏪', path: '/booths' },
  { label: 'Profile', icon: '👤', path: '/profile' },
  { label: 'Analytics', icon: '📈', path: '/analytics' },
];

export default function ExhibitorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ctx, setCtx] = useState<ExhibitorCtx | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/login'); return; }

      // Extract eventSlug from pathname: /exhibitor/[slug]/...
      const match = pathname.match(/\/exhibitor\/([^/]+)/);
      const eventSlug = match?.[1];
      if (!eventSlug) { router.replace('/login'); return; }

      const { data: event } = await supabase
        .from('events')
        .select('id, name')
        .eq('slug', eventSlug)
        .maybeSingle();
      if (!event) { router.replace('/login'); return; }

      const { data: exhibitor } = await supabase
        .from('exhibitors')
        .select('*')
        .eq('user_id', user.id)
        .eq('event_id', event.id)
        .maybeSingle();
      if (!exhibitor) { router.replace(`/event/${eventSlug}/register`); return; }

      setCtx({
        user,
        exhibitor: exhibitor as ExhibitorProfile,
        eventSlug,
        eventName: event.name,
      });
      setLoading(false);
    };
    init();
  }, [pathname, router]);

  if (loading || !ctx) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  return (
    <ExhibitorContext.Provider value={ctx}>
      <div className="min-h-screen bg-[#0f172a] flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-white/10 bg-white/[0.02] flex flex-col">
          <div className="p-6 border-b border-white/10">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Event</p>
            <p className="text-white font-semibold truncate">{ctx.eventName}</p>
            <p className="text-blue-400 text-sm truncate mt-1">{ctx.exhibitor.company_name}</p>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {NAV_ITEMS.map((item) => {
              const href = `/exhibitor/${ctx.eventSlug}${item.path}`;
              const active = pathname === href || (item.path !== '' && pathname.startsWith(href));
              return (
                <Link
                  key={item.path}
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    active
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-white/10">
            <button
              onClick={handleSignOut}
              className="w-full text-left text-sm text-gray-500 hover:text-white transition-colors px-3 py-2"
            >
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 p-8 overflow-auto">
          {children}
        </main>
      </div>
    </ExhibitorContext.Provider>
  );
}
