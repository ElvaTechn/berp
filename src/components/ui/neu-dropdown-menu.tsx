"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/* =================================================================
   NEU DROPDOWN MENU - Neumorphic Dropdown Menu Component
   
   Wrapper around Radix UI DropdownMenu with Neumorphic styling
   
   Features:
   - Content with convex popup effect
   - Items with hover states
   - Shortcuts display
   - Submenu support
   - Full keyboard accessibility from Radix
   
   Usage:
   <NeuDropdownMenu>
     <NeuDropdownMenuTrigger>Open Menu</NeuDropdownMenuTrigger>
     <NeuDropdownMenuContent>
       <NeuDropdownMenuItem>Item 1</NeuDropdownMenuItem>
       <NeuDropdownMenuItem>Item 2</NeuDropdownMenuItem>
       <NeuDropdownMenuSeparator />
       <NeuDropdownMenuItem>Item 3</NeuDropdownMenuItem>
     </NeuDropdownMenuContent>
   </NeuDropdownMenu>
   ================================================================= */

const NeuDropdownMenu = DropdownMenuPrimitive.Root;
const NeuDropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const NeuDropdownMenuGroup = DropdownMenuPrimitive.Group;
const NeuDropdownMenuPortal = DropdownMenuPrimitive.Portal;
const NeuDropdownMenuSub = DropdownMenuPrimitive.Sub;
const NeuDropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

const NeuDropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean;
  }
>(({ className, inset, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "flex cursor-pointer select-none items-center gap-2",
      "rounded-xl px-3 py-2",
      "neu-text-body",
      "hover:bg-[var(--neu-surface-hover)] hover:neu-convex-xs",
      "focus:bg-[var(--neu-surface-hover)] focus:outline-none",
      "data-[state=open]:bg-[var(--neu-surface-hover)]",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      "transition-all duration-150",
      inset && "pl-8",
      className
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto h-4 w-4 text-[var(--neu-text-muted)]" />
  </DropdownMenuPrimitive.SubTrigger>
));
NeuDropdownMenuSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName;

const NeuDropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-2xl",
      "neu-surface neu-convex-lg",
      "border border-[var(--neu-border)]",
      "backdrop-blur-sm",
      "p-1",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
      "data-[side=bottom]:slide-in-from-top-2",
      "data-[side=left]:slide-in-from-right-2",
      "data-[side=right]:slide-in-from-left-2",
      "data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
));
NeuDropdownMenuSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName;

const NeuDropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 min-w-[12rem] overflow-hidden rounded-2xl",
        "neu-surface neu-convex-lg",
        "border border-[var(--neu-border)]",
        "backdrop-blur-sm",
        "p-1",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[side=bottom]:slide-in-from-top-2",
        "data-[side=left]:slide-in-from-right-2",
        "data-[side=right]:slide-in-from-left-2",
        "data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
));
NeuDropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

const NeuDropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-pointer select-none items-center gap-2",
      "rounded-xl px-3 py-2",
      "neu-text-body",
      "hover:bg-[var(--neu-surface-hover)] hover:neu-convex-xs hover:text-[var(--neu-text-primary)]",
      "focus:bg-[var(--neu-surface-hover)] focus:outline-none",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      "transition-all duration-150",
      inset && "pl-8",
      className
    )}
    {...props}
  />
));
NeuDropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

const NeuDropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-pointer select-none items-center gap-2",
      "rounded-xl pl-8 pr-3 py-2",
      "neu-text-body",
      "hover:bg-[var(--neu-surface-hover)] hover:neu-convex-xs",
      "focus:bg-[var(--neu-surface-hover)] focus:outline-none",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      "transition-all duration-150",
      className
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-4 w-4 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Check className="h-4 w-4 text-[var(--neu-accent)]" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
));
NeuDropdownMenuCheckboxItem.displayName = DropdownMenuPrimitive.CheckboxItem.displayName;

const NeuDropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-pointer select-none items-center gap-2",
      "rounded-xl pl-8 pr-3 py-2",
      "neu-text-body",
      "hover:bg-[var(--neu-surface-hover)] hover:neu-convex-xs",
      "focus:bg-[var(--neu-surface-hover)] focus:outline-none",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      "transition-all duration-150",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-4 w-4 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <div className="h-2 w-2 rounded-full bg-[var(--neu-accent)]" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
));
NeuDropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;

const NeuDropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn(
      "px-3 py-2",
      "neu-text-label",
      "text-[var(--neu-text-muted)]",
      inset && "pl-8",
      className
    )}
    {...props}
  />
));
NeuDropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;

const NeuDropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn(
      "my-1 h-px bg-[var(--neu-border)] opacity-50",
      className
    )}
    {...props}
  />
));
NeuDropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

const NeuDropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        "ml-auto text-xs tracking-wider",
        "neu-surface neu-convex-xs",
        "px-2 py-0.5 rounded",
        "text-[var(--neu-text-muted)]",
        className
      )}
      {...props}
    />
  );
};
NeuDropdownMenuShortcut.displayName = "NeuDropdownMenuShortcut";

export {
  NeuDropdownMenu,
  NeuDropdownMenuTrigger,
  NeuDropdownMenuContent,
  NeuDropdownMenuItem,
  NeuDropdownMenuCheckboxItem,
  NeuDropdownMenuRadioItem,
  NeuDropdownMenuLabel,
  NeuDropdownMenuSeparator,
  NeuDropdownMenuShortcut,
  NeuDropdownMenuGroup,
  NeuDropdownMenuPortal,
  NeuDropdownMenuSub,
  NeuDropdownMenuSubContent,
  NeuDropdownMenuSubTrigger,
  NeuDropdownMenuRadioGroup,
};
