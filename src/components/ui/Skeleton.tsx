interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-white/5 ${className}`}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-surface-card-dark border border-border-dark rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <Skeleton className="h-5 w-48 mb-2" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
      <div className="flex items-center gap-3 mt-4">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
