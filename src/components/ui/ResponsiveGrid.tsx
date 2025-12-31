import { ReactNode } from 'react';

interface ResponsiveGridProps {
  children: ReactNode;
  className?: string;
  cols?: {
    mobile?: 1 | 2;
    tablet?: 1 | 2 | 3;
    desktop?: 2 | 3 | 4 | 5 | 6;
  };
  gap?: string;
}

export function ResponsiveGrid({
  children,
  className = '',
  cols,
  gap = 'gap-3 sm:gap-4 lg:gap-6',
}: ResponsiveGridProps) {
  const mobileCols = cols?.mobile ?? 1;
  const tabletCols = cols?.tablet ?? 2;
  const desktopCols = cols?.desktop ?? 4;

  return (
    <div
      className={`
        grid
        grid-cols-${mobileCols}
        sm:grid-cols-${tabletCols}
        lg:grid-cols-${desktopCols}
        ${gap}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      {children}
    </div>
  );
}
