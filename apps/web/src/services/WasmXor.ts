/**
 * WASM XOR Wrapper - High-performance Vernam encryption
 * 
 * Uses Rust WASM for ~10x faster XOR operations compared to JavaScript.
 * Falls back to JavaScript if WASM fails to load.
 */

let wasmModule: typeof import('../wasm/zks_wasm') | null = null;
let isWasmReady = false;

/**
 * Initialize WASM module (call once on app start)
 */
export async function initWasm(): Promise<boolean> {
    if (isWasmReady) return true;

    try {
        const wasm = await import('../wasm/zks_wasm');
        await wasm.default();  // Initialize WASM
        wasmModule = wasm;
        isWasmReady = true;
        console.log('[WASM] XOR module loaded successfully');
        return true;
    } catch (error) {
        console.warn('[WASM] Failed to load, using JS fallback:', error);
        return false;
    }
}

/**
 * XOR encrypt/decrypt using WASM (with JS fallback)
 * 
 * @param data - Input data
 * @param keyA - First key
 * @param keyB - Second key (optional, for Vernam)
 * @returns XOR result
 */
export function xorFast(data: Uint8Array, keyA: Uint8Array, keyB?: Uint8Array): Uint8Array {
    // Use WASM if available
    if (isWasmReady && wasmModule) {
        try {
            if (keyB) {
                return new Uint8Array(wasmModule.xor_vernam(data, keyA, keyB));
            } else {
                return new Uint8Array(wasmModule.xor_single(data, keyA));
            }
        } catch (error) {
            console.warn('[WASM] XOR failed, using JS fallback:', error);
        }
    }

    // JavaScript fallback
    return xorFallback(data, keyA, keyB);
}

/**
 * Pure JavaScript XOR fallback
 */
function xorFallback(data: Uint8Array, keyA: Uint8Array, keyB?: Uint8Array): Uint8Array {
    const result = new Uint8Array(data.length);
    if (keyB) {
        for (let i = 0; i < data.length; i++) {
            result[i] = data[i] ^ (keyA[i] || 0) ^ (keyB[i] || 0);
        }
    } else {
        for (let i = 0; i < data.length; i++) {
            result[i] = data[i] ^ (keyA[i] || 0);
        }
    }
    return result;
}

/**
 * Check if WASM is available
 */
export function isWasmAvailable(): boolean {
    return isWasmReady;
}
