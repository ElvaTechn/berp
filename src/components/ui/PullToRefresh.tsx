/**
 * ================================================================
 * PullToRefresh Component - BIZCONTROL 360 ERP
 * ================================================================
 * Visual component for pull-to-refresh indicator.
 * Works with usePullToRefresh hook.
 * ================================================================
 */

"use client";

import { ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PullToRefreshProps {
    /** Whether currently refreshing */
    isRefreshing: boolean;
    /** Pull progress (0-1) */
    pullProgress: number;
    /** Pull distance in pixels */
    pullDistance: number;
    /** Children content */
    children: ReactNode;
    /** Optional className for container */
    className?: string;
}

export function PullToRefresh({
    isRefreshing,
    pullProgress,
    pullDistance,
    children,
    className,
}: PullToRefreshProps) {
    const showIndicator = pullDistance > 10 || isRefreshing;

    return (
        <div className={cn("relative", className)}>
            {/* Pull Indicator */}
            <div
                className={cn(
                    "absolute left-0 right-0 flex items-center justify-center transition-all duration-200 z-10",
                    "pointer-events-none"
                )}
                style={{
                    top: 0,
                    height: pullDistance,
                    opacity: showIndicator ? 1 : 0,
                }}
            >
                <div
                    className={cn(
                        "flex items-center justify-center w-10 h-10 rounded-full",
                        "bg-blue-600 dark:bg-blue-500 text-white shadow-lg",
                        "transition-transform duration-200"
                    )}
                    style={{
                        transform: `scale(${Math.min(pullProgress, 1)}) rotate(${pullProgress * 360}deg)`,
                    }}
                >
                    <RefreshCw
                        className={cn(
                            "w-5 h-5",
                            isRefreshing && "animate-spin"
                        )}
                    />
                </div>
            </div>

            {/* Content with transform */}
            <div
                className="transition-transform duration-200"
                style={{
                    transform: `translateY(${pullDistance}px)`,
                }}
            >
                {children}
            </div>
        </div>
    );
}

/**
 * Example usage:
 * 
 * function ProductList() {
 *   const { containerRef, isRefreshing, pullProgress, pullDistance } = usePullToRefresh(
 *     async () => {
 *       await refetchProducts();
 *     }
 *   );
 * 
 *   return (
 *     <div ref={containerRef} className="overflow-y-auto">
 *       <PullToRefresh
 *         isRefreshing={isRefreshing}
 *         pullProgress={pullProgress}
 *         pullDistance={pullDistance}
 *       >
 *         {products.map(...)}
 *       </PullToRefresh>
 *     </div>
 *   );
 * }
 */
