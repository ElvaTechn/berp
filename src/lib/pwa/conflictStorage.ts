/**
 * ================================================================
 * CONFLICT STORAGE - BIZCONTROL 360 ERP v2.1.0
 * ================================================================
 * Armazenamento persistente de conflitos usando localStorage
 * Simples e eficiente para histórico de conflitos de sync
 * ================================================================
 */

"use client";

// ================================================================
// TYPES
// ================================================================

export interface Conflict {
  id: string;
  type: 'product' | 'sale' | 'employee' | 'company';
  entityId: string;
  timestamp: Date;
  status: 'pending' | 'resolved' | 'failed';
  localData: Record<string, any>;
  serverData: Record<string, any>;
  resolution?: 'local' | 'server' | 'merged';
  resolvedAt?: Date;
  error?: string;
}

// ================================================================
// STORAGE KEY
// ================================================================

const CONFLICT_STORAGE_KEY = 'bizcontrol_conflict_history';

// ================================================================
// HELPER FUNCTIONS
// ================================================================

function getConflictsFromStorage(): Conflict[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const data = localStorage.getItem(CONFLICT_STORAGE_KEY);
    if (!data) return [];
    
    const conflicts = JSON.parse(data);
    // Convert date strings back to Date objects
    return conflicts.map((c: any) => ({
      ...c,
      timestamp: new Date(c.timestamp),
      resolvedAt: c.resolvedAt ? new Date(c.resolvedAt) : undefined,
    }));
  } catch (error) {
    console.error('[ConflictStorage] Failed to read conflicts:', error);
    return [];
  }
}

function saveConflictsToStorage(conflicts: Conflict[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(CONFLICT_STORAGE_KEY, JSON.stringify(conflicts));
  } catch (error) {
    console.error('[ConflictStorage] Failed to save conflicts:', error);
  }
}

// ================================================================
// PUBLIC API
// ================================================================

/**
 * Get all stored conflicts
 */
export async function getAllConflicts(): Promise<Conflict[]> {
  return getConflictsFromStorage();
}

/**
 * Get conflicts filtered by status
 */
export async function getConflictsByStatus(status: Conflict['status']): Promise<Conflict[]> {
  const conflicts = getConflictsFromStorage();
  return conflicts.filter(c => c.status === status);
}

/**
 * Add a new conflict
 */
export async function addConflict(conflict: Omit<Conflict, 'id' | 'timestamp'>): Promise<Conflict> {
  const conflicts = getConflictsFromStorage();
  
  const newConflict: Conflict = {
    ...conflict,
    id: `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
  };
  
  conflicts.push(newConflict);
  saveConflictsToStorage(conflicts);
  
  return newConflict;
}

/**
 * Update a conflict (e.g., mark as resolved)
 */
export async function updateConflict(id: string, updates: Partial<Conflict>): Promise<Conflict | null> {
  const conflicts = getConflictsFromStorage();
  const index = conflicts.findIndex(c => c.id === id);
  
  if (index === -1) return null;
  
  conflicts[index] = { ...conflicts[index], ...updates };
  saveConflictsToStorage(conflicts);
  
  return conflicts[index];
}

/**
 * Delete a specific conflict
 */
export async function deleteConflict(id: string): Promise<boolean> {
  const conflicts = getConflictsFromStorage();
  const filtered = conflicts.filter(c => c.id !== id);
  
  if (filtered.length === conflicts.length) return false;
  
  saveConflictsToStorage(filtered);
  return true;
}

/**
 * Clear old conflicts (older than specified days)
 */
export async function clearOldConflicts(daysOld: number = 7): Promise<number> {
  const conflicts = getConflictsFromStorage();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysOld);
  
  const filtered = conflicts.filter(c => {
    // Keep pending conflicts regardless of age
    if (c.status === 'pending') return true;
    // Remove resolved/failed conflicts older than cutoff
    return c.timestamp > cutoff;
  });
  
  const removed = conflicts.length - filtered.length;
  saveConflictsToStorage(filtered);
  
  return removed;
}

/**
 * Clear all conflicts
 */
export async function clearAllConflicts(): Promise<void> {
  saveConflictsToStorage([]);
}

/**
 * Get conflict statistics
 */
export async function getConflictStats(): Promise<{
  total: number;
  pending: number;
  resolved: number;
  failed: number;
  byType: Record<string, number>;
}> {
  const conflicts = getConflictsFromStorage();
  
  return {
    total: conflicts.length,
    pending: conflicts.filter(c => c.status === 'pending').length,
    resolved: conflicts.filter(c => c.status === 'resolved').length,
    failed: conflicts.filter(c => c.status === 'failed').length,
    byType: {
      product: conflicts.filter(c => c.type === 'product').length,
      sale: conflicts.filter(c => c.type === 'sale').length,
      employee: conflicts.filter(c => c.type === 'employee').length,
      company: conflicts.filter(c => c.type === 'company').length,
    },
  };
}

/**
 * Resolve a conflict
 */
export async function resolveConflict(
  id: string, 
  resolution: 'local' | 'server' | 'merged'
): Promise<Conflict | null> {
  return updateConflict(id, {
    status: 'resolved',
    resolution,
    resolvedAt: new Date(),
  });
}
