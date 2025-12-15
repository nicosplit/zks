import { logger } from '../utils/logger';

/**
 * MeshPeerManager - WebRTC P2P connections for mesh file sharing
 * 
 * Manages direct peer-to-peer connections between all participants
 * in a file transfer swarm. Uses the relay for signaling only.
 */

const ICE_SERVERS: RTCIceServer[] = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
];

export interface MeshPeer {
    id: string;
    pc: RTCPeerConnection;
    dc: RTCDataChannel | null;
    hasChunks: Set<number>;
    isConnected: boolean;
    bytesReceived: number;
    lastSpeed: number; // bytes/sec
    pendingIce: RTCIceCandidateInit[]; // Buffered ICE candidates
}

export type OnMeshPeerConnected = (peerId: string) => void;
export type OnMeshChunkReceived = (peerId: string, chunkIndex: number, data: Uint8Array) => void;
export type OnMeshPeerHasChunks = (peerId: string, chunks: number[]) => void;

export class MeshPeerManager {
    private peers: Map<string, MeshPeer> = new Map();
    private myId: string = '';
    private relayWs: WebSocket | null = null;

    public onPeerConnected: OnMeshPeerConnected | null = null;
    public onPeerDisconnected: OnMeshPeerConnected | null = null;
    public onChunkReceived: OnMeshChunkReceived | null = null;
    public onPeerHasChunks: OnMeshPeerHasChunks | null = null;
    public onPeerReady: ((peerId: string) => void) | null = null; // Fired when DataChannel is open
    public onPeerMessage: ((peerId: string, msg: any) => void) | null = null; // Custom messages

    setMyId(id: string) {
        this.myId = id;
    }

    setRelay(ws: WebSocket) {
        this.relayWs = ws;
    }

    /**
     * Start P2P connection to a peer (as initiator)
     */
    async connectToPeer(peerId: string): Promise<void> {
        if (this.peers.has(peerId)) return;
        if (peerId === this.myId) return;

        logger.log('[MeshPeer] Connecting to:', peerId);

        const peer = this.createPeer(peerId);
        peer.dc = peer.pc.createDataChannel('mesh', { ordered: true });
        this.setupDataChannel(peer);

        const offer = await peer.pc.createOffer();
        await peer.pc.setLocalDescription(offer);

        this.sendSignal(peerId, { type: 'offer', sdp: offer.sdp });
    }

    /**
     * Handle incoming signaling message
     * Note: The relay broadcasts to all peers, but we only process signals meant for us
     */
    async handleSignal(
        fromId: string,
        toId: string,
        signal: { type: string; sdp?: string; candidate?: RTCIceCandidateInit }
    ): Promise<void> {
        // Ignore signals not meant for us
        if (toId !== this.myId) {
            return;
        }

        // Ignore signals from ourselves
        if (fromId === this.myId) {
            return;
        }

        let peer = this.peers.get(fromId);

        try {
            if (signal.type === 'offer') {
                // New peer connecting to us
                if (!peer) {
                    peer = this.createPeer(fromId);
                }

                // Only process offer if we're in stable state
                if (peer.pc.signalingState !== 'stable') {
                    logger.log('[MeshPeer] Ignoring offer, not in stable state:', peer.pc.signalingState);
                    return;
                }

                await peer.pc.setRemoteDescription({ type: 'offer', sdp: signal.sdp });

                // Apply any buffered ICE candidates
                await this.applyPendingIce(peer);

                const answer = await peer.pc.createAnswer();
                await peer.pc.setLocalDescription(answer);

                this.sendSignal(fromId, { type: 'answer', sdp: answer.sdp });

            } else if (signal.type === 'answer') {
                if (peer && peer.pc.signalingState === 'have-local-offer') {
                    await peer.pc.setRemoteDescription({ type: 'answer', sdp: signal.sdp });

                    // Apply any buffered ICE candidates
                    await this.applyPendingIce(peer);
                } else {
                    logger.log('[MeshPeer] Ignoring answer, state:', peer?.pc.signalingState);
                }

            } else if (signal.type === 'ice' && signal.candidate) {
                if (peer && peer.pc.remoteDescription) {
                    // Remote description set, apply ICE immediately
                    await peer.pc.addIceCandidate(signal.candidate);
                    logger.log('[MeshPeer] Applied ICE candidate for:', fromId);
                } else if (peer) {
                    // Buffer ICE candidate until remote description is set
                    peer.pendingIce.push(signal.candidate);
                    logger.log('[MeshPeer] Buffered ICE candidate for:', fromId);
                } else {
                    logger.log('[MeshPeer] Ignoring ICE, no peer yet');
                }
            }
        } catch (err) {
            logger.warn('[MeshPeer] Signal handling error:', err);
        }
    }

    /**
     * Apply buffered ICE candidates after remote description is set
     */
    private async applyPendingIce(peer: MeshPeer): Promise<void> {
        if (peer.pendingIce.length === 0) return;

        logger.log('[MeshPeer] Applying', peer.pendingIce.length, 'buffered ICE candidates for:', peer.id);

        for (const candidate of peer.pendingIce) {
            try {
                await peer.pc.addIceCandidate(candidate);
            } catch (err) {
                logger.warn('[MeshPeer] Failed to add buffered ICE:', err);
            }
        }

        peer.pendingIce = []; // Clear buffer
    }

    private createPeer(peerId: string): MeshPeer {
        const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

        const peer: MeshPeer = {
            id: peerId,
            pc,
            dc: null,
            hasChunks: new Set(),
            isConnected: false,
            bytesReceived: 0,
            lastSpeed: 0,
            pendingIce: [],  // Buffer for ICE candidates before remote description
        };

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                this.sendSignal(peerId, { type: 'ice', candidate: event.candidate.toJSON() });
            }
        };

        pc.ondatachannel = (event) => {
            peer.dc = event.channel;
            this.setupDataChannel(peer);
        };

        pc.onconnectionstatechange = () => {
            if (pc.connectionState === 'connected') {
                peer.isConnected = true;
                logger.log('[MeshPeer] Connected to:', peerId);
                this.onPeerConnected?.(peerId);
            } else if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
                peer.isConnected = false;
                logger.log('[MeshPeer] Disconnected from:', peerId);
                this.onPeerDisconnected?.(peerId);
            }
        };

        this.peers.set(peerId, peer);
        return peer;
    }

    private setupDataChannel(peer: MeshPeer) {
        if (!peer.dc) return;

        peer.dc.binaryType = 'arraybuffer';

        peer.dc.onopen = () => {
            logger.log('[MeshPeer] DataChannel open with:', peer.id);
            peer.isConnected = true;
            this.onPeerReady?.(peer.id); // Trigger chunk requests
        };

        peer.dc.onmessage = (event) => {
            if (typeof event.data === 'string') {
                const msg = JSON.parse(event.data);
                this.handlePeerMessage(peer, msg);
            } else {
                // Binary: chunk data with header
                this.handleChunkData(peer, new Uint8Array(event.data));
            }
        };

        peer.dc.onclose = () => {
            peer.isConnected = false;
        };
    }

    private handlePeerMessage(peer: MeshPeer, msg: { type: string;[key: string]: unknown }) {
        if (msg.type === 'have_chunks') {
            // Peer announces which chunks they have
            const chunks = msg.chunks as number[];
            chunks.forEach(c => peer.hasChunks.add(c));
            this.onPeerHasChunks?.(peer.id, chunks);
            logger.log('[MeshPeer]', peer.id, 'has', chunks.length, 'chunks');

        } else if (msg.type === 'want_chunk') {
            // Peer requests a chunk from us - handled by MeshFileTransfer
            // Emit event or callback
        } else {
            // Custom message (e.g. KeyB)
            this.onPeerMessage?.(peer.id, msg);
        }
    }

    private handleChunkData(peer: MeshPeer, data: Uint8Array) {
        // First 4 bytes = chunk index, rest = chunk data
        const view = new DataView(data.buffer);
        const chunkIndex = view.getUint32(0);
        const chunkData = data.slice(4);

        peer.bytesReceived += chunkData.length;
        this.onChunkReceived?.(peer.id, chunkIndex, chunkData);
    }

    /**
     * Send signaling message via relay
     */
    private sendSignal(toPeerId: string, signal: object) {
        this.relayWs?.send(JSON.stringify({
            type: 'mesh_signal',
            to: toPeerId,
            from: this.myId,
            signal,
        }));
    }

    /**
     * Announce which chunks we have to all peers
     */
    announceChunks(chunks: number[]) {
        const msg = JSON.stringify({ type: 'have_chunks', chunks });
        this.peers.forEach(peer => {
            if (peer.dc?.readyState === 'open') {
                peer.dc.send(msg);
            }
        });
    }

    /**
     * Request a chunk from a specific peer
     */
    requestChunk(peerId: string, chunkIndex: number) {
        const peer = this.peers.get(peerId);
        if (peer?.dc?.readyState === 'open') {
            peer.dc.send(JSON.stringify({ type: 'want_chunk', chunk: chunkIndex }));
        }
    }

    /**
     * Send a chunk to a specific peer
     */
    sendChunk(peerId: string, chunkIndex: number, data: Uint8Array) {
        const peer = this.peers.get(peerId);
        if (peer?.dc?.readyState === 'open') {
            // 4 bytes header + chunk data
            const packet = new Uint8Array(4 + data.length);
            new DataView(packet.buffer).setUint32(0, chunkIndex);
            packet.set(data, 4);
            peer.dc.send(packet);
        }
    }

    /**
     * Send a generic JSON message to a peer
     */
    sendJSON(peerId: string, msg: object) {
        const peer = this.peers.get(peerId);
        if (peer?.dc?.readyState === 'open') {
            peer.dc.send(JSON.stringify(msg));
        }
    }

    /**
     * Get list of connected peers
     */
    getConnectedPeers(): string[] {
        return Array.from(this.peers.values())
            .filter(p => p.isConnected)
            .map(p => p.id);
    }

    /**
     * Find peers that have a specific chunk
     */
    peersWithChunk(chunkIndex: number): string[] {
        return Array.from(this.peers.values())
            .filter(p => p.isConnected && p.hasChunks.has(chunkIndex))
            .map(p => p.id);
    }

    /**
     * Get all chunks a specific peer has
     */
    getPeerChunks(peerId: string): Set<number> {
        return this.peers.get(peerId)?.hasChunks || new Set();
    }

    /**
     * Cleanup all connections
     */
    disconnect() {
        this.peers.forEach(peer => {
            peer.dc?.close();
            peer.pc.close();
        });
        this.peers.clear();
    }
}

export const meshPeerManager = new MeshPeerManager();
