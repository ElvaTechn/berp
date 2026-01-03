/**
 * ================================================================
 * EMPLOYEES SKELETON LOADING - BIZCONTROL 360 ERP
 * ================================================================
 * Skeleton components for Employees/Team page
 * ================================================================
 */

import { Skeleton, StatsSkeleton } from '@/components/ui/skeleton';

export function EmployeesSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" variant="text" />
          <Skeleton className="h-4 w-64" variant="text" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10" variant="rounded" />
          <Skeleton className="h-10 w-48" variant="rounded" />
        </div>
      </div>

      {/* Search Bar */}
      <Skeleton className="h-10 w-full" variant="rounded" />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10" variant="rounded" />
              <Skeleton className="h-4 w-20" variant="text" />
            </div>
            <Skeleton className="h-8 w-16" variant="text" />
          </div>
        ))}
      </div>

      {/* Employee Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="border rounded-lg overflow-hidden">
            <Skeleton className="h-2 w-full" />
            <div className="p-5 space-y-4">
              {/* Avatar and Name */}
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" variant="circular" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" variant="text" />
                  <Skeleton className="h-6 w-20" variant="rounded" />
                </div>
              </div>

              {/* Info */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" variant="text" />
                <Skeleton className="h-4 w-3/4" variant="text" />
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Skeleton className="h-9 flex-1" variant="rounded" />
                <Skeleton className="h-9 w-12" variant="rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
