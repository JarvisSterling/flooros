'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  BarChart3,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/providers/auth-provider';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Events', href: '/dashboard/events', icon: Calendar },
  { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { label: 'Team', href: '/dashboard/team', icon: Users },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const { profile, signOut } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className={cn('flex h-16 items-center border-b border-white/10 px-4', collapsed && 'justify-center px-2')}>
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 font-bold text-white text-sm">F</div>
          {!collapsed && <span className="text-lg font-bold text-white">FloorOS</span>}
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-blue-500/10 text-blue-400'
                  : 'text-white/60 hover:bg-white/5 hover:text-white',
                collapsed && 'justify-center px-2'
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle (desktop only) */}
      <div className="hidden lg:block border-t border-white/10 p-3">
        <button
          onClick={onToggleCollapse}
          className="flex w-full items-center justify-center rounded-lg px-3 py-2 text-white/40 transition hover:bg-white/5 hover:text-white/70"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* User section */}
      <div className="relative border-t border-white/10 p-3">
        <button
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition hover:bg-white/5',
            collapsed && 'justify-center px-2'
          )}
        >
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 text-xs font-medium">
            {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          {!collapsed && (
            <span className="truncate text-white/80">{profile?.full_name || 'User'}</span>
          )}
        </button>

        {userMenuOpen && (
          <div className="absolute bottom-full left-3 right-3 mb-2 rounded-lg border border-white/10 bg-[#0a0f1a] py-1 shadow-xl">
            <Link
              href="/dashboard/settings"
              onClick={() => { setUserMenuOpen(false); onCloseMobile(); }}
              className="flex items-center gap-2 px-4 py-2 text-sm text-white/60 hover:bg-white/5 hover:text-white"
            >
              <User className="h-4 w-4" /> Profile
            </Link>
            <button
              onClick={() => { setUserMenuOpen(false); signOut(); }}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-white/60 hover:bg-white/5 hover:text-red-400"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={onCloseMobile}>
          <div className="absolute inset-0 bg-black/60" />
        </div>
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-[260px] bg-[#0a0f1a] transition-transform duration-300 lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <button
          onClick={onCloseMobile}
          className="absolute right-3 top-4 rounded-lg p-1 text-white/40 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 bg-[#0a0f1a] border-r border-white/10 transition-all duration-300',
          collapsed ? 'lg:w-[72px]' : 'lg:w-[260px]'
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
