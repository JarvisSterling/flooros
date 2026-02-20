'use client';

import { trackEvent } from '@/lib/api/analytics';

const DEBOUNCE_MS = 5000;
const recentEvents = new Map<string, number>();

function getVisitorId(): string {
  if (typeof window === 'undefined') return 'ssr';
  let id = localStorage.getItem('flooros_visitor_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('flooros_visitor_id', id);
  }
  return id;
}

function isDuplicate(key: string): boolean {
  const now = Date.now();
  const last = recentEvents.get(key);
  if (last && now - last < DEBOUNCE_MS) return true;
  recentEvents.set(key, now);
  // Clean old entries
  if (recentEvents.size > 100) {
    for (const [k, v] of recentEvents) {
      if (now - v > DEBOUNCE_MS * 2) recentEvents.delete(k);
    }
  }
  return false;
}

export function trackPageView(eventId: string): void {
  const key = `view:${eventId}`;
  if (isDuplicate(key)) return;
  trackEvent(eventId, null, 'view', {}, getVisitorId()).catch(() => {});
}

export function trackBoothClick(eventId: string, boothId: string): void {
  const key = `click:${eventId}:${boothId}`;
  if (isDuplicate(key)) return;
  trackEvent(eventId, boothId, 'click', {}, getVisitorId()).catch(() => {});
}

export function trackDirectionRequest(eventId: string, boothId: string): void {
  const key = `direction:${eventId}:${boothId}`;
  if (isDuplicate(key)) return;
  trackEvent(eventId, boothId, 'direction', {}, getVisitorId()).catch(() => {});
}

export function trackBookmark(eventId: string, boothId: string): void {
  const key = `bookmark:${eventId}:${boothId}`;
  if (isDuplicate(key)) return;
  trackEvent(eventId, boothId, 'bookmark', {}, getVisitorId()).catch(() => {});
}
