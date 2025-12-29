/**
 * ================================================================
 * NOTIFICATIONS HOOK - BIZCONTROL 360 ERP v2.0.0
 * ================================================================
 * Hook React para notificações seguindo padrões agent-os:
 * - Single Responsibility
 * - Reusability
 * - Clear Interface
 * - Performance Considerations
 * ================================================================ */

"use client";

import { useState, useEffect, useCallback } from 'react';
import { ERPNotifications, type Notification } from '@/lib/notifications/notificationService';

export interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  unread: Notification[];
  
  // Actions
  add: (type: Notification['type'], title: string, message: string, options?: {
    duration?: number;
    persistent?: boolean;
    action?: { label: string; callback: () => void };
    sound?: string;
  }) => string;
  
  remove: (id: string) => boolean;
  markAsRead: (id: string) => boolean;
  markAllAsRead: () => void;
  clear: () => void;
  
  // ERP specific
  vendaConcluida: (total: number, paymentMethod: string) => string;
  alertaEstoqueBaixo: (productName: string, quantity: number) => string;
  erroSincronizacao: (error: string) => string;
  sincronizacaoSucesso: (items: number) => string;
  novaReserva: (customerName: string, product: string) => string;
  produtoExpirando: (productName: string, daysLeft: number) => string;
}

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Atualizar lista quando há mudanças
  useEffect(() => {
    const updateNotifications = () => {
      setNotifications(ERPNotifications.global.getAll());
    };

    // Carregar inicial
    updateNotifications();

    // Registrar callbacks
    const unregister = ERPNotifications.global.onEvents({
      onShow: updateNotifications,
      onClose: updateNotifications,
    });

    return unregister;
  }, []);

  // Computed values
  const unreadCount = ERPNotifications.global.unreadCount;
  const unread = notifications.filter(n => !n.read);

  // Actions
  const add = useCallback((
    type: Notification['type'],
    title: string,
    message: string,
    options?: {
      duration?: number;
      persistent?: boolean;
      action?: { label: string; callback: () => void };
      sound?: string;
    }
  ) => {
    return ERPNotifications.global.add(type, title, message, options);
  }, []);

  const remove = useCallback((id: string) => {
    const result = ERPNotifications.global.remove(id);
    setNotifications(ERPNotifications.global.getAll());
    return result;
  }, []);

  const markAsRead = useCallback((id: string) => {
    const result = ERPNotifications.global.markAsRead(id);
    setNotifications(ERPNotifications.global.getAll());
    return result;
  }, []);

  const markAllAsRead = useCallback(() => {
    ERPNotifications.global.markAllAsRead();
    setNotifications(ERPNotifications.global.getAll());
  }, []);

  const clear = useCallback(() => {
    ERPNotifications.global.clear();
    setNotifications([]);
  }, []);

  // ERP specific notifications
  const vendaConcluida = useCallback((total: number, paymentMethod: string) => {
    const id = ERPNotifications.vendaConcluida(total, paymentMethod);
    setNotifications(ERPNotifications.global.getAll());
    return id;
  }, []);

  const alertaEstoqueBaixo = useCallback((productName: string, quantity: number) => {
    const id = ERPNotifications.alertaEstoqueBaixo(productName, quantity);
    setNotifications(ERPNotifications.global.getAll());
    return id;
  }, []);

  const erroSincronizacao = useCallback((error: string) => {
    const id = ERPNotifications.erroSincronizacao(error);
    setNotifications(ERPNotifications.global.getAll());
    return id;
  }, []);

  const sincronizacaoSucesso = useCallback((items: number) => {
    const id = ERPNotifications.sincronizacaoSucesso(items);
    setNotifications(ERPNotifications.global.getAll());
    return id;
  }, []);

  const novaReserva = useCallback((customerName: string, product: string) => {
    const id = ERPNotifications.novaReserva(customerName, product);
    setNotifications(ERPNotifications.global.getAll());
    return id;
  }, []);

  const produtoExpirando = useCallback((productName: string, daysLeft: number) => {
    const id = ERPNotifications.produtoExpirando(productName, daysLeft);
    setNotifications(ERPNotifications.global.getAll());
    return id;
  }, []);

  return {
    notifications,
    unreadCount,
    unread,
    add,
    remove,
    markAsRead,
    markAllAsRead,
    clear,
    vendaConcluida,
    alertaEstoqueBaixo,
    erroSincronizacao,
    sincronizacaoSucesso,
    novaReserva,
    produtoExpirando,
  };
}

// ================================================================
// NOTIFICATION CONTEXT HOOK
// ================================================================

export function useNotificationManager() {
  return ERPNotifications.global;
}

// ================================================================
// DESKTOP NOTIFICATIONS HOOK
// ================================================================

export interface UseDesktopNotificationsReturn {
  supported: boolean;
  permission: NotificationPermission;
  requestPermission: () => Promise<NotificationPermission>;
  show: (title: string, options?: globalThis.NotificationOptions) => globalThis.Notification | null;
}

export function useDesktopNotifications(): UseDesktopNotificationsReturn {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const supported = typeof Notification !== 'undefined';

  useEffect(() => {
    if (supported) {
      setPermission(Notification.permission);
    }
  }, [supported]);

  const requestPermission = useCallback(async () => {
    if (!supported) return 'default';

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  }, [supported]);

  const show = useCallback((
    title: string,
    options?: globalThis.NotificationOptions
  ): globalThis.Notification | null => {
    if (!supported || permission !== 'granted') return null;

    try {
      return new globalThis.Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });
    } catch (error) {
      console.error('Error showing desktop notification:', error);
      return null;
    }
  }, [supported, permission]);

  return {
    supported,
    permission,
    requestPermission,
    show,
  };
}

// ================================================================
// NOTIFICATION PERMISSION HOOK
// ================================================================

export function useNotificationPermission(): {
  permission: NotificationPermission;
  canNotify: boolean;
  requestPermission: () => Promise<boolean>;
} {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  
  useEffect(() => {
    if (typeof Notification !== 'undefined') {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') {
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Error requesting permission:', error);
      return false;
    }
  }, []);

  return {
    permission,
    canNotify: permission === 'granted',
    requestPermission,
  };
}
