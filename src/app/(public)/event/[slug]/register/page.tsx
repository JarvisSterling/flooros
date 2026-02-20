'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { z } from 'zod';

const supabase = createClient();

const registerSchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  contactEmail: z.string().email('Valid email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  description: z.string().optional(),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  category: z.string().optional(),
  acceptTerms: z.literal(true, { errorMap: () => ({ message: 'You must accept the terms' }) }),
});

type FormData = z.infer<typeof registerSchema>;

const CATEGORIES = [
  'Technology', 'Food & Beverage', 'Health & Wellness', 'Education',
  'Fashion', 'Entertainment', 'Services', 'Manufacturing', 'Other',
];

export default function ExhibitorRegisterPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [eventData, setEventData] = useState<{ id: string; name: string } | null>(null);
  const [form, setForm] = useState<Partial<FormData>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      // Fetch event
      const { data: event } = await supabase
        .from('events')
        .select('id, name')
        .eq('slug', slug)
        .maybeSingle();
      if (!event) { setLoading(false); return; }
      setEventData(event);

      // Check if already logged in as exhibitor
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: exhibitor } = await supabase
          .from('exhibitors')
          .select('id')
          .eq('user_id', user.id)
          .eq('event_id', event.id)
          .maybeSingle();
        if (exhibitor) {
          router.replace(`/exhibitor/${slug}`);
          return;
        }
      }
      setLoading(false);
    };
    init();
  }, [slug, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGlobalError('');

    const result = registerSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((i) => { fieldErrors[i.path[0] as string] = i.message; });
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    try {
      const val = result.data;

      // Check if user already exists / is logged in
      let userId: string;
      const { data: { user: existingUser } } = await supabase.auth.getUser();
      
      if (existingUser) {
        userId = existingUser.id;
      } else {
        // Sign up
        const { data: authData, error: authErr } = await supabase.auth.signUp({
          email: val.contactEmail,
          password: val.password,
        });
        if (authErr || !authData.user) {
          setGlobalError(authErr?.message ?? 'Failed to create account');
          setSubmitting(false);
          return;
        }
        userId = authData.user.id;
      }

      // Create exhibitor record
      const { error: exErr } = await supabase.from('exhibitors').insert({
        event_id: eventData!.id,
        user_id: userId,
        company_name: val.companyName,
        contact_email: val.contactEmail,
        description: val.description ?? null,
        website: val.website || null,
        category: val.category || null,
        tags: [],
        social_links: {},
      });

      if (exErr) {
        setGlobalError(exErr.message);
        setSubmitting(false);
        return;
      }

      router.push(`/exhibitor/${slug}`);
    } catch {
      setGlobalError('An unexpected error occurred');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <p className="text-gray-400 text-lg">Event not found</p>
      </div>
    );
  }

  const field = (key: keyof FormData, label: string, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={(form[key] as string) ?? ''}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      {errors[key] && <p className="text-red-400 text-xs mt-1">{errors[key]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Become an Exhibitor</h1>
          <p className="text-gray-400">Register for <span className="text-blue-400 font-semibold">{eventData.name}</span></p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 space-y-5">
          {globalError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
              {globalError}
            </div>
          )}

          {field('companyName', 'Company Name', 'text', 'Acme Corp')}
          {field('contactEmail', 'Email', 'email', 'hello@company.com')}
          {field('password', 'Password', 'password', '••••••••')}
          {field('description', 'Company Description', 'text', 'Brief description of your company')}
          {field('website', 'Website', 'url', 'https://company.com')}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
            <select
              value={form.category ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a category</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.acceptTerms === true}
              onChange={(e) => setForm((f) => ({ ...f, acceptTerms: e.target.checked as true }))}
              className="mt-1 h-4 w-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-400">
              I accept the <a href="#" className="text-blue-400 hover:underline">terms and conditions</a> for exhibitors
            </span>
          </label>
          {errors.acceptTerms && <p className="text-red-400 text-xs">{errors.acceptTerms}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
          >
            {submitting ? 'Registering...' : 'Register as Exhibitor'}
          </button>
        </form>
      </div>
    </div>
  );
}
