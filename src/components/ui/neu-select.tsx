"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/* =================================================================
   NEU SELECT - Neumorphic Select Component
   
   Wrapper around Radix UI Select with Neumorphic styling
   
   Features:
   - Trigger with concave effect (pressed in)
   - Content with convex popup effect
   - Items with hover states
   - Full keyboard accessibility from Radix
   
   Variants:
   - convex: Raised trigger (less common for selects)
   - concave: Pressed-in trigger (default, typical for inputs)
   - flat: Minimal flat style
   
   Sizes:
   - sm: Small (h-9, text-sm)
   - md: Medium (h-11, text-base) - default
   - lg: Large (h-13, text-base)
   
   Usage:
   <NeuSelect value={value} onValueChange={setValue}>
     <NeuSelectTrigger variant="concave" size="md">
       <NeuSelectValue placeholder="Select..." />
     </NeuSelectTrigger>
     <NeuSelectContent>
       <NeuSelectItem value="option1">Option 1</NeuSelectItem>
       <NeuSelectItem value="option2">Option 2</NeuSelectItem>
     </NeuSelectContent>
   </NeuSelect>
   ================================================================= */

const NeuSelect = SelectPrimitive.Root;
const NeuSelectGroup = SelectPrimitive.Group;
const NeuSelectValue = SelectPrimitive.Value;

const selectTriggerVariants = cva(
  // Base styles
  [
    "flex w-full items-center justify-between",
    "neu-surface neu-text-body",
    "placeholder:text-[var(--neu-text-muted)]",
    "focus:outline-none",
    "focus:ring-2 focus:ring-[var(--neu-accent)] focus:ring-offset-2 focus:ring-offset-transparent",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "transition-all duration-200",
    "[&>span]:line-clamp-1",
  ],
  {
    variants: {
      variant: {
        convex: [
          "neu-convex-sm",
          "hover:neu-convex-md",
          "active:neu-concave-sm",
          "data-[state=open]:neu-concave-sm",
        ],
        concave: [
          "neu-concave-sm",
          "hover:neu-concave-md",
          "data-[state=open]:neu-concave-md",
        ],
        flat: [
          "shadow-none",
          "border border-[var(--neu-border)]",
          "hover:border-[var(--neu-accent)]",
          "data-[state=open]:border-[var(--neu-accent)]",
        ],
      },
      size: {
        sm: "h-9 px-3 py-2 text-sm rounded-lg",
        md: "h-11 px-4 py-3 text-base rounded-xl",
        lg: "h-13 px-5 py-3 text-base rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "concave",
      size: "md",
    },
  }
);

export interface NeuSelectTriggerProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>,
    VariantProps<typeof selectTriggerVariants> {}

const NeuSelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  NeuSelectTriggerProps
>(({ className, children, variant, size, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(selectTriggerVariants({ variant, size, className }))}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 text-[var(--neu-text-muted)] transition-transform duration-200 data-[state=open]:rotate-180" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
NeuSelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const NeuSelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      "text-[var(--neu-text-muted)]",
      className
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
));
NeuSelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const NeuSelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      "text-[var(--neu-text-muted)]",
      className
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
));
NeuSelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;

const NeuSelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-2xl",
        // Neumorphic popup
        "neu-surface neu-convex-lg",
        "border border-[var(--neu-border)]",
        // Animation
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
        "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        // Popper positioning
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <NeuSelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <NeuSelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
NeuSelectContent.displayName = SelectPrimitive.Content.displayName;

const NeuSelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn(
      "neu-text-label font-semibold",
      "px-3 py-2",
      className
    )}
    {...props}
  />
));
NeuSelectLabel.displayName = SelectPrimitive.Label.displayName;

const NeuSelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-pointer select-none items-center",
      "rounded-xl py-2.5 pl-3 pr-8",
      "neu-text-body",
      // Hover state
      "hover:bg-[var(--neu-surface-hover)]",
      "hover:outline-none",
      // Focus state
      "focus:bg-[var(--neu-surface-hover)]",
      "focus:outline-none",
      // Disabled state
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      // Transition
      "transition-colors duration-150",
      className
    )}
    {...props}
  >
    <span className="absolute right-3 flex h-4 w-4 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4 text-[var(--neu-accent)]" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
NeuSelectItem.displayName = SelectPrimitive.Item.displayName;

const NeuSelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn(
      "my-1 h-px bg-[var(--neu-border-light)]",
      className
    )}
    {...props}
  />
));
NeuSelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  NeuSelect,
  NeuSelectGroup,
  NeuSelectValue,
  NeuSelectTrigger,
  NeuSelectContent,
  NeuSelectLabel,
  NeuSelectItem,
  NeuSelectSeparator,
  NeuSelectScrollUpButton,
  NeuSelectScrollDownButton,
  selectTriggerVariants,
  type NeuSelectTriggerProps,
};
