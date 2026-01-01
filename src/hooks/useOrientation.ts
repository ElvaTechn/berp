/**
 * ================================================================
 * useOrientation Hook
 * ================================================================
 * Detects device orientation (portrait/landscape)
 * Updates on orientation change
 * ================================================================
 */

import { useState, useEffect } from 'react';

type Orientation = 'portrait' | 'landscape';

export function useOrientation(): Orientation {
  const [orientation, setOrientation] = useState<Orientation>('portrait');

  useEffect(() => {
    // Check if window is available (SSR safety)
    if (typeof window === 'undefined') return;

    const updateOrientation = () => {
      // Use matchMedia for more reliable orientation detection
      const isLandscape = window.matchMedia('(orientation: landscape)').matches;
      setOrientation(isLandscape ? 'landscape' : 'portrait');
    };

    // Set initial orientation
    updateOrientation();

    // Listen for orientation changes
    const mediaQuery = window.matchMedia('(orientation: landscape)');
    
    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', updateOrientation);
    } else {
      // Fallback for older browsers
      window.addEventListener('orientationchange', updateOrientation);
      window.addEventListener('resize', updateOrientation);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', updateOrientation);
      } else {
        window.removeEventListener('orientationchange', updateOrientation);
        window.removeEventListener('resize', updateOrientation);
      }
    };
  }, []);

  return orientation;
}

/**
 * Hook to detect if device is mobile + landscape (critical for UI)
 */
export function useIsMobileLandscape(): boolean {
  const [isMobileLandscape, setIsMobileLandscape] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkMobileLandscape = () => {
      const isLandscape = window.matchMedia('(orientation: landscape)').matches;
      const isMobile = window.innerWidth < 768; // < md breakpoint
      setIsMobileLandscape(isLandscape && isMobile);
    };

    checkMobileLandscape();

    const landscapeQuery = window.matchMedia('(orientation: landscape)');
    const mobileQuery = window.matchMedia('(max-width: 767px)');

    if (landscapeQuery.addEventListener) {
      landscapeQuery.addEventListener('change', checkMobileLandscape);
      mobileQuery.addEventListener('change', checkMobileLandscape);
    } else {
      window.addEventListener('orientationchange', checkMobileLandscape);
      window.addEventListener('resize', checkMobileLandscape);
    }

    return () => {
      if (landscapeQuery.removeEventListener) {
        landscapeQuery.removeEventListener('change', checkMobileLandscape);
        mobileQuery.removeEventListener('change', checkMobileLandscape);
      } else {
        window.removeEventListener('orientationchange', checkMobileLandscape);
        window.removeEventListener('resize', checkMobileLandscape);
      }
    };
  }, []);

  return isMobileLandscape;
}
