import * as React from "react";
import { cn } from "@/lib/utils";

/* =================================================================
   NEU INPUT - Neumorphic Input Component
   
   Features:
   - Concave shadow (pressed in effect)
   - Optional label
   - Optional icon (left side)
   - Error state with message
   - Full keyboard accessibility
   
   Usage:
   <NeuInput 
     label="Email" 
     type="email" 
     placeholder="you@example.com"
     error="Invalid email"
     icon={<Mail />}
   />
   ================================================================= */

export interface NeuInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const NeuInput = React.forwardRef<HTMLInputElement, NeuInputProps>(
  ({ className, label, error, icon, type = 'text', id, ...props }, ref) => {
    // Generate unique ID if not provided
    const inputId = id || React.useId();
    
    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={inputId}
            className="neu-text-label mb-1.5 block"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--neu-text-muted)] pointer-events-none">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            className={cn(
              // Base styles
              "w-full",
              "neu-surface",
              "neu-concave-sm",
              "rounded-xl px-4 py-3",
              // Text styles
              "neu-text-body",
              "placeholder:text-[var(--neu-text-muted)]",
              // Focus styles
              "focus:outline-none",
              "focus:neu-concave-md",
              "focus:ring-2 focus:ring-[var(--neu-accent)] focus:ring-offset-2 focus:ring-offset-transparent",
              // Error styles
              error && "ring-2 ring-[var(--neu-error)] focus:ring-[var(--neu-error)]",
              // Disabled styles
              "disabled:opacity-50 disabled:cursor-not-allowed",
              // Icon padding
              icon && "pl-10",
              className
            )}
            ref={ref}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />
        </div>
        {error && (
          <p 
            id={`${inputId}-error`}
            className="neu-text-caption mt-1 text-[var(--neu-error)]"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);
NeuInput.displayName = 'NeuInput';

export { NeuInput };
