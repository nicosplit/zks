/**
 * ZKS Crypto - End-to-End Encryption for File Chunks
 *
 * Uses AES-GCM with key derived from file hash.
 * The relay never sees the plaintext.
 */

// Derive encryption key from file hash using HKDF
export async function deriveKeyFromHash(fileHash: string): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const hashBytes = hexToBytes(fileHash);

    // Import as raw key material
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        hashBytes.buffer.slice(0) as ArrayBuffer,
        'HKDF',
        false,
        ['deriveKey']
    );

    // Derive AES-GCM key
    return crypto.subtle.deriveKey(
        {
            name: 'HKDF',
            hash: 'SHA-256',
            salt: encoder.encode('zks-chunk-key'),
            info: encoder.encode('zks-v1'),
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

// Encrypt a chunk (nonce = chunk index for deterministic resume)
export async function encryptChunk(
    chunk: ArrayBuffer,
    key: CryptoKey,
    chunkIndex: number
): Promise<ArrayBuffer> {
    // 12-byte nonce from chunk index
    const nonce = new Uint8Array(12);
    new DataView(nonce.buffer).setUint32(0, chunkIndex, true);

    return crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: nonce },
        key,
        chunk
    );
}

// Decrypt a chunk
export async function decryptChunk(
    encryptedChunk: ArrayBuffer,
    key: CryptoKey,
    chunkIndex: number
): Promise<ArrayBuffer> {
    const nonce = new Uint8Array(12);
    new DataView(nonce.buffer).setUint32(0, chunkIndex, true);

    return crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: nonce },
        key,
        encryptedChunk
    );
}

// Compute SHA-256 hash of file
export async function hashFile(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    return bytesToHex(new Uint8Array(hashBuffer));
}

// Helper: hex string to bytes
function hexToBytes(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return bytes;
}

// Helper: bytes to hex string
function bytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}
