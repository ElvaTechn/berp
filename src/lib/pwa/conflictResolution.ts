/**
 * ================================================================
 * CONFLICT RESOLUTION - BIZCONTROL 360 ERP v2.0.0
 * ================================================================
 * Sistema de resolução de conflitos para sincronização offline
 * 
 * ESTRATÉGIAS:
 * - Last-Write-Wins (LWW): Última modificação vence
 * - Merge Strategy: Combina campos não conflitantes
 * - Manual Resolve: Requer intervenção do usuário
 * - Timestamp-Based: Usa timestamp + user ID
 * ================================================================
 */

"use client";

// ================================================================
// TYPES
// ================================================================

export type ConflictType = 
  | 'product' 
  | 'sale' 
  | 'employee' 
  | 'company' 
  | 'any';

export type ConflictStrategy = 
  | 'lww'                    // Last-Write-Wins
  | 'merge'                  // Merge inteligente
  | 'manual'                 // Resolver manualmente
  | 'timestamp_priority'     // Timestamp + prioridade usuário
  | 'keep_remote'            // Manter versão remota
  | 'keep_local'             // Manter versão local

export interface Conflict {
  id: string;
  type: ConflictType;
  entityId: string;
  entityType: string;
  
  // Versões em conflito
  localVersion: Record<string, any>;
  remoteVersion: Record<string, any>;
  
  // Metadados
  localTimestamp: number;
  remoteTimestamp: number;
  localUserId?: string;
  remoteUserId?: string;
  
  // Campos conflitantes
  conflictedFields: string[];
  
  // Estratégia a usar
  strategy: ConflictStrategy;
  
  // Estado
  resolved: boolean;
  resolution?: Record<string, any>;
  resolutionTimestamp?: number;
  resolvedBy?: string;
}

export interface ConflictResolutionResult {
  conflict: Conflict;
  resolved: boolean;
  resolution: Record<string, any>;
  strategy: ConflictStrategy;
}

export interface MergeOptions {
  // Prioridade de campos (em ordem de importância)
  fieldPriority?: string[];
  
  // Campos que NÃO podem ser mesclados
  nonMergeableFields?: string[];
  
  // Campos numéricos: somar ou máximo?
  numericMerge?: 'sum' | 'max' | 'lww';
  
  // Campos de array: concatenar ou replace?
  arrayMerge?: 'concat' | 'replace' | 'lww';
}

// ================================================================
// CONFIGURAÇÃO
// ================================================================

const CONFLICT_CONFIG = {
  // Tempo de retenção de conflitos não resolvidos (7 dias)
  RETENTION_DAYS: 7,
  
  // Estratégias padrão por tipo de entidade
  DEFAULT_STRATEGIES: {
    product: 'merge',
    sale: 'keep_remote',  // Vendas não devem ser alteradas
    employee: 'merge',
    company: 'manual',
  } as Record<ConflictType, ConflictStrategy>,
  
  // Configurações de merge
  MERGE_OPTIONS: {
    product: {
      fieldPriority: ['name', 'code', 'price', 'quantity'],
      nonMergeableFields: ['id', 'created_at', 'updated_at'],
      numericMerge: 'lww',
      arrayMerge: 'replace',
    },
    employee: {
      fieldPriority: ['full_name', 'email', 'role'],
      nonMergeableFields: ['id', 'password'],
      numericMerge: 'lww',
      arrayMerge: 'replace',
    },
  } as Record<string, MergeOptions>,
} as const;

// ================================================================
// CONFLICT RESOLUTION ENGINE
// ================================================================

class ConflictResolutionEngine {
  private conflicts: Map<string, Conflict> = new Map();
  private resolutionCallbacks: Set<(conflict: Conflict) => void> = new Set();

  /**
   * Detecta conflito entre versões local e remota
   */
  detectConflict(
    type: ConflictType,
    entityId: string,
    entityType: string,
    localVersion: Record<string, any>,
    remoteVersion: Record<string, any>,
    options?: {
      localUserId?: string;
      remoteUserId?: string;
      localTimestamp?: number;
      remoteTimestamp?: number;
    }
  ): Conflict | null {
    const conflictedFields = this.findConflictedFields(localVersion, remoteVersion);
    
    // Se não há campos conflitantes, não há conflito
    if (conflictedFields.length === 0) {
      return null;
    }

    const conflict: Conflict = {
      id: `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      entityId,
      entityType,
      localVersion: { ...localVersion },
      remoteVersion: { ...remoteVersion },
      localTimestamp: options?.localTimestamp || Date.now(),
      remoteTimestamp: options?.remoteTimestamp || Date.now(),
      localUserId: options?.localUserId,
      remoteUserId: options?.remoteUserId,
      conflictedFields,
      strategy: CONFLICT_CONFIG.DEFAULT_STRATEGIES[type] || 'lww',
      resolved: false,
    };

    this.conflicts.set(conflict.id, conflict);
    
    // Notificar callback
    this.resolutionCallbacks.forEach(cb => cb(conflict));
    
    return conflict;
  }

  /**
   * Encontra campos conflitantes
   */
  private findConflictedFields(
    local: Record<string, any>,
    remote: Record<string, any>
  ): string[] {
    const fields: string[] = [];
    
    // Obter todas as chaves de ambos os objetos
    const allKeys = new Set([
      ...Object.keys(local),
      ...Object.keys(remote),
    ]);
    
    for (const key of allKeys) {
      const localValue = local[key];
      const remoteValue = remote[key];
      
      // Ignorar campos de timestamp criados automaticamente
      if (
        key === 'updated_at' ||
        key === 'synced_at' ||
        key === 'cached_at'
      ) {
        continue;
      }
      
      // Comparar valores (deep compare para objetos)
      if (!this.deepEqual(localValue, remoteValue)) {
        fields.push(key);
      }
    }
    
    return fields;
  }

  /**
   * Deep compare para objetos
   */
  private deepEqual(a: any, b: any): boolean {
    if (a === b) return true;
    
    if (typeof a !== typeof b) return false;
    if (typeof a !== 'object' || a === null || b === null) return false;
    
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    if (Array.isArray(a)) {
      if (a.length !== b.length) return false;
      return a.every((item, i) => this.deepEqual(item, b[i]));
    }
    
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    
    if (keysA.length !== keysB.length) return false;
    
    return keysA.every(key => this.deepEqual(a[key], b[key]));
  }

  /**
   * Resolve conflito usando estratégia específica
   */
  async resolveConflict(
    conflictId: string,
    strategy?: ConflictStrategy,
    customResolution?: Record<string, any>
  ): Promise<ConflictResolutionResult> {
    const conflict = this.conflicts.get(conflictId);
    
    if (!conflict) {
      throw new Error(`Conflict ${conflictId} not found`);
    }
    
    if (conflict.resolved) {
      throw new Error(`Conflict ${conflictId} already resolved`);
    }
    
    // Usar estratégia do conflito ou fornecida
    const effectiveStrategy = strategy || conflict.strategy;
    
    let resolution: Record<string, any>;
    
    // Lógica de resolução baseada na estratégia
    switch (effectiveStrategy) {
      case 'lww':
        resolution = this.resolveLWW(conflict);
        break;
      
      case 'merge':
        resolution = this.resolveMerge(conflict);
        break;
      
      case 'timestamp_priority':
        resolution = this.resolveTimestampPriority(conflict);
        break;
      
      case 'keep_remote':
        resolution = { ...conflict.remoteVersion };
        break;
      
      case 'keep_local':
        resolution = { ...conflict.localVersion };
        break;
      
      case 'manual':
        if (!customResolution) {
          throw new Error('Manual resolution requires customResolution');
        }
        resolution = { ...customResolution };
        break;
      
      default:
        resolution = this.resolveLWW(conflict);
    }
    
    // Atualizar conflito como resolvido
    conflict.resolved = true;
    conflict.resolution = resolution;
    conflict.resolutionTimestamp = Date.now();
    conflict.resolvedBy = 'system';
    conflict.strategy = effectiveStrategy;
    
    return {
      conflict,
      resolved: true,
      resolution,
      strategy: effectiveStrategy,
    };
  }

  /**
   * Strategy: Last-Write-Wins
   */
  private resolveLWW(conflict: Conflict): Record<string, any> {
    const isNewerLocal = conflict.localTimestamp >= conflict.remoteTimestamp;
    return { ...isNewerLocal ? conflict.localVersion : conflict.remoteVersion };
  }

  /**
   * Strategy: Merge inteligente
   */
  private resolveMerge(conflict: Conflict): Record<string, any> {
    const mergeOptions = CONFLICT_CONFIG.MERGE_OPTIONS[conflict.type] || {};
    const nonMergeable = new Set(mergeOptions.nonMergeableFields || []);
    
    const result: Record<string, any> = { ...conflict.remoteVersion };
    const isNewerLocal = conflict.localTimestamp >= conflict.remoteTimestamp;
    
    // Para cada campo conflitante
    for (const field of conflict.conflictedFields) {
      // Se campo não pode ser mesclado, usar LWW
      if (nonMergeable.has(field)) {
        result[field] = isNewerLocal 
          ? conflict.localVersion[field] 
          : conflict.remoteVersion[field];
        continue;
      }
      
      const localValue = conflict.localVersion[field];
      const remoteValue = conflict.remoteVersion[field];
      
      // Merge baseado no tipo de dado
      if (typeof localValue === 'number' && typeof remoteValue === 'number') {
        // Números
        const strategy = mergeOptions.numericMerge || 'lww';
        
        if (strategy === 'sum') {
          result[field] = localValue + remoteValue;
        } else if (strategy === 'max') {
          result[field] = Math.max(localValue, remoteValue);
        } else {
          // lww
          result[field] = isNewerLocal ? localValue : remoteValue;
        }
      } else if (Array.isArray(localValue) && Array.isArray(remoteValue)) {
        // Arrays
        const strategy = mergeOptions.arrayMerge || 'replace';
        
        if (strategy === 'concat') {
          result[field] = [...remoteValue, ...localValue];
          // Remover duplicatas
          result[field] = Array.from(new Set(result[field]));
        } else if (strategy === 'lww') {
          result[field] = isNewerLocal ? localValue : remoteValue;
        } else {
          // replace
          result[field] = remoteValue;
        }
      } else {
        // Outros tipos: LWW
        result[field] = isNewerLocal ? localValue : remoteValue;
      }
      
      // Atualizar timestamp
      result.updated_at = new Date().toISOString();
    }
    
    return result;
  }

  /**
   * Strategy: Timestamp + Priority baseada em user
   */
  private resolveTimestampPriority(conflict: Conflict): Record<string, any> {
    // Se há user IDs, usar hierarquia
    if (conflict.localUserId && conflict.remoteUserId) {
      // Aqui você pode implementar lógica de prioridade (ex: admin vs regular)
      // Por enquanto, usar timestamp
      return this.resolveLWW(conflict);
    }
    
    // Caso contrário, usar timestamp
    return this.resolveLWW(conflict);
  }

  /**
   * Obtém conflito por ID
   */
  getConflict(conflictId: string): Conflict | undefined {
    return this.conflicts.get(conflictId);
  }

  /**
   * Obtém todos os conflitos (opcionalmente filtrado)
   */
  getConflicts(filter?: {
    type?: ConflictType;
    resolved?: boolean;
    entityId?: string;
  }): Conflict[] {
    let conflicts = Array.from(this.conflicts.values());
    
    if (filter?.type) {
      conflicts = conflicts.filter(c => c.type === filter.type);
    }
    
    if (filter?.resolved !== undefined) {
      conflicts = conflicts.filter(c => c.resolved === filter.resolved);
    }
    
    if (filter?.entityId) {
      conflicts = conflicts.filter(c => c.entityId === filter.entityId);
    }
    
    return conflicts;
  }

  /**
   * Registra callback para novos conflitos
   */
  onNewConflict(callback: (conflict: Conflict) => void): () => void {
    this.resolutionCallbacks.add(callback);
    
    // Retorna unsubscribe function
    return () => {
      this.resolutionCallbacks.delete(callback);
    };
  }

  /**
   * Limpa conflitos antigos
   */
  cleanupOldConflicts(): number {
    const cutoff = Date.now() - (CONFLICT_CONFIG.RETENTION_DAYS * 24 * 60 * 60 * 1000);
    let cleaned = 0;
    
    for (const [id, conflict] of this.conflicts.entries()) {
      // Remover conflitos resolvidos muito antigos
      if (
        conflict.resolved && 
        conflict.resolutionTimestamp && 
        conflict.resolutionTimestamp < cutoff
      ) {
        this.conflicts.delete(id);
        cleaned++;
      }
    }
    
    return cleaned;
  }

  /**
   * Limpa todos os conflitos
   */
  clearAllConflicts(): void {
    this.conflicts.clear();
  }
}

// ================================================================
// EXPORT SINGLETON
// ================================================================

export const conflictResolution = new ConflictResolutionEngine();

// ================================================================
// HELPER FUNCTIONS
// ================================================================

/**
 * Detecta automaticamente conflito e tenta resolver
 */
export async function autoResolveConflict<T extends Record<string, any>>(
  type: ConflictType,
  entityId: string,
  entityType: string,
  local: T,
  remote: T,
  options?: {
    localUserId?: string;
    remoteUserId?: string;
    localTimestamp?: number;
    remoteTimestamp?: number;
    preferStrategy?: ConflictStrategy;
  }
): Promise<{ resolved: T; hadConflict: boolean; resolution?: ConflictResolutionResult }> {
  // Detectar conflito
  const conflict = conflictResolution.detectConflict(
    type,
    entityId,
    entityType,
    local,
    remote,
    options
  );
  
  // Se não há conflito, retornar versão mais recente
  if (!conflict) {
    const isNewerLocal = (options?.localTimestamp || 0) >= (options?.remoteTimestamp || 0);
    return {
      resolved: isNewerLocal ? local : remote,
      hadConflict: false,
    };
  }
  
  // Tentar resolver automaticamente
  try {
    const result = await conflictResolution.resolveConflict(
      conflict.id,
      options?.preferStrategy
    );
    
    return {
      resolved: result.resolution as T,
      hadConflict: true,
      resolution: result,
    };
  } catch (error) {
    console.error('Auto-resolution failed:', error);
    // Em caso de erro, usar LWW
    const isNewerLocal = (options?.localTimestamp || 0) >= (options?.remoteTimestamp || 0);
    return {
      resolved: isNewerLocal ? local : remote,
      hadConflict: true,
    };
  }
}

/**
 * Wrapper para resolver conflito manualmente
 */
export async function manualResolveConflict(
  conflictId: string,
  resolution: Record<string, any>
): Promise<ConflictResolutionResult> {
  return conflictResolution.resolveConflict(conflictId, 'manual', resolution);
}

/**
 * Obtém estatísticas de conflitos
 */
export function getConflictStats() {
  const conflicts = conflictResolution.getConflicts();
  
  return {
    total: conflicts.length,
    resolved: conflicts.filter(c => c.resolved).length,
    pending: conflicts.filter(c => !c.resolved).length,
    byType: {
      product: conflicts.filter(c => c.type === 'product').length,
      sale: conflicts.filter(c => c.type === 'sale').length,
      employee: conflicts.filter(c => c.type === 'employee').length,
      company: conflicts.filter(c => c.type === 'company').length,
    },
  };
}
