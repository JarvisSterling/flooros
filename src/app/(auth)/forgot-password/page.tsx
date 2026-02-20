'use client';

import { useState } from 'react';
import Link from 'next/link';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';

const schema = z.object({ email: z.string().email('Invalid email address') });

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = schema.safeParse({ email });
    if (!parsed.success) { setError(parsed.error.errors[0].message); return; }
    setLoading(true);
    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    });
    if (resetError) { setError(resetError.message); setLoading(false); return; }
    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl text-center">
        <div className="text-4xl mb-4">✉️</div>
        <h2 className="text-xl font-semibold text-white mb-2">Check your email</h2>
        <p className="text-white/50 text-sm">If an account exists for <span className="text-white font-medium">{email}</span>, you&apos;ll receive a reset link.</p>
        <Link href="/login" className="mt-6 inline-block text-sm text-blue-400 hover:text-blue-300 transition">Back to login</Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl">
      <h2 className="text-xl font-semibold text-white mb-2">Reset your password</h2>
      <p className="text-sm text-white/50 mb-6">Enter your email and we&apos;ll send you a reset link.</p>

      {error && (
        <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-1">Email</label>
          <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-white/30 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="you@example.com" required />
        </div>
        <button type="submit" disabled={loading}
          className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? 'Sending...' : 'Send reset link'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-white/50">
        <Link href="/login" className="text-blue-400 hover:text-blue-300 transition">Back to login</Link>
      </p>
    </div>
  );
}
