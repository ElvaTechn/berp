import * as React from "react";
import { cn } from "@/lib/utils";

/* =================================================================
   NEU CARD - Neumorphic Card Component (RESPONSIVE)
   
   Variants:
   - convex: Pops out of surface (default for cards)
   - concave: Pressed into surface (for inputs, recessed areas)
   - flat: No depth (for overlays, simple containers)
   
   Sizes (RESPONSIVE):
   - sm: p-3 (mobile) → p-4 (desktop) - Compact
   - md: p-4 (mobile) → p-6 (desktop) - Standard
   - lg: p-5 (mobile) → p-8 (desktop) - Spacious
   
   Changes from v1:
   - ✅ Responsive padding (smaller on mobile)
   - ✅ Compact variant for mobile
   - ✅ Better spacing in small screens
   
   Usage:
   <NeuCard variant="convex" size="md">
     <NeuCardHeader>
       <NeuCardTitle>Title</NeuCardTitle>
       <NeuCardDescription>Description</NeuCardDescription>
     </NeuCardHeader>
     <NeuCardContent>Content...</NeuCardContent>
     <NeuCardFooter>Actions...</NeuCardFooter>
   </NeuCard>
   ================================================================= */

interface NeuCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'convex' | 'concave' | 'flat';
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
}

const NeuCard = React.forwardRef<HTMLDivElement, NeuCardProps>(
  ({ variant = 'convex', size = 'md', interactive = false, className, children, onClick, ...props }, ref) => {
    // Responsive padding: smaller on mobile, larger on desktop
    const sizeClasses = {
      sm: 'p-3 md:p-4 rounded-xl',           // 12px → 16px
      md: 'p-4 md:p-6 rounded-2xl',          // 16px → 24px
      lg: 'p-5 md:p-8 rounded-3xl'           // 20px → 32px
    };
    
    const shadowClasses = {
      convex: 'neu-surface neu-convex-md',
      concave: 'neu-surface neu-concave-md',
      flat: 'neu-surface'
    };
    
    return (
      <div
        ref={ref}
        onClick={onClick}
        className={cn(
          'transition-all duration-200',
          // Responsive size
          sizeClasses[size],
          // Shadow variant
          shadowClasses[variant],
          // Interactive states
          interactive && [
            'cursor-pointer',
            'hover:neu-convex-lg hover:-translate-y-0.5',
            'active:neu-concave-sm active:translate-y-0',
            'touch-manipulation'
          ],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
NeuCard.displayName = "NeuCard";

/* Card Header Component */
interface NeuCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const NeuCardHeader = React.forwardRef<HTMLDivElement, NeuCardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 mb-3 md:mb-4", className)}
      {...props}
    />
  )
);
NeuCardHeader.displayName = "NeuCardHeader";

/* Card Title Component */
interface NeuCardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

const NeuCardTitle = React.forwardRef<HTMLParagraphElement, NeuCardTitleProps>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("neu-text-h3", className)}
      {...props}
    />
  )
);
NeuCardTitle.displayName = "NeuCardTitle";

/* Card Description Component */
interface NeuCardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const NeuCardDescription = React.forwardRef<HTMLParagraphElement, NeuCardDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("neu-text-caption", className)}
      {...props}
    />
  )
);
NeuCardDescription.displayName = "NeuCardDescription";

/* Card Content Component */
interface NeuCardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const NeuCardContent = React.forwardRef<HTMLDivElement, NeuCardContentProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("pt-0", className)} {...props} />
  )
);
NeuCardContent.displayName = "NeuCardContent";

/* Card Footer Component */
interface NeuCardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const NeuCardFooter = React.forwardRef<HTMLDivElement, NeuCardFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center pt-3 md:pt-4 mt-3 md:mt-4 border-t border-[var(--neu-border-light)]", className)}
      {...props}
    />
  )
);
NeuCardFooter.displayName = "NeuCardFooter";

export {
  NeuCard,
  NeuCardHeader,
  NeuCardFooter,
  NeuCardTitle,
  NeuCardDescription,
  NeuCardContent,
};
