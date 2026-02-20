import type { BoothStatus } from '@/types/database';

export type SizeCategory = 'small' | 'medium' | 'large' | 'xl';

export const BOOTH_STATUS_COLORS: Record<BoothStatus, string> = {
  available: 'rgba(34, 197, 94, 0.2)',
  reserved: 'rgba(234, 179, 8, 0.2)',
  sold: 'rgba(59, 130, 246, 0.2)',
  blocked: 'rgba(239, 68, 68, 0.2)',
  premium: 'rgba(249, 115, 22, 0.2)',
};

export const BOOTH_STATUS_BORDER: Record<BoothStatus, string> = {
  available: '#22c55e',
  reserved: '#eab308',
  sold: '#3b82f6',
  blocked: '#ef4444',
  premium: '#f97316',
};

export const BOOTH_STATUS_LABELS: Record<BoothStatus, string> = {
  available: 'Available',
  reserved: 'Reserved',
  sold: 'Sold',
  blocked: 'Blocked',
  premium: 'Premium',
};

export const SIZE_CATEGORY_LABELS: Record<SizeCategory, string> = {
  small: 'Small',
  medium: 'Medium',
  large: 'Large',
  xl: 'XL',
};

export function generateBoothNumber(existingNumbers: string[], floorNumber?: number): string {
  const prefix = floorNumber != null ? `F${floorNumber}-` : 'B';
  let num = 1;
  while (existingNumbers.includes(prefix + String(num).padStart(3, '0'))) {
    num++;
  }
  return prefix + String(num).padStart(3, '0');
}
