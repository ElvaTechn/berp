/**
 * ================================================================
 * usePullToRefresh Hook - BIZCONTROL 360 ERP
 * ================================================================
 * Provides pull-to-refresh functionality for mobile lists.
 * Detects touch gestures and triggers refresh callback.
 * ================================================================
 */

import { useState, useRef, useCallback, useEffect } from 'react';

interface UsePullToRefreshOptions {
    /** Minimum pull distance to trigger refresh (default: 80px) */
    threshold?: number;
    /** Maximum pull distance allowed (default: 150px) */
    maxPull?: number;
    /** Whether the feature is enabled (default: true) */
    enabled?: boolean;
}

interface UsePullToRefreshReturn {
    /** Ref to attach to the scrollable container */
    containerRef: React.RefObject<HTMLDivElement | null>;
    /** Whether currently refreshing */
    isRefreshing: boolean;
    /** Current pull distance (0-1 normalized progress) */
    pullProgress: number;
    /** Raw pull distance in pixels */
    pullDistance: number;
}

export function usePullToRefresh(
    onRefresh: () => Promise<void>,
    options: UsePullToRefreshOptions = {}
): UsePullToRefreshReturn {
    const { threshold = 80, maxPull = 150, enabled = true } = options;

    const containerRef = useRef<HTMLDivElement>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);

    const startY = useRef(0);
    const currentY = useRef(0);
    const isPulling = useRef(false);

    const handleTouchStart = useCallback(
        (e: TouchEvent) => {
            if (!enabled || isRefreshing) return;

            const container = containerRef.current;
            if (!container) return;

            // Only start pull if scrolled to top
            if (container.scrollTop <= 0) {
                startY.current = e.touches[0].clientY;
                isPulling.current = true;
            }
        },
        [enabled, isRefreshing]
    );

    const handleTouchMove = useCallback(
        (e: TouchEvent) => {
            if (!isPulling.current || !enabled || isRefreshing) return;

            currentY.current = e.touches[0].clientY;
            const diff = currentY.current - startY.current;

            if (diff > 0) {
                // Apply resistance - pull gets harder as you go
                const resistance = 0.5;
                const adjustedDiff = Math.min(diff * resistance, maxPull);
                setPullDistance(adjustedDiff);

                // Prevent default scroll when pulling
                if (adjustedDiff > 10) {
                    e.preventDefault();
                }
            }
        },
        [enabled, isRefreshing, maxPull]
    );

    const handleTouchEnd = useCallback(async () => {
        if (!isPulling.current || !enabled) return;

        isPulling.current = false;

        if (pullDistance >= threshold && !isRefreshing) {
            setIsRefreshing(true);
            setPullDistance(threshold); // Keep at threshold during refresh

            try {
                await onRefresh();
            } finally {
                setIsRefreshing(false);
                setPullDistance(0);
            }
        } else {
            setPullDistance(0);
        }
    }, [enabled, isRefreshing, onRefresh, pullDistance, threshold]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container || !enabled) return;

        container.addEventListener('touchstart', handleTouchStart, { passive: true });
        container.addEventListener('touchmove', handleTouchMove, { passive: false });
        container.addEventListener('touchend', handleTouchEnd);

        return () => {
            container.removeEventListener('touchstart', handleTouchStart);
            container.removeEventListener('touchmove', handleTouchMove);
            container.removeEventListener('touchend', handleTouchEnd);
        };
    }, [enabled, handleTouchStart, handleTouchMove, handleTouchEnd]);

    return {
        containerRef,
        isRefreshing,
        pullProgress: Math.min(pullDistance / threshold, 1),
        pullDistance,
    };
}
