# ZKS: The Death of Mass Surveillance
## How I built a "Split-Key" Mesh Protocol that makes file transfer mathematically private.

**By Md. Wasif Faisal**

---

We live in an era where "End-to-End Encryption" (E2EE) is the gold standard. Signal uses it. WhatsApp uses it. But there's a catch: E2EE usually relies on a single key negotiation. If that negotiation is compromised, or if the endpoint is compromised, the game is over.

I wanted to build something different. Something that doesn't just *hide* the data, but makes it **mathematically impossible** for any single entity—including myself—to reconstruct it.

Enter **ZKS (Zero-Knowledge Swarm)**.

It’s not just an app. It’s a new Application-Layer Protocol built on top of WebRTC, Rust, and Cloudflare Workers. Here is the deep technical dive into how it works.

---

## 1. The Core Innovation: Split-Streamed Vernam Cipher

The **Vernam Cipher** (or One-Time Pad) is the only encryption scheme proven to be unbreakable. It requires a random key as long as the message itself.

In traditional systems, generating and distributing a 1GB key for a 1GB file is impractical. ZKS solves this with a **Split-Key Architecture**:

1.  **Key A (Local):** Generated inside your browser using the Web Crypto API. It **never** leaves your device.
2.  **Key B (Remote):** Streamed in real-time from a secure Cloudflare Worker.
3.  **The XOR Operation:**
    ```rust
    // Simplified Rust Logic
    let ciphertext = file_chunk ^ key_a_chunk ^ key_b_chunk;
    ```

Because `KeyA` is local and `KeyB` is remote, the server never has both keys. The file is encrypted with a key that **never exists in one place**.

---

## 2. The Architecture: Rust, WASM, and The Edge

I built ZKS using a high-performance stack designed for speed and security.

### Component A: The Key Node (Rust + Cloudflare Workers)
I needed a source of high-quality entropy that could scale infinitely. I chose Cloudflare Workers running Rust.

*   **Entropy Source:** I use **LavaRand** (Cloudflare’s physical entropy source from lava lamps) mixed with Linux `urandom`.
*   **Streaming:** The worker doesn't just send a key; it *streams* it over a WebSocket.

**Code Snippet (Key Generation):**
```rust
// workers/key-node/src/lib.rs
async fn stream_random_key(ws: &WebSocket, total_size: usize) {
    let mut chunk = vec![0u8; CHUNK_SIZE];
    // getrandom uses the system's CSPRNG (LavaRand seeded)
    getrandom::getrandom(&mut chunk).unwrap(); 
    ws.send_with_bytes(&chunk).unwrap();
}
```

### Component B: The Relay (Durable Objects)
For the Peer-to-Peer connection, I needed a signaling server. Instead of a monolithic Node.js server, I used **Cloudflare Durable Objects**.

*   **Isolation:** Each transfer room is a separate Durable Object. This ensures memory isolation and massive scalability.
*   **Dumb Pipe:** The relay only forwards SDP (Session Description Protocol) packets. It has no logic to inspect data.

**Code Snippet (Signaling):**
```rust
// workers/relay/src/relay_room.rs
pub async fn handle_websocket(&mut self, ws: WebSocket) {
    while let Some(msg) = ws.next().await {
        // Broadcast signal to other peer
        self.broadcast(msg);
    }
}
```

### Component C: The WASM Core
JavaScript is fast, but XORing gigabytes of data requires native speed. I wrote the core encryption logic in **Rust** and compiled it to **WebAssembly (WASM)**.

*   **Performance:** Processing 64-bit chunks in WASM is ~10x faster than JS loops.
*   **Memory Safety:** Rust ensures we don't accidentally leak key data in memory.

---

## 3. The Swarm: WebRTC Mesh Networking

ZKS doesn't store files. It streams them directly from Sender to Receiver.

*   **Protocol:** I use **WebRTC DataChannels** (SCTP) for the transfer.
*   **Mesh:** If multiple people join a room, they form a swarm.
*   **Ephemeral:** Once the transfer is done, the "room" dissolves. The keys vanish. The data vanishes.

---

## Conclusion

ZKS is an experiment in **Absolute Privacy**. By splitting the encryption key and decentralizing the transfer, I have removed the "Trusted Third Party" from the equation.

I don't need you to trust me. I built a system where I **cannot** betray you.

**ZKS is Open Source.**
Check out the code: [github.com/cswasif/ZKS](https://github.com/cswasif/ZKS)
Try it now: [zks.wasif.app](https://zks.wasif.app)
