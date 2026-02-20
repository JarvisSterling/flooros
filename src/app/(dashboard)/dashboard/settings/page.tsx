'use client';

import { useState } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { createClient } from '@/lib/supabase/client';
import { Settings, Upload, AlertTriangle, Trash2 } from 'lucide-react';

export default function SettingsPage() {
  const { organization, refreshProfile } = useAuth();
  const [orgName, setOrgName] = useState(organization?.name || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleSave = async () => {
    if (!organization) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from('organizations').update({ name: orgName }).eq('id', organization.id);
    await refreshProfile();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!organization || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    const supabase = createClient();
    const path = `org-logos/${organization.id}/${file.name}`;
    const { error } = await supabase.storage.from('assets').upload(path, file, { upsert: true });
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from('assets').getPublicUrl(path);
      await supabase.from('organizations').update({ logo_url: publicUrl }).eq('id', organization.id);
      await refreshProfile();
    }
  };

  const handleDelete = async () => {
    if (!organization || deleteConfirm !== organization.name) return;
    setDeleting(true);
    const supabase = createClient();
    await supabase.from('organizations').delete().eq('id', organization.id);
    window.location.href = '/';
  };

  if (!organization) {
    return (
      <div className="flex items-center justify-center py-32">
        <p className="text-white/50">No organization found.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="h-6 w-6" /> Organization Settings
        </h2>
        <p className="mt-1 text-white/60">Manage your organization details.</p>
      </div>

      {/* General */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4">
        <h3 className="text-lg font-semibold text-white">General</h3>
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Organization Name</label>
          <input
            type="text"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Logo</label>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white transition hover:bg-white/10">
            <Upload className="h-4 w-4" /> Upload Logo
            <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
          </label>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-blue-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-600 disabled:opacity-50"
        >
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Danger Zone */}
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 space-y-4">
        <h3 className="text-lg font-semibold text-red-400 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" /> Danger Zone
        </h3>
        <p className="text-sm text-white/60">
          Deleting your organization will permanently remove all events, booths, and data. This cannot be undone.
        </p>
        {!showDelete ? (
          <button
            onClick={() => setShowDelete(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 px-4 py-2 text-sm text-red-400 transition hover:bg-red-500/10"
          >
            <Trash2 className="h-4 w-4" /> Delete Organization
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-white/70">
              Type <strong className="text-white">{organization.name}</strong> to confirm:
            </p>
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              className="w-full rounded-lg border border-red-500/30 bg-white/5 px-4 py-2.5 text-white outline-none"
              placeholder="Type organization name..."
            />
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={deleteConfirm !== organization.name || deleting}
                className="rounded-lg bg-red-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-600 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Permanently Delete'}
              </button>
              <button
                onClick={() => { setShowDelete(false); setDeleteConfirm(''); }}
                className="rounded-lg border border-white/10 px-5 py-2.5 text-sm text-white transition hover:bg-white/5"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
