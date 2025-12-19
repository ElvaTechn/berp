/**
 * Helpers para integrar operações offline com a aplicação
 * Facilita o uso do sistema de fila offline
 */

import { offlineQueue } from './offline-queue';

/**
 * Registra uma venda para sincronização offline
 */
export async function createVendaOffline(vendaData: any) {
  if (navigator.onLine) {
    // Se estiver online, faz a requisição diretamente
    try {
      const response = await fetch('/api/vendas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vendaData),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao criar venda online, adicionando à fila:', error);
      // Se falhar online, adiciona à fila
      return addVendaToQueue(vendaData);
    }
  } else {
    // Se estiver offline, adiciona à fila
    return addVendaToQueue(vendaData);
  }
}

/**
 * Adiciona venda à fila offline
 */
function addVendaToQueue(vendaData: any) {
  const id = offlineQueue.add({
    type: 'venda',
    action: 'create',
    data: vendaData,
  });

  console.log('📦 Venda adicionada à fila offline:', id);

  return {
    success: true,
    offline: true,
    queueId: id,
    message: 'Venda registrada offline. Será sincronizada quando voltar online.',
  };
}

/**
 * Atualiza um produto offline
 */
export async function updateProdutoOffline(produtoId: string, produtoData: any) {
  if (navigator.onLine) {
    try {
      const response = await fetch(`/api/produtos/${produtoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(produtoData),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao atualizar produto online, adicionando à fila:', error);
      return addProdutoUpdateToQueue(produtoId, produtoData);
    }
  } else {
    return addProdutoUpdateToQueue(produtoId, produtoData);
  }
}

/**
 * Adiciona atualização de produto à fila
 */
function addProdutoUpdateToQueue(produtoId: string, produtoData: any) {
  const id = offlineQueue.add({
    type: 'produto',
    action: 'update',
    data: { id: produtoId, ...produtoData },
  });

  return {
    success: true,
    offline: true,
    queueId: id,
    message: 'Produto atualizado offline. Será sincronizado quando voltar online.',
  };
}

/**
 * Cria um cliente offline
 */
export async function createClienteOffline(clienteData: any) {
  if (navigator.onLine) {
    try {
      const response = await fetch('/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clienteData),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao criar cliente online, adicionando à fila:', error);
      return addClienteToQueue(clienteData);
    }
  } else {
    return addClienteToQueue(clienteData);
  }
}

/**
 * Adiciona cliente à fila
 */
function addClienteToQueue(clienteData: any) {
  const id = offlineQueue.add({
    type: 'cliente',
    action: 'create',
    data: clienteData,
  });

  return {
    success: true,
    offline: true,
    queueId: id,
    message: 'Cliente criado offline. Será sincronizado quando voltar online.',
  };
}

/**
 * Registra um pagamento offline
 */
export async function createPagamentoOffline(pagamentoData: any) {
  if (navigator.onLine) {
    try {
      const response = await fetch('/api/pagamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pagamentoData),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao criar pagamento online, adicionando à fila:', error);
      return addPagamentoToQueue(pagamentoData);
    }
  } else {
    return addPagamentoToQueue(pagamentoData);
  }
}

/**
 * Adiciona pagamento à fila
 */
function addPagamentoToQueue(pagamentoData: any) {
  const id = offlineQueue.add({
    type: 'pagamento',
    action: 'create',
    data: pagamentoData,
  });

  return {
    success: true,
    offline: true,
    queueId: id,
    message: 'Pagamento registrado offline. Será sincronizado quando voltar online.',
  };
}

/**
 * Verifica se há operações pendentes de sincronização
 */
export function hasPendingOperations(): boolean {
  return offlineQueue.getPending().length > 0;
}

/**
 * Obtém estatísticas das operações offline
 */
export function getOfflineStats() {
  return offlineQueue.getStats();
}

/**
 * Força sincronização de todas as operações pendentes
 */
export async function forceSyncAll() {
  if (!navigator.onLine) {
    throw new Error('Não é possível sincronizar offline');
  }
  
  await offlineQueue.syncAll();
}

/**
 * Salva dados em cache local (localStorage)
 * Útil para cachear produtos, clientes, etc
 */
export function cacheData<T>(key: string, data: T, expiryMinutes: number = 60): void {
  try {
    const item = {
      data,
      expiry: Date.now() + (expiryMinutes * 60 * 1000),
    };
    localStorage.setItem(`cache_${key}`, JSON.stringify(item));
  } catch (error) {
    console.error('Erro ao cachear dados:', error);
  }
}

/**
 * Recupera dados do cache local
 */
export function getCachedData<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(`cache_${key}`);
    if (!item) return null;

    const parsed = JSON.parse(item);
    
    // Verifica expiração
    if (Date.now() > parsed.expiry) {
      localStorage.removeItem(`cache_${key}`);
      return null;
    }

    return parsed.data as T;
  } catch (error) {
    console.error('Erro ao recuperar cache:', error);
    return null;
  }
}

/**
 * Limpa cache expirado
 */
export function clearExpiredCache(): void {
  try {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(key => key.startsWith('cache_'));
    
    cacheKeys.forEach(key => {
      const item = localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);
        if (Date.now() > parsed.expiry) {
          localStorage.removeItem(key);
        }
      }
    });
  } catch (error) {
    console.error('Erro ao limpar cache:', error);
  }
}

/**
 * Obtém tamanho total do cache em bytes
 */
export function getCacheSize(): number {
  let size = 0;
  try {
    for (const key in localStorage) {
      if (key.startsWith('cache_') || key === 'bizcontrol_offline_queue') {
        size += localStorage[key].length + key.length;
      }
    }
  } catch (error) {
    console.error('Erro ao calcular tamanho do cache:', error);
  }
  return size;
}

/**
 * Formata tamanho em bytes para formato legível
 */
export function formatCacheSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
