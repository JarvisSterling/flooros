import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database';

type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
type TeamInvitation = Database['public']['Tables']['team_invitations']['Row'];

const supabase = createClient();

// M3: Permission check helper — only owner/admin can mutate team
async function checkPermission(orgId: string): Promise<{ error: string | null }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role, org_id')
    .eq('id', user.id)
    .single();

  if (!profile || profile.org_id !== orgId) return { error: 'Access denied' };
  if (profile.role !== 'owner' && profile.role !== 'admin') return { error: 'Insufficient permissions: owner or admin role required' };

  return { error: null };
}

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
  // M3: Check permissions
  const permCheck = await checkPermission(orgId);
  if (permCheck.error) return { data: null, error: permCheck.error };

  // m5: Validate role
  const validRoles = ['admin', 'editor', 'viewer'];
  if (!validRoles.includes(role)) {
    return { data: null, error: 'Invalid role. Must be admin, editor, or viewer.' };
  }

  // M4: Check for existing pending invite with same email + org
  const { data: existingInvite } = await supabase
    .from('team_invitations')
    .select('id')
    .eq('org_id', orgId)
    .eq('email', email)
    .eq('status', 'pending')
    .single();

  if (existingInvite) {
    return { data: null, error: 'This email has already been invited' };
  }

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

// B3: Require orgId, verify target belongs to same org
export async function updateMemberRole(
  userId: string,
  orgId: string,
  role: 'admin' | 'editor' | 'viewer'
): Promise<{ error: string | null }> {
  // M3: Check permissions
  const permCheck = await checkPermission(orgId);
  if (permCheck.error) return { error: permCheck.error };

  // B3: Verify target user belongs to this org
  const { data: target } = await supabase
    .from('user_profiles')
    .select('org_id, role')
    .eq('id', userId)
    .single();

  if (!target || target.org_id !== orgId) return { error: 'User does not belong to this organization' };
  if (target.role === 'owner') return { error: 'Cannot change the owner\'s role' };

  const { error } = await supabase
    .from('user_profiles')
    .update({ role })
    .eq('id', userId)
    .eq('org_id', orgId);

  return { error: error?.message ?? null };
}

// B3: Require orgId, verify target belongs to same org
export async function removeMember(userId: string, orgId: string): Promise<{ error: string | null }> {
  // M3: Check permissions
  const permCheck = await checkPermission(orgId);
  if (permCheck.error) return { error: permCheck.error };

  // B3: Verify target user belongs to this org
  const { data: target } = await supabase
    .from('user_profiles')
    .select('org_id, role')
    .eq('id', userId)
    .single();

  if (!target || target.org_id !== orgId) return { error: 'User does not belong to this organization' };
  if (target.role === 'owner') return { error: 'Cannot remove the owner' };

  const { error } = await supabase
    .from('user_profiles')
    .update({ org_id: null, role: 'viewer' })
    .eq('id', userId)
    .eq('org_id', orgId);

  return { error: error?.message ?? null };
}

// B4: Require orgId for org-scoping
export async function cancelInvitation(invitationId: string, orgId: string): Promise<{ error: string | null }> {
  // M3: Check permissions
  const permCheck = await checkPermission(orgId);
  if (permCheck.error) return { error: permCheck.error };

  const { error } = await supabase
    .from('team_invitations')
    .delete()
    .eq('id', invitationId)
    .eq('org_id', orgId);

  return { error: error?.message ?? null };
}
