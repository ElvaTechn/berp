import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ResponsiveButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export function ResponsiveButton({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  ...props
}: ResponsiveButtonProps) {
  const variants: Record<string, string> = {
    primary: 'bg-[var(--neu-accent)] text-white neu-convex-md hover:neu-convex-lg active:neu-pressed',
    secondary: 'text-[var(--neu-text-primary)] neu-convex-md hover:neu-convex-lg',
    danger: 'bg-[var(--neu-error-light)] text-[var(--neu-error)] neu-convex-md hover:neu-convex-lg',
    ghost: 'text-[var(--neu-text-secondary)] hover:text-[var(--neu-text-primary)]',
  };

  const sizes: Record<string, string> = {
    sm: 'px-3 py-2 text-sm min-h-[36px]',
    md: 'px-4 py-3 text-base min-h-[44px]',
    lg: 'px-6 py-4 text-lg min-h-[52px]',
  };

  return (
    <button
      className={`
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        rounded-xl font-medium
        transition-all duration-200
        active:scale-[0.98]
        disabled:opacity-50 disabled:cursor-not-allowed
        touch-action-manipulation
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      {...props}
    >
      {children}
    </button>
  );
}
