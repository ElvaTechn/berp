import * as React from "react";
import { cn } from "@/lib/utils";

/* =================================================================
   NEU BADGE - Neumorphic Badge Component
   
   Variants:
   - convex: Raised badge (default)
   - concave: Pressed badge
   - flat: No depth, simple background
   
   Status:
   - default: Neutral
   - success: Green (positive states)
   - warning: Yellow (caution states)
   - error: Red (negative states)
   - info: Blue (informational states)
   
   Usage:
   <NeuBadge status="success" variant="convex">Active</NeuBadge>
   <NeuBadge status="error">Out of Stock</NeuBadge>
   ================================================================= */

interface NeuBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'convex' | 'concave' | 'flat';
  status?: 'success' | 'warning' | 'error' | 'info' | 'default';
}

const NeuBadge = React.forwardRef<HTMLSpanElement, NeuBadgeProps>(
  ({ variant = 'convex', status = 'default', className, children, ...props }, ref) => {
    const statusColors = {
      success: {
        bg: 'bg-[var(--neu-success-light)]',
        text: 'text-[var(--neu-success)]',
      },
      warning: {
        bg: 'bg-[var(--neu-warning-light)]',
        text: 'text-[var(--neu-warning)]',
      },
      error: {
        bg: 'bg-[var(--neu-error-light)]',
        text: 'text-[var(--neu-error)]',
      },
      info: {
        bg: 'bg-[var(--neu-info-light)]',
        text: 'text-[var(--neu-info)]',
      },
      default: {
        bg: 'neu-surface',
        text: 'text-[var(--neu-text-secondary)]',
      },
    };
    
    const shadowStyles = {
      convex: 'neu-convex-sm',
      concave: 'neu-concave-sm',
      flat: '',
    };
    
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center px-2.5 py-1 rounded-full',
          'neu-text-label font-medium',
          statusColors[status].bg,
          statusColors[status].text,
          shadowStyles[variant],
          'transition-all duration-200',
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);
NeuBadge.displayName = 'NeuBadge';

export { NeuBadge };
