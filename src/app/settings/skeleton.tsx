/**
 * ================================================================
 * SETTINGS PAGE SKELETON - BIZCONTROL 360 ERP
 * ================================================================
 */

import { Skeleton } from '@/components/ui/skeleton';

export function SettingsPageSkeleton() {
  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-10 w-48" variant="text" />
        <Skeleton className="h-5 w-96" variant="text" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Info Card */}
          <div className="border rounded-lg p-6 space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" variant="text" />
              <Skeleton className="h-4 w-64" variant="text" />
            </div>

            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" variant="text" />
                  <Skeleton className="h-10 w-full" variant="rounded" />
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-4">
              <Skeleton className="h-10 w-32 rounded-lg" variant="rounded" />
              <Skeleton className="h-10 w-24 rounded-lg" variant="rounded" />
            </div>
          </div>

          {/* Employee Info Card */}
          <div className="border rounded-lg p-6 space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" variant="text" />
              <Skeleton className="h-4 w-64" variant="text" />
            </div>

            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" variant="text" />
                  <Skeleton className="h-10 w-full" variant="rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar/Stats */}
        <div className="space-y-6">
          {/* Stats Card */}
          <div className="border rounded-lg p-4 space-y-4">
            <Skeleton className="h-5 w-28" variant="text" />
            
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-20" variant="text" />
                  <Skeleton className="h-6 w-16 rounded-md" variant="rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Subscription Info */}
          <div className="border rounded-lg p-4 space-y-3">
            <Skeleton className="h-5 w-32" variant="text" />
            <Skeleton className="h-4 w-60" variant="text" />
            <Skeleton className="h-8 w-full rounded-lg" variant="rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
