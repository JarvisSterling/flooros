'use client';

import { useState } from 'react';
import { useExhibitor } from '../../../layout';
import ProfileForm from '@/components/exhibitor/ProfileForm';
import { updateExhibitorProfile, uploadExhibitorLogo } from '@/lib/api/exhibitor';

export default function ProfilePage() {
  const { exhibitor } = useExhibitor();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (data: Record<string, unknown>, logoFile?: File) => {
    setSaving(true);
    setError('');
    setSaved(false);

    try {
      let logoUrl = data.logo_url as string | null;

      if (logoFile) {
        const { url, error: upErr } = await uploadExhibitorLogo(logoFile);
        if (upErr) { setError(upErr); setSaving(false); return; }
        logoUrl = url;
      }

      const { error: saveErr } = await updateExhibitorProfile(exhibitor.id, {
        company_name: data.company_name as string,
        description: (data.description as string) || null,
        logo_url: logoUrl,
        website: (data.website as string) || null,
        contact_email: (data.contact_email as string) || null,
        contact_phone: (data.contact_phone as string) || null,
        social_links: (data.social_links as Record<string, string>) ?? {},
        category: (data.category as string) || null,
        tags: (data.tags as string[]) ?? [],
      });

      if (saveErr) { setError(saveErr); setSaving(false); return; }
      setSaved(true);
    } catch {
      setError('Failed to save profile');
    }
    setSaving(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Edit Profile</h1>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm mb-4">{error}</div>
      )}
      {saved && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-green-400 text-sm mb-4">Profile saved successfully!</div>
      )}

      <ProfileForm
        exhibitor={exhibitor}
        onSave={handleSave}
        saving={saving}
      />
    </div>
  );
}
