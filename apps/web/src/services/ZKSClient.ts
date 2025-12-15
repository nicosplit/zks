/**
 * ZKS Client - Connect to ZKM for File Swarm Discovery
 *
 * Registers files and finds peers sharing the same file.
 * Protocol matches FileSwarm Durable Object.
 */

const ZKM_URL = 'wss://p2pcf-zkm.md-wasif-faisal.workers.dev/ws/file';

export interface SwarmPeer {
    peerId: string;
}

export type OnPeersFoundCallback = (fileHash: string, peers: string[]) => void;
export type OnPeerJoinedCallback = (fileHash: string, peerId: string) => void;
export type OnRegisteredCallback = (fileHash: string, peerCount: number) => void;
export type OnConnectedCallback = () => void;
export type OnErrorCallback = (error: string) => void;

export class ZKSClient {
    private ws: WebSocket | null = null;
    private peerId: string;
    private registeredHashes: Set<string> = new Set();

    private onPeersFound: OnPeersFoundCallback | null = null;
    private onPeerJoined: OnPeerJoinedCallback | null = null;
    private onRegistered: OnRegisteredCallback | null = null;
    private onConnected: OnConnectedCallback | null = null;
    private onError: OnErrorCallback | null = null;

    constructor(peerId?: string) {
        this.peerId = peerId || this.generatePeerId();
    }

    private generatePeerId(): string {
        const bytes = new Uint8Array(16);
        crypto.getRandomValues(bytes);
        return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    getPeerId(): string {
        return this.peerId;
    }

    setOnPeersFound(callback: OnPeersFoundCallback): void {
        this.onPeersFound = callback;
    }

    setOnPeerJoined(callback: OnPeerJoinedCallback): void {
        this.onPeerJoined = callback;
    }

    setOnRegistered(callback: OnRegisteredCallback): void {
        this.onRegistered = callback;
    }

    setOnConnected(callback: OnConnectedCallback): void {
        this.onConnected = callback;
    }

    setOnError(callback: OnErrorCallback): void {
        this.onError = callback;
    }

    async connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            const url = `${ZKM_URL}?peerId=${this.peerId}`;
            console.log('[ZKSClient] Connecting to:', url);
            this.ws = new WebSocket(url);

            this.ws.onopen = () => {
                console.log('[ZKSClient] Connected to ZKM FileSwarm');
                this.onConnected?.();
                resolve();
            };

            this.ws.onmessage = (event) => {
                if (event.data === 'pong') return; // Keepalive response
                try {
                    const msg = JSON.parse(event.data);
                    this.handleMessage(msg);
                } catch (e) {
                    console.error('[ZKSClient] Failed to parse message:', e);
                }
            };

            this.ws.onerror = (error) => {
                console.error('[ZKSClient] WebSocket error:', error);
                this.onError?.('Connection error');
                reject(error);
            };

            this.ws.onclose = () => {
                console.log('[ZKSClient] Disconnected from ZKM');
            };

            // Keepalive ping every 30s
            setInterval(() => {
                if (this.ws?.readyState === WebSocket.OPEN) {
                    this.ws.send('ping');
                }
            }, 30000);
        });
    }

    private handleMessage(msg: { type: string;[key: string]: unknown }): void {
        switch (msg.type) {
            case 'registered':
                console.log(`[ZKSClient] File registered: ${msg.fileHash} (${msg.peerCount} peers)`);
                this.onRegistered?.(msg.fileHash as string, msg.peerCount as number);
                break;
            case 'peers':
                console.log(`[ZKSClient] Peers for ${msg.fileHash}:`, msg.peers);
                this.onPeersFound?.(msg.fileHash as string, msg.peers as string[]);
                break;
            case 'peer_joined':
                console.log(`[ZKSClient] Peer joined swarm: ${msg.peerId}`);
                this.onPeerJoined?.(msg.fileHash as string, msg.peerId as string);
                break;
            case 'error':
                console.error('[ZKSClient] Error:', msg.message);
                this.onError?.(msg.message as string);
                break;
        }
    }

    /**
     * Register a file by hash - other peers can find you
     */
    registerFile(fileHash: string): void {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            throw new Error('Not connected to ZKM');
        }
        this.ws.send(JSON.stringify({
            type: 'register',
            fileHash: fileHash,
            peerId: this.peerId,
        }));
        this.registeredHashes.add(fileHash);
    }

    /**
     * Find peers who have registered a file
     */
    findPeers(fileHash: string): void {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            throw new Error('Not connected to ZKM');
        }
        this.ws.send(JSON.stringify({
            type: 'find',
            fileHash: fileHash,
        }));
    }

    /**
     * Stop sharing a file
     */
    unregisterFile(fileHash: string): void {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            throw new Error('Not connected to ZKM');
        }
        this.ws.send(JSON.stringify({
            type: 'unregister',
            fileHash: fileHash,
        }));
        this.registeredHashes.delete(fileHash);
    }

    isConnected(): boolean {
        return this.ws?.readyState === WebSocket.OPEN;
    }

    disconnect(): void {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
}

// Singleton instance
export const zksClient = new ZKSClient();
