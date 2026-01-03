/**
 * ================================================================
 * P2P FEATURES HOOK - BIZCONTROL 360 ERP v2.1.0
 * ================================================================
 * Hook simplificado para usar features P2P em componentes
 * 
 * USO:
 * const { startP2PSync, generateOfflineReport } = useP2PFeatures();
 * 
 * await startP2PSync();
 * await generateOfflineReport('sales', 'pdf');
 * ================================================================
 */

"use client";

import { useCallback, useState } from 'react';
import { useP2PSync, P2PSyncResult } from '@/lib/pwa/p2pSync';
import { useOfflineReports } from '@/lib/pwa/offlineReports';
import { pwaStorage } from '@/lib/pwa';
import { getConflictStats, conflictResolution } from '@/lib/pwa/conflictResolution';
import type { ReportType, ReportFormat } from '@/lib/pwa/offlineReports';

export interface P2PFeaturesReturn {
  // P2P Sync
  p2pConnected: boolean;
  p2pSync: () => Promise<P2PSyncResult>;
  
  // Reports
  generateReport: (type: ReportType, format: ReportFormat) => Promise<void>;
  
  // Stats
  getStorageStats: () => Promise<any>;
  getConflictStats: () => Promise<any>;
}

export function useP2PFeatures(): P2PFeaturesReturn {
  const { isConnected, startFullSync } = useP2PSync();
  const { generateAndDownload } = useOfflineReports();
  
  /**
   * Start P2P sync with feedback
   */
  const p2pSync = useCallback(async () => {
    if (!isConnected) {
      throw new Error('Not connected to any peer');
    }

    try {
      const result = await startFullSync();
      return result;
    } catch (error) {
      throw error;
    }
  }, [isConnected, startFullSync]);

  /**
   * Generate offline report and download
   */
  const generateReport = useCallback(async (type: ReportType, format: ReportFormat) => {
    try {
      await generateAndDownload(type, format);
    } catch (error) {
      throw error;
    }
  }, [generateAndDownload]);

  /**
   * Get storage stats
   */
  const getStorageStats = useCallback(async () => {
    return await pwaStorage.getCacheStats();
  }, []);

  /**
   * Get conflict stats
   */
  const getConflictStats = useCallback(async () => {
    return getConflictStats();
  }, []);

  return {
    // P2P
    p2pConnected: isConnected,
    p2pSync,
    
    // Reports
    generateReport,
    
    // Stats
    getStorageStats,
    getConflictStats,
  };
}
