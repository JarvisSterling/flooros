interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  rounded?: 'sm' | 'md' | 'lg' | 'full' | 'xl';
  className?: string;
}

const roundedMap = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  full: 'rounded-full',
};

export default function Skeleton({
  width,
  height = 16,
  rounded = 'md',
  className = '',
}: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-white/10 ${roundedMap[rounded]} ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    />
  );
}
