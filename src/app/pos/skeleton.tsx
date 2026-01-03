/**
 * ================================================================
 * POS SKELETON LOADING - BIZCONTROL 360 ERP
 * ================================================================
 * Skeleton components specifically for Point of Sale page
 * ================================================================
 */

import { Skeleton, ProductGridSkeleton, StatsSkeleton } from '@/components/ui/skeleton';

export function POSSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" variant="text" />
          <Skeleton className="h-4 w-64" variant="text" />
        </div>
        <div className="flex items-center gap-4">
          <div className="h-8 w-24 rounded-full bg-slate-200 animate-pulse" />
        </div>
      </div>

      {/* Stats Row */}
      <StatsSkeleton />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products Grid */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search and Filter */}
          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-10 w-full" variant="rounded" />
              </div>
              <Skeleton className="h-10 w-full sm:w-48" variant="rounded" />
            </div>
          </div>

          {/* Product Cards */}
          <ProductGridSkeleton count={12} />
        </div>

        {/* Cart Sidebar */}
        <div className="lg:col-span-1">
          <div className="border rounded-lg shadow-lg sticky top-4">
            {/* Header */}
            <div className="border-b p-4">
              <Skeleton className="h-6 w-32" variant="text" />
            </div>

            {/* Cart Items */}
            <div className="p-4 space-y-3">
              <div className="space-y-3 max-h-[300px] overflow-hidden">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" variant="text" />
                      <Skeleton className="h-3 w-1/2" variant="text" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-8 w-8" variant="rounded" />
                      <Skeleton className="h-8 w-8" variant="rounded" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-16" variant="text" />
                  <Skeleton className="h-6 w-24" variant="text" />
                </div>
              </div>

              {/* Checkout Button */}
              <Skeleton className="h-12 w-full" variant="rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Offline Notice */}
      <div className="border-2 rounded-lg p-4 bg-yellow-50 dark:bg-yellow-900/20">
        <div className="flex items-start gap-3">
          <Skeleton className="h-5 w-5 rounded-full" variant="circular" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-1/3" variant="text" />
            <Skeleton className="h-4 w-full" variant="text" />
            <Skeleton className="h-4 w-full" variant="text" />
          </div>
        </div>
      </div>
    </div>
  );
}
