"use client";

import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/* =================================================================
   NEU SWITCH - Neumorphic Switch/Toggle Component
   
   Wrapper around Radix UI Switch with Neumorphic styling
   
   Features:
   - Track with concave effect (pressed in)
   - Thumb with convex effect (raised button)
   - Smooth transitions with spring animation
   - Full keyboard accessibility from Radix
   - Optional label support
   
   Variants:
   - default: Gray track, accent thumb
   - success: Green track when checked
   - warning: Orange track when checked
   - error: Red track when checked
   
   Sizes:
   - sm: Small (w-9 h-5, thumb w-4 h-4)
   - md: Medium (w-11 h-6, thumb w-5 h-5) - default
   - lg: Large (w-13 h-7, thumb w-6 h-6)
   
   Usage:
   <NeuSwitch
     checked={enabled}
     onCheckedChange={setEnabled}
     variant="success"
     size="md"
   />
   
   With Label:
   <div className="flex items-center gap-2">
     <NeuSwitch checked={enabled} onCheckedChange={setEnabled} />
     <label className="neu-text-body">Enable notifications</label>
   </div>
   ================================================================= */

const switchVariants = cva(
  // Base styles
  [
    "peer inline-flex shrink-0 cursor-pointer items-center",
    "rounded-full",
    "neu-surface neu-concave-sm",
    "transition-all duration-300",
    "focus-visible:outline-none",
    "focus-visible:ring-2 focus-visible:ring-[var(--neu-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "relative",
  ],
  {
    variants: {
      variant: {
        default: [
          "data-[state=unchecked]:bg-[var(--neu-surface)]",
          "data-[state=checked]:bg-[var(--neu-accent)]",
          "data-[state=checked]:neu-concave-xs",
        ],
        success: [
          "data-[state=unchecked]:bg-[var(--neu-surface)]",
          "data-[state=checked]:bg-[var(--neu-success)]",
          "data-[state=checked]:neu-concave-xs",
        ],
        warning: [
          "data-[state=unchecked]:bg-[var(--neu-surface)]",
          "data-[state=checked]:bg-[var(--neu-warning)]",
          "data-[state=checked]:neu-concave-xs",
        ],
        error: [
          "data-[state=unchecked]:bg-[var(--neu-surface)]",
          "data-[state=checked]:bg-[var(--neu-error)]",
          "data-[state=checked]:neu-concave-xs",
        ],
      },
      size: {
        sm: "w-9 h-5",
        md: "w-11 h-6",
        lg: "w-13 h-7",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

const switchThumbVariants = cva(
  // Base styles
  [
    "pointer-events-none block rounded-full",
    "neu-surface neu-convex-sm",
    "transition-transform duration-300 ease-in-out",
    "shadow-md",
  ],
  {
    variants: {
      variant: {
        default: [
          "data-[state=unchecked]:bg-[var(--neu-text-muted)]",
          "data-[state=checked]:bg-white",
        ],
        success: [
          "data-[state=unchecked]:bg-[var(--neu-text-muted)]",
          "data-[state=checked]:bg-white",
        ],
        warning: [
          "data-[state=unchecked]:bg-[var(--neu-text-muted)]",
          "data-[state=checked]:bg-white",
        ],
        error: [
          "data-[state=unchecked]:bg-[var(--neu-text-muted)]",
          "data-[state=checked]:bg-white",
        ],
      },
      size: {
        sm: "w-4 h-4 data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0.5",
        md: "w-5 h-5 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0.5",
        lg: "w-6 h-6 data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-0.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface NeuSwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>,
    VariantProps<typeof switchVariants> {
  label?: string;
  labelPosition?: "left" | "right";
}

const NeuSwitch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  NeuSwitchProps
>(({ className, variant, size, label, labelPosition = "right", ...props }, ref) => {
  const switchElement = (
    <SwitchPrimitives.Root
      className={cn(switchVariants({ variant, size, className }))}
      {...props}
      ref={ref}
    >
      <SwitchPrimitives.Thumb
        className={cn(switchThumbVariants({ variant, size }))}
      />
    </SwitchPrimitives.Root>
  );

  if (!label) {
    return switchElement;
  }

  return (
    <div className="flex items-center gap-2">
      {labelPosition === "left" && (
        <label className="neu-text-body cursor-pointer select-none">
          {label}
        </label>
      )}
      {switchElement}
      {labelPosition === "right" && (
        <label className="neu-text-body cursor-pointer select-none">
          {label}
        </label>
      )}
    </div>
  );
});

NeuSwitch.displayName = SwitchPrimitives.Root.displayName;

export { NeuSwitch, switchVariants, switchThumbVariants };
