/**
 * ================================================================
 * P2P SYNC SYSTEM - BIZCONTROL 360 ERP v2.1.0
 * ================================================================
 * Sincronização Peer-to-Peer entre dispositivos offline
 * 
 * ARQUITETURA:
 * - WebRTC para P2P via browser
 * - DataChannel para troca de dados
 * - Sync automático de vendas/produtos
 * - Conflict resolution integrado
 * 
 * USO:
 * 1. Dispositivo A (Main) → Inicia P2P Sync Host
 * 2. Dispositivo B (Peer) → Escaneia QR Code para conectar
 * 3. Automaticamente sync quando ambos online
 * ================================================================
 */

"use client";

import { conflictResolution, autoResolveConflict } from './conflictResolution';

// ================================================================
// TYPES
// ================================================================

export enum P2PConnectionState {
  IDLE = 'idle',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
}

export enum P2PRole {
  HOST = 'host',
  PEER = 'peer',
}

export interface P2PPeer {
  id: string;
  name: string;
  role: P2PRole;
  deviceId: string;
  lastSeen: number;
}

export interface SyncData {
  type: 'pending_sales' | 'products' | 'employees' | 'full_sync';
  data: any[];
  timestamp: number;
  deviceId: string;
}

// Tipo para mensagens P2P
export type P2PMessage = 
  | { type: 'ping'; timestamp: number }
  | { type: 'pong'; timestamp: number }
  | { type: 'sync_request'; syncType: SyncData['type']; fromDeviceId: string }
  | { type: 'sync_data'; syncData: SyncData }
  | { type: 'sync_complete'; result: P2PSyncResult };

export interface P2PSyncResult {
  success: boolean;
  syncedCount: number;
  conflictCount: number;
  errors: string[];
}

// ================================================================
// WebRTC Configuration
// ================================================================

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
];

// ================================================================
// P2P Peer Connection Manager
// ================================================================

class P2PSyncManager {
  private connection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private stateCallback: ((state: P2PConnectionState) => void) | null = null;
  private peerId: string;
  private remotePeerId: string | null = null;

  constructor() {
    this.peerId = `p2p_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Inicia conexão P2P como HOST
   */
  async initHost(): Promise<string> {
    try {
      // Criar PeerConnection
      this.connection = new RTCPeerConnection({ iceServers: ICE_SERVERS });

      // Criar DataChannel
      this.dataChannel = this.connection.createDataChannel('sync', {
        ordered: true,
      });

      this.setupDataChannel(this.dataChannel);
      this.setupConnectionEvents();

      // Criar offer
      const offer = await this.connection.createOffer();
      await this.connection.setLocalDescription(offer);

      // Aguardar ICE candidates ready
      await this.waitForIceComplete();

      // Retornar offer codificado
      return btoa(JSON.stringify({
        type: 'offer',
        sdp: offer.sdp,
        peerId: this.peerId,
      }));

    } catch (error) {
      console.error('[P2P] Host init failed:', error);
      throw new Error('Failed to initialize P2P host');
    }
  }

  /**
   * Conecta como PEER
   */
  async connectAsPeer(offerString: string): Promise<string> {
    try {
      const offer = JSON.parse(atob(offerString));

      this.connection = new RTCPeerConnection({ iceServers: ICE_SERVERS });

      this.setupConnectionEvents();

      // Setup handler para data channel recebido
      this.connection.ondatachannel = (event) => {
        this.setupDataChannel(event.channel);
      };

      // Set remote description
      await this.connection.setRemoteDescription(
        new RTCSessionDescription(offer)
      );

      // Criar answer
      const answer = await this.connection.createAnswer();
      await this.connection.setLocalDescription(answer);

      // Aguardar ICE candidates
      await this.waitForIceComplete();

      // Retornar answer codificado
      return btoa(JSON.stringify({
        type: 'answer',
        sdp: answer.sdp,
        peerId: this.peerId,
      }));

    } catch (error) {
      console.error('[P2P] Peer connect failed:', error);
      throw new Error('Failed to connect to host');
    }
  }

  /**
   * Finaliza handshake (HOST only)
   */
  async completeHandshake(answerString: string): Promise<void> {
    try {
      const answer = JSON.parse(atob(answerString));

      if (!this.connection) {
        throw new Error('Connection not initialized');
      }

      await this.connection.setRemoteDescription(
        new RTCSessionDescription(answer)
      );

      this.remotePeerId = answer.peerId;
      console.log('[P2P] Handshake completed with peer:', answer.peerId);

    } catch (error) {
      console.error('[P2P] Handshake failed:', error);
      throw new Error('Failed to complete handshake');
    }
  }

  /**
   * Setup DataChannel handlers
   */
  private setupDataChannel(channel: RTCDataChannel): void {
    this.dataChannel = channel;

    channel.onopen = () => {
      console.log('[P2P] DataChannel open');
      this.notifyStateChange(P2PConnectionState.CONNECTED);
    };

    channel.onclose = () => {
      console.log('[P2P] DataChannel closed');
      this.notifyStateChange(P2PConnectionState.DISCONNECTED);
    };

    channel.onerror = (error) => {
      console.error('[P2P] DataChannel error:', error);
      this.notifyStateChange(P2PConnectionState.ERROR);
    };

    channel.onmessage = async (event) => {
      await this.handleMessage(JSON.parse(event.data));
    };
  }

  /**
   * Setup ICE and Connection events
   */
  private setupConnectionEvents(): void {
    if (!this.connection) return;

    this.connection.onicecandidate = () => {
      // ICE gathering state changed
    };

    this.connection.onconnectionstatechange = () => {
      const state = this.connection?.connectionState;
      console.log('[P2P] Connection state:', state);
    };

    this.connection.oniceconnectionstatechange = () => {
      const state = this.connection?.iceConnectionState;
      console.log('[P2P] ICE connection state:', state);

      if (state === 'disconnected' || state === 'failed') {
        this.notifyStateChange(P2PConnectionState.DISCONNECTED);
      }
    };
  }

  /**
   * Aguarda ICE gathering complete
   */
  private waitForIceComplete(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.connection) {
        resolve();
        return;
      }

      if (this.connection.iceGatheringState === 'complete') {
        resolve();
        return;
      }

      this.connection.onicegatheringstatechange = () => {
        if (this.connection?.iceGatheringState === 'complete') {
          resolve();
        }
      };
    });
  }

  /**
   * Envia dados para peer
   */
  send(data: P2PMessage): boolean {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
      console.error('[P2P] DataChannel not ready');
      return false;
    }

    try {
      this.dataChannel.send(JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('[P2P] Send failed:', error);
      return false;
    }
  }

  /**
   * Processa mensagem recebida
   */
  private async handleMessage(message: any): Promise<void> {
    console.log('[P2P] Received message:', message);

    try {
      switch (message.type) {
        case 'sync_request':
          await this.handleSyncRequest(message);
          break;
        case 'sync_data':
          await this.handleSyncData(message);
          break;
        case 'ping':
          this.send({ type: 'pong', timestamp: Date.now() });
          break;
        case 'pong':
          // Calcula latency
          const latency = Date.now() - message.timestamp;
          console.log('[P2P] Latency:', latency, 'ms');
          break;
        default:
          console.warn('[P2P] Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('[P2P] Failed to handle message:', error);
    }
  }

  /**
   * Envia dados de sync
   */
  async syncData(type: SyncData['type'], data: any[]): Promise<P2PSyncResult> {
    return new Promise((resolve) => {
      const syncData: SyncData = {
        type,
        data,
        timestamp: Date.now(),
        deviceId: this.peerId,
      };

      const sent = this.send({
        type: 'sync_data',
        syncData,
      });

      if (sent) {
        resolve({
          success: true,
          syncedCount: data.length,
          conflictCount: 0,
          errors: [],
        });
      } else {
        resolve({
          success: false,
          syncedCount: 0,
          conflictCount: 0,
          errors: ['Failed to send data'],
        });
      }
    });
  }

  /**
   * Solicita sync do peer
   */
  syncRequest(type: SyncData['type']): void {
    this.send({
      type: 'sync_request',
      syncType: type,
      fromDeviceId: this.peerId,
    });
  }

  /**
   * Handler para sync request
   */
  private async handleSyncRequest(request: any): Promise<void> {
    const { syncType } = request;
    const { pwaStorage } = await import('./indexedDB.enhanced');

    let data: any[] = [];

    switch (syncType) {
      case 'pending_sales':
        data = await pwaStorage.getPendingSales();
        break;
      case 'products':
        data = await pwaStorage.getCachedProducts();
        break;
      case 'employees':
        data = await pwaStorage.getCachedEmployees();
        break;
    }

    this.send({
      type: 'sync_data',
      syncData: {
        type: syncType,
        data,
        timestamp: Date.now(),
        deviceId: this.peerId,
      },
    });
  }

  /**
   * Handler para sync data received
   */
  private async handleSyncData(message: any): Promise<void> {
    const { syncData } = message;
    const { pwaStorage } = await import('./indexedDB.enhanced');

    let conflicts = 0;
    let synced = 0;
    const errors: string[] = [];

    for (const item of syncData.data) {
      try {
        // Check for conflicts
        const localItem = syncData.type === 'products'
          ? await pwaStorage.getCachedProduct(item.id)
          : null;

        if (localItem) {
          // Detect and resolve conflict
          const result = await autoResolveConflict(
            syncData.type === 'products' ? 'product' : 'sale',
            item.id,
            syncData.type,
            localItem,
            item,
            {
              localTimestamp: localItem.cached_at,
              remoteTimestamp: syncData.timestamp,
            }
          );

          if (result.hadConflict) {
            conflicts++;
          }

          // Save resolved version
          if (syncData.type === 'products') {
            await pwaStorage.cacheProducts([result.resolved]);
          }
        } else {
          // No conflict, just save
          if (syncData.type === 'products') {
            await pwaStorage.cacheProducts([item]);
          }
        }

        synced++;
      } catch (error) {
        errors.push(`Failed to sync item ${item.id}: ${error}`);
      }
    }

    // Notify result
    this.send({
      type: 'sync_complete',
      result: {
        success: errors.length === 0,
        syncedCount: synced,
        conflictCount: conflicts,
        errors,
      },
    });

    console.log('[P2P] Sync complete:', { synced, conflicts, errors });
  }

  /**
   * Notifica mudança de estado
   */
  private notifyStateChange(state: P2PConnectionState): void {
    if (this.stateCallback) {
      this.stateCallback(state);
    }
  }

  /**
   * Registra listener de estado
   */
  onStateChange(callback: (state: P2PConnectionState) => void): void {
    this.stateCallback = callback;
  }

  /**
   * Desconecta
   */
  disconnect(): void {
    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }

    if (this.connection) {
      this.connection.close();
      this.connection = null;
    }

    this.notifyStateChange(P2PConnectionState.DISCONNECTED);
  }

  /**
   * Limpa recursos
   */
  cleanup(): void {
    this.disconnect();
    this.stateCallback = null;
  }

  /**
   * Verifica se está conectado
   */
  isConnected(): boolean {
    return this.dataChannel?.readyState === 'open';
  }

  /**
   * Obtém latency aproximada
   */
  async measureLatency(): Promise<number> {
    if (!this.isConnected()) {
      return -1;
    }

    const start = Date.now();
    this.send({ type: 'ping', timestamp: start });

    // Espera por pong (handler lida com calcular)
    // Simplificação: retorna -1 e handler calcula
    return -1;
  }

  /**
   * Gera QR Code string para conexão
   */
  getConnectionString(): string | null {
    if (!this.connection?.localDescription) {
      return null;
    }

    return btoa(JSON.stringify({
      type: 'offer',
      sdp: this.connection.localDescription.sdp,
      peerId: this.peerId,
    }));
  }

  /**
   * Obtém peer ID
   */
  getPeerId(): string {
    return this.peerId;
  }

  /**
   * Obtém remote peer ID
   */
  getRemotePeerId(): string | null {
    return this.remotePeerId;
  }
}

// ================================================================
// EXPORT SINGLETON
// ================================================================

export const p2pSync = new P2PSyncManager();

// ================================================================
// REACT HOOK
// ================================================================

import { useState, useEffect, useCallback, useRef } from 'react';

export function useP2PSync() {
  const [state, setState] = useState<P2PConnectionState>(P2PConnectionState.IDLE);
  const [role, setRole] = useState<P2PRole | null>(null);
  const [connectionString, setConnectionString] = useState<string | null>(null);
  const [remotePeer, setRemotePeer] = useState<string | null>(null);
  const [connectedPeers, setConnectedPeers] = useState<P2PPeer[]>([]);

  const syncResultsRef = useRef<P2PSyncResult[]>([]);

  // Setup state change listener
  useEffect(() => {
    p2pSync.onStateChange((newState) => {
      setState(newState);
    });
  }, []);

  /**
   * Inicia como Host
   */
  const initHost = useCallback(async () => {
    try {
      setRole(P2PRole.HOST);
      setState(P2PConnectionState.CONNECTING);

      const offerString = await p2pSync.initHost();
      setConnectionString(offerString);

      console.log('[P2P] Host ready, connection string ready');
    } catch (error) {
      console.error('[P2P] Failed to init as host:', error);
      setState(P2PConnectionState.ERROR);
    }
  }, []);

  /**
   * Conecta como Peer
   */
  const connectPeer = useCallback(async (offerString: string) => {
    try {
      setRole(P2PRole.PEER);
      setState(P2PConnectionState.CONNECTING);

      const answerString = await p2pSync.connectAsPeer(offerString);
      setConnectionString(answerString);

      console.log('[P2P] Peer connected, answer string ready');
    } catch (error) {
      console.error('[P2P] Failed to connect as peer:', error);
      setState(P2PConnectionState.ERROR);
    }
  }, []);

  /**
   * Finaliza handshake (host)
   */
  const completeHandshake = useCallback(async (answerString: string) => {
    try {
      await p2pSync.completeHandshake(answerString);
      setState(P2PConnectionState.CONNECTED);
      setRemotePeer(p2pSync.getRemotePeerId());
    } catch (error) {
      console.error('[P2P] Failed to complete handshake:', error);
      setState(P2PConnectionState.ERROR);
    }
  }, []);

  /**
   * Inicia full sync bidirectional
   */
  const startFullSync = useCallback(async (): Promise<P2PSyncResult> => {
    if (!p2pSync.isConnected()) {
      throw new Error('Not connected to peer');
    }

    const { pwaStorage } = await import('./indexedDB.enhanced');

    // 1. Sync pending sales
    const pendingSales = await pwaStorage.getPendingSales();
    const salesResult = await p2pSync.syncData('pending_sales', pendingSales);

    // 2. Sync products
    const products = await pwaStorage.getCachedProducts();
    const productsResult = await p2pSync.syncData('products', products);

    // 3. Sync employees
    const employees = await pwaStorage.getCachedEmployees();
    const employeesResult = await p2pSync.syncData('employees', employees);

    const totalResult: P2PSyncResult = {
      success: salesResult.success && productsResult.success && employeesResult.success,
      syncedCount: salesResult.syncedCount + productsResult.syncedCount + employeesResult.syncedCount,
      conflictCount: salesResult.conflictCount + productsResult.conflictCount + employeesResult.conflictCount,
      errors: [...salesResult.errors, ...productsResult.errors, ...employeesResult.errors],
    };

    syncResultsRef.current.push(totalResult);

    return totalResult;
  }, []);

  /**
   * Desconecta
   */
  const disconnect = useCallback(() => {
    p2pSync.disconnect();
    setConnectionString(null);
    setRemotePeer(null);
    setRole(null);
    setConnectedPeers([]);
  }, []);

  /**
   * Limpa
   */
  useEffect(() => {
    return () => {
      p2pSync.cleanup();
    };
  }, []);

  return {
    state,
    role,
    connectionString,
    remotePeer,
    connectedPeers,
    isConnected: state === P2PConnectionState.CONNECTED,
    initHost,
    connectPeer,
    completeHandshake,
    startFullSync,
    disconnect,
    syncResults: syncResultsRef.current,
  };
}

// ================================================================
// TYPES EXPORT
// ================================================================

// Enums are already exported above (lines 28, 36)
// Interfaces are already exported above with 'export interface'
// No need to re-export them here
