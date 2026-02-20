import type { BoothStatus } from '@/types/database';

export const BOOTH_STATUS_COLORS: Record<BoothStatus, string> = {
  available: '#4CAF50',
  reserved: '#FFD700',
  sold: '#2196F3',
  blocked: '#9E9E9E',
  premium: '#FF9800',
};

export const BOOTH_STATUS_BORDER: Record<BoothStatus, string> = {
  available: '#388E3C',
  reserved: '#FFC107',
  sold: '#1976D2',
  blocked: '#757575',
  premium: '#F57C00',
};

export const BOOTH_STATUS_LABELS: Record<BoothStatus, string> = {
  available: 'Available',
  reserved: 'Reserved',
  sold: 'Sold',
  blocked: 'Blocked',
  premium: 'Premium',
};

export function generateBoothNumber(existingNumbers: string[]): string {
  let num = 1;
  while (existingNumbers.includes('B' + String(num).padStart(3, '0'))) {
    num++;
  }
  return 'B' + String(num).padStart(3, '0');
}
