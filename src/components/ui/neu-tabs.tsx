"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

/* =================================================================
   NEU TABS - Neumorphic Tabs Component
   
   Wrapper around Radix UI Tabs with Neumorphic styling
   
   Features:
   - Tab buttons with convex effect
   - Active tab with concave (pressed in)
   - Animated indicator
   - Content panels
   - Full keyboard accessibility from Radix
   
   Usage:
   <NeuTabs defaultValue="tab1">
     <NeuTabsList>
       <NeuTabsTrigger value="tab1">Tab 1</NeuTabsTrigger>
       <NeuTabsTrigger value="tab2">Tab 2</NeuTabsTrigger>
     </NeuTabsList>
     <NeuTabsContent value="tab1">Content 1</NeuTabsContent>
     <NeuTabsContent value="tab2">Content 2</NeuTabsContent>
   </NeuTabs>
   ================================================================= */

const NeuTabs = TabsPrimitive.Root;

const NeuTabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex items-center gap-2 p-1",
      "neu-surface neu-concave-sm",
      "rounded-2xl",
      className
    )}
    {...props}
  />
));
NeuTabsList.displayName = TabsPrimitive.List.displayName;

const NeuTabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap",
      "rounded-xl px-4 py-2.5",
      "neu-text-body font-medium",
      "transition-all duration-200",
      // Default state (not selected)
      "text-[var(--neu-text-secondary)]",
      "hover:text-[var(--neu-text-primary)]",
      "hover:bg-[var(--neu-surface-hover)]",
      // Active state (selected)
      "data-[state=active]:text-[var(--neu-accent)]",
      "data-[state=active]:neu-surface",
      "data-[state=active]:neu-convex-sm",
      "data-[state=active]:font-semibold",
      // Focus
      "focus-visible:outline-none",
      "focus-visible:ring-2 focus-visible:ring-[var(--neu-accent)] focus-visible:ring-offset-2",
      // Disabled
      "disabled:pointer-events-none disabled:opacity-50",
      className
    )}
    {...props}
  />
));
NeuTabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const NeuTabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-4",
      // Animation
      "data-[state=active]:animate-in data-[state=inactive]:animate-out",
      "data-[state=inactive]:fade-out-0 data-[state=active]:fade-in-0",
      "data-[state=inactive]:zoom-out-95 data-[state=active]:zoom-in-95",
      // Focus
      "focus-visible:outline-none",
      "focus-visible:ring-2 focus-visible:ring-[var(--neu-accent)] focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
));
NeuTabsContent.displayName = TabsPrimitive.Content.displayName;

export { NeuTabs, NeuTabsList, NeuTabsTrigger, NeuTabsContent };
