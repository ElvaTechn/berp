"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/* =================================================================
   NEU TEXTAREA - Neumorphic Textarea Component
   
   Textarea with Neumorphic styling for multi-line text input
   
   Features:
   - Concave effect (pressed in) for input area
   - Optional label support
   - Optional character counter
   - Error state support
   - Flexible resize options
   - Full accessibility support
   
   Variants:
   - concave: Pressed in effect (default, typical for inputs)
   - flat: Minimal flat style with border
   
   Sizes:
   - sm: Small (text-sm, py-2, px-3)
   - md: Medium (text-base, py-3, px-4) - default
   - lg: Large (text-lg, py-4, px-5)
   
   Usage:
   <NeuTextarea
     label="Description"
     placeholder="Enter description..."
     value={value}
     onChange={(e) => setValue(e.target.value)}
     maxLength={500}
     showCounter
   />
   ================================================================= */

const textareaVariants = cva(
  // Base styles
  [
    "flex w-full rounded-xl",
    "neu-surface neu-text-body",
    "placeholder:text-[var(--neu-text-muted)]",
    "focus:outline-none",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "transition-all duration-200",
    "resize-none",
  ],
  {
    variants: {
      variant: {
        concave: [
          "neu-concave-sm",
          "focus:neu-concave-md",
          "focus:ring-2 focus:ring-[var(--neu-accent)] focus:ring-offset-2 focus:ring-offset-transparent",
        ],
        flat: [
          "shadow-none",
          "border border-[var(--neu-border)]",
          "focus:border-[var(--neu-accent)]",
          "focus:ring-2 focus:ring-[var(--neu-accent)] focus:ring-offset-2",
        ],
      },
      size: {
        sm: "text-sm py-2 px-3 min-h-[80px]",
        md: "text-base py-3 px-4 min-h-[100px]",
        lg: "text-lg py-4 px-5 min-h-[120px]",
      },
      hasError: {
        true: "ring-2 ring-[var(--neu-error)] focus:ring-[var(--neu-error)]",
        false: "",
      },
    },
    defaultVariants: {
      variant: "concave",
      size: "md",
      hasError: false,
    },
  }
);

export interface NeuTextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size">,
    VariantProps<typeof textareaVariants> {
  label?: string;
  error?: string;
  showCounter?: boolean;
  resizable?: boolean | "vertical" | "horizontal" | "both";
}

const NeuTextarea = React.forwardRef<HTMLTextAreaElement, NeuTextareaProps>(
  (
    {
      className,
      variant,
      size,
      label,
      error,
      showCounter,
      maxLength,
      value,
      resizable = false,
      hasError: _hasError, // Extrair para não passar ao textarea
      ...props
    },
    ref
  ) => {
    const [charCount, setCharCount] = React.useState(0);
    const hasError = !!error;

    // Update character count
    React.useEffect(() => {
      if (value !== undefined && value !== null) {
        setCharCount(String(value).length);
      }
    }, [value]);

    // Determine resize class
    const resizeClass = React.useMemo(() => {
      if (resizable === true || resizable === "both") return "resize";
      if (resizable === "vertical") return "resize-y";
      if (resizable === "horizontal") return "resize-x";
      return "resize-none";
    }, [resizable]);

    // Calculate counter color based on usage
    const counterColor = React.useMemo(() => {
      if (!maxLength) return "text-[var(--neu-text-muted)]";
      const percentage = (charCount / maxLength) * 100;
      if (percentage >= 100) return "text-[var(--neu-error)] font-bold";
      if (percentage >= 90) return "text-[var(--neu-warning)]";
      if (percentage >= 75) return "text-[var(--neu-text-secondary)]";
      return "text-[var(--neu-text-muted)]";
    }, [charCount, maxLength]);

    return (
      <div className="w-full space-y-1.5">
        {/* Label */}
        {label && (
          <label className="neu-text-label block">
            {label}
            {props.required && (
              <span className="text-[var(--neu-error)] ml-1">*</span>
            )}
          </label>
        )}

        {/* Textarea Container */}
        <div className="relative">
          <textarea
            ref={ref}
            className={cn(
              textareaVariants({ variant, size, hasError }),
              resizeClass,
              showCounter && maxLength && "pb-8", // Extra padding for counter
              className
            )}
            maxLength={maxLength}
            value={value}
            onChange={(e) => {
              setCharCount(e.target.value.length);
              props.onChange?.(e);
            }}
            aria-invalid={hasError ? "true" : "false"}
            aria-describedby={error ? `${props.id}-error` : undefined}
            {...props}
          />

          {/* Character Counter */}
          {showCounter && maxLength && (
            <div
              className={cn(
                "absolute bottom-2 right-3 text-xs font-medium pointer-events-none",
                counterColor
              )}
            >
              {charCount} / {maxLength}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <p
            id={`${props.id}-error`}
            className="neu-text-caption text-[var(--neu-error)] flex items-center gap-1"
          >
            <svg
              className="w-3 h-3"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  }
);

NeuTextarea.displayName = "NeuTextarea";

export { NeuTextarea, textareaVariants };
