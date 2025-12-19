/**
 * Sistema de Fila de Sincronização Offline
 * Armazena operações localmente e sincroniza quando online
 */

export interface OfflineOperation {
  id: string;
  type: 'venda' | 'produto' | 'cliente' | 'pagamento';
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  retries: number;
  status: 'pending' | 'syncing' | 'failed' | 'success';
  error?: string;
}

const STORAGE_KEY = 'bizcontrol_offline_queue';
const MAX_RETRIES = 3;

class OfflineQueue {
  private queue: OfflineOperation[] = [];
  private isSyncing = false;
  private listeners: ((queue: OfflineOperation[]) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadFromStorage();
      this.setupListeners();
    }
  }

  /**
   * Carrega fila do localStorage
   */
  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
        console.log(`📦 Fila Offline: ${this.queue.length} operações carregadas`);
      }
    } catch (error) {
      console.error('Erro ao carregar fila offline:', error);
      this.queue = [];
    }
  }

  /**
   * Salva fila no localStorage
   */
  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.queue));
      this.notifyListeners();
    } catch (error) {
      console.error('Erro ao salvar fila offline:', error);
    }
  }

  /**
   * Configura listeners de conexão
   */
  private setupListeners() {
    window.addEventListener('online', () => {
      console.log('🔄 Conexão restaurada! Iniciando sincronização...');
      this.syncAll();
    });

    // Listener customizado da aplicação
    window.addEventListener('app-online', () => {
      this.syncAll();
    });
  }

  /**
   * Adiciona operação à fila
   */
  public add(operation: Omit<OfflineOperation, 'id' | 'timestamp' | 'retries' | 'status'>): string {
    const id = `${operation.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newOperation: OfflineOperation = {
      ...operation,
      id,
      timestamp: Date.now(),
      retries: 0,
      status: 'pending',
    };

    this.queue.push(newOperation);
    this.saveToStorage();

    console.log(`➕ Adicionado à fila: ${operation.type} (${operation.action})`);
    
    // Tenta sincronizar imediatamente se estiver online
    if (navigator.onLine && !this.isSyncing) {
      this.syncAll();
    }

    return id;
  }

  /**
   * Remove operação da fila
   */
  public remove(id: string) {
    this.queue = this.queue.filter(op => op.id !== id);
    this.saveToStorage();
    console.log(`➖ Removido da fila: ${id}`);
  }

  /**
   * Obtém todas as operações
   */
  public getAll(): OfflineOperation[] {
    return [...this.queue];
  }

  /**
   * Obtém operações pendentes
   */
  public getPending(): OfflineOperation[] {
    return this.queue.filter(op => op.status === 'pending');
  }

  /**
   * Limpa todas as operações bem-sucedidas
   */
  public clearSuccessful() {
    this.queue = this.queue.filter(op => op.status !== 'success');
    this.saveToStorage();
  }

  /**
   * Sincroniza uma operação específica
   */
  private async syncOperation(operation: OfflineOperation): Promise<boolean> {
    if (!navigator.onLine) {
      console.log('⏸️ Offline: Sync pausado');
      return false;
    }

    try {
      operation.status = 'syncing';
      this.saveToStorage();

      // Monta a URL da API baseado no tipo
      const apiUrl = `/api/${operation.type}s`;
      
      let response: Response;

      switch (operation.action) {
        case 'create':
          response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(operation.data),
          });
          break;

        case 'update':
          response = await fetch(`${apiUrl}/${operation.data.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(operation.data),
          });
          break;

        case 'delete':
          response = await fetch(`${apiUrl}/${operation.data.id}`, {
            method: 'DELETE',
          });
          break;

        default:
          throw new Error(`Ação não suportada: ${operation.action}`);
      }

      if (response.ok) {
        operation.status = 'success';
        console.log(`✅ Sincronizado: ${operation.type} (${operation.action})`);
        
        // Remove da fila após sucesso
        setTimeout(() => this.remove(operation.id), 5000);
        
        return true;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

    } catch (error) {
      console.error(`❌ Erro ao sincronizar ${operation.id}:`, error);
      
      operation.retries++;
      operation.error = error instanceof Error ? error.message : 'Erro desconhecido';

      if (operation.retries >= MAX_RETRIES) {
        operation.status = 'failed';
        console.error(`⚠️ Falha permanente após ${MAX_RETRIES} tentativas: ${operation.id}`);
      } else {
        operation.status = 'pending';
      }

      this.saveToStorage();
      return false;
    }
  }

  /**
   * Sincroniza todas as operações pendentes
   */
  public async syncAll(): Promise<void> {
    if (this.isSyncing) {
      console.log('⏳ Sincronização já em andamento...');
      return;
    }

    if (!navigator.onLine) {
      console.log('⏸️ Offline: Sincronização adiada');
      return;
    }

    const pending = this.getPending();
    if (pending.length === 0) {
      console.log('✨ Nenhuma operação pendente');
      return;
    }

    this.isSyncing = true;
    console.log(`🔄 Iniciando sincronização de ${pending.length} operações...`);

    let successCount = 0;
    let failCount = 0;

    for (const operation of pending) {
      const success = await this.syncOperation(operation);
      if (success) {
        successCount++;
      } else {
        failCount++;
      }
    }

    this.isSyncing = false;
    
    console.log(`📊 Sincronização concluída: ${successCount} ✅ | ${failCount} ❌`);
    
    // Notifica sobre o resultado
    if (successCount > 0) {
      this.dispatchEvent('sync-success', { count: successCount });
    }
    if (failCount > 0) {
      this.dispatchEvent('sync-error', { count: failCount });
    }
  }

  /**
   * Registra listener de mudanças na fila
   */
  public onChange(callback: (queue: OfflineOperation[]) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  /**
   * Notifica listeners sobre mudanças
   */
  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.getAll()));
  }

  /**
   * Dispara evento customizado
   */
  private dispatchEvent(type: string, detail: any) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(`offline-queue-${type}`, { detail }));
    }
  }

  /**
   * Obtém estatísticas da fila
   */
  public getStats() {
    return {
      total: this.queue.length,
      pending: this.queue.filter(op => op.status === 'pending').length,
      syncing: this.queue.filter(op => op.status === 'syncing').length,
      failed: this.queue.filter(op => op.status === 'failed').length,
      success: this.queue.filter(op => op.status === 'success').length,
    };
  }
}

// Exporta instância singleton
export const offlineQueue = new OfflineQueue();
