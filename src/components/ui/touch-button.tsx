/**
 * ================================================================
 * TOUCH BUTTON - BIZCONTROL 360 ERP v2.1.0
 * ================================================================
 * Botão otimizado para touch com targets de 44x44px (Apple HIG)
 * ================================================================
 */

"use client";

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface TouchButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

/**
 * TouchButton - Botão com touch target mínimo de 44x44px
 * Segue Apple Human Interface Guidelines e Material Design
 */
export const TouchButton = forwardRef<HTMLButtonElement, TouchButtonProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      isLoading = false,
      icon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    // Variants
    const variants = {
      default: 'bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-900 dark:text-white',
      primary: 'bg-blue-600 hover:bg-blue-700 text-white',
      secondary: 'bg-slate-600 hover:bg-slate-700 text-white',
      danger: 'bg-red-600 hover:bg-red-700 text-white',
      ghost: 'hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300',
    };

    // Sizes (sempre garantindo min 44x44px de área clicável)
    const sizes = {
      sm: 'min-w-[44px] min-h-[44px] p-2 text-sm', // 44x44px
      md: 'min-w-[48px] min-h-[48px] p-3 text-base', // 48x48px
      lg: 'min-w-[52px] min-h-[52px] p-4 text-lg', // 52x52px
    };

    return (
      <button
        ref={ref}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center gap-2',
          'font-medium rounded-xl',
          'transition-all duration-200',
          'active:scale-95',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'touch-manipulation', // Otimização touch (remove delay)
          'select-none', // Previne seleção acidental
          // Variant
          variants[variant],
          // Size
          sizes[size],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : icon ? (
          icon
        ) : null}
        {children}
      </button>
    );
  }
);

TouchButton.displayName = 'TouchButton';

/**
 * TouchIconButton - Botão circular apenas com ícone
 * Touch target: 44x44px mínimo
 */
export interface TouchIconButtonProps extends TouchButtonProps {
  icon: React.ReactNode;
  label?: string; // Para acessibilidade
}

export const TouchIconButton = forwardRef<HTMLButtonElement, TouchIconButtonProps>(
  ({ icon, label, size = 'md', className, ...props }, ref) => {
    // Sizes para botões circulares
    const sizes = {
      sm: 'w-11 h-11', // 44x44px
      md: 'w-12 h-12', // 48x48px
      lg: 'w-14 h-14', // 56x56px
    };

    return (
      <button
        ref={ref}
        aria-label={label}
        title={label}
        className={cn(
          // Base
          'inline-flex items-center justify-center',
          'rounded-full',
          'transition-all duration-200',
          'active:scale-95',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'touch-manipulation',
          'select-none',
          // Hover/Focus
          'hover:bg-slate-100 dark:hover:bg-white/10',
          'focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
          // Size
          sizes[size],
          className
        )}
        {...props}
      >
        {icon}
      </button>
    );
  }
);

TouchIconButton.displayName = 'TouchIconButton';

/**
 * TouchActionButtons - Grupo de botões de ação (Edit, Delete, etc)
 * Com espaçamento adequado para evitar toque acidental
 */
export interface TouchActionButtonsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
  customActions?: Array<{
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    variant?: TouchButtonProps['variant'];
  }>;
  className?: string;
}

export function TouchActionButtons({
  onEdit,
  onDelete,
  onView,
  customActions = [],
  className,
}: TouchActionButtonsProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* View */}
      {onView && (
        <TouchIconButton
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          }
          label="Ver detalhes"
          onClick={onView}
          className="text-blue-600 dark:text-blue-400"
        />
      )}

      {/* Edit */}
      {onEdit && (
        <TouchIconButton
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          }
          label="Editar"
          onClick={onEdit}
          className="text-slate-600 dark:text-slate-400"
        />
      )}

      {/* Delete */}
      {onDelete && (
        <TouchIconButton
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          }
          label="Excluir"
          onClick={onDelete}
          className="text-red-600 dark:text-red-400"
        />
      )}

      {/* Custom Actions */}
      {customActions.map((action, index) => (
        <TouchIconButton
          key={index}
          icon={action.icon}
          label={action.label}
          onClick={action.onClick}
        />
      ))}
    </div>
  );
}
