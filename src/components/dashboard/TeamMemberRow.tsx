'use client';

import { useState } from 'react';
import type { UserProfile } from '@/types/database';

const ROLE_COLORS: Record<string, string> = {
  owner: '#a855f7',
  admin: '#3b82f6',
  editor: '#22c55e',
  viewer: '#6b7280',
};

interface TeamMemberRowProps {
  member: UserProfile;
  currentUserId: string;
  currentUserRole: string;
  onChangeRole: (userId: string, role: 'admin' | 'editor' | 'viewer') => Promise<void>;
  onRemove: (userId: string) => Promise<void>;
}

function getInitials(name: string | null): string {
  if (!name) return '??';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function TeamMemberRow({
  member,
  currentUserId,
  currentUserRole,
  onChangeRole,
  onRemove,
}: TeamMemberRowProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [loading, setLoading] = useState(false);

  const canManage =
    (currentUserRole === 'owner' || currentUserRole === 'admin') &&
    member.id !== currentUserId &&
    member.role !== 'owner';

  const handleRoleChange = async (role: 'admin' | 'editor' | 'viewer') => {
    setLoading(true);
    await onChangeRole(member.id, role);
    setLoading(false);
    setMenuOpen(false);
  };

  const handleRemove = async () => {
    setLoading(true);
    await onRemove(member.id);
    setLoading(false);
    setConfirmRemove(false);
    setMenuOpen(false);
  };

  const roleColor = ROLE_COLORS[member.role] ?? ROLE_COLORS.viewer;

  // m3: Show email if available, otherwise show name or fallback
  const displayName = member.full_name ?? 'Unnamed User';
  const displayEmail = (member as any).email ?? null;

  return (
    <div className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-white/5 transition-colors group">
      <div className="flex items-center gap-3 min-w-0">
        {member.avatar_url ? (
          <img
            src={member.avatar_url}
            alt={displayName}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
            style={{ backgroundColor: roleColor + '33', color: roleColor }}
          >
            {getInitials(member.full_name)}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-white font-medium truncate">
            {displayName}
            {member.id === currentUserId && (
              <span className="text-white/40 text-sm ml-2">(you)</span>
            )}
          </p>
          <p className="text-white/50 text-sm truncate">{displayEmail || member.full_name || member.id}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <span
          className="px-2.5 py-0.5 rounded-full text-xs font-medium capitalize"
          style={{ backgroundColor: roleColor + '22', color: roleColor, border: `1px solid ${roleColor}44` }}
        >
          {member.role}
        </span>

        <span className="text-white/30 text-xs hidden sm:block">
          {new Date(member.created_at).toLocaleDateString()}
        </span>

        {canManage && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-md hover:bg-white/10 text-white/50 hover:text-white transition-colors"
              disabled={loading}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <circle cx="8" cy="3" r="1.5" />
                <circle cx="8" cy="8" r="1.5" />
                <circle cx="8" cy="13" r="1.5" />
              </svg>
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => { setMenuOpen(false); setConfirmRemove(false); }} />
                <div className="absolute right-0 top-8 z-50 w-48 rounded-lg border border-white/10 bg-[#1a1a2e] shadow-xl py-1">
                  {confirmRemove ? (
                    <div className="p-3">
                      <p className="text-white/70 text-sm mb-2">Remove this member?</p>
                      <div className="flex gap-2">
                        <button
                          onClick={handleRemove}
                          disabled={loading}
                          className="flex-1 px-3 py-1.5 rounded bg-red-500/20 text-red-400 text-sm hover:bg-red-500/30 transition-colors disabled:opacity-50"
                        >
                          {loading ? '...' : 'Remove'}
                        </button>
                        <button
                          onClick={() => setConfirmRemove(false)}
                          className="flex-1 px-3 py-1.5 rounded bg-white/5 text-white/60 text-sm hover:bg-white/10 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="px-3 py-1.5 text-xs text-white/30 uppercase tracking-wider">Change Role</div>
                      {(['admin', 'editor', 'viewer'] as const)
                        .filter((r) => r !== member.role)
                        .map((role) => (
                          <button
                            key={role}
                            onClick={() => handleRoleChange(role)}
                            disabled={loading}
                            className="w-full text-left px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors capitalize disabled:opacity-50"
                          >
                            <span
                              className="inline-block w-2 h-2 rounded-full mr-2"
                              style={{ backgroundColor: ROLE_COLORS[role] }}
                            />
                            {role}
                          </button>
                        ))}
                      <div className="border-t border-white/10 mt-1 pt-1">
                        <button
                          onClick={() => setConfirmRemove(true)}
                          disabled={loading}
                          className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                        >
                          Remove from Team
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
