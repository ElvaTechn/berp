/**
 * ================================================================
 * NOTIFICATION MANAGER - BIZCONTROL 360 ERP
 * ================================================================
 * Centraliza notificações visuais, sonoras e táctis
 *
 * USO:
 *   NotificationManager.success('Título', 'Descrição');
 *   NotificationManager.error('Erro', 'Detalhes');
 *   NotificationManager.saleComplete();  // venda completada
 *   NotificationManager.offline();         // sem conexão
 *   NotificationManager.conflictDetected(5); // conflitos
 * ================================================================
 */

import { toast } from 'sonner';
import { playNotification } from '@/lib/notification-sounds';

interface NotificationOptions {
  enableSound?: boolean;
  enableHaptic?: boolean;
  duration?: number;
}

/**
 * Gestor centralizado de notificações
 * Fornece métodos para diferentes tipos de feedback
 */
export class NotificationManager {
  /**
   * Success notification - uso geral para operações bem-sucedidas
   */
  static success(title: string, message?: string, options: NotificationOptions = {}) {
    const {
      enableSound = true,
      enableHaptic = true,
      duration = 3000,
    } = options;

    // Play sound + haptic FIRST (para feedback imediato)
    if (enableSound) {
      playNotification('success', enableSound, enableHaptic);
    }

    // Show toast
    toast.success(title, {
      description: message,
      duration,
    });
  }

  /**
   * Error notification - uso para erros e falhas críticas
   */
  static error(title: string, message?: string, options: NotificationOptions = {}) {
    const {
      enableSound = true,
      enableHaptic = true,
      duration = 5000,
    } = options;

    if (enableSound) {
      playNotification('error', enableSound, enableHaptic);
    }

    toast.error(title, {
      description: message,
      duration,
    });
  }

  /**
   * Warning notification - uso para alertas e avisos importantes
   */
  static warning(title: string, message?: string, options: NotificationOptions = {}) {
    const {
      enableSound = true,
      enableHaptic = true,
      duration = 4000,
    } = options;

    if (enableSound) {
      playNotification('warning', enableSound, enableHaptic);
    }

    toast.warning(title, {
      description: message,
      duration,
    });
  }

  /**
   * Info notification - uso para informações gerais
   */
  static info(title: string, message?: string, options: NotificationOptions = {}) {
    const {
      enableSound = false, // info geralmente sem som
      enableHaptic = true,
      duration = 3000,
    } = options;

    if (enableHaptic) {
      playNotification('info', false, enableHaptic);
    }

    toast.info(title, {
      description: message,
      duration,
    });
  }

  /**
   * Sale complete notification - uso para vendas finalizadas com sucesso
   */
  static saleComplete(options: NotificationOptions = {}) {
    const {
      enableSound = true,
      enableHaptic = true,
      duration = 3000,
    } = options;

    if (enableSound) {
      playNotification('saleComplete', enableSound, enableHaptic);
    }

    toast.success('Venda concluída!', {
      description: 'A venda foi registrada com sucesso.',
      duration,
    });
  }

  /**
   * Item added to cart - notificação sutil quando adiciona item
   */
  static itemAdded(options: NotificationOptions = {}) {
    const {
      enableSound = true,
      enableHaptic = true,
      duration = 1500, // mais curto
    } = options;

    if (enableSound) {
      playNotification('itemAdded', enableSound, enableHaptic);
    }

    toast.success('Item adicionado', {
      duration: 1500,
      icon: '📦',
    });
  }

  /**
   * Offline notification - sistema detectou que perdeu conexão
   */
  static offline(message?: string) {
    const {
      enableSound = true,
      enableHaptic = true,
      duration = 3000,
    } = {};

    if (enableSound) {
      playNotification('warning', enableSound, enableHaptic);
    }

    toast.warning('Modo Offline Ativo', {
      description: message || 'Conexão com servidor perdida. Operações continuam locais.',
      duration,
    });
  }

  /**
   * Online notification - sistema detectou que reconectou
   */
  static online(message?: string) {
    const {
      enableSound = true,
      enableHaptic = true,
      duration = 3000,
    } = {};

    if (enableSound) {
      playNotification('success', enableSound, enableHaptic);
    }

    toast.success('Conexão Restabelecida!', {
      description: message || 'Sincronizando dados pendentes...',
      duration,
    });
  }

  /**
   * Sync complete notification - sincronização terminou
   * @param count - número de vendas sincronizadas
   */
  static syncComplete(count: number, options: NotificationOptions = {}) {
    const {
      enableSound = true,
      enableHaptic = true,
      duration = 4000,
    } = options;

    if (enableSound) {
      playNotification('success', enableSound, enableHaptic);
    }

    toast.success('Sincronização Concluída', {
      description: `${count} venda(s) sincronizada(s) com sucesso!`,
      duration,
    });
  }

  /**
   * Sync failed notification - erro na sincronização
   * @param message - descrição opcional do erro
   */
  static syncFailed(message?: string, options: NotificationOptions = {}) {
    const {
      enableSound = true,
      enableHaptic = true,
      duration = 5000,
    } = options;

    if (enableSound) {
      playNotification('error', enableSound, enableHaptic);
    }

    toast.error('Erro na Sincronização', {
      description: message || 'Não foi possível sincronizar os dados. Tente novamente.',
      duration,
    });
  }

  /**
   * Conflict detected notification - novos conflitos encontrados
   * @param count - número de conflitos pendentes
   */
  static conflictDetected(count: number, options: NotificationOptions = {}) {
    const {
      enableSound = true,
      enableHaptic = true,
      duration = 5000,
    } = options;

    if (enableSound) {
      playNotification('warning', enableSound, enableHaptic);
    }

    toast.warning('Conflito Detectado', {
      description: `${count} conflito(s) necessita(m) atenção. Verifique em "Sinc & Relatórios".`,
      duration,
    });
  }

  /**
   * Button click feedback - feedback sutilo para cliques
   * Use em botões de interface para feedback instantâneo
   */
  static click(options: NotificationOptions = {}) {
    const {
      enableSound = false,
      enableHaptic = true,
    } = options;

    if (enableHaptic && 'vibrate' in navigator) {
      navigator.vibrate([10]);
    }
    // Nada visual - apenas feedback táctil
  }
}

// Export padrão para conveniência
export default NotificationManager;
