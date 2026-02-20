'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';

const orgSchema = z.object({
  name: z.string().min(2, 'Organization name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
});

const profileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
});

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [orgName, setOrgName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!slugEdited) setSlug(slugify(orgName));
  }, [orgName, slugEdited]);

  async function handleStep1(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = orgSchema.safeParse({ name: orgName, slug });
    if (!parsed.success) { setError(parsed.error.errors[0].message); return; }
    setStep(2);
  }

  async function handleStep2(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = profileSchema.safeParse({ fullName });
    if (!parsed.success) { setError(parsed.error.errors[0].message); return; }

    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError('Not authenticated'); setLoading(false); return; }

    // Create organization
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({ name: orgName, slug, created_by: user.id })
      .select()
      .single();

    if (orgError) {
      setError(orgError.message.includes('duplicate') ? 'That slug is already taken. Go back and choose another.' : orgError.message);
      setLoading(false);
      return;
    }

    // Upsert user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert({ id: user.id, full_name: fullName, org_id: org.id, role: 'owner' as const });

    if (profileError) { setError(profileError.message); setLoading(false); return; }

    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl">
      {/* Steps indicator */}
      <div className="flex items-center gap-3 mb-8">
        {[1, 2].map(s => (
          <div key={s} className="flex items-center gap-2">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition ${
              step >= s ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/40'
            }`}>{s}</div>
            {s < 2 && <div className={`h-px w-12 ${step > s ? 'bg-blue-500' : 'bg-white/10'}`} />}
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">{error}</div>
      )}

      {step === 1 && (
        <form onSubmit={handleStep1} className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Create your organization</h2>
          <p className="text-sm text-white/50">This is your team or company workspace.</p>
          <div>
            <label htmlFor="orgName" className="block text-sm font-medium text-white/70 mb-1">Organization name</label>
            <input id="orgName" type="text" value={orgName} onChange={e => setOrgName(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-white/30 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Acme Events" required />
          </div>
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-white/70 mb-1">URL slug</label>
            <div className="flex items-center rounded-lg border border-white/10 bg-white/5 overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
              <span className="px-3 text-sm text-white/30">flooros.app/</span>
              <input id="slug" type="text" value={slug}
                onChange={e => { setSlug(e.target.value); setSlugEdited(true); }}
                className="flex-1 bg-transparent px-2 py-2.5 text-white outline-none"
                required />
            </div>
          </div>
          <button type="submit"
            className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500">
            Continue
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleStep2} className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Your profile</h2>
          <p className="text-sm text-white/50">Tell us a bit about yourself.</p>
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-white/70 mb-1">Full name</label>
            <input id="fullName" type="text" value={fullName} onChange={e => setFullName(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-white/30 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Jane Doe" required />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => { setStep(1); setError(null); }}
              className="flex-1 rounded-lg border border-white/10 py-2.5 text-sm font-medium text-white transition hover:bg-white/5">
              Back
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Setting up...' : 'Complete setup'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
