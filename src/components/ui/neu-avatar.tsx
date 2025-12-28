"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/* =================================================================
   NEU AVATAR - Neumorphic Avatar Component
   
   Wrapper around Radix UI Avatar with Neumorphic styling
   
   Features:
   - Convex effect (raised border)
   - Status indicator (online, offline, busy, away)
   - Initials fallback
   - Multiple sizes (xs to 3xl)
   - Avatar group support
   - Hover states
   
   Sizes:
   - xs: w-8 h-8
   - sm: w-10 h-10
   - md: w-12 h-12 (default)
   - lg: w-16 h-16
   - xl: w-20 h-20
   - 2xl: w-24 h-24
   - 3xl: w-32 h-32
   
   Status:
   - online: Green indicator
   - offline: Gray indicator
   - busy: Red indicator
   - away: Yellow indicator
   
   Usage:
   <NeuAvatar size="md" status="online">
     <NeuAvatarImage src="/avatar.jpg" alt="User" />
     <NeuAvatarFallback>JD</NeuAvatarFallback>
   </NeuAvatar>
   ================================================================= */

const avatarVariants = cva(
  [
    "relative flex shrink-0 overflow-hidden rounded-full",
    "neu-surface neu-convex-sm",
    "border-2 border-[var(--neu-border)]",
    "transition-all duration-200",
    "hover:neu-convex-md hover:scale-105",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--neu-accent)] focus-visible:ring-offset-2",
  ],
  {
    variants: {
      size: {
        xs: "w-8 h-8 text-xs",
        sm: "w-10 h-10 text-sm",
        md: "w-12 h-12 text-base",
        lg: "w-16 h-16 text-lg",
        xl: "w-20 h-20 text-xl",
        "2xl": "w-24 h-24 text-2xl",
        "3xl": "w-32 h-32 text-3xl",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

const statusIndicatorVariants = cva(
  [
    "absolute bottom-0 right-0",
    "rounded-full",
    "neu-convex-xs",
    "border-2 border-[var(--neu-surface)]",
  ],
  {
    variants: {
      status: {
        online: "bg-[var(--neu-success)]",
        offline: "bg-[var(--neu-text-muted)]",
        busy: "bg-[var(--neu-error)]",
        away: "bg-[var(--neu-warning)]",
      },
      size: {
        xs: "w-2 h-2",
        sm: "w-2.5 h-2.5",
        md: "w-3 h-3",
        lg: "w-4 h-4",
        xl: "w-5 h-5",
        "2xl": "w-6 h-6",
        "3xl": "w-8 h-8",
      },
    },
    defaultVariants: {
      status: "offline",
      size: "md",
    },
  }
);

export interface NeuAvatarProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>,
    VariantProps<typeof avatarVariants> {
  status?: "online" | "offline" | "busy" | "away";
  showStatus?: boolean;
}

const NeuAvatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  NeuAvatarProps
>(({ className, size, status, showStatus = false, ...props }, ref) => (
  <div className="relative inline-block">
    <AvatarPrimitive.Root
      ref={ref}
      className={cn(avatarVariants({ size, className }))}
      {...props}
    />
    {showStatus && status && (
      <div
        className={cn(statusIndicatorVariants({ status, size }))}
        aria-label={`Status: ${status}`}
      />
    )}
  </div>
));
NeuAvatar.displayName = AvatarPrimitive.Root.displayName;

const NeuAvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full object-cover", className)}
    {...props}
  />
));
NeuAvatarImage.displayName = AvatarPrimitive.Image.displayName;

const NeuAvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center",
      "rounded-full",
      "bg-[var(--neu-surface)]",
      "neu-text-body font-semibold",
      "text-[var(--neu-text-primary)]",
      className
    )}
    {...props}
  />
));
NeuAvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

/* =================================================================
   NEU AVATAR GROUP - Group of overlapping avatars
   
   Usage:
   <NeuAvatarGroup max={3}>
     <NeuAvatar><NeuAvatarImage src="..." /></NeuAvatar>
     <NeuAvatar><NeuAvatarImage src="..." /></NeuAvatar>
     <NeuAvatar><NeuAvatarImage src="..." /></NeuAvatar>
     <NeuAvatar><NeuAvatarImage src="..." /></NeuAvatar>
   </NeuAvatarGroup>
   ================================================================= */

export interface NeuAvatarGroupProps {
  children: React.ReactNode;
  max?: number;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
  className?: string;
}

const NeuAvatarGroup = ({ children, max = 4, size = "md", className }: NeuAvatarGroupProps) => {
  const childArray = React.Children.toArray(children);
  const displayedChildren = max ? childArray.slice(0, max) : childArray;
  const remaining = childArray.length - displayedChildren.length;

  return (
    <div className={cn("flex items-center -space-x-2", className)}>
      {displayedChildren.map((child, index) => (
        <div
          key={index}
          className="relative"
          style={{ zIndex: displayedChildren.length - index }}
        >
          {React.isValidElement(child)
            ? React.cloneElement(child as React.ReactElement<NeuAvatarProps>, {
                size,
                className: cn(
                  "ring-2 ring-[var(--neu-surface)]",
                  (child as React.ReactElement<NeuAvatarProps>).props.className
                ),
              })
            : child}
        </div>
      ))}
      {remaining > 0 && (
        <NeuAvatar size={size} className="ring-2 ring-[var(--neu-surface)]">
          <NeuAvatarFallback>+{remaining}</NeuAvatarFallback>
        </NeuAvatar>
      )}
    </div>
  );
};
NeuAvatarGroup.displayName = "NeuAvatarGroup";

export { NeuAvatar, NeuAvatarImage, NeuAvatarFallback, NeuAvatarGroup, avatarVariants };
