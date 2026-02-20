'use client';

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  draft: { label: 'Draft', color: '#6b7280', bg: 'rgba(107,114,128,0.15)' },
  published: { label: 'Published', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
  live: { label: 'Live', color: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
  archived: { label: 'Archived', color: '#eab308', bg: 'rgba(234,179,8,0.15)' },
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.draft;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${className}`}
      style={{ color: config.color, backgroundColor: config.bg }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: config.color }}
      />
      {config.label}
    </span>
  );
}
