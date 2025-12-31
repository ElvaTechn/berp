import { ReactNode } from 'react';

interface ResponsiveCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'elevated' | 'flat';
}

export function ResponsiveCard({
  children,
  className = '',
  onClick,
  variant = 'default',
}: ResponsiveCardProps) {
  const variants = {
    default: 'neu-convex-md',
    elevated: 'neu-convex-lg',
    flat: '',
  };

  return (
    <div
      onClick={onClick}
      className={`
        rounded-2xl p-4 sm:p-6
        transition-all duration-200
        ${variants[variant]}
        ${onClick ? 'cursor-pointer active:neu-pressed active:scale-[0.98]' : ''}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      {children}
    </div>
  );
}
