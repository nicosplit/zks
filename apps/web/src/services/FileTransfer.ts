/**
 * ZKS File Transfer - Request-Response E2E Encrypted Transfer
 *
 * Architecture:
 * 1. Sender: Connects to relay, waits for file_request
 * 2. Receiver: Connects to same room, sends file_request
 * 3. Sender: Streams encrypted chunks to receiver
 * 4. Receiver: Decrypts and assembles file
 */

import { hashFile, deriveKeyFromHash, encryptChunk, decryptChunk } from './Crypto';

const RELAY_URL = 'wss://p2pcf-relay.md-wasif-faisal.workers.dev';
const CHUNK_SIZE = 16 * 1024; // 16KB chunks

export interface TransferProgress {
    transferId: string;
    fileName: string;
    fileSize: number;
    progress: number; // 0-100
    status: 'preparing' | 'waiting' | 'transferring' | 'complete' | 'error';
}

export type OnProgressCallback = (progress: TransferProgress) => void;
export type OnCompleteCallback = (file: File) => void;
export type OnErrorCallback = (error: string) => void;
export type OnPeerCountCallback = (count: number, isOnline: boolean) => void;

export class ZKSFileTransfer {
    private relayWs: WebSocket | null = null;
    private encryptionKey: CryptoKey | null = null;
    private receivedChunks: Map<number, ArrayBuffer> = new Map();
    private fileMetadata: { name: string; size: number; totalChunks: number } | null = null;
    private pendingFile: File | null = null;
    private fileHash: string = '';

    private onProgress: OnProgressCallback | null = null;
    private onComplete: OnCompleteCallback | null = null;
    private onError: OnErrorCallback | null = null;
    private onPeerCount: OnPeerCountCallback | null = null;
    private peerCount: number = 0;

    setOnProgress(callback: OnProgressCallback): void {
        this.onProgress = callback;
    }

    setOnComplete(callback: OnCompleteCallback): void {
        this.onComplete = callback;
    }

    setOnError(callback: OnErrorCallback): void {
        this.onError = callback;
    }

    setOnPeerCount(callback: OnPeerCountCallback): void {
        this.onPeerCount = callback;
    }

    /**
     * Share a file - returns ZKS link immediately, keeps connection open
     * Sender must keep tab open until receiver downloads
     */
    async shareFile(file: File): Promise<string> {
        // Step 1: Hash the file
        this.fileHash = await hashFile(file);
        console.log('[ZKSFileTransfer] File hash:', this.fileHash);

        // Step 2: Derive encryption key
        this.encryptionKey = await deriveKeyFromHash(this.fileHash);

        // Step 3: Store file for later streaming
        this.pendingFile = file;

        // Step 4: Connect to relay room (deterministic ID)
        const roomId = `zks-${this.fileHash}`;
        await this.connectAsHost(roomId);

        // Status: Waiting for receiver
        this.onProgress?.({
            transferId: this.fileHash,
            fileName: file.name,
            fileSize: file.size,
            progress: 0,
            status: 'waiting',
        });

        // Return ZKS link immediately
        return `zks://${this.fileHash}/${encodeURIComponent(file.name)}`;
    }

    /**
     * Receive a file from ZKS link
     */
    async receiveFile(zksLink: string): Promise<void> {
        // Parse ZKS link
        const match = zksLink.match(/^zks:\/\/([a-f0-9]+)\/(.+)$/i);
        if (!match) {
            this.onError?.('Invalid ZKS link');
            return;
        }

        this.fileHash = match[1];
        const fileName = decodeURIComponent(match[2]);

        console.log('[ZKSFileTransfer] Receiving file:', fileName, 'hash:', this.fileHash);

        // Derive decryption key
        this.encryptionKey = await deriveKeyFromHash(this.fileHash);

        // Store expected file info
        this.fileMetadata = { name: fileName, size: 0, totalChunks: 0 };

        // Connect to relay room (deterministic ID)
        const roomId = `zks-${this.fileHash}`;
        await this.connectAsReceiver(roomId);
    }

    /**
     * Connect as file host (sender) - waits for file_request
     */
    private async connectAsHost(roomId: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const url = `${RELAY_URL}/room/${roomId}`;
            console.log('[ZKSFileTransfer] Connecting as HOST to:', url);
            this.relayWs = new WebSocket(url);
            this.relayWs.binaryType = 'arraybuffer';

            this.relayWs.onopen = () => {
                console.log('[ZKSFileTransfer] Host connected to relay');
                resolve();
            };

            this.relayWs.onmessage = async (event) => {
                if (typeof event.data === 'string') {
                    const msg = JSON.parse(event.data);

                    // Handle relay peer events
                    if (msg.type === 'welcome') {
                        this.peerCount = (msg.peers as string[]).length;
                        console.log('[ZKSFileTransfer] Welcome! Peers in room:', this.peerCount);
                        this.onPeerCount?.(this.peerCount, true);
                    } else if (msg.type === 'peer_join') {
                        this.peerCount++;
                        console.log('[ZKSFileTransfer] Peer joined. Total:', this.peerCount);
                        this.onPeerCount?.(this.peerCount, true);
                    } else if (msg.type === 'peer_leave') {
                        this.peerCount = Math.max(0, this.peerCount - 1);
                        console.log('[ZKSFileTransfer] Peer left. Total:', this.peerCount);
                        this.onPeerCount?.(this.peerCount, true);
                    } else if (msg.type === 'file_request' && msg.hash === this.fileHash) {
                        console.log('[ZKSFileTransfer] Received file request, streaming...');
                        await this.streamFile();
                    }
                }
            };

            this.relayWs.onerror = (error) => {
                console.error('[ZKSFileTransfer] Host relay error:', error);
                reject(error);
            };

            this.relayWs.onclose = () => {
                console.log('[ZKSFileTransfer] Host disconnected');
            };
        });
    }

    /**
     * Connect as file receiver - sends file_request and waits for data
     */
    private async connectAsReceiver(roomId: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const url = `${RELAY_URL}/room/${roomId}`;
            console.log('[ZKSFileTransfer] Connecting as RECEIVER to:', url);
            this.relayWs = new WebSocket(url);
            this.relayWs.binaryType = 'arraybuffer';
            this.receivedChunks.clear();
            this.chunkIndex = 0;

            this.relayWs.onopen = () => {
                console.log('[ZKSFileTransfer] Receiver connected to relay');
                // Request the file
                this.sendMetadata({ type: 'file_request', hash: this.fileHash });
                resolve();
            };

            this.relayWs.onmessage = async (event) => {
                if (typeof event.data === 'string') {
                    const msg = JSON.parse(event.data);

                    // Handle relay peer events
                    if (msg.type === 'welcome') {
                        this.peerCount = (msg.peers as string[]).length;
                        console.log('[ZKSFileTransfer] Welcome! Sender peers in room:', this.peerCount);
                        this.onPeerCount?.(this.peerCount, this.peerCount > 0);

                        // If no sender is online, show error
                        if (this.peerCount === 0) {
                            this.onError?.('Sender is offline. Ask them to reopen the share page.');
                        }
                    } else if (msg.type === 'peer_join') {
                        this.peerCount++;
                        console.log('[ZKSFileTransfer] Sender joined! Requesting file...');
                        this.onPeerCount?.(this.peerCount, true);
                        // Re-send file request when sender joins
                        this.sendMetadata({ type: 'file_request', hash: this.fileHash });
                    } else if (msg.type === 'peer_leave') {
                        this.peerCount = Math.max(0, this.peerCount - 1);
                        console.log('[ZKSFileTransfer] Sender left. Peers:', this.peerCount);
                        this.onPeerCount?.(this.peerCount, this.peerCount > 0);
                    } else {
                        await this.handleMetadata(msg);
                    }
                } else {
                    await this.handleChunk(event.data as ArrayBuffer);
                }
            };

            this.relayWs.onerror = (error) => {
                console.error('[ZKSFileTransfer] Receiver relay error:', error);
                reject(error);
            };

            this.relayWs.onclose = () => {
                console.log('[ZKSFileTransfer] Receiver disconnected');
            };
        });
    }

    /**
     * Stream the pending file to the requester
     */
    private async streamFile(): Promise<void> {
        if (!this.pendingFile || !this.encryptionKey) {
            console.error('[ZKSFileTransfer] No pending file to stream');
            return;
        }

        const file = this.pendingFile;
        const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

        // Send file metadata first
        this.sendMetadata({
            type: 'file_start',
            name: file.name,
            size: file.size,
            totalChunks,
            hash: this.fileHash,
        });

        // Stream encrypted chunks
        for (let i = 0; i < totalChunks; i++) {
            const start = i * CHUNK_SIZE;
            const end = Math.min(start + CHUNK_SIZE, file.size);
            const chunkData = await file.slice(start, end).arrayBuffer();

            // Encrypt chunk
            const encryptedChunk = await encryptChunk(chunkData, this.encryptionKey, i);

            // Send as binary
            this.relayWs?.send(encryptedChunk);

            // Report progress
            this.onProgress?.({
                transferId: this.fileHash,
                fileName: file.name,
                fileSize: file.size,
                progress: Math.round(((i + 1) / totalChunks) * 100),
                status: 'transferring',
            });

            // Small delay for flow control
            await new Promise(r => setTimeout(r, 5));
        }

        // Send end marker
        this.sendMetadata({ type: 'file_end', hash: this.fileHash });

        this.onProgress?.({
            transferId: this.fileHash,
            fileName: file.name,
            fileSize: file.size,
            progress: 100,
            status: 'complete',
        });

        console.log('[ZKSFileTransfer] File streaming complete');
    }

    private sendMetadata(data: object): void {
        this.relayWs?.send(JSON.stringify(data));
    }

    private async handleMetadata(msg: { type: string;[key: string]: unknown }): Promise<void> {
        switch (msg.type) {
            case 'file_start':
                this.fileMetadata = {
                    name: msg.name as string,
                    size: msg.size as number,
                    totalChunks: msg.totalChunks as number,
                };
                this.receivedChunks.clear();
                this.chunkIndex = 0;
                console.log('[ZKSFileTransfer] Receiving file metadata:', this.fileMetadata);
                break;

            case 'file_end':
                await this.assembleFile();
                break;
        }
    }

    private chunkIndex = 0;

    private async handleChunk(encryptedData: ArrayBuffer): Promise<void> {
        if (!this.encryptionKey || !this.fileMetadata) return;

        try {
            // Decrypt chunk
            const decryptedChunk = await decryptChunk(
                encryptedData,
                this.encryptionKey,
                this.chunkIndex
            );

            this.receivedChunks.set(this.chunkIndex, decryptedChunk);
            this.chunkIndex++;

            // Report progress
            this.onProgress?.({
                transferId: this.fileHash,
                fileName: this.fileMetadata.name,
                fileSize: this.fileMetadata.size,
                progress: Math.round((this.chunkIndex / this.fileMetadata.totalChunks) * 100),
                status: 'transferring',
            });
        } catch (e) {
            console.error('[ZKSFileTransfer] Failed to decrypt chunk:', e);
        }
    }

    private async assembleFile(): Promise<void> {
        if (!this.fileMetadata) return;

        // Combine all chunks
        const chunks: ArrayBuffer[] = [];
        for (let i = 0; i < this.fileMetadata.totalChunks; i++) {
            const chunk = this.receivedChunks.get(i);
            if (!chunk) {
                this.onError?.(`Missing chunk ${i}`);
                return;
            }
            chunks.push(chunk);
        }

        const blob = new Blob(chunks);
        const file = new File([blob], this.fileMetadata.name);

        this.onProgress?.({
            transferId: this.fileHash,
            fileName: this.fileMetadata.name,
            fileSize: this.fileMetadata.size,
            progress: 100,
            status: 'complete',
        });

        this.onComplete?.(file);
        console.log('[ZKSFileTransfer] File assembled:', file.name, file.size);
    }

    disconnect(): void {
        this.relayWs?.close();
        this.relayWs = null;
        this.pendingFile = null;
    }
}

export const zksFileTransfer = new ZKSFileTransfer();
