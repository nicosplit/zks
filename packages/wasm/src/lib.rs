//! ZKS WASM - High-performance XOR encryption for ZKS file transfer
//! 
//! Compiled to WebAssembly for ~10x faster encryption/decryption
//! compared to JavaScript loops.

use wasm_bindgen::prelude::*;

/// XOR encrypt/decrypt data with two keys (Vernam cipher)
/// 
/// Since XOR is symmetric, this function works for both encryption and decryption.
/// 
/// # Arguments
/// * `data` - The input data (plaintext for encryption, ciphertext for decryption)
/// * `key_a` - First key (must be >= data.len())
/// * `key_b` - Second key (must be >= data.len())
/// 
/// # Returns
/// XOR result: data ^ key_a ^ key_b
#[wasm_bindgen]
pub fn xor_vernam(data: &[u8], key_a: &[u8], key_b: &[u8]) -> Vec<u8> {
    let len = data.len();
    let mut result = Vec::with_capacity(len);
    
    // Process 8 bytes at a time for better performance
    let chunks = len / 8;
    let remainder = len % 8;
    
    for i in 0..chunks {
        let idx = i * 8;
        // Read 8 bytes as u64 for faster processing
        let d = u64::from_ne_bytes([
            data[idx], data[idx+1], data[idx+2], data[idx+3],
            data[idx+4], data[idx+5], data[idx+6], data[idx+7],
        ]);
        let ka = u64::from_ne_bytes([
            key_a[idx], key_a[idx+1], key_a[idx+2], key_a[idx+3],
            key_a[idx+4], key_a[idx+5], key_a[idx+6], key_a[idx+7],
        ]);
        let kb = u64::from_ne_bytes([
            key_b[idx], key_b[idx+1], key_b[idx+2], key_b[idx+3],
            key_b[idx+4], key_b[idx+5], key_b[idx+6], key_b[idx+7],
        ]);
        
        let xored = (d ^ ka ^ kb).to_ne_bytes();
        result.extend_from_slice(&xored);
    }
    
    // Handle remaining bytes
    let base = chunks * 8;
    for i in 0..remainder {
        let idx = base + i;
        result.push(data[idx] ^ key_a.get(idx).copied().unwrap_or(0) ^ key_b.get(idx).copied().unwrap_or(0));
    }
    
    result
}

/// XOR data with a single key
#[wasm_bindgen]
pub fn xor_single(data: &[u8], key: &[u8]) -> Vec<u8> {
    data.iter()
        .zip(key.iter())
        .map(|(d, k)| d ^ k)
        .collect()
}

/// Generate random bytes for key generation
/// Uses JavaScript's crypto.getRandomValues via wasm-bindgen
#[wasm_bindgen]
pub fn random_bytes(len: usize) -> Vec<u8> {
    let mut buffer = vec![0u8; len];
    getrandom::getrandom(&mut buffer).unwrap_or_default();
    buffer
}
