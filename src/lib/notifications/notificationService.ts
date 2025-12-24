/**
 * ================================================================
 * NOTIFICATION SERVICE - BIZCONTROL 360 ERP v2.0.0
 * ================================================================
 * Sistema completo de notificações seguindo padrões agent-os:
 * - Single Responsibility
 * - Reusability
 * - Clear Interface
 * - Performance Considerations
 * ================================================================
 */

"use client";

import * as offlineSync from '../pwa/offlineSync';

// ================================================================
// TYPES
// ================================================================

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  persistent?: boolean; // Não remove automaticamente
  action?: {
    label: string;
    callback: () => void;
  };
  metadata?: Record<string, any>;
}

export interface NotificationOptions {
  duration?: number; // ms (0 = não remove automaticamente)
  persistent?: boolean;
  showProgress?: boolean;
  action?: Notification['action'];
  sound?: string; // Nome do som para tocar
}

export type NotificationCallback = {
  onShow?: (notification: Notification) => void;
  onClose?: (notification: Notification) => void;
  onClick?: (notification: Notification) => void;
};

// ================================================================
// CONFIGURAÇÃO
// ================================================================

const NOTIFICATION_CONFIG = {
  DEFAULT_DURATION: 5000, // 5 segundos
  MAX_NOTIFICATIONS: 5, // Máximo simultâneo
  STORAGE_KEY: 'bizcontrol_notifications',
  SOUNDS: {
    success: 'success.mp3',
    error: 'error.mp3',
    warning: 'warning.mp3',
    info: 'info.mp3',
  } as const,
} as const;

// ================================================================
// CORE NOTIFICATION MANAGER
// ================================================================

class NotificationManager {
  private notifications: Notification[] = [];
  private callbacks: Set<NotificationCallback> = new Set();
  private audioContext: AudioContext | null = null;
  private observer: MutationObserver | null = null;

  constructor() {
    this.initializeAudio();
    this.requestPermissions();
    this.setupPageVisibility();
  }

  /**
   * Inicializa contexto de áudio
   */
  private initializeAudio(): void {
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      this.audioContext = new AudioContext();
    }
  }

  /**
   * Solicita permissões de notificação
   */
  private async requestPermissions(): Promise<void> {
    if (!('Notification' in window)) {
      console.warn('Este navegador não suporta notificações');
      return;
    }

    if (Notification.permission === 'default') {
      try {
        await Notification.requestPermission();
      } catch (error) {
        console.warn('Não foi possível solicitar permissão de notificação:', error);
      }
    }
  }

  /**
   * Configura visibilidade da página para pausar notificações
   */
  private setupPageVisibility(): void {
    if (typeof document !== 'undefined') {
      this.observer = new MutationObserver(() => {
        this.handlePageVisibilityChange();
      });
      
      this.observer.observe(document, {
        childList: true,
        subtree: true,
        attributes: true,
      });
    }
  }

  /**
   * Lida com mudança de visibilidade da página
   */
  private handlePageVisibilityChange(): void {
    if (document.hidden) {
      // Página em background - usar notificações nativas se disponível
      this.enableNativeNotifications();
    }
  }

  /**
   * Habilita notificações nativas do sistema
   */
  private enableNativeNotifications(): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      const unreadNotifications = this.notifications.filter(n => !n.read);
      
      unreadNotifications.forEach(notification => {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico',
          tag: notification.id,
          requireInteraction: notification.persistent,
        });
      });
    }
  }

  /**
   * Registra callbacks de eventos
   */
  onEvents(callbacks: NotificationCallback): () => void {
    this.callbacks.add(callbacks);
    
    // Cleanup function
    return () => {
      this.callbacks.delete(callbacks);
    };
  }

  /**
   * Dispara eventos para todos os callbacks
   */
  private triggerCallbacks(
    event: keyof NotificationCallback,
    notification: Notification
  ): void {
    this.callbacks.forEach(callback => {
      const handler = callback[event];
      if (handler) {
        try {
          handler(notification);
        } catch (error) {
          console.warn('Erro em callback de notificação:', error);
        }
      }
    });
  }

  /**
   * Adiciona notificação
   */
  add(
    type: Notification['type'],
    title: string,
    message: string,
    options?: NotificationOptions
  ): string {
    const id = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const notification: Notification = {
      id,
      type,
      title,
      message,
      timestamp: Date.now(),
      read: false,
      persistent: options?.persistent || false,
      action: options?.action,
      metadata: {
        duration: options?.duration ?? NOTIFICATION_CONFIG.DEFAULT_DURATION,
        showProgress: options?.showProgress || false,
      },
    };

    // Verificar limite máximo
    if (this.notifications.length >= NOTIFICATION_CONFIG.MAX_NOTIFICATIONS) {
      // Remover a mais antiga não persistente
      const oldest = this.notifications
        .filter(n => !n.persistent)
        .sort((a, b) => a.timestamp - b.timestamp)[0];
      
      if (oldest) {
        this.remove(oldest.id);
      }
    }

    this.notifications.push(notification);
    this.saveToStorage();

    // Tocar som se especificado
    if (options?.sound) {
      this.playSound(options.sound);
    } else {
      this.playSound(type);
    }

    // Auto-remove se não for persistente
    if (!notification.persistent && options?.duration !== 0) {
      setTimeout(() => {
        this.remove(id);
      }, notification.metadata?.duration || NOTIFICATION_CONFIG.DEFAULT_DURATION);
    }

    // Disparar callbacks
    this.triggerCallbacks('onShow', notification);

    return id;
  }

  /**
   * Remove notificação
   */
  remove(id: string): boolean {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index === -1) return false;

    const notification = this.notifications[index];
    this.notifications.splice(index, 1);
    this.saveToStorage();

    // Disparar callbacks
    this.triggerCallbacks('onClose', notification);

    return true;
  }

  /**
   * Marca notificação como lida
   */
  markAsRead(id: string): boolean {
    const notification = this.notifications.find(n => n.id === id);
    if (!notification || notification.read) return false;

    notification.read = true;
    this.saveToStorage();

    return true;
  }

  /**
   * Marca todas como lidas
   */
  markAllAsRead(): void {
    this.notifications.forEach(n => {
      n.read = true;
    });
    this.saveToStorage();
  }

  /**
   * Limpa todas as notificações
   */
  clear(): void {
    this.notifications = [];
    this.saveToStorage();
  }

  /**
   * Obtém todas as notificações
   */
  getAll(): Notification[] {
    return [...this.notifications].sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Obtém notificações não lidas
   */
  getUnread(): Notification[] {
    return this.notifications.filter(n => !n.read);
  }

  /**
   * Contagem de notificações não lidas
  */
  get unreadCount(): number {
    return this.getUnread().length;
  }

  /**
   * Salva no localStorage
   */
  private saveToStorage(): void {
    try {
      const data = {
        notifications: this.notifications,
        timestamp: Date.now(),
      };
      localStorage.setItem(NOTIFICATION_CONFIG.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Erro ao salvar notificações:', error);
    }
  }

  /**
   * Carrega do localStorage
   */
  loadFromStorage(): void {
    try {
      const data = localStorage.getItem(NOTIFICATION_CONFIG.STORAGE_KEY);
      if (!data) return;

      const parsed = JSON.parse(data);
      
      // Verificar se os dados não são muito antigos (mais de 7 dias)
      const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      if (parsed.timestamp < weekAgo) {
        // Limpar dados antigos
        localStorage.removeItem(NOTIFICATION_CONFIG.STORAGE_KEY);
        return;
      }

      this.notifications = parsed.notifications || [];
      
    } catch (error) {
      console.warn('Erro ao carregar notificações:', error);
    }
  }

  /**
   * Toca som de notificação (performance otimizado)
   */
  private playSound(type: string): void {
    if (!this.audioContext) return;

    try {
      // Create oscillator para som simples e performático
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      // Configurar frequências baseadas no tipo
      const frequencies = {
        success: 800,
        error: 400,
        warning: 600,
        info: 500,
      };

      oscillator.frequency.setValueAtTime(
        frequencies[type as keyof typeof frequencies] || 500,
        this.audioContext.currentTime
      );

      // Configurar envelope de áudio
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);

      // Conectar nós
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Tocar
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.2);

    } catch (error) {
      console.warn('Erro ao tocar som:', error);
    }
  }

  /**
   * Limpeza
   */
  destroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
    
    if (this.audioContext) {
      this.audioContext.close();
    }
    
    this.callbacks.clear();
  }
}

// ================================================================
// IMPLEMENTAÇÃO DE NOTIFICAÇÕES ESPECÍFICAS DO ERP
// ================================================================

export class ERPNotifications {
  private static instance = new NotificationManager();

  /**
   * Notificação de venda concluída
   */
  static vendaConcluida(total: number, paymentMethod: string): string {
    return this.instance.add(
      'success',
      'Venda Concluída',
      new Intl.NumberFormat('pt-MZ', {
        style: 'currency',
        currency: 'MZN'
      }).format(total), {
        duration: 4000,
        sound: 'success',
      }
    );
  }

  /**
   * Alerta de estoque baixo
   */
  static alertaEstoqueBaixo(productName: string, quantity: number): string {
    return this.instance.add(
      'warning',
      'Estoque Baixo',
      `${productName} está com apenas ${quantity} unidades`,
      {
        persistent: true,
        sound: 'warning',
        action: {
          label: 'Ver Estoque',
          callback: () => {
            window.location.href = '/inventory';
          },
        },
      }
    );
  }

  /**
   * Erro de sincronização offline
   */
  static erroSincronizacao(error: string): string {
    return this.instance.add(
      'error',
      'Erro de Sincronização',
      error,
      {
        persistent: true,
        sound: 'error',
        action: {
          label: 'Tentar Novamente',
          callback: () => {
            offlineSync.syncOffline().catch(console.error);
          },
        },
      }
    );
  }

  /**
   * Sucesso na sincronização
   */
  static sincronizacaoSucesso(items: number): string {
    return this.instance.add(
      'success',
      'Sincronização Completa',
      `${items} itens sincronizados com sucesso`,
      {
        duration: 3000,
        sound: 'success',
      }
    );
  }

  /**
   * Nova reserva
   */
  static novaReserva(customerName: string, product: string): string {
    return this.instance.add(
      'info',
      'Nova Reserva',
      `${customerName} reservou ${product}`,
      {
        action: {
          label: 'Ver Reserva',
          callback: () => {
            window.location.href = '/reservations';
          },
        },
      }
    );
  }

  /**
   * Aviso de expiração de produto
   */
  static produtoExpirando(productName: string, daysLeft: number): string {
    return this.instance.add(
      'warning',
      'Produto Próximo de Vencer',
      `${productName} expira em ${daysLeft} dias`,
      {
        persistent: true,
        action: {
          label: 'Ver Produtos',
          callback: () => {
            window.location.href = '/products';
          },
        },
      }
    );
  }

  /**
   * Notificação de sistema
   */
  static mensagemSistema(title: string, message: string): string {
    return this.instance.add('info', title, message, {
      duration: 6000,
    });
  }

  /**
   * Instância global para acesso direto
   */
  static get global(): NotificationManager {
    return this.instance;
  }
}

// ================================================================
// EXPORTS E INTERFACE GLOBAL
// ================================================================

// Adicionar ao window se disponível (para fácil debugging)
if (typeof window !== 'undefined') {
  (window as any).ERPNotifications = ERPNotifications;
}

// Carregar notificações salvas
ERPNotifications.global.loadFromStorage();

export default ERPNotifications;
