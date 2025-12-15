/**
 * ChunkTracker - Bitfield management for P2P mesh file sharing
 * 
 * Tracks which chunks we have, which we need, and schedules
 * chunk requests from the best available peers.
 */

export interface ChunkRequest {
    chunkIndex: number;
    requestedFrom: string | null;
    requestedAt: number;
}

export class ChunkTracker {
    private totalChunks: number = 0;
    private haveChunks: Set<number> = new Set();
    private pendingRequests: Map<number, ChunkRequest> = new Map();
    private chunkData: Map<number, Uint8Array> = new Map();

    /**
     * Initialize tracker with total chunk count
     */
    init(totalChunks: number) {
        this.totalChunks = totalChunks;
        this.haveChunks.clear();
        this.pendingRequests.clear();
        this.chunkData.clear();
    }

    /**
     * Mark a chunk as received
     */
    markHave(chunkIndex: number, data: Uint8Array) {
        this.haveChunks.add(chunkIndex);
        this.pendingRequests.delete(chunkIndex);
        this.chunkData.set(chunkIndex, data);
    }

    /**
     * Check if we have a chunk
     */
    hasChunk(chunkIndex: number): boolean {
        return this.haveChunks.has(chunkIndex);
    }

    /**
     * Get chunk data if we have it
     */
    getChunk(chunkIndex: number): Uint8Array | null {
        return this.chunkData.get(chunkIndex) || null;
    }

    /**
     * Get list of chunks we have
     */
    getHaveList(): number[] {
        return Array.from(this.haveChunks);
    }

    /**
     * Check if download is complete
     */
    isComplete(): boolean {
        return this.haveChunks.size >= this.totalChunks;
    }

    /**
     * Get download progress (0-100)
     */
    getProgress(): number {
        if (this.totalChunks === 0) return 0;
        return Math.round((this.haveChunks.size / this.totalChunks) * 100);
    }

    /**
     * Get list of chunks we still need
     */
    getNeededChunks(): number[] {
        const needed: number[] = [];
        for (let i = 0; i < this.totalChunks; i++) {
            if (!this.haveChunks.has(i) && !this.pendingRequests.has(i)) {
                needed.push(i);
            }
        }
        return needed;
    }

    /**
     * Mark a chunk as requested from a peer
     */
    markRequested(chunkIndex: number, fromPeerId: string) {
        this.pendingRequests.set(chunkIndex, {
            chunkIndex,
            requestedFrom: fromPeerId,
            requestedAt: Date.now(),
        });
    }

    /**
     * Check if a chunk is already requested
     */
    isRequested(chunkIndex: number): boolean {
        return this.pendingRequests.has(chunkIndex);
    }

    /**
     * Cancel timed-out requests (older than 5 seconds)
     */
    cancelTimedOutRequests(): number[] {
        const timedOut: number[] = [];
        const now = Date.now();

        this.pendingRequests.forEach((req, chunkIndex) => {
            if (now - req.requestedAt > 5000) {
                timedOut.push(chunkIndex);
                this.pendingRequests.delete(chunkIndex);
            }
        });

        return timedOut;
    }

    /**
     * Get the rarest chunks (those available from fewest peers)
     * This is the "rarest first" strategy from BitTorrent
     */
    getRarestChunks(peerChunks: Map<string, Set<number>>, count: number = 5): number[] {
        const needed = this.getNeededChunks();

        // Count how many peers have each chunk
        const availability: Map<number, number> = new Map();
        needed.forEach(chunkIdx => {
            let count = 0;
            peerChunks.forEach(chunks => {
                if (chunks.has(chunkIdx)) count++;
            });
            availability.set(chunkIdx, count);
        });

        // Sort by availability (rarest first), filter out unavailable
        return needed
            .filter(idx => (availability.get(idx) || 0) > 0)
            .sort((a, b) => (availability.get(a) || 0) - (availability.get(b) || 0))
            .slice(0, count);
    }

    /**
     * Assemble all chunks into final data
     */
    assembleData(): Uint8Array {
        let totalSize = 0;
        for (let i = 0; i < this.totalChunks; i++) {
            const chunk = this.chunkData.get(i);
            if (chunk) totalSize += chunk.length;
        }

        const result = new Uint8Array(totalSize);
        let offset = 0;
        for (let i = 0; i < this.totalChunks; i++) {
            const chunk = this.chunkData.get(i);
            if (chunk) {
                result.set(chunk, offset);
                offset += chunk.length;
            }
        }

        return result;
    }

    /**
     * Clear all data
     */
    clear() {
        this.haveChunks.clear();
        this.pendingRequests.clear();
        this.chunkData.clear();
        this.totalChunks = 0;
    }
}

export const chunkTracker = new ChunkTracker();
