'use client';

import { useState, useRef } from 'react';
import { z } from 'zod';
import type { ExhibitorProfile } from '@/lib/api/exhibitor';

const profileSchema = z.object({
  company_name: z.string().min(2, 'Company name is required'),
  description: z.string().optional(),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  contact_email: z.string().email('Valid email required').optional().or(z.literal('')),
  contact_phone: z.string().optional(),
  category: z.string().optional(),
  tags: z.string().optional(),
  social_twitter: z.string().optional(),
  social_linkedin: z.string().optional(),
  social_instagram: z.string().optional(),
});

const CATEGORIES = [
  'Technology', 'Food & Beverage', 'Health & Wellness', 'Education',
  'Fashion', 'Entertainment', 'Services', 'Manufacturing', 'Other',
];

interface Props {
  exhibitor: ExhibitorProfile;
  onSave: (data: Record<string, unknown>, logoFile?: File) => void;
  saving: boolean;
}

export default function ProfileForm({ exhibitor, onSave, saving }: Props) {
  const [form, setForm] = useState({
    company_name: exhibitor.company_name,
    description: exhibitor.description ?? '',
    website: exhibitor.website ?? '',
    contact_email: exhibitor.contact_email ?? '',
    contact_phone: exhibitor.contact_phone ?? '',
    category: exhibitor.category ?? '',
    tags: (exhibitor.tags ?? []).join(', '),
    social_twitter: exhibitor.social_links?.twitter ?? '',
    social_linkedin: exhibitor.social_links?.linkedin ?? '',
    social_instagram: exhibitor.social_links?.instagram ?? '',
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(exhibitor.logo_url);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const result = profileSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((i) => { fieldErrors[i.path[0] as string] = i.message; });
      setErrors(fieldErrors);
      return;
    }

    const socialLinks: Record<string, string> = {};
    if (form.social_twitter) socialLinks.twitter = form.social_twitter;
    if (form.social_linkedin) socialLinks.linkedin = form.social_linkedin;
    if (form.social_instagram) socialLinks.instagram = form.social_instagram;

    onSave(
      {
        company_name: form.company_name,
        description: form.description,
        logo_url: exhibitor.logo_url,
        website: form.website,
        contact_email: form.contact_email,
        contact_phone: form.contact_phone,
        social_links: socialLinks,
        category: form.category,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      },
      logoFile ?? undefined,
    );
  };

  const field = (key: string, label: string, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={(form as Record<string, string>)[key] ?? ''}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {errors[key] && <p className="text-red-400 text-xs mt-1">{errors[key]}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-2xl space-y-5">
      {/* Logo Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Logo</label>
        <div className="flex items-center gap-4">
          {logoPreview ? (
            <img src={logoPreview} alt="Logo" className="w-16 h-16 rounded-lg object-cover border border-white/10" />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-white/10 flex items-center justify-center text-gray-500 text-2xl">🏢</div>
          )}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-sm text-white transition-colors"
          >
            Upload Logo
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
        </div>
      </div>

      {field('company_name', 'Company Name', 'text', 'Acme Corp')}

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          rows={4}
          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Tell visitors about your company..."
        />
      </div>

      {field('website', 'Website', 'url', 'https://company.com')}
      {field('contact_email', 'Contact Email', 'email', 'hello@company.com')}
      {field('contact_phone', 'Contact Phone', 'tel', '+1 234 567 8900')}

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
        <select
          value={form.category}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select a category</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {field('tags', 'Tags (comma separated)', 'text', 'AI, SaaS, B2B')}

      <div className="border-t border-white/10 pt-5">
        <p className="text-sm font-medium text-gray-300 mb-3">Social Links</p>
        {field('social_twitter', 'Twitter/X', 'url', 'https://x.com/company')}
        {field('social_linkedin', 'LinkedIn', 'url', 'https://linkedin.com/company/...')}
        {field('social_instagram', 'Instagram', 'url', 'https://instagram.com/company')}
      </div>

      <button
        type="submit"
        disabled={saving}
        className="px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
      >
        {saving ? 'Saving...' : 'Save Profile'}
      </button>
    </form>
  );
}
