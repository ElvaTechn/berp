import { ReactElement } from 'react';

interface MobileScrollWrapperProps {
  children: ReactElement;
  isMobile: boolean;
  itemCount?: number;
  showIndicator?: boolean;
}

export function MobileScrollWrapper({
  children,
  isMobile,
  itemCount = 0,
  showIndicator = true
}: MobileScrollWrapperProps) {
  const needsScroll = isMobile && (showIndicator && itemCount > 3);

  return (
    <>
      {needsScroll && (
        <div className="flex justify-center mb-2 px-4">
          <span className="neu-text-caption text-[var(--neu-text-muted)] text-sm">
            ← Deslize para mais →
          </span>
        </div>
      )}
      <div className={isMobile ? '-mx-4 sm:mx-0' : ''}>
        {children}
      </div>
      {isMobile && <div className="px-4"></div>}
    </>
  );
}
