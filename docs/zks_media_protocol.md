# ZKS Media Protocol: Text, Audio, & Video (Rust/WASM Implementation)

**Status:** Draft
**Primary Language:** Rust (WASM)
**Transport:** WebRTC (Data Channels & Insertable Streams)

## 1. Core Philosophy
The ZKS Media Protocol extends the "Perfect Secrecy" of the Vernam Cipher to real-time media.
*   **The Cost:** Every bit of data requires a bit of key.
*   **The Benefit:** Mathematically unbreakable communication.
*   **The Implementation:** Core logic is written in **Rust** and compiled to WASM for maximum performance and memory safety.

## 2. Architecture Overview

### 2.1 The Rust Core (`zks-core-wasm`)
We will expand the existing WASM module to handle stream processing.

```rust
// Pseudo-code for Rust Core
struct KeyStreamBuffer {
    buffer: Vec<u8>,
    min_buffer_size: usize,
}

impl KeyStreamBuffer {
    // Fetches keys from Cloudflare Worker to keep buffer full
    fn maintain_buffer(&mut self) { ... }
    
    // Returns the next N bytes of key for encryption
    fn get_key_chunk(&mut self, size: usize) -> Vec<u8> { ... }
}

struct VernamTransformer {
    key_buffer: KeyStreamBuffer,
}

impl VernamTransformer {
    // XORs a media frame with the next key chunk
    fn process_frame(&mut self, frame: &[u8]) -> Vec<u8> { ... }
}
```

### 2.2 Bandwidth Requirements
| Media Type | Source Rate | Key Rate | **Total Bandwidth** | Transport |
| :--- | :--- | :--- | :--- | :--- |
| **Text** | < 1 kbps | < 1 kbps | **Negligible** | Data Channel (Reliable) |
| **Audio** | 50 kbps (Opus) | 50 kbps | **~100 kbps** | Data Channel (UDP) |
| **Video** | 1 Mbps (VP8) | 1 Mbps | **~2 Mbps** | Data Channel (UDP) |

---

## 3. Implementation Strategy

### 3.1 Text (Chat)
*   **Mechanism:**
    1.  **Input:** User types message.
    2.  **Rust:** `encrypt_text(message)` -> XORs with key from buffer.
    3.  **Transport:** Send via WebRTC Data Channel.
    4.  **Rust:** `decrypt_text(encrypted_message)` -> XORs with same key index.
*   **Key Sync:** Reliable Data Channel ensures packets arrive in order, simplifying key synchronization.

### 3.2 Audio (Secure Voice)
*   **Mechanism:**
    1.  **Input:** `navigator.mediaDevices.getUserMedia({ audio: true })`
    2.  **Intercept:** **WebRTC Insertable Streams API**.
    3.  **Rust:** Receive **Encoded Opus Frame**.
    4.  **Encrypt:** `XOR(OpusFrame, KeyChunk)`.
    5.  **Transport:** Send modified frame or use Data Channel.
*   **Challenge:** Packet loss. If a packet is lost, the Key Stream desynchronizes.
*   **Solution:** **Packet Header** must include `KeyOffset`.
    *   `[ KeyOffset (4 bytes) | Encrypted Opus Data ]`
    *   Receiver reads `KeyOffset` and jumps to that position in their Key Buffer.

### 3.3 Video (Secure Video)
*   **Mechanism:**
    1.  **Input:** `getUserMedia({ video: true })`
    2.  **Intercept:** **Insertable Streams API** (Encoded Transform).
    3.  **Rust:** Receive **Encoded VP8/H.264 Frame**.
        *   *Note:* We only encrypt the **payload**, not the frame headers, to avoid breaking the codec (or we wrap the whole thing in a custom container).
    4.  **Encrypt:** `XOR(FramePayload, KeyChunk)`.
*   **Performance:**
    *   Video requires **heavy** key streaming.
    *   The `KeyStreamBuffer` must aggressively pre-fetch keys (e.g., 5MB buffer).

---

## 4. Work Plan

### Phase 1: Rust Core Expansion
- [ ] Implement `KeyStreamBuffer` in Rust.
- [ ] Implement `VernamTransform` trait for generic data.
- [ ] Expose `encrypt_frame` and `decrypt_frame` to JS via `wasm-bindgen`.

### Phase 2: Text Integration
- [ ] Connect Rust Core to the new `ChatLayout.tsx`.
- [ ] Implement `KeyOffset` tracking for chat messages.

### Phase 3: Audio/Video Research
- [ ] Prototype "Insertable Streams" with a simple XOR in JS first.
- [ ] Move the XOR logic to Rust WASM for performance.
