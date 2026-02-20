'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import TeamMemberRow from '@/components/dashboard/TeamMemberRow';
import InvitationRow from '@/components/dashboard/InvitationRow';
import InviteModal from '@/components/dashboard/InviteModal';
import {
  getTeamMembers,
  getPendingInvitations,
  inviteTeamMember,
  updateMemberRole,
  removeMember,
  cancelInvitation,
} from '@/lib/api/team';
import type { UserProfile, TeamInvitation } from '@/types/database';

export default function TeamPage() {
  const { user, profile, organization, loading: authLoading } = useAuth();
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);

  const canManage = profile?.role === 'owner' || profile?.role === 'admin';

  const fetchData = useCallback(async () => {
    if (!organization?.id) return;
    setLoading(true);
    setError(null);

    const [membersRes, invitationsRes] = await Promise.all([
      getTeamMembers(organization.id),
      getPendingInvitations(organization.id),
    ]);

    if (membersRes.error) setError(membersRes.error);
    setMembers(membersRes.data);
    setInvitations(invitationsRes.data);
    setLoading(false);
  }, [organization?.id]);

  useEffect(() => {
    if (!authLoading && organization) fetchData();
    else if (!authLoading) setLoading(false);
  }, [authLoading, organization, fetchData]);

  const handleInvite = async (email: string, role: string): Promise<{ error: string | null }> => {
    if (!organization?.id || !user?.id) return { error: 'Not authenticated' };
    const result = await inviteTeamMember(organization.id, email, role, user.id);
    if (!result.error) await fetchData();
    return { error: result.error };
  };

  const handleChangeRole = async (userId: string, role: 'admin' | 'editor' | 'viewer') => {
    const { error: err } = await updateMemberRole(userId, role);
    if (err) setError(err);
    else await fetchData();
  };

  const handleRemove = async (userId: string) => {
    const { error: err } = await removeMember(userId);
    if (err) setError(err);
    else await fetchData();
  };

  const handleCancelInvitation = async (id: string) => {
    const { error: err } = await cancelInvitation(id);
    if (err) setError(err);
    else await fetchData();
  };

  if (authLoading || loading) {
    return (
      <div className="flex-1 p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="h-8 w-48 bg-white/5 rounded-lg animate-pulse mb-6" />
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 py-3">
                <div className="w-10 h-10 rounded-full bg-white/5 animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 w-32 bg-white/5 rounded animate-pulse mb-1" />
                  <div className="h-3 w-48 bg-white/5 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="flex-1 p-6 md:p-8">
        <div className="max-w-4xl mx-auto text-center py-20">
          <p className="text-white/50">No organization found. Please complete onboarding.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Team</h1>
            <p className="text-white/50 text-sm mt-1">
              {members.length} member{members.length !== 1 ? 's' : ''} in {organization.name}
            </p>
          </div>
          {canManage && (
            <button
              onClick={() => setInviteOpen(true)}
              className="px-4 py-2.5 rounded-lg bg-[#3b82f6] text-white font-medium hover:bg-[#3b82f6]/80 transition-colors flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4-4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M19 8v6M22 11h-6" />
              </svg>
              Invite Member
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
            <button onClick={() => setError(null)} className="ml-2 text-red-300 hover:text-red-200">×</button>
          </div>
        )}

        {/* Members */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5">
            <h2 className="text-sm font-medium text-white/60 uppercase tracking-wider">Members</h2>
          </div>
          <div className="divide-y divide-white/5">
            {members.length === 0 ? (
              <div className="px-4 py-8 text-center text-white/40">No team members found.</div>
            ) : (
              members.map((member) => (
                <TeamMemberRow
                  key={member.id}
                  member={member}
                  currentUserId={user?.id ?? ''}
                  currentUserRole={profile?.role ?? 'viewer'}
                  onChangeRole={handleChangeRole}
                  onRemove={handleRemove}
                />
              ))
            )}
          </div>
        </div>

        {/* Pending Invitations */}
        {(invitations.length > 0 || canManage) && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-white/5">
              <h2 className="text-sm font-medium text-white/60 uppercase tracking-wider">
                Pending Invitations
                {invitations.length > 0 && (
                  <span className="ml-2 text-yellow-400/80">{invitations.length}</span>
                )}
              </h2>
            </div>
            <div className="divide-y divide-white/5">
              {invitations.length === 0 ? (
                <div className="px-4 py-8 text-center text-white/40">No pending invitations.</div>
              ) : (
                invitations.map((inv) => (
                  <InvitationRow
                    key={inv.id}
                    invitation={inv}
                    canManage={canManage}
                    onCancel={handleCancelInvitation}
                  />
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <InviteModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onInvite={handleInvite}
      />
    </div>
  );
}
