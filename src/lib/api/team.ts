import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database';

type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
type TeamInvitation = Database['public']['Tables']['team_invitations']['Row'];

const supabase = createClient();

export async function getTeamMembers(orgId: string): Promise<{ data: UserProfile[]; error: string | null }> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('org_id', orgId)
    .order('created_at', { ascending: true });

  if (error) return { data: [], error: error.message };
  return { data: data ?? [], error: null };
}

export async function getPendingInvitations(orgId: string): Promise<{ data: TeamInvitation[]; error: string | null }> {
  const { data, error } = await supabase
    .from('team_invitations')
    .select('*')
    .eq('org_id', orgId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) return { data: [], error: error.message };
  return { data: data ?? [], error: null };
}

export async function inviteTeamMember(
  orgId: string,
  email: string,
  role: string,
  invitedBy: string
): Promise<{ data: TeamInvitation | null; error: string | null }> {
  // Check if already invited
  const { data: existing } = await supabase
    .from('team_invitations')
    .select('id')
    .eq('org_id', orgId)
    .eq('email', email)
    .eq('status', 'pending')
    .single();

  if (existing) {
    return { data: null, error: 'This email has already been invited' };
  }

  // Check if already a member
  const { data: existingMember } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('org_id', orgId)
    .ilike('id', email) // Note: we can't check email from user_profiles directly
    .single();

  const { data, error } = await supabase
    .from('team_invitations')
    .insert({
      org_id: orgId,
      email,
      role,
      invited_by: invitedBy,
      status: 'pending',
    })
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function updateMemberRole(
  userId: string,
  role: 'admin' | 'editor' | 'viewer'
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('user_profiles')
    .update({ role })
    .eq('id', userId);

  return { error: error?.message ?? null };
}

export async function removeMember(userId: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('user_profiles')
    .update({ org_id: null, role: 'viewer' })
    .eq('id', userId);

  return { error: error?.message ?? null };
}

export async function cancelInvitation(invitationId: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('team_invitations')
    .delete()
    .eq('id', invitationId);

  return { error: error?.message ?? null };
}
