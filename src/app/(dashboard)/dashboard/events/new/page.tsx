'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import { createEvent, generateSlug } from '@/lib/api/events';
import { z } from 'zod';

const eventSchema = z.object({
  name: z.string().min(1, 'Event name is required').max(100),
  slug: z.string().min(1, 'Slug is required').max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only'),
  description: z.string().max(2000).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  venue: z.string().max(200).optional(),
});

type FormData = z.infer<typeof eventSchema>;
type FormErrors = Partial<Record<keyof FormData, string>>;

export default function CreateEventPage() {
  const router = useRouter();
  const { organization } = useAuth();
  const [form, setForm] = useState<FormData>({
    name: '',
    slug: '',
    description: '',
    start_date: '',
    end_date: '',
    venue: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [slugManual, setSlugManual] = useState(false);

  useEffect(() => {
    if (!slugManual) {
      setForm((prev) => ({ ...prev, slug: generateSlug(prev.name) }));
    }
  }, [form.name, slugManual]);

  const handleChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    if (field === 'slug') setSlugManual(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const result = eventSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof FormData;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    if (!organization) {
      setSubmitError('No organization found');
      return;
    }

    setSubmitting(true);
    const { data, error } = await createEvent({
      org_id: organization.id,
      name: form.name,
      slug: form.slug,
      description: form.description || null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      venue: form.venue || null,
      status: 'draft',
    });

    if (error) {
      setSubmitError(error);
      setSubmitting(false);
      return;
    }

    if (data) {
      router.push('/dashboard/events/' + data.id);
    }
  };

  const inputClass = 'w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
  const labelClass = 'block text-sm font-medium text-white/70 mb-1.5';
  const errorClass = 'text-red-400 text-xs mt-1';

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => router.push('/dashboard/events')}
          className="text-white/40 hover:text-white text-sm flex items-center gap-1 mb-4 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Events
        </button>
        <h1 className="text-2xl font-bold text-white">Create Event</h1>
        <p className="text-white/40 text-sm mt-1">Set up a new event for your organization</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 space-y-5">
          <div>
            <label className={labelClass}>Event Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="My Awesome Event"
              className={inputClass}
            />
            {errors.name && <p className={errorClass}>{errors.name}</p>}
          </div>

          <div>
            <label className={labelClass}>Slug *</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => handleChange('slug', e.target.value)}
              placeholder="my-awesome-event"
              className={inputClass}
            />
            {errors.slug && <p className={errorClass}>{errors.slug}</p>}
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe your event..."
              rows={4}
              className={inputClass + ' resize-none'}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Start Date</label>
              <input
                type="date"
                value={form.start_date}
                onChange={(e) => handleChange('start_date', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>End Date</label>
              <input
                type="date"
                value={form.end_date}
                onChange={(e) => handleChange('end_date', e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Venue</label>
            <input
              type="text"
              value={form.venue}
              onChange={(e) => handleChange('venue', e.target.value)}
              placeholder="Convention Center, City"
              className={inputClass}
            />
          </div>
        </div>

        {submitError && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3">
            <p className="text-red-400 text-sm">{submitError}</p>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push('/dashboard/events')}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {submitting ? 'Creating...' : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  );
}
