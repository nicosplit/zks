/* tslint:disable */
/* eslint-disable */

/**
 * Generate random bytes for key generation
 * Uses JavaScript's crypto.getRandomValues via wasm-bindgen
 */
export function random_bytes(len: number): Uint8Array;

/**
 * XOR data with a single key
 */
export function xor_single(data: Uint8Array, key: Uint8Array): Uint8Array;

/**
 * XOR encrypt/decrypt data with two keys (Vernam cipher)
 * 
 * Since XOR is symmetric, this function works for both encryption and decryption.
 * 
 * # Arguments
 * * `data` - The input data (plaintext for encryption, ciphertext for decryption)
 * * `key_a` - First key (must be >= data.len())
 * * `key_b` - Second key (must be >= data.len())
 * 
 * # Returns
 * XOR result: data ^ key_a ^ key_b
 */
export function xor_vernam(data: Uint8Array, key_a: Uint8Array, key_b: Uint8Array): Uint8Array;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly random_bytes: (a: number) => [number, number];
  readonly xor_single: (a: number, b: number, c: number, d: number) => [number, number];
  readonly xor_vernam: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number];
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly __externref_table_alloc: () => number;
  readonly __wbindgen_externrefs: WebAssembly.Table;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
