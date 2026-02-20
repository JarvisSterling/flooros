'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import Sidebar from '@/components/dashboard/Sidebar';
import TopBar from '@/components/dashboard/TopBar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div
        className={cn(
          'transition-all duration-300',
          collapsed ? 'lg:pl-[72px]' : 'lg:pl-[260px]'
        )}
      >
        <TopBar
          onOpenMobileSidebar={() => setMobileOpen(true)}
          sidebarCollapsed={collapsed}
        />
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
