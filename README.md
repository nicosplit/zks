# ZKS Protocol: Zero-Knowledge Swarm

**Architect & Lead Developer:** Md. Wasif Faisal

<img src="https://wzks.pages.dev/favicon.svg" width="120" alt="ZKS Logo" />

> **[📖 Read the Story: "The Death of Mass Surveillance"](docs/blog_post.md)**  
> *How I built a "Split-Key" Mesh Protocol that makes file transfer mathematically private.*

## Overview
ZKS is a decentralized, application-layer communication protocol designed for secure, anonymous, and limit-free file sharing. It introduces a novel **Split-Streamed Vernam Cipher Approximation** over a **WebRTC Mesh Network**.

Unlike traditional end-to-end encryption which relies on a single negotiated key, ZKS splits the encryption key into two independent components (`KeyA` and `KeyB`) that are never stored together, making mass surveillance mathematically impossible.

## 🚀 The Architecture

The ZKS Protocol is composed of four distinct components working in unison:

### 1. Web Client (`apps/web`)
*   **Tech:** React, Vite, TypeScript.
*   **Role:** The user interface and P2P logic controller.
*   **Function:** Generates `KeyA` locally (using browser CSPRNG) and coordinates the WebRTC mesh connection.

### 2. Relay Worker (`workers/relay`)
*   **Tech:** Cloudflare Workers, Durable Objects, Rust.
*   **Role:** The signaling server.
*   **Function:** Facilitates the initial WebRTC handshake (SDP exchange) and acts as a fallback transport for encrypted data. It is a "dumb pipe" and cannot decrypt traffic.

### 3. Key Node (`workers/key-node`)
*   **Tech:** Cloudflare Workers, Rust.
*   **Role:** The entropy source.
*   **Function:** Streams `KeyB` to the client in real-time.
*   **Entropy:** Powered by **Cloudflare LavaRand** (physical entropy from lava lamps) mixed with Linux `urandom` for computational security.

### 4. WASM Core (`packages/wasm`)
*   **Tech:** Rust, WebAssembly.
*   **Role:** High-performance cryptography.
*   **Function:** Executes the XOR operation (`Ciphertext = File ⊕ KeyA ⊕ KeyB`) at near-native speeds (10x faster than JS), processing data in 64-bit chunks.

## 🔒 Security Model

### The Vernam Split
The core innovation of ZKS is the separation of keys:
1.  **Key A (Local):** Generated on the user's device. Never leaves the browser except via direct, encrypted P2P channels.
2.  **Key B (Remote):** Streamed from the Key Node.
3.  **Encryption:** The file is XOR-ed with both keys.

Because the Relay Server never sees `KeyA`, and the Key Node never sees the file or `KeyA`, no single entity in the infrastructure possesses enough information to decrypt the data.

### The Cost of Privacy
This architecture requires streaming a key stream equal in size to the file. Sending a 1GB file consumes ~2GB of bandwidth. This is a deliberate trade-off: **we prioritize mathematical impossibility of decryption over bandwidth efficiency.**

### Mesh Swarm
*   **Transport:** WebRTC DataChannels (SCTP).
*   **Privacy:** Direct Peer-to-Peer transfer means data does not rest on any server.
*   **Ephemeral:** The swarm exists only as long as the peers are connected. Once the tab is closed, the keys and data vanish.

## 🛠️ Development Setup

This is a monorepo containing all components.

### Prerequisites
*   Node.js (v18+)
*   Rust (latest stable)
*   Wrangler (Cloudflare CLI)

### Installation
```bash
# Install dependencies
npm install

# Build WASM Core
cd packages/wasm
wasm-pack build --target web

# Run Web Client
cd ../../apps/web
npm run dev
```

### Deployment
Each component is deployed separately to Cloudflare's edge network.

```bash
# Deploy Relay
cd workers/relay
npx wrangler deploy

# Deploy Key Node
cd workers/key-node
npx wrangler deploy

# Deploy Web App
cd apps/web
npm run build
npx wrangler pages deploy dist
```

## License
MIT License. Copyright (c) 2025 Md. Wasif Faisal.
