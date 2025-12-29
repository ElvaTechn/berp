"use client";

import React from 'react';
import { Toaster as Sonner, toast } from 'sonner';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

// Custom Toast Icon Component
const ToastIcon = ({ type }: { type: 'success' | 'error' | 'warning' | 'info' }) => {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-[var(--neu-success)]" />,
    error: <XCircle className="w-5 h-5 text-[var(--neu-error)]" />,
    warning: <AlertTriangle className="w-5 h-5 text-[var(--neu-warning)]" />,
    info: <Info className="w-5 h-5 text-[var(--neu-accent)]" />,
  };

  return (
    <div className="w-10 h-10 rounded-xl neu-surface neu-convex-md flex items-center justify-center flex-shrink-0">
      {icons[type]}
    </div>
  );
};

// Neumorphic Toaster Provider
export function NeuToaster() {
  return (
    <Sonner
      position="top-right"
      expand={false}
      richColors={false}
      closeButton={true}
      duration={4000}
      gap={12}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: cn(
            'w-full max-w-md p-4 rounded-2xl backdrop-blur-md',
            'neu-surface neu-convex-md',
            'border border-[var(--neu-border)]',
            'shadow-lg',
            'data-[mounted=true]:animate-in data-[mounted=true]:slide-in-from-top-full',
            'data-[swipe=end]:animate-out data-[swipe=end]:slide-out-to-right-full',
            'group'
          ),
          title: 'neu-text-body font-bold text-[var(--neu-text-primary)] mb-1',
          description: 'neu-text-caption text-[var(--neu-text-muted)]',
          actionButton: cn(
            'px-4 py-2 rounded-xl neu-surface neu-convex-sm',
            'neu-text-caption font-bold text-[var(--neu-accent)]',
            'hover:neu-convex-md transition-all duration-200'
          ),
          cancelButton: cn(
            'px-4 py-2 rounded-xl neu-surface neu-concave-sm',
            'neu-text-caption font-bold text-[var(--neu-text-muted)]',
            'hover:text-[var(--neu-text-primary)] transition-all duration-200'
          ),
          closeButton: cn(
            'absolute top-4 right-4 w-8 h-8 rounded-lg',
            'neu-surface neu-convex-sm flex items-center justify-center',
            'text-[var(--neu-text-muted)] hover:text-[var(--neu-text-primary)]',
            'hover:neu-convex-md transition-all duration-200',
            'opacity-0 group-hover:opacity-100'
          ),
          success: 'border-l-4 border-[var(--neu-success)]',
          error: 'border-l-4 border-[var(--neu-error)]',
          warning: 'border-l-4 border-[var(--neu-warning)]',
          info: 'border-l-4 border-[var(--neu-accent)]',
        },
      }}
      icons={{
        success: <ToastIcon type="success" />,
        error: <ToastIcon type="error" />,
        warning: <ToastIcon type="warning" />,
        info: <ToastIcon type="info" />,
      }}
    />
  );
}

export const neuToast = {
  success: (message: string, options?: any) => {
    return toast.success(message, options);
  },
  error: (message: string, options?: any) => {
    return toast.error(message, options);
  },
  warning: (message: string, options?: any) => {
    return toast.warning(message, options);
  },
  info: (message: string, options?: any) => {
    return toast.info(message, options);
  },
  promise: <T,>(promise: Promise<T>, options: any) => {
    return toast.promise(promise, options);
  },
  dismiss: (toastId?: string | number) => {
    return toast.dismiss(toastId);
  },
};

export { toast };
