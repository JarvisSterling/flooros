import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export interface ExhibitorProfile {
  id: string;
  event_id: string;
  user_id: string;
  company_name: string;
  description: string | null;
  logo_url: string | null;
  website: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  social_links: Record<string, string>;
  category: string | null;
  tags: string[];
  created_at: string;
}

export interface AvailableBooth {
  id: string;
  object_id: string;
  floor_id: string | null;
  event_id: string;
  booth_number: string;
  name: string | null;
  status: string;
  size_category: string | null;
  price: number | null;
  category: string | null;
}

export interface BoothReservation {
  id: string;
  booth_id: string;
  exhibitor_id: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  reserved_at: string;
  confirmed_at: string | null;
  payment_id: string | null;
  booth?: AvailableBooth;
}

export async function getExhibitorProfile(
  userId: string,
  eventId: string
): Promise<{ data: ExhibitorProfile | null; error: string | null }> {
  const { data, error } = await supabase
    .from('exhibitors')
    .select('*')
    .eq('user_id', userId)
    .eq('event_id', eventId)
    .maybeSingle();
  return { data, error: error?.message ?? null };
}

export async function getExhibitorBySlug(
  userId: string,
  eventSlug: string
): Promise<{ data: ExhibitorProfile | null; eventId: string | null; error: string | null }> {
  const { data: event } = await supabase
    .from('events')
    .select('id')
    .eq('slug', eventSlug)
    .maybeSingle();
  if (!event) return { data: null, eventId: null, error: 'Event not found' };
  const { data, error } = await supabase
    .from('exhibitors')
    .select('*')
    .eq('user_id', userId)
    .eq('event_id', event.id)
    .maybeSingle();
  return { data, eventId: event.id, error: error?.message ?? null };
}

export async function updateExhibitorProfile(
  exhibitorId: string,
  data: Partial<Omit<ExhibitorProfile, 'id' | 'event_id' | 'user_id' | 'created_at'>>
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('exhibitors')
    .update(data)
    .eq('id', exhibitorId);
  return { error: error?.message ?? null };
}

export async function getAvailableBooths(
  eventId: string
): Promise<{ data: AvailableBooth[]; error: string | null }> {
  const { data, error } = await supabase
    .from('booths')
    .select('id, object_id, floor_id, event_id, booth_number, name, status, size_category, price, category')
    .eq('event_id', eventId)
    .eq('status', 'available');
  return { data: data ?? [], error: error?.message ?? null };
}

export async function getAllBooths(
  eventId: string
): Promise<{ data: AvailableBooth[]; error: string | null }> {
  const { data, error } = await supabase
    .from('booths')
    .select('id, object_id, floor_id, event_id, booth_number, name, status, size_category, price, category')
    .eq('event_id', eventId);
  return { data: data ?? [], error: error?.message ?? null };
}

export async function reserveBooth(
  boothId: string,
  exhibitorId: string
): Promise<{ data: BoothReservation | null; error: string | null }> {
  // Check booth is still available
  const { data: booth } = await supabase
    .from('booths')
    .select('status')
    .eq('id', boothId)
    .single();
  if (!booth || booth.status !== 'available') {
    return { data: null, error: 'Booth is no longer available' };
  }

  // Create reservation
  const { data, error } = await supabase
    .from('booth_reservations')
    .insert({
      booth_id: boothId,
      exhibitor_id: exhibitorId,
      status: 'pending',
      reserved_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) return { data: null, error: error.message };

  // Update booth status
  await supabase
    .from('booths')
    .update({ status: 'reserved' })
    .eq('id', boothId);

  return { data, error: null };
}

export async function getMyReservation(
  exhibitorId: string
): Promise<{ data: BoothReservation | null; error: string | null }> {
  const { data, error } = await supabase
    .from('booth_reservations')
    .select(`*, booths ( id, object_id, floor_id, event_id, booth_number, name, status, size_category, price, category )`)
    .eq('exhibitor_id', exhibitorId)
    .in('status', ['pending', 'confirmed'])
    .order('reserved_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) return { data: null, error: error.message };
  if (!data) return { data: null, error: null };
  return {
    data: {
      ...data,
      booth: (data as Record<string, unknown>).booths as AvailableBooth | undefined,
    } as BoothReservation,
    error: null,
  };
}

export async function getExhibitorAnalytics(
  exhibitorId: string
): Promise<{ profileViews: number; directionRequests: number; bookmarks: number }> {
  const counts = { profileViews: 0, directionRequests: 0, bookmarks: 0 };
  
  const { count: views } = await supabase
    .from('analytics_events')
    .select('*', { count: 'exact', head: true })
    .eq('exhibitor_id', exhibitorId)
    .eq('event_type', 'profile_view');
  counts.profileViews = views ?? 0;

  const { count: directions } = await supabase
    .from('analytics_events')
    .select('*', { count: 'exact', head: true })
    .eq('exhibitor_id', exhibitorId)
    .eq('event_type', 'direction_request');
  counts.directionRequests = directions ?? 0;

  const { count: bmarks } = await supabase
    .from('analytics_events')
    .select('*', { count: 'exact', head: true })
    .eq('exhibitor_id', exhibitorId)
    .eq('event_type', 'bookmark');
  counts.bookmarks = bmarks ?? 0;

  return counts;
}

export async function uploadExhibitorLogo(
  file: File
): Promise<{ url: string | null; error: string | null }> {
  const ext = file.name.split('.').pop();
  const path = `exhibitor-logos/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from('public-assets')
    .upload(path, file, { upsert: true });
  if (error) return { url: null, error: error.message };
  const { data } = supabase.storage.from('public-assets').getPublicUrl(path);
  return { url: data.publicUrl, error: null };
}

export async function getPendingReservations(
  eventId: string
): Promise<{ data: Array<BoothReservation & { exhibitor?: ExhibitorProfile }>; error: string | null }> {
  const { data, error } = await supabase
    .from('booth_reservations')
    .select(`*, booths!inner ( id, object_id, floor_id, event_id, booth_number, name, status, size_category, price, category ), exhibitors ( * )`)
    .eq('booths.event_id', eventId)
    .eq('status', 'pending')
    .order('reserved_at', { ascending: true });
  if (error) return { data: [], error: error.message };
  return {
    data: (data ?? []).map((r: Record<string, unknown>) => ({
      ...r,
      booth: r.booths as AvailableBooth | undefined,
      exhibitor: r.exhibitors as ExhibitorProfile | undefined,
    })) as Array<BoothReservation & { exhibitor?: ExhibitorProfile }>,
    error: null,
  };
}

export async function approveReservation(
  reservationId: string
): Promise<{ error: string | null }> {
  const { data: res, error: fetchErr } = await supabase
    .from('booth_reservations')
    .select('booth_id, exhibitor_id')
    .eq('id', reservationId)
    .single();
  if (fetchErr || !res) return { error: fetchErr?.message ?? 'Not found' };

  const { error } = await supabase
    .from('booth_reservations')
    .update({ status: 'confirmed', confirmed_at: new Date().toISOString() })
    .eq('id', reservationId);
  if (error) return { error: error.message };

  await supabase
    .from('booths')
    .update({ status: 'sold', exhibitor_id: res.exhibitor_id })
    .eq('id', res.booth_id);

  return { error: null };
}

export async function rejectReservation(
  reservationId: string
): Promise<{ error: string | null }> {
  const { data: res, error: fetchErr } = await supabase
    .from('booth_reservations')
    .select('booth_id')
    .eq('id', reservationId)
    .single();
  if (fetchErr || !res) return { error: fetchErr?.message ?? 'Not found' };

  const { error } = await supabase
    .from('booth_reservations')
    .update({ status: 'cancelled' })
    .eq('id', reservationId);
  if (error) return { error: error.message };

  await supabase
    .from('booths')
    .update({ status: 'available' })
    .eq('id', res.booth_id);

  return { error: null };
}
