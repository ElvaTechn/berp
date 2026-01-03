/**
 * ================================================================
 * SALES PAGE SKELETON - BIZCONTROL 360 ERP
 * ================================================================
 */

import { Skeleton } from '@/components/ui/skeleton';

export function SalesPageSkeleton() {
  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start space-y-3">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" variant="text" />
          <Skeleton className="h-5 w-96" variant="text" />
        </div>
        <Skeleton className="h-10 w-32 rounded-lg" variant="rounded" />
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <Skeleton className="h-10 flex-1 rounded-lg" variant="rounded" />
        <Skeleton className="h-10 w-40 rounded-lg" variant="rounded" />
      </div>

      {/* Sales List */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="border rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div className="flex gap-3">
                <Skeleton className="h-10 w-10 rounded-full" variant="circular" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-48" variant="text" />
                  <Skeleton className="h-4 w-64" variant="text" />
                </div>
              </div>
              <Skeleton className="h-6 w-16 rounded-md" variant="rounded" />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-3 border-t">
              <div className="space-y-1">
                <Skeleton className="h-3 w-20" variant="text" />
                <Skeleton className="h-4 w-32" variant="text" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-3 w-20" variant="text" />
                <Skeleton className="h-4 w-32" variant="text" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
