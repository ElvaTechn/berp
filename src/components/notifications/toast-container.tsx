/**
 * ================================================================
 * NOTIFICATION TOAST COMPONENT - BIZCONTROL 360 ERP v2.0.0
 * ================================================================
 * Component de toast para notificações seguindo padrões agent-os:
 * - Single Responsibility
 * - Reusability
 * - Clear Interface
 * - Performance Considerations (Animation otimizada)
 * ================================================================ */

"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info, WifiOff } from 'lucide-react';
import { ERPNotifications, Notification } from '@/lib/notifications/notificationService';

// ================================================================
// UTILS
// ================================================================

const getIconForType = (type: Notification['type']) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="w-5 h-5" />;
    case 'error':
      return <X className="w-5 h-5" />;
    case 'warning':
      return <AlertTriangle className="w-5 h-5" />;
    case 'info':
      return <Info className="w-5 h-5" />;
  }
};

const getColorsForType = (type: Notification['type']) => {
  switch (type) {
    case 'success':
      return {
        bg: 'bg-green-500/10 border-green-500/20',
        text: 'text-green-600 dark:text-green-400',
        icon: 'text-green-500',
        progress: 'bg-green-500',
      };
    case 'error':
      return {
        bg: 'bg-red-500/10 border-red-500/20',
        text: 'text-red-600 dark:text-red-400',
        icon: 'text-red-500',
        progress: 'bg-red-500',
      };
    case 'warning':
      return {
        bg: 'bg-orange-500/10 border-orange-500/20',
        text: 'text-orange-600 dark:text-orange-400',
        icon: 'text-orange-500',
        progress: 'bg-orange-500',
      };
    case 'info':
      return {
        bg: 'bg-blue-500/10 border-blue-500/20',
        text: 'text-blue-600 dark:text-blue-400',
        icon: 'text-blue-500',
        progress: 'bg-blue-500',
      };
  }
};

// ================================================================
// COMPONENT
// ================================================================

export function ToastContainer() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Obter notificações iniciais
    setNotifications(ERPNotifications.global.getAll());

    // Registrar callbacks
    const unregister = ERPNotifications.global.onEvents({
      onShow: (notification) => {
        setNotifications(prev => [...prev, notification]);
      },
      onClose: (notification) => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      },
    });

    return unregister;
  }, []);

  const removeNotification = useCallback((id: string) => {
    ERPNotifications.global.remove(id);
  }, []);

  const markAsRead = useCallback((id: string) => {
    ERPNotifications.global.markAsRead(id);
  }, []);

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2 max-w-md w-full pointer-events-none">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <Toast
            key={notification.id}
            notification={notification}
            onRemove={removeNotification}
            onRead={markAsRead}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

interface ToastProps {
  notification: Notification;
  onRemove: (id: string) => void;
  onRead: (id: string) => void;
}

function Toast({ notification, onRemove, onRead }: ToastProps) {
  const colors = getColorsForType(notification.type);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (notification.persistent || notification.metadata?.duration === 0) {
      return;
    }

    const duration = notification.metadata?.duration || 5000;
    const interval = 50; // Update every 50ms for smooth progress
    const decrement = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress(prev => {
        const newValue = prev - decrement;
        if (newValue <= 0) {
          clearInterval(timer);
          return 0;
        }
        return newValue;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [notification]);

  const handleClick = useCallback(() => {
    if (!notification.read) {
      onRead(notification.id);
    }
    
    if (notification.action) {
      notification.action.callback();
    }
  }, [notification, onRead]);

  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove(notification.id);
  }, [notification.id, onRemove]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 380, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 380, scale: 0.8 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        mass: 0.8
      }}
      className={`
        relative overflow-hidden rounded-xl border backdrop-blur-sm cursor-pointer
        pointer-events-auto select-none shadow-lg hover:shadow-xl transition-all duration-200
        ${colors.bg} ${colors.text} border-l-4
      `}
      style={{ borderLeftColor: `currentColor` }}
      onClick={handleClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start gap-3 p-4">
        {/* Icon */}
        <div className={`flex-shrink-0 ${colors.icon}`}>
          {getIconForType(notification.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm mb-1 truncate">
                {notification.title}
              </h4>
              <p className="text-xs opacity-90 leading-relaxed">
                {notification.message}
              </p>
              
              {/* Action Button */}
              {notification.action && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    notification.action?.callback();
                  }}
                  className="mt-2 text-xs font-medium hover:opacity-80 transition-opacity"
                >
                  {notification.action.label} →
                </button>
              )}
            </div>

            {/* Remove Button */}
            <button
              onClick={handleRemove}
              className="flex-shrink-0 p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-2 mt-2 text-xs opacity-70">
            <span>
              {new Date(notification.timestamp).toLocaleTimeString('pt-MZ', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            {!notification.read && (
              <span className="w-2 h-2 rounded-full bg-current" />
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {notification.metadata?.showProgress && !notification.persistent && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10 dark:bg-white/10">
          <motion.div
            className={`h-full ${colors.progress}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </motion.div>
  );
}

// ================================================================
// NOTIFICATION CENTER (DROPDOWN)
// ================================================================

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const unreadCount = ERPNotifications.global.unreadCount;

  useEffect(() => {
    const updateNotifications = () => {
      setNotifications(ERPNotifications.global.getAll());
    };

    updateNotifications();

    const unregister = ERPNotifications.global.onEvents({
      onShow: updateNotifications,
      onClose: updateNotifications,
    });

    return unregister;
  }, []);

  // Auto-fechar após 10 segundos
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setIsOpen(false);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const markAllAsRead = useCallback(() => {
    ERPNotifications.global.markAllAsRead();
    setNotifications(ERPNotifications.global.getAll());
  }, []);

  const clearAll = useCallback(() => {
    ERPNotifications.global.clear();
    setNotifications([]);
    setIsOpen(false);
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <div className="w-5 h-5" />
        {/* Bell icon aqui - implementação simplificada */}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-96 bg-white dark:bg-black rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
              <h3 className="font-semibold">Notificações</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs hover:opacity-70 transition-opacity"
                  >
                    Marcar todas como lidas
                  </button>
                )}
                <button
                  onClick={clearAll}
                  className="text-xs hover:opacity-70 transition-opacity"
                >
                  Limpar
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <div className="w-12 h-12 mx-auto mb-4 opacity-50">
                    <WifiOff className="w-full h-full" />
                  </div>
                  <p className="text-sm">Nenhuma notificação</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-800">
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onClick={() => setIsOpen(false)}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface NotificationItemProps {
  notification: Notification;
  onClick: () => void;
}

function NotificationItem({ notification, onClick }: NotificationItemProps) {
  const colors = getColorsForType(notification.type);

  const handleClick = useCallback(() => {
    if (!notification.read) {
      ERPNotifications.global.markAsRead(notification.id);
    }
    onClick();
  }, [notification, onClick]);

  return (
    <motion.div
      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition-colors ${!notification.read ? 'bg-gray-50/50 dark:bg-gray-900/50' : ''}`}
      onClick={handleClick}
      whileHover={{ x: 4 }}
    >
      <div className="flex gap-3">
        <div className={`flex-shrink-0 ${colors.icon} mt-0.5`}>
          {getIconForType(notification.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm mb-1 truncate">
                {notification.title}
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                {notification.message}
              </p>
            </div>
            {!notification.read && (
              <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            {new Date(notification.timestamp).toLocaleDateString('pt-MZ', {
              day: '2-digit',
              month: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
