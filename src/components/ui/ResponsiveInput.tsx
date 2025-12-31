import { InputHTMLAttributes, forwardRef } from 'react';

interface ResponsiveInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const ResponsiveInput = forwardRef<HTMLInputElement, ResponsiveInputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[var(--neu-text-secondary)] mb-2 neu-text-label">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-4 py-3
            text-base
            bg-[var(--neu-surface)]
            rounded-xl
            neu-convex-md
            focus:neu-pressed
            transition-all duration-200
            placeholder:text-[var(--neu-text-muted)]
            focus:outline-none
            ${error ? 'text-[var(--neu-error)] border-2 border-[var(--neu-error)]' : ''}
            ${className}
          `.trim().replace(/\s+/g, ' ')}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-[var(--neu-error)] neu-text-caption">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-[var(--neu-text-muted)] neu-text-caption">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

ResponsiveInput.displayName = 'ResponsiveInput';
