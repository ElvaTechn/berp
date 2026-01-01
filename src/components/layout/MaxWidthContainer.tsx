/**
 * ================================================================
 * MAX WIDTH CONTAINER - Layout Component
 * ================================================================
 * Prevents content from being too wide on large screens
 * Provides optimal reading width (80-100 characters per line)
 * ================================================================
 */

import * as React from "react";
import { cn } from "@/lib/utils";

interface MaxWidthContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  children: React.ReactNode;
}

/**
 * MaxWidthContainer Component
 * 
 * Sizes:
 * - sm: 640px (mobile content, narrow forms)
 * - md: 768px (tablets, medium content)
 * - lg: 1024px (laptops, wide content)
 * - xl: 1280px (desktops, dashboards) - DEFAULT
 * - 2xl: 1536px (large desktops, data tables)
 * - full: 100% (no max-width)
 * 
 * Usage:
 * <MaxWidthContainer size="xl">
 *   <YourContent />
 * </MaxWidthContainer>
 */
export function MaxWidthContainer({ 
  size = 'xl', 
  className, 
  children,
  ...props 
}: MaxWidthContainerProps) {
  const maxWidthClasses = {
    sm: 'max-w-screen-sm',   // 640px
    md: 'max-w-screen-md',   // 768px
    lg: 'max-w-screen-lg',   // 1024px
    xl: 'max-w-screen-xl',   // 1280px
    '2xl': 'max-w-screen-2xl', // 1536px
    full: 'max-w-full'       // No limit
  };

  return (
    <div
      className={cn(
        'w-full mx-auto',
        maxWidthClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
