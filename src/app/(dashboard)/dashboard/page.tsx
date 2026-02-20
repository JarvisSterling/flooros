'use client';

import { useAuth } from '@/components/providers/auth-provider';

export default function DashboardPage() {
  const { user, profile, organization, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
        <div className="text-white/50">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Welcome{profile?.full_name ? `, ${profile.full_name}` : ''}
            </h1>
            {organization && (
              <p className="text-white/50 text-sm mt-1">{organization.name}</p>
            )}
          </div>
          <button
            onClick={signOut}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            Sign out
          </button>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
          <p className="text-white/50">Dashboard coming soon. You&apos;re logged in as {user?.email}.</p>
        </div>
      </div>
    </div>
  );
}
