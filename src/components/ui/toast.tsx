"use client";

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { enableSwipeToDismiss } from '@/lib/toast-swipe';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const removeToast = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const duration = toast.duration || 5000;
    const newToast: Toast = {
      ...toast,
      id,
      duration,
    };

    setToasts(prev => [...prev, newToast]);

    const timer = setTimeout(() => {
      removeToast(id);
    }, duration);
    
    timersRef.current.set(id, timer);
  }, [removeToast]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach(timer => clearTimeout(timer));
    };
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

// Individual toast item com swipe-to-dismiss
const ToastItem: React.FC<{ toast: Toast; onDismiss: () => void }> = ({ toast, onDismiss }) => {
  const toastRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (toastRef.current) {
      const cleanup = enableSwipeToDismiss(
        toastRef.current,
        onDismiss,
        100 // threshold em pixels
      );
      return cleanup;
    }
  }, [onDismiss]);

  const getIcon = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getStyles = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <div
      ref={toastRef}
      className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg max-w-sm animate-fade-in cursor-pointer select-none hover:bg-opacity-90 ${getStyles(toast.type)}`}
    >
      <div className="flex-shrink-0">
        {getIcon(toast.type)}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm">{toast.title}</h4>
        {toast.message && (
          <p className="text-sm mt-1 opacity-90">{toast.message}</p>
        )}
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDismiss();
        }}
        className="flex-shrink-0 p-1 hover:opacity-70 transition-colors"
        aria-label={`Dismiss ${toast.type} notification`}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// Toast helper object - must be used within ToastProvider context via useToast hook
// These are kept for backward compatibility but should use useToast() hook directly
let toastCallback: ((toast: Omit<Toast, 'id'>) => void) | null = null;

export const setToastCallback = (callback: ((toast: Omit<Toast, 'id'>) => void) | null) => {
  toastCallback = callback;
};

export const toast = {
  success: (title: string, message?: string) => {
    if (toastCallback) {
      toastCallback({ type: 'success', title, message });
    } else {
      console.warn('Toast not initialized. Wrap your app in ToastProvider.');
    }
  },
  error: (title: string, message?: string) => {
    if (toastCallback) {
      toastCallback({ type: 'error', title, message, duration: 8000 });
    } else {
      console.warn('Toast not initialized. Wrap your app in ToastProvider.');
    }
  },
  warning: (title: string, message?: string) => {
    if (toastCallback) {
      toastCallback({ type: 'warning', title, message });
    } else {
      console.warn('Toast not initialized. Wrap your app in ToastProvider.');
    }
  },
  info: (title: string, message?: string) => {
    if (toastCallback) {
      toastCallback({ type: 'info', title, message });
    } else {
      console.warn('Toast not initialized. Wrap your app in ToastProvider.');
    }
  }
};

// Component to initialize toast callback
export const ToastInitializer: React.FC = () => {
  const { addToast } = useToast();
  
  useEffect(() => {
    setToastCallback(addToast);
    return () => {
      setToastCallback(null);
    };
  }, [addToast]);
  
  return null;
};
