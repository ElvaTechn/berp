import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

/* =================================================================
   NEU BUTTON - Neumorphic Button Component (RESPONSIVE + WCAG)
   
   Variants:
   - convex: Raised button that pops out (default)
   - concave: Pressed button (for active states)
   - accent: Primary action with accent color
   - ghost: Transparent, minimal interaction
   
   Sizes (WCAG 2.1 AA Compliant - Min 44x44px touch target):
   - sm: Small (h-11, text-sm) - 44px ✅
   - md: Medium (h-12, text-sm) - 48px ✅ (default)
   - lg: Large (h-14, text-base) - 56px ✅
   - icon: Square icon button (h-11 w-11) - 44px ✅
   
   Changes from v1:
   - ✅ sm: 32px → 44px (WCAG compliant)
   - ✅ md: 40px → 48px (improved touch)
   - ✅ lg: 48px → 56px (more comfortable)
   - ✅ icon: 40px → 44px (WCAG compliant)
   
   Usage:
   <NeuButton variant="convex" size="md">Click me</NeuButton>
   <NeuButton variant="accent" loading>Saving...</NeuButton>
   <NeuButton variant="ghost" size="icon"><Icon /></NeuButton>
   ================================================================= */

const buttonVariants = cva(
  // Base styles
  [
    "inline-flex items-center justify-center",
    "font-medium",
    "transition-all duration-200",
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--neu-accent)] focus-visible:ring-offset-2",
    // Touch-friendly
    "touch-manipulation",
    "select-none",
  ],
  {
    variants: {
      variant: {
        convex: [
          "neu-surface",
          "neu-convex-sm",
          "text-[var(--neu-text-primary)]",
          "hover:neu-convex-md hover:-translate-y-0.5",
          "active:neu-concave-sm active:translate-y-0",
        ],
        concave: [
          "neu-surface",
          "neu-concave-sm",
          "text-[var(--neu-text-primary)]",
          "active:neu-concave-md",
        ],
        accent: [
          "bg-[var(--neu-accent)]",
          "text-white",
          "shadow-[4px_4px_8px_var(--neu-shadow-dark),-4px_-4px_8px_var(--neu-shadow-light)]",
          "hover:shadow-[6px_6px_12px_var(--neu-shadow-dark),-6px_-6px_12px_var(--neu-shadow-light)]",
          "hover:-translate-y-0.5",
          "active:shadow-[2px_2px_4px_var(--neu-shadow-dark),-2px_-2px_4px_var(--neu-shadow-light)]",
          "active:translate-y-0",
        ],
        ghost: [
          "bg-transparent",
          "shadow-none",
          "text-[var(--neu-text-secondary)]",
          "hover:bg-[var(--neu-surface-hover)]",
          "active:bg-[var(--neu-surface-active)]",
        ],
        success: [
          "bg-[var(--neu-success)]",
          "text-white",
          "shadow-[4px_4px_8px_var(--neu-shadow-dark),-4px_-4px_8px_var(--neu-shadow-light)]",
          "hover:shadow-[6px_6px_12px_var(--neu-shadow-dark),-6px_-6px_12px_var(--neu-shadow-light)]",
          "hover:-translate-y-0.5",
        ],
        warning: [
          "bg-[var(--neu-warning)]",
          "text-white",
          "shadow-[4px_4px_8px_var(--neu-shadow-dark),-4px_-4px_8px_var(--neu-shadow-light)]",
          "hover:shadow-[6px_6px_12px_var(--neu-shadow-dark),-6px_-6px_12px_var(--neu-shadow-light)]",
          "hover:-translate-y-0.5",
        ],
        error: [
          "bg-[var(--neu-error)]",
          "text-white",
          "shadow-[4px_4px_8px_var(--neu-shadow-dark),-4px_-4px_8px_var(--neu-shadow-light)]",
          "hover:shadow-[6px_6px_12px_var(--neu-shadow-dark),-6px_-6px_12px_var(--neu-shadow-light)]",
          "hover:-translate-y-0.5",
        ],
      },
      size: {
        sm: "h-11 px-3 rounded-lg text-sm",        // 44px ✅ WCAG
        md: "h-12 px-5 rounded-xl text-sm",        // 48px ✅
        lg: "h-14 px-7 rounded-2xl text-base",     // 56px ✅
        icon: "h-11 w-11 rounded-xl",              // 44x44px ✅ WCAG
      },
    },
    defaultVariants: {
      variant: "convex",
      size: "md",
    },
  }
);

export interface NeuButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const NeuButton = React.forwardRef<HTMLButtonElement, NeuButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        )}
        {children}
      </Comp>
    );
  }
);
NeuButton.displayName = "NeuButton";

export { NeuButton, buttonVariants };
