/**
 * MeshFileTransfer - P2P Mesh File Sharing with Vernam Encryption
 * 
 * Combines:
 * - VernamFileTransfer (encryption)
 * - MeshPeerManager (P2P connections)
 * - ChunkTracker (bitfield management)
 * 
 * Flow:
 * 1. Sender shares via relay (like before)
 * 2. Receiver downloads from sender
 * 3. Receiver becomes seeder, announces chunks
 * 4. New receivers download from sender + seeders
 */

import { meshPeerManager, MeshPeerManager } from './MeshPeerManager';
import { ChunkTracker } from './ChunkTracker';
import { hashFile } from './Crypto';
import { xorFast } from './WasmXor';
import { logger } from '../utils/logger';

const RELAY_URL = 'wss://p2pcf-relay.md-wasif-faisal.workers.dev';
const KEY_WORKER_URL = 'wss://zks-key.md-wasif-faisal.workers.dev';
const CHUNK_SIZE = 16 * 1024; // 16KB

export interface MeshProgress {
    stage: 'hashing' | 'keys' | 'connecting' | 'transferring' | 'seeding' | 'complete';
    progress: number;
    fileName: string;
    fileSize: number;
    sources: { relay: number; p2p: number };
}

export type OnMeshProgressCallback = (progress: MeshProgress) => void;
export type OnMeshCompleteCallback = (file: File) => void;
export type OnMeshErrorCallback = (error: string) => void;
export type OnMeshPeerCallback = (seeders: number, leechers: number) => void;

export class MeshFileTransfer {
    private relayWs: WebSocket | null = null;
    private mesh: MeshPeerManager = meshPeerManager;
    private tracker: ChunkTracker = new ChunkTracker();

    private pendingFile: File | null = null;
    private keyA: Uint8Array[] = [];
    private keyB: Uint8Array[] = [];
    private totalChunks = 0;
    private fileName = '';
    private fileSize = 0;
    private sessionId = '';
    private myPeerId = '';
    private isReceiving = false;  // Guard against duplicate receive calls
    private isStreaming = false;  // Guard against duplicate stream calls

    // Track download sources
    private relayChunks = 0;
    private p2pChunks = 0;

    private onProgress: OnMeshProgressCallback | null = null;
    private onComplete: OnMeshCompleteCallback | null = null;
    private onError: OnMeshErrorCallback | null = null;
    private onPeer: OnMeshPeerCallback | null = null;

    setOnProgress(cb: OnMeshProgressCallback) { this.onProgress = cb; }
    setOnComplete(cb: OnMeshCompleteCallback) { this.onComplete = cb; }
    setOnError(cb: OnMeshErrorCallback) { this.onError = cb; }
    setOnPeer(cb: OnMeshPeerCallback) { this.onPeer = cb; }

    /**
     * Share a file with mesh P2P support
     */
    async shareFile(file: File): Promise<string> {
        this.pendingFile = file;
        this.fileName = file.name;
        this.fileSize = file.size;
        this.totalChunks = Math.ceil(file.size / CHUNK_SIZE);
        this.myPeerId = this.generatePeerId();

        // Initialize tracker with all chunks (we're the sender)
        this.tracker.init(this.totalChunks);
        for (let i = 0; i < this.totalChunks; i++) {
            // We'll mark chunks as we read them
        }

        // Step 1: Hash file for session ID
        this.emitProgress('hashing', 0);
        const fileHash = await hashFile(file);
        this.sessionId = fileHash.substring(0, 16);
        logger.log('[MeshTransfer] Session:', this.sessionId);

        // Step 2: Generate keys
        this.emitProgress('keys', 10);
        this.keyA = this.generateLocalKey(this.totalChunks);
        this.emitProgress('keys', 30);
        this.keyB = await this.fetchKeyFromWorker(file.size);
        logger.log('[MeshTransfer] Keys ready');

        // Step 3: Connect to relay
        this.emitProgress('connecting', 80);
        await this.connectAsHost();

        this.emitProgress('seeding', 100);
        return `zkv://${this.sessionId}/${encodeURIComponent(file.name)}`;
    }

    /**
     * Download a file with mesh P2P support
     */
    async receiveFile(link: string): Promise<void> {
        // Prevent duplicate calls
        if (this.isReceiving) {
            logger.log('[MeshTransfer] Already receiving, ignoring duplicate call');
            return;
        }

        const match = link.match(/^zkv:\/\/([a-f0-9]+)\/(.+)$/i);
        if (!match) {
            this.onError?.('Invalid link format');
            return;
        }

        // Cleanup any existing connection
        this.disconnect();

        this.isReceiving = true;
        this.sessionId = match[1];
        this.fileName = decodeURIComponent(match[2]);
        this.myPeerId = this.generatePeerId();
        this.relayChunks = 0;
        this.p2pChunks = 0;

        logger.log('[MeshTransfer] Joining:', this.sessionId);

        await this.connectAsReceiver();
    }

    private generatePeerId(): string {
        return 'peer-' + Math.random().toString(36).substring(2, 10);
    }

    private generateLocalKey(chunkCount: number): Uint8Array[] {
        const key: Uint8Array[] = [];
        for (let i = 0; i < chunkCount; i++) {
            const chunk = new Uint8Array(CHUNK_SIZE);
            crypto.getRandomValues(chunk);
            key.push(chunk);
        }
        return key;
    }

    private async fetchKeyFromWorker(fileSize: number): Promise<Uint8Array[]> {
        const chunkCount = Math.ceil(fileSize / CHUNK_SIZE);
        const chunks: Uint8Array[] = [];

        return new Promise((resolve, reject) => {
            const ws = new WebSocket(`${KEY_WORKER_URL}/ws/key/${fileSize}`);
            ws.binaryType = 'arraybuffer';

            ws.onmessage = (event) => {
                if (event.data instanceof ArrayBuffer) {
                    chunks.push(new Uint8Array(event.data));
                    this.emitProgress('keys', 30 + Math.round((chunks.length / chunkCount) * 50));
                }
            };

            ws.onerror = () => reject(new Error('Key worker failed'));
            ws.onclose = (e) => {
                if (e.code === 1000) resolve(chunks);
                else reject(new Error(`Key worker closed: ${e.code}`));
            };
        });
    }

    private async connectAsHost(): Promise<void> {
        return new Promise((resolve, reject) => {
            const url = `${RELAY_URL}/room/zkv-${this.sessionId}`;
            logger.log('[MeshTransfer] HOST connecting:', url);

            this.relayWs = new WebSocket(url);
            this.relayWs.binaryType = 'arraybuffer';

            this.mesh.setMyId(this.myPeerId);
            this.mesh.setRelay(this.relayWs);

            this.relayWs.onopen = () => {
                logger.log('[MeshTransfer] Host connected');
                resolve();
            };

            this.relayWs.onmessage = async (event) => {
                if (typeof event.data === 'string') {
                    const msg = JSON.parse(event.data);
                    await this.handleHostMessage(msg);
                }
            };

            this.relayWs.onerror = (e) => reject(e);

            // Setup mesh callbacks for Sender
            this.mesh.onPeerReady = (_peerId) => {
                logger.log('[MeshTransfer] Peer ready, announcing chunks');
                const have = this.tracker.getHaveList();
                // Split into batches of 500 to avoid huge messages
                for (let i = 0; i < have.length; i += 500) {
                    this.mesh.announceChunks(have.slice(i, i + 500));
                }
            };

            this.mesh.onPeerConnected = () => {
                const connected = this.mesh.getConnectedPeers().length;
                logger.log('[MeshTransfer] Peer connected. Total:', connected);
                this.onPeer?.(1, connected);
            };

            this.mesh.onPeerDisconnected = () => {
                const connected = this.mesh.getConnectedPeers().length;
                logger.log('[MeshTransfer] Peer disconnected. Total:', connected);
                this.onPeer?.(1, connected);
            };
        });
    }

    private async handleHostMessage(msg: { type: string;[key: string]: unknown }) {
        logger.log('[MeshTransfer] Host received:', msg.type);

        if (msg.type === 'welcome') {
            // Use relay-assigned ID for signaling
            this.myPeerId = msg.your_id as string;
            this.mesh.setMyId(this.myPeerId);
            logger.log('[MeshTransfer] Host ID:', this.myPeerId);

            const peers = msg.peers as string[];
            this.onPeer?.(1, peers.length); // We're the seeder
        } else if (msg.type === 'peer_join') {
            logger.log('[MeshTransfer] Peer joined:', msg.client_id || msg.peerId);
            // Don't update count here, wait for P2P connection
        } else if (msg.type === 'file_request') {
            logger.log('[MeshTransfer] Got file_request, starting stream...');
            // Defer to next tick so WebSocket stays responsive
            setTimeout(() => this.streamToReceiver(), 0);
        } else if (msg.type === 'mesh_signal') {
            await this.mesh.handleSignal(msg.from as string, msg.to as string, msg.signal as any);
        }
    }

    private async streamToReceiver() {
        // Guard against duplicate streaming
        if (this.isStreaming) {
            logger.log('[MeshTransfer] Already streaming, ignoring duplicate call');
            return;
        }
        if (!this.pendingFile) return;
        if (!this.relayWs || this.relayWs.readyState !== WebSocket.OPEN) {
            logger.error('[MeshTransfer] WebSocket not open, cannot stream');
            return;
        }

        this.isStreaming = true;
        const file = this.pendingFile;

        try {
            // Send metadata
            logger.log('[MeshTransfer] Sending file_start metadata');
            if (!this.safeSend(JSON.stringify({
                type: 'file_start',
                name: file.name,
                size: file.size,
                totalChunks: this.totalChunks,
                session: this.sessionId
            }))) {
                logger.error('[MeshTransfer] Failed to send file_start');
                return;
            }

            await new Promise(r => setTimeout(r, 100));

            // Send keys
            logger.log('[MeshTransfer] Sending keyA');
            this.safeSend(JSON.stringify({ type: 'vernam_keyA', count: this.keyA.length }));
            for (const chunk of this.keyA) {
                this.safeSend(chunk);
                while (this.relayWs && this.relayWs.bufferedAmount > 1024 * 1024) {
                    await new Promise(r => setTimeout(r, 10));
                }
            }

            await new Promise(r => setTimeout(r, 100));

            // Send keyB
            const peers = this.mesh.getConnectedPeers();
            if (peers.length > 0) {
                logger.log('[MeshTransfer] Sending KeyB via P2P (SECURE)');
                const peerId = peers[0];
                this.mesh.sendJSON(peerId, { type: 'vernam_keyB_start', count: this.keyB.length });

                for (let i = 0; i < this.keyB.length; i++) {
                    const base64 = toBase64(this.keyB[i]);
                    this.mesh.sendJSON(peerId, { type: 'vernam_keyB_chunk', index: i, data: base64 });
                    if (i % 10 === 0) await new Promise(r => setTimeout(r, 5));
                }
            } else {
                logger.warn('[MeshTransfer] No P2P peer. Sending KeyB via Relay (LESS SECURE)');
                logger.log('[MeshTransfer] Sending keyB');
                this.safeSend(JSON.stringify({ type: 'vernam_keyB', count: this.keyB.length }));
                for (const chunk of this.keyB) {
                    this.safeSend(chunk);
                    while (this.relayWs && this.relayWs.bufferedAmount > 1024 * 1024) {
                        await new Promise(r => setTimeout(r, 10));
                    }
                }
            }

            await new Promise(r => setTimeout(r, 100));

            logger.log('[MeshTransfer] Starting stream...');

            // Stream encrypted chunks
            for (let i = 0; i < this.totalChunks; i++) {
                // Check WebSocket is still open
                if (!this.relayWs || this.relayWs.readyState !== WebSocket.OPEN) {
                    logger.error('[MeshTransfer] WebSocket closed during streaming at chunk', i);
                    break;
                }

                const start = i * CHUNK_SIZE;
                const end = Math.min(start + CHUNK_SIZE, file.size);
                const plainChunk = new Uint8Array(await file.slice(start, end).arrayBuffer());

                const encrypted = this.xorChunk(plainChunk, this.keyA[i], this.keyB[i]);
                this.tracker.markHave(i, encrypted); // Store for P2P sharing
                this.safeSend(encrypted);

                // Announce to P2P peers every 10 chunks
                if (i % 10 === 0 || i === this.totalChunks - 1) {
                    const batch: number[] = [];
                    for (let k = Math.max(0, i - 9); k <= i; k++) batch.push(k);
                    this.mesh.announceChunks(batch);

                    this.emitProgress('seeding', Math.round(((i + 1) / this.totalChunks) * 100));
                }

                // Yield to event loop every 10 chunks to keep UI responsive and connection alive
                if (i % 10 === 9) {
                    await new Promise(resolve => setTimeout(resolve, 0));
                }

                // Backpressure control: If buffer is full (>1MB), wait for it to drain
                while (this.relayWs && this.relayWs.bufferedAmount > 1024 * 1024) {
                    await new Promise(resolve => setTimeout(resolve, 50));
                }
            }

            this.safeSend(JSON.stringify({ type: 'file_end', session: this.sessionId }));
            logger.log('[MeshTransfer] Streaming complete');
        } finally {
            this.isStreaming = false;
        }
    }

    /**
     * Safely send data, checking WebSocket state first
     */
    private safeSend(data: string | ArrayBufferLike | Blob | ArrayBufferView): boolean {
        if (this.relayWs && this.relayWs.readyState === WebSocket.OPEN) {
            this.relayWs.send(data);
            return true;
        }
        return false;
    }

    private async connectAsReceiver(): Promise<void> {
        return new Promise((resolve, reject) => {
            const url = `${RELAY_URL}/room/zkv-${this.sessionId}`;
            logger.log('[MeshTransfer] RECEIVER connecting:', url);

            this.relayWs = new WebSocket(url);
            this.relayWs.binaryType = 'arraybuffer';

            this.mesh.setMyId(this.myPeerId);
            this.mesh.setRelay(this.relayWs);

            // Setup mesh callbacks
            this.mesh.onChunkReceived = (_peerId, chunkIndex, data) => {
                this.handleP2PChunk(chunkIndex, data);
            };

            this.mesh.onPeerHasChunks = (_peerId, _chunks) => {
                this.requestNeededChunks();
            };

            // When a P2P peer's DataChannel is ready, request chunks from them
            this.mesh.onPeerReady = (peerId: string) => {
                logger.log('[MeshTransfer] P2P peer ready:', peerId);
                this.requestChunksFromPeer(peerId);
            };

            let expectingKeyA = false;
            let expectingKeyB = false;
            let transferStarted = false;
            let chunkIndex = 0;

            let keyAChunks: Uint8Array[] = [];
            let keyBChunks: Uint8Array[] = [];
            let totalKeyAChunks = 0;
            let totalKeyBChunks = 0;

            this.mesh.onPeerMessage = (_peerId, msg) => {
                if (msg.type === 'vernam_keyB_start') {
                    expectingKeyB = true;
                    totalKeyBChunks = msg.count;
                    keyBChunks = [];
                    logger.log('[MeshTransfer] Expecting keyB via P2P:', totalKeyBChunks, 'chunks');
                } else if (msg.type === 'vernam_keyB_chunk') {
                    if (expectingKeyB) {
                        keyBChunks.push(fromBase64(msg.data));
                        if (keyBChunks.length === totalKeyBChunks) {
                            this.keyB = keyBChunks;
                            expectingKeyB = false;
                            logger.log('[MeshTransfer] Got full keyB via P2P');
                        }
                    }
                }
            };

            this.relayWs.onopen = () => {
                logger.log('[MeshTransfer] Receiver connected, sending request in 500ms...');
                // Wait a bit to ensure relay registration before broadcasting request
                setTimeout(() => {
                    logger.log('[MeshTransfer] Sending file_request');
                    this.relayWs?.send(JSON.stringify({ type: 'file_request', session: this.sessionId }));
                }, 500);
                resolve();
            };

            this.relayWs.onmessage = async (event) => {
                if (typeof event.data === 'string') {
                    const msg = JSON.parse(event.data);

                    if (msg.type === 'welcome') {
                        // Use relay-assigned ID for signaling
                        this.myPeerId = msg.your_id as string;
                        this.mesh.setMyId(this.myPeerId);
                        logger.log('[MeshTransfer] Receiver ID:', this.myPeerId);

                        const peers = (msg.peers as string[]).filter(p => p !== this.myPeerId);
                        this.onPeer?.(peers.length > 0 ? 1 : 0, 1);

                        // Connect to existing peers for P2P
                        peers.forEach(peerId => this.mesh.connectToPeer(peerId));

                        if (peers.length === 0) {
                            this.onError?.('Sender offline');
                        }
                    } else if (msg.type === 'peer_join') {
                        if (!transferStarted) {
                            this.relayWs?.send(JSON.stringify({ type: 'file_request', session: this.sessionId }));
                        }
                        // Connect to new peer
                        this.mesh.connectToPeer(msg.peerId as string);
                    } else if (msg.type === 'vernam_keyA') {
                        transferStarted = true;
                        expectingKeyA = true;
                        totalKeyAChunks = msg.count;
                        keyAChunks = [];
                        logger.log('[MeshTransfer] Expecting keyA:', totalKeyAChunks, 'chunks');
                    } else if (msg.type === 'vernam_keyB') {
                        expectingKeyB = true;
                        totalKeyBChunks = msg.count;
                        keyBChunks = [];
                        logger.log('[MeshTransfer] Expecting keyB:', totalKeyBChunks, 'chunks');
                    } else if (msg.type === 'file_start') {
                        this.totalChunks = msg.totalChunks as number;
                        this.fileSize = msg.size as number;
                        this.tracker.init(this.totalChunks);
                        logger.log('[MeshTransfer] File:', msg.name, this.totalChunks, 'chunks');
                    } else if (msg.type === 'file_end') {
                        this.finishDownload();
                    } else if (msg.type === 'mesh_signal') {
                        await this.mesh.handleSignal(msg.from as string, msg.to as string, msg.signal as any);
                    }
                } else {
                    const data = new Uint8Array(event.data as ArrayBuffer);

                    if (expectingKeyA) {
                        keyAChunks.push(data);
                        if (keyAChunks.length === totalKeyAChunks) {
                            this.keyA = keyAChunks;
                            expectingKeyA = false;
                            logger.log('[MeshTransfer] Got full keyA');
                        }
                    } else if (expectingKeyB) {
                        keyBChunks.push(data);
                        if (keyBChunks.length === totalKeyBChunks) {
                            this.keyB = keyBChunks;
                            expectingKeyB = false;
                            logger.log('[MeshTransfer] Got full keyB');
                        }
                    } else {
                        // Relay chunk
                        this.handleRelayChunk(chunkIndex, data);
                        chunkIndex++;
                    }
                }
            };

            this.relayWs.onerror = (e) => reject(e);
        });
    }

    private handleRelayChunk(chunkIndex: number, encrypted: Uint8Array) {
        if (this.tracker.hasChunk(chunkIndex)) return;

        // Decrypt
        const decrypted = this.xorChunk(encrypted, this.keyA[chunkIndex], this.keyB[chunkIndex]);
        this.tracker.markHave(chunkIndex, decrypted);
        this.relayChunks++;

        this.updateProgress();

        // Announce to mesh peers
        this.mesh.announceChunks([chunkIndex]);
    }

    private handleP2PChunk(chunkIndex: number, encrypted: Uint8Array) {
        if (this.tracker.hasChunk(chunkIndex)) return;

        // Decrypt
        const decrypted = this.xorChunk(encrypted, this.keyA[chunkIndex], this.keyB[chunkIndex]);
        this.tracker.markHave(chunkIndex, decrypted);
        this.p2pChunks++;

        this.updateProgress();

        // Announce to other mesh peers
        this.mesh.announceChunks([chunkIndex]);

        // Request more chunks
        this.requestNeededChunks();

        if (this.tracker.isComplete()) {
            this.finishDownload();
        }
    }

    private requestNeededChunks() {
        // Get needed chunks, prioritizing those with available peers

        const needed = this.tracker.getNeededChunks().slice(0, 10);

        needed.forEach(chunkIdx => {
            const peers = this.mesh.peersWithChunk(chunkIdx);
            if (peers.length > 0) {
                const randomPeer = peers[Math.floor(Math.random() * peers.length)];
                this.mesh.requestChunk(randomPeer, chunkIdx);
                this.tracker.markRequested(chunkIdx, randomPeer);
            }
        });
    }

    /**
     * Request chunks from a specific peer (called when DataChannel opens)
     */
    private requestChunksFromPeer(peerId: string) {
        const peerChunks = this.mesh.getPeerChunks(peerId);
        const needed = this.tracker.getNeededChunks();

        // Request up to 5 chunks that this peer has and we haven't already requested
        const toRequest = needed
            .filter(idx => peerChunks.has(idx))
            .filter(idx => !this.tracker.isRequested(idx))
            .slice(0, 5);

        if (toRequest.length > 0) {
            logger.log('[MeshTransfer] Requesting', toRequest.length, 'chunks from peer:', peerId);
            toRequest.forEach(chunkIdx => {
                this.mesh.requestChunk(peerId, chunkIdx);
                this.tracker.markRequested(chunkIdx, peerId);
            });
        }
    }

    private updateProgress() {
        if (this.totalChunks === 0) return;

        this.emitProgress('transferring', this.tracker.getProgress());
    }

    private finishDownload() {
        if (!this.tracker.isComplete()) return;

        const data = this.tracker.assembleData();
        const blob = new Blob([data.buffer.slice(0) as ArrayBuffer]);
        const file = new File([blob], this.fileName);

        logger.log('[MeshTransfer] Complete! Relay:', this.relayChunks, 'P2P:', this.p2pChunks);

        this.emitProgress('complete', 100);
        this.onComplete?.(file);

        this.mesh.announceChunks(this.tracker.getHaveList());
    }

    private emitProgress(stage: MeshProgress['stage'], progress: number) {
        this.onProgress?.({
            stage,
            progress,
            fileName: this.fileName,
            fileSize: this.fileSize,
            sources: { relay: this.relayChunks, p2p: this.p2pChunks }
        });
    }

    private xorChunk(data: Uint8Array, keyA: Uint8Array, keyB: Uint8Array): Uint8Array {
        // Use WASM for ~10x faster XOR (with JS fallback)
        return xorFast(data, keyA, keyB);
    }



    disconnect() {
        this.mesh.disconnect();
        this.relayWs?.close();
        this.relayWs = null;
        this.tracker.clear();
    }
}

export const meshFileTransfer = new MeshFileTransfer();

function toBase64(bytes: Uint8Array) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

function fromBase64(base64: string) {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes;
}
