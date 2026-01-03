/**
 * ================================================================
 * SKELETON BASE COMPONENTS - BIZCONTROL 360 ERP
 * ================================================================
 * Base skeleton components reused across the app
 * ================================================================
 */

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'default' | 'text' | 'circular' | 'rounded';
}

export function Skeleton({ className, variant = 'default' }: SkeletonProps) {
  const baseStyles = 'animate-pulse bg-slate-200 dark:bg-slate-800';

  const variantStyles = {
    default: 'rounded-md',
    text: 'h-4 rounded w-full',
    circular: 'rounded-full',
    rounded: 'rounded-lg',
  };

  return (
    <div
      className={cn(baseStyles, variantStyles[variant], className)}
      role="status"
      aria-label="Loading..."
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

// Pre-built skeleton components

export function CardSkeleton() {
  return (
    <div className="border rounded-lg p-6 space-y-3">
      <Skeleton className="h-5 w-1/3" variant="text" />
      <Skeleton className="h-4 w-full" variant="text" />
      <Skeleton className="h-4 w-5/6" variant="text" />
      <Skeleton className="h-32 w-full" variant="rounded" />
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="border rounded-lg p-4 space-y-3">
          <Skeleton className="h-10 w-10 rounded-full" variant="circular" />
          <Skeleton className="h-4 w-full" variant="text" />
          <Skeleton className="h-8 w-2/3" variant="text" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="border-b bg-slate-50 dark:bg-slate-800/50 p-4">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4" variant="text" />
          ))}
        </div>
      </div>
      {/* Rows */}
      <div className="p-4 space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, j) => (
              <Skeleton key={j} className="h-4" variant="text" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border rounded-lg p-3 space-y-3">
          <Skeleton className="h-32 w-full" variant="rounded" />
          <Skeleton className="h-4 w-3/4" variant="text" />
          <Skeleton className="h-4 w-1/2" variant="text" />
        </div>
      ))}
    </div>
  );
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
          <Skeleton className="h-12 w-12 rounded-full" variant="circular" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" variant="text" />
            <Skeleton className="h-3 w-1/2" variant="text" />
          </div>
          <Skeleton className="h-10 w-20" variant="rounded" />
        </div>
      ))}
    </div>
  );
}
