import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: { value: number; positive: boolean };
}

export default function StatCard({ icon: Icon, label, value, trend }: StatCardProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/[0.07]">
      <div className="flex items-center justify-between">
        <div className="rounded-lg bg-blue-500/10 p-2.5">
          <Icon className="h-5 w-5 text-blue-400" />
        </div>
        {trend && (
          <span
            className={cn(
              'text-xs font-medium',
              trend.positive ? 'text-emerald-400' : 'text-red-400'
            )}
          >
            {trend.positive ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="mt-1 text-sm text-white/60">{label}</p>
      </div>
    </div>
  );
}
