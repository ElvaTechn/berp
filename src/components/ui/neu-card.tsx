import * as React from "react";
import { cn } from "@/lib/utils";

/* =================================================================
   NEU CARD - Neumorphic Card Component
   
   Variants:
   - convex: Pops out of surface (default for cards)
   - concave: Pressed into surface (for inputs, recessed areas)
   - flat: No depth (for overlays, simple containers)
   
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
    const sizeClasses = {
      sm: 'p-3 rounded-xl',
      md: 'p-5 rounded-2xl',
      lg: 'p-7 rounded-3xl'
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
          // Size
          sizeClasses[size],
          // Shadow variant
          shadowClasses[variant],
          // Interactive states
          interactive && [
            'cursor-pointer',
            'hover:neu-convex-lg hover:-translate-y-0.5',
            'active:neu-concave-sm active:translate-y-0'
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
      className={cn("flex flex-col space-y-1.5 mb-4", className)}
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
      className={cn("flex items-center pt-4 mt-4 border-t border-[var(--neu-border-light)]", className)}
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
