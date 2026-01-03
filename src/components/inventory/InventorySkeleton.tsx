/**
 * ================================================================
 * INVENTORY SKELETON LOADING - BIZCONTROL 360 ERP
 * ================================================================
 * Skeleton components for Inventory page
 * ================================================================
 */

import { Skeleton, StatsSkeleton, TableSkeleton } from '@/components/ui/skeleton';

export function InventorySkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" variant="text" />
          <Skeleton className="h-4 w-64" variant="text" />
        </div>
        <Skeleton className="h-10 w-48" variant="rounded" />
      </div>

      {/* Stats Cards */}
      <StatsSkeleton />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Skeleton className="h-10 flex-1" variant="rounded" />
        <Skeleton className="h-10 w-full sm:w-48" variant="rounded" />
      </div>

      {/* Table */}
      <TableSkeleton rows={10} columns={6} />
    </div>
  );
}
