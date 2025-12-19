import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'default' | 'lg';
  text?: string;
  message?: string;
}

export default function LoadingSpinner({ size = 'default', text, message }: LoadingSpinnerProps) {
  const sizes: Record<string, string> = {
    sm: 'h-4 w-4',
    default: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className={`${sizes[size]} animate-spin text-blue-600`} />
      {(text || message) && (
        <p className="text-slate-500 mt-3">{text || message}</p>
      )}
    </div>
  );
}
