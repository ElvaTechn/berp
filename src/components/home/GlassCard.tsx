/**
 * ================================================================
 * GLASS CARD COMPONENT - BIZ360 ERP
 * ================================================================
 * Componente reutilizável com efeito glassmorphism otimizado
 * para performance mobile
 * ================================================================
 */

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: ReactNode;
  variant?: 'small' | 'medium' | 'large' | 'hero';
  hover?: boolean;
  className?: string;
  animate?: boolean;
  style?: React.CSSProperties;
}

export function GlassCard({ 
  children, 
  variant = 'medium', 
  hover = true,
  className,
  animate = true,
  style 
}: GlassCardProps) {
  const sizes = {
    small: 'p-4 rounded-xl',
    medium: 'p-6 md:p-8 rounded-2xl',
    large: 'p-8 md:p-12 rounded-3xl',
    hero: 'p-10 md:p-16 lg:p-20 rounded-[32px] md:rounded-[48px]'
  };

  const blurClasses = {
    small: 'backdrop-blur-md md:backdrop-blur-lg',
    medium: 'backdrop-blur-lg md:backdrop-blur-xl',
    large: 'backdrop-blur-xl md:backdrop-blur-2xl',
    hero: 'backdrop-blur-2xl md:backdrop-blur-3xl'
  };

  return (
    <div 
      className={cn(
        // Base styles
        'relative',
        'bg-[rgba(30,30,35,0.5)] md:bg-[rgba(30,30,35,0.7)]',
        blurClasses[variant],
        'border border-white/6 md:border-white/10',
        'shadow-xl md:shadow-2xl',
        sizes[variant],
        
        // Performance optimizations
        'will-change-transform',
        'transform-gpu',
        'backface-hidden',
        
        // Hover effects (only on desktop)
        hover && 'md:transition-all md:duration-300',
        hover && 'md:hover:scale-[1.02] md:hover:shadow-3xl',
        hover && 'md:hover:border-white/20',
        
        // Animation
        animate && 'animate-in fade-in duration-700',
        
        className
      )}
      style={style}
    >
      {children}
    </div>
  );
}

/**
 * Glass Button Component
 */
interface GlassButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  onClick?: () => void;
  className?: string;
}

export function GlassButton({ 
  children, 
  variant = 'primary', 
  size = 'md',
  href,
  onClick,
  className 
}: GlassButtonProps) {
  const sizes = {
    sm: 'px-4 py-2 text-sm rounded-lg',
    md: 'px-6 py-3 text-base rounded-xl',
    lg: 'px-8 py-4 text-lg rounded-2xl'
  };

  const variants = {
    primary: cn(
      'bg-gradient-to-r from-orange-500 to-orange-600',
      'text-white font-semibold',
      'shadow-lg shadow-orange-500/25',
      'md:hover:shadow-xl md:hover:shadow-orange-500/40',
      'md:hover:scale-105'
    ),
    secondary: cn(
      'bg-[rgba(30,30,35,0.6)]',
      'backdrop-blur-xl',
      'border border-white/10',
      'text-white font-medium',
      'md:hover:border-white/20',
      'md:hover:bg-[rgba(30,30,35,0.8)]'
    ),
    ghost: cn(
      'bg-transparent',
      'border border-white/10',
      'text-white/80 font-medium',
      'md:hover:text-white',
      'md:hover:border-white/20',
      'md:hover:bg-white/5'
    )
  };

  const baseClasses = cn(
    'inline-flex items-center justify-center',
    'transition-all duration-300',
    'transform-gpu',
    'cursor-pointer',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    sizes[size],
    variants[variant],
    className
  );

  if (href) {
    return (
      <a href={href} className={baseClasses}>
        {children}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={baseClasses}>
      {children}
    </button>
  );
}

/**
 * Glass Badge Component
 */
interface GlassBadgeProps {
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export function GlassBadge({ children, icon, className }: GlassBadgeProps) {
  return (
    <div className={cn(
      'inline-flex items-center gap-2',
      'px-4 py-2 rounded-full',
      'bg-[rgba(30,30,35,0.4)]',
      'backdrop-blur-md',
      'border border-white/8',
      'text-sm text-white/70',
      className
    )}>
      {icon && <span className="text-orange-500">{icon}</span>}
      {children}
    </div>
  );
}
