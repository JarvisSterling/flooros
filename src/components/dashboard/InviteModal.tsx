'use client';

import { useState } from 'react';
import { z } from 'zod';

const inviteSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['admin', 'editor', 'viewer'], { required_error: 'Please select a role' }),
});

interface InviteModalProps {
  open: boolean;
  onClose: () => void;
  onInvite: (email: string, role: string) => Promise<{ error: string | null }>;
}

export default function InviteModal({ open, onClose, onInvite }: InviteModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'editor' | 'viewer'>('viewer');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const result = inviteSchema.safeParse({ email, role });
    if (!result.success) {
      setError(result.error.errors[0]?.message ?? "Invalid input");
      return;
    }

    setLoading(true);
    const { error: inviteError } = await onInvite(result.data.email, result.data.role);
    setLoading(false);

    if (inviteError) {
      setError(inviteError);
    } else {
      setSuccess(true);
      setEmail('');
      setRole('viewer');
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    }
  };

  const handleClose = () => {
    setEmail('');
    setRole('viewer');
    setError(null);
    setSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0f0f23]/95 backdrop-blur-xl shadow-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Invite Team Member</h2>
            <button
              onClick={handleClose}
              className="p-1 rounded-md hover:bg-white/10 text-white/50 hover:text-white transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-white/60 mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@company.com"
                className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#3b82f6]/50 focus:ring-1 focus:ring-[#3b82f6]/25 transition-colors"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-1.5">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'admin' | 'editor' | 'viewer')}
                className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#3b82f6]/50 focus:ring-1 focus:ring-[#3b82f6]/25 transition-colors appearance-none cursor-pointer"
              >
                <option value="admin" className="bg-[#1a1a2e]">Admin — Full access</option>
                <option value="editor" className="bg-[#1a1a2e]">Editor — Edit events & plans</option>
                <option value="viewer" className="bg-[#1a1a2e]">Viewer — View only</option>
              </select>
            </div>

            {error && (
              <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                Invitation sent successfully!
              </div>
            )}

            <p className="text-xs text-white/30">
              Note: Email delivery will be available in a future update. The invitation will be recorded.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || success}
                className="flex-1 px-4 py-2.5 rounded-lg bg-[#3b82f6] text-white font-medium hover:bg-[#3b82f6]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : success ? 'Sent!' : 'Send Invite'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
