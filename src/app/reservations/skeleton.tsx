/**
 * ================================================================
 * RESERVATIONS PAGE SKELETON - BIZCONTROL 360 ERP
 * ================================================================
 */

import { Skeleton } from '@/components/ui/skeleton';

export function ReservationsPageSkeleton() {
  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center space-y-3">
        <div className="space-y-2">
          <Skeleton className="h-10 w-48" variant="text" />
          <Skeleton className="h-5 w-64" variant="text" />
        </div>
        <Skeleton className="h-10 w-40 rounded-lg" variant="rounded" />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="border rounded-lg p-4 space-y-3">
            <Skeleton className="h-8 w-8 rounded-full" variant="circular" />
            <Skeleton className="h-7 w-16" variant="text" />
            <Skeleton className="h-4 w-24" variant="text" />
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <Skeleton className="h-10 flex-1 rounded-lg" variant="rounded" />
        <Skeleton className="h-10 w-40 rounded-lg" variant="rounded" />
        <Skeleton className="h-10 w-24 rounded-lg" variant="rounded" />
      </div>

      {/* Reservations List */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="border rounded-lg p-4 space-y-3">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" variant="circular" />
                  <div>
                    <Skeleton className="h-5 w-48" variant="text" />
                    <Skeleton className="h-4 w-32" variant="text" />
                  </div>
                </div>
              </div>
              <Skeleton className="h-6 w-20 rounded-md" variant="rounded" />
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t">
              <div className="space-y-1">
                <Skeleton className="h-3 w-16" variant="text" />
                <Skeleton className="h-4 w-32" variant="text" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-3 w-20" variant="text" />
                <Skeleton className="h-4 w-28" variant="text" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-3 w-14" variant="text" />
                <Skeleton className="h-4 w-24" variant="text" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-3 w-16" variant="text" />
                <Skeleton className="h-4 w-20" variant="text" />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-9 w-24 rounded-lg" variant="rounded" />
              <Skeleton className="h-9 w-24 rounded-lg" variant="rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
