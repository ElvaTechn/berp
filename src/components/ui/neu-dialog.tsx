"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/* =================================================================
   NEU DIALOG - Neumorphic Dialog/Modal Component
   
   Wrapper around Radix UI Dialog with Neumorphic styling
   
   Features:
   - Overlay with backdrop blur
   - Content with convex popup effect
   - Smooth animations
   - Close button Neumorphic
   - Full keyboard accessibility from Radix
   
   Sizes:
   - sm: Small modal (max-w-sm, ~400px)
   - md: Medium modal (max-w-md, ~500px) - default
   - lg: Large modal (max-w-lg, ~700px)
   - xl: Extra large modal (max-w-xl, ~900px)
   - full: Full width modal (max-w-[95vw])
   
   Usage:
   <NeuDialog>
     <NeuDialogTrigger>Open</NeuDialogTrigger>
     <NeuDialogContent size="md">
       <NeuDialogHeader>
         <NeuDialogTitle>Title</NeuDialogTitle>
         <NeuDialogDescription>Description</NeuDialogDescription>
       </NeuDialogHeader>
       Content...
       <NeuDialogFooter>
         Actions...
       </NeuDialogFooter>
     </NeuDialogContent>
   </NeuDialog>
   ================================================================= */

const NeuDialog = DialogPrimitive.Root;
const NeuDialogTrigger = DialogPrimitive.Trigger;
const NeuDialogPortal = DialogPrimitive.Portal;
const NeuDialogClose = DialogPrimitive.Close;

const NeuDialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50",
      "bg-[var(--neu-base)]/80 backdrop-blur-md",
      // Animation
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
NeuDialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const dialogContentVariants = cva(
  // Base styles
  [
    // Position
    "fixed left-[50%] top-[50%] z-50",
    "translate-x-[-50%] translate-y-[-50%]",
    // Base width
    "w-full",
    // Height & scroll
    "max-h-[90vh] overflow-y-auto",
    // Spacing
    "p-6 gap-4",
    // Neumorphic styling
    "neu-surface neu-convex-lg",
    "rounded-3xl",
    "border border-[var(--neu-border)]",
    // Animation
    "data-[state=open]:animate-in data-[state=closed]:animate-out",
    "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
    "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
    "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
    "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
    // Focus
    "focus:outline-none",
  ],
  {
    variants: {
      size: {
        sm: "max-w-sm", // ~400px
        md: "max-w-md", // ~500px
        lg: "max-w-lg", // ~700px
        xl: "max-w-xl", // ~900px
        full: "max-w-[95vw]", // Almost full width
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

export interface NeuDialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof dialogContentVariants> {}

const NeuDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  NeuDialogContentProps
>(({ className, children, size, ...props }, ref) => (
  <NeuDialogPortal>
    <NeuDialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(dialogContentVariants({ size, className }))}
      {...props}
    >
      {children}
      <DialogPrimitive.Close
        className={cn(
          "absolute right-4 top-4",
          "rounded-xl p-2",
          "neu-surface neu-convex-sm",
          "hover:neu-convex-md",
          "transition-all duration-200",
          "focus:outline-none",
          "focus:ring-2 focus:ring-[var(--neu-accent)] focus:ring-offset-2",
          "disabled:pointer-events-none",
          "group"
        )}
      >
        <X className="h-4 w-4 text-[var(--neu-text-muted)] group-hover:text-[var(--neu-text-primary)] transition-colors" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </NeuDialogPortal>
));
NeuDialogContent.displayName = DialogPrimitive.Content.displayName;

const NeuDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
);
NeuDialogHeader.displayName = "NeuDialogHeader";

const NeuDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      "pt-4 mt-4 border-t border-[var(--neu-border)]",
      className
    )}
    {...props}
  />
);
NeuDialogFooter.displayName = "NeuDialogFooter";

const NeuDialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("neu-text-h2", className)}
    {...props}
  />
));
NeuDialogTitle.displayName = DialogPrimitive.Title.displayName;

const NeuDialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("neu-text-body text-[var(--neu-text-muted)]", className)}
    {...props}
  />
));
NeuDialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  NeuDialog,
  NeuDialogPortal,
  NeuDialogOverlay,
  NeuDialogTrigger,
  NeuDialogClose,
  NeuDialogContent,
  NeuDialogHeader,
  NeuDialogFooter,
  NeuDialogTitle,
  NeuDialogDescription,
  dialogContentVariants,
  type NeuDialogContentProps,
};
