'use client';

import { useState } from 'react';

const ROLE_COLORS: Record<string, string> = {
  owner: '#a855f7',
  admin: '#3b82f6',
  editor: '#22c55e',
  viewer: '#6b7280',
};

interface InvitationRowProps {
  invitation: {
    id: string;
    email: string;
    role: string;
    status: string;
    created_at: string;
  };
  canManage: boolean;
  onCancel: (id: string) => Promise<void>;
}

export default function InvitationRow({ invitation, canManage, onCancel }: InvitationRowProps) {
  const [loading, setLoading] = useState(false);

  const roleColor = ROLE_COLORS[invitation.role] ?? ROLE_COLORS.viewer;

  const handleCancel = async () => {
    setLoading(true);
    await onCancel(invitation.id);
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-white/5 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm flex-shrink-0 bg-white/5"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/30">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M22 7l-10 7L2 7" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-white/80 font-medium truncate">{invitation.email}</p>
          <p className="text-white/40 text-sm">
            Invited {new Date(invitation.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <span
          className="px-2.5 py-0.5 rounded-full text-xs font-medium capitalize"
          style={{ backgroundColor: roleColor + '22', color: roleColor, border: `1px solid ${roleColor}44` }}
        >
          {invitation.role}
        </span>

        <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-500/15 text-yellow-400 border border-yellow-500/30">
          Pending
        </span>

        {canManage && (
          <button
            onClick={handleCancel}
            disabled={loading}
            className="px-3 py-1 rounded-md text-sm text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
          >
            {loading ? '...' : 'Cancel'}
          </button>
        )}
      </div>
    </div>
  );
}
