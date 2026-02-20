'use client';

import { usePathname } from 'next/navigation';
import { Menu, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopBarProps {
  onOpenMobileSidebar: () => void;
  sidebarCollapsed: boolean;
}

const routeTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/events': 'Events',
  '/dashboard/analytics': 'Analytics',
  '/dashboard/team': 'Team',
  '/dashboard/settings': 'Settings',
};

export default function TopBar({ onOpenMobileSidebar, sidebarCollapsed }: TopBarProps) {
  const pathname = usePathname();

  const title = routeTitles[pathname] || 'Dashboard';
  const breadcrumbs = pathname.split('/').filter(Boolean);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/10 bg-[#0f172a]/80 px-4 backdrop-blur-xl sm:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenMobileSidebar}
          className="rounded-lg p-2 text-white/60 hover:bg-white/5 hover:text-white lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <h1 className="text-lg font-semibold text-white">{title}</h1>
          <nav className="hidden sm:flex items-center gap-1 text-xs text-white/40">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <span>/</span>}
                <span className={cn(i === breadcrumbs.length - 1 && 'text-white/60')}>
                  {crumb.charAt(0).toUpperCase() + crumb.slice(1)}
                </span>
              </span>
            ))}
          </nav>
        </div>
      </div>

      <button className="relative rounded-lg p-2 text-white/60 hover:bg-white/5 hover:text-white">
        <Bell className="h-5 w-5" />
        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-blue-500" />
      </button>
    </header>
  );
}
