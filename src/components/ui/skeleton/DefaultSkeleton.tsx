/**
 * ================================================================
 * DEFAULT SKELETON - BIZCONTROL 360 ERP
 * ================================================================
 * Skeleton loading padrão para páginas sem skeleton específico
 * Uso como fallback global
 * ================================================================
 */

import { Skeleton, CardSkeleton, StatsSkeleton, TableSkeleton } from './Skeleton';

export function DefaultSkeleton() {
  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="space-y-3">
        <Skeleton className="h-10 w-64" variant="text" />
        <Skeleton className="h-5 w-96" variant="text" />
      </div>

      {/* Stats Row */}
      <StatsSkeleton />

      {/* Main Content Area */}
      <div className="space-y-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}

/**
 * Simple page skeleton (minimal)
 */
export function SimplePageSkeleton() {
  return (
    <div className="p-4 md:p-6 space-y-4 max-w-7xl mx-auto">
      <Skeleton className="h-9 w-64" variant="text" />
      <Skeleton className="h-64 w-full" variant="rounded" />
    </div>
  );
}

/**
 * Loading spinner skeleton for page transitions
 */
export function PageLoaderSkeleton() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center space-y-4">
        <Skeleton className="h-12 w-12 rounded-full mx-auto" variant="circular" />
        <Skeleton className="h-6 w-48 mx-auto" variant="text" />
      </div>
    </div>
  );
}
