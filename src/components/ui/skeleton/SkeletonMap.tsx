/**
 * ================================================================
 * SKELETON MAP - BIZCONTROL 360 ERP
 * ================================================================
 * Mapeia rotas para skeletons específicos.
 * Uso com Suspense para loading states uniformes.
 *
 * EXEMPLO:
 * import { Suspense } from 'react';
 * import { getSkeletonForPath } from '@/components/ui/skeleton/SkeletonMap';
 *
 * export default function Page() {
 *   const skeleton = getSkeletonForPath('/dashboard');
 *   return (
 *     <Suspense fallback={skeleton}>
 *       <ActualContent />
 *     </Suspense>
 *   );
 * }
 * ================================================================
 */

import { DefaultSkeleton } from './DefaultSkeleton';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { POSSkeleton } from '@/app/pos/skeleton';
import { InventorySkeleton } from '@/components/inventory/InventorySkeleton';
import { EmployeesSkeleton } from '@/components/employees/EmployeesSkeleton';
import { SalesPageSkeleton } from '@/app/sales/skeleton';
import { SettingsPageSkeleton } from '@/app/settings/skeleton';
import { ReservationsPageSkeleton } from '@/app/reservations/skeleton';

// Skeleton components
export const SkeletonComponents = {
  Default: DefaultSkeleton,
  Dashboard: DashboardSkeleton,
  POS: POSSkeleton,
  Inventory: InventorySkeleton,
  Employees: EmployeesSkeleton,
  Sales: SalesPageSkeleton,
  Settings: SettingsPageSkeleton,
  Reservations: ReservationsPageSkeleton,
};

/**
 * Skeleton mapping for routes
 */
const skeletonRouteMap: Record<string, React.ReactNode> = {
  // Dashboard
  '/dashboard': <SkeletonComponents.Dashboard />,
  '/vendedor/dashboard': <SkeletonComponents.Dashboard />,

  // POS / Sales
  '/pos': <SkeletonComponents.POS />,
  '/sales/pos': <SkeletonComponents.POS />,
  '/vendas/nova': <SkeletonComponents.POS />,

  // Inventory
  '/inventory': <SkeletonComponents.Inventory />,
  '/products': <SkeletonComponents.Inventory />,
  '/produtos': <SkeletonComponents.Inventory />,

  // Employees
  '/funcionarios': <SkeletonComponents.Employees />,
  '/team': <SkeletonComponents.Employees />,
  '/vendedor/team': <SkeletonComponents.Employees />,

  // Sales
  '/sales': <SkeletonComponents.Sales />,

  // Settings
  '/settings': <SkeletonComponents.Settings />,
  '/admin/settings': <SkeletonComponents.Settings />,

  // Reservations
  '/reservations': <SkeletonComponents.Reservations />,

  // Default fallback
  '/': <SkeletonComponents.Dashboard />,
};

/**
 * Gets skeleton component for a given route path
 */
export function getSkeletonForPath(path: string): React.ReactNode {
  // Try exact match first
  if (skeletonRouteMap[path]) {
    return skeletonRouteMap[path];
  }

  // Try prefix match (for dynamic routes)
  const matchedKey = Object.keys(skeletonRouteMap).find(key =>
    path.startsWith(key) || key.startsWith(path)
  );

  return matchedKey ? skeletonRouteMap[matchedKey] : <SkeletonComponents.Default />;
}

/**
 * Gets skeleton component by name (for explicit usage)
 */
export function getSkeletonByName(name: keyof typeof SkeletonComponents): React.ReactNode {
  const Component = SkeletonComponents[name];
  return Component ? <Component /> : <SkeletonComponents.Default />;
}

/**
 * All available skeleton names
 */
export type SkeletonName = keyof typeof SkeletonComponents;
export const availableSkeletons: SkeletonName[] = Object.keys(SkeletonComponents) as SkeletonName[];
