import { useState, useEffect } from 'react';

type Orientation = 'portrait' | 'landscape' | 'unknown';

export function useOrientation() {
  const [orientation, setOrientation] = useState<Orientation>('unknown');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(orientation: portrait)');

    const handleChange = (e: MediaQueryListEvent) => {
      setOrientation(e.matches ? 'portrait' : 'landscape');
    };

    setOrientation(mediaQuery.matches ? 'portrait' : 'landscape');

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return orientation;
}
