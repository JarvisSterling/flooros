'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import { getEvent, updateEvent, deleteEvent, duplicateEvent, generateSlug } from '@/lib/api/events';
import type { EventWithCounts } from '@/lib/api/events';
import StatusBadge from '@/components/dashboard/StatusBadge';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { z } from 'zod';

// M1: TODO — Add server actions for server-side validation. Currently relies on RLS for protection.
const eventSchema = z.object({
  name: z.string().min(1, 'Required').max(100),
  slug: z.string().min(1, 'Required').regex(/^[a-z0-9-]+$/, 'Lowercase with hyphens only'),
  description: z.string().max(2000).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  venue: z.string().max(200).optional(),
});

type Tab = 'overview' | 'settings' | 'floorplans' | 'exhibitors';
type FormErrors = Partial<Record<string, string>>;

const statusTransitions: Record<string, { next: string; label: string; color: string }> = {
  draft: { next: 'published', label: 'Publish', color: 'bg-blue-600 hover:bg-blue-700' },
  published: { next: 'live', label: 'Go Live', color: 'bg-green-600 hover:bg-green-700' },
  live: { next: 'archived', label: 'Archive', color: 'bg-yellow-600 hover:bg-yellow-700' },
};

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;
  const { organization, profile } = useAuth();

  // M2: Role-based access
  const userRole = profile?.role ?? 'viewer';
  const canEdit = userRole === 'owner' || userRole === 'admin' || userRole === 'editor';
  const canDelete = userRole === 'owner' || userRole === 'admin';

  const [event, setEvent] = useState<EventWithCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('overview');

  // Settings form state
  const [form, setForm] = useState({ name: '', slug: '', description: '', start_date: '', end_date: '', venue: '' });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  // Modals
  const [showDelete, setShowDelete] = useState(false);
  const [showStatusChange, setShowStatusChange] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const orgId = organization?.id;

  const loadEvent = useCallback(async () => {
    if (!orgId) return;
    const { data, error: err } = await getEvent(eventId, orgId);
    if (err || !data) {
      setError(err || 'Event not found');
      setLoading(false);
      return;
    }
    setEvent(data);
    setForm({
      name: data.name,
      slug: data.slug,
      description: data.description || '',
      start_date: data.start_date || '',
      end_date: data.end_date || '',
      venue: data.venue || '',
    });
    setLoading(false);
  }, [eventId, orgId]);

  useEffect(() => { loadEvent(); }, [loadEvent]);

  const handleSave = async () => {
    if (!orgId) return;
    const result = eventSchema.safeParse(form);
    if (!result.success) {
      const errs: FormErrors = {};
      result.error.errors.forEach((e) => { errs[e.path[0] as string] = e.message; });
      setFormErrors(errs);
      return;
    }
    // m2: Date validation
    if (form.start_date && form.end_date && form.end_date < form.start_date) {
      setFormErrors({ end_date: 'End date must be on or after start date' });
      return;
    }
    setSaving(true);
    setSaveMsg(null);
    const { error: err } = await updateEvent(eventId, orgId, {
      name: form.name,
      slug: form.slug,
      description: form.description || null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      venue: form.venue || null,
    });
    if (err) setSaveMsg('Error: ' + err);
    else { setSaveMsg('Saved!'); await loadEvent(); }
    setSaving(false);
    setTimeout(() => setSaveMsg(null), 3000);
  };

  const handleStatusChange = async () => {
    if (!event || !orgId) return;
    const transition = statusTransitions[event.status];
    if (!transition) return;
    const { error: err } = await updateEvent(eventId, orgId, { status: transition.next as 'draft' | 'published' | 'live' | 'archived' });
    if (!err) await loadEvent();
    setShowStatusChange(false);
  };

  const handleDelete = async () => {
    if (!orgId) return;
    setDeleting(true);
    const { error: err } = await deleteEvent(eventId, orgId);
    if (!err) router.push('/dashboard/events');
    setDeleting(false);
    setShowDelete(false);
  };

  const handleDuplicate = async () => {
    if (!orgId) return;
    const { data } = await duplicateEvent(eventId, orgId);
    if (data) router.push('/dashboard/events/' + data.id);
  };

  const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—';

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 w-48 bg-white/10 rounded-lg animate-pulse" />
        <div className="h-64 bg-white/5 border border-white/10 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center">
          <p className="text-red-400">{error || 'Event not found'}</p>
          <button onClick={() => router.push('/dashboard/events')} className="text-blue-400 text-sm mt-2 hover:underline">Back to Events</button>
        </div>
      </div>
    );
  }

  const transition = statusTransitions[event.status];
  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'settings', label: 'Settings' },
    { key: 'floorplans', label: 'Floor Plans' },
    { key: 'exhibitors', label: 'Exhibitors' },
  ];

  const inputClass = 'w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button onClick={() => router.push('/dashboard/events')} className="text-white/40 hover:text-white text-sm flex items-center gap-1 mb-3 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Events
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">{event.name}</h1>
            <StatusBadge status={event.status} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* M2: Only show status change for editors+ */}
          {transition && canEdit && (
            <button onClick={() => setShowStatusChange(true)} className={`px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors ${transition.color}`}>
              {transition.label}
            </button>
          )}
          {canEdit && (
            <button onClick={handleDuplicate} className="px-3 py-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg text-sm transition-colors">
              Duplicate
            </button>
          )}
          {/* M2: Only owners/admins can delete */}
          {canDelete && (
            <button onClick={() => setShowDelete(true)} className="px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg text-sm transition-colors">
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/10">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t.key ? 'text-white border-blue-500' : 'text-white/40 border-transparent hover:text-white/70'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 rounded-xl border border-white/10 bg-white/5 p-6 space-y-4">
            <h2 className="text-white font-semibold">Event Details</h2>
            {event.description && <p className="text-white/60 text-sm">{event.description}</p>}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-white/40">Start Date</span><p className="text-white mt-0.5">{formatDate(event.start_date)}</p></div>
              <div><span className="text-white/40">End Date</span><p className="text-white mt-0.5">{formatDate(event.end_date)}</p></div>
              <div><span className="text-white/40">Venue</span><p className="text-white mt-0.5">{event.venue || '—'}</p></div>
              <div><span className="text-white/40">Slug</span><p className="text-white mt-0.5">{event.slug}</p></div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <p className="text-white/40 text-xs font-medium uppercase tracking-wider">Booths</p>
              <p className="text-3xl font-bold text-white mt-1">{event.booth_count ?? 0}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <p className="text-white/40 text-xs font-medium uppercase tracking-wider">Status</p>
              <div className="mt-2"><StatusBadge status={event.status} /></div>
            </div>
          </div>
        </div>
      )}

      {tab === 'settings' && (
        <div className="max-w-2xl rounded-xl border border-white/10 bg-white/5 p-6 space-y-5">
          {!canEdit && (
            <div className="px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm">
              You have view-only access. Contact an admin to make changes.
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">Event Name *</label>
            <input type="text" value={form.name} disabled={!canEdit} onChange={(e) => { setForm(f => ({ ...f, name: e.target.value })); setFormErrors(fe => ({ ...fe, name: undefined })); }} className={inputClass + (!canEdit ? ' opacity-50 cursor-not-allowed' : '')} />
            {formErrors.name && <p className="text-red-400 text-xs mt-1">{formErrors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">Slug *</label>
            <input type="text" value={form.slug} disabled={!canEdit} onChange={(e) => { setForm(f => ({ ...f, slug: e.target.value })); setFormErrors(fe => ({ ...fe, slug: undefined })); }} className={inputClass + (!canEdit ? ' opacity-50 cursor-not-allowed' : '')} />
            {formErrors.slug && <p className="text-red-400 text-xs mt-1">{formErrors.slug}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">Description</label>
            <textarea value={form.description} disabled={!canEdit} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} rows={4} className={inputClass + ' resize-none' + (!canEdit ? ' opacity-50 cursor-not-allowed' : '')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Start Date</label>
              <input type="date" value={form.start_date} disabled={!canEdit} onChange={(e) => setForm(f => ({ ...f, start_date: e.target.value }))} className={inputClass + (!canEdit ? ' opacity-50 cursor-not-allowed' : '')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">End Date</label>
              <input type="date" value={form.end_date} disabled={!canEdit} onChange={(e) => setForm(f => ({ ...f, end_date: e.target.value }))} className={inputClass + (!canEdit ? ' opacity-50 cursor-not-allowed' : '')} />
              {formErrors.end_date && <p className="text-red-400 text-xs mt-1">{formErrors.end_date}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">Venue</label>
            <input type="text" value={form.venue} disabled={!canEdit} onChange={(e) => setForm(f => ({ ...f, venue: e.target.value }))} className={inputClass + (!canEdit ? ' opacity-50 cursor-not-allowed' : '')} />
          </div>
          {canEdit && (
            <div className="flex items-center gap-3 pt-2">
              <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              {saveMsg && <span className={`text-sm ${saveMsg.startsWith('Error') ? 'text-red-400' : 'text-green-400'}`}>{saveMsg}</span>}
            </div>
          )}
        </div>
      )}

      {tab === 'floorplans' && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-12 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
          </div>
          <h3 className="text-white font-medium mb-1">Floor Plans</h3>
          <p className="text-white/40 text-sm">Floor plan management coming soon</p>
        </div>
      )}

      {tab === 'exhibitors' && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-12 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </div>
          <h3 className="text-white font-medium mb-1">Exhibitors</h3>
          <p className="text-white/40 text-sm">Exhibitor management coming soon</p>
        </div>
      )}

      {/* Modals */}
      <ConfirmModal
        open={showDelete}
        title="Delete Event"
        message={`Are you sure you want to delete "${event.name}"? This action cannot be undone.`}
        confirmLabel={deleting ? 'Deleting...' : 'Delete'}
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
      <ConfirmModal
        open={showStatusChange}
        title={`${transition?.label || 'Change Status'}`}
        message={`Change event status from "${event.status}" to "${transition?.next || ''}"?`}
        confirmLabel={transition?.label || 'Confirm'}
        onConfirm={handleStatusChange}
        onCancel={() => setShowStatusChange(false)}
      />
    </div>
  );
}
