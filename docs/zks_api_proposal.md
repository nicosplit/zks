# ZKS Developer API Proposal

**Goal:** Allow any developer to add "Perfect Secrecy" to their app with a few lines of code.
**Package:** `@zks/sdk`

## 1. The Vision
Developers shouldn't need to understand Vernam Ciphers or Key Streams. They should just pass a `MediaStream` and get an encrypted one back.

## 2. API Usage Example

### Initialization
```typescript
import { ZKS } from '@zks/sdk';

// Initialize with their own Key Server (or ours if we offer SaaS)
const zks = new ZKS({
  keyServer: 'wss://keys.zks.app',
  apiKey: 'sk_live_...'
});
```

### Encrypting a Video Call
```typescript
// Get User Media
const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

// 🪄 The Magic Line
const secureStream = await zks.encryptStream(stream, {
  peerId: 'recipient_public_key'
});

// Use it in WebRTC like normal
peerConnection.addStream(secureStream);
```

### Decrypting (Automatic)
The SDK hooks into the `RTCPeerConnection` to automatically decrypt incoming streams.
```typescript
zks.attachToPeerConnection(peerConnection);
```

## 3. Architecture for Robustness

### 3.1 The "Key Offset" Header
To solve UDP packet loss (the biggest robustness risk), every encrypted packet will have a 4-byte header:

`[ Offset (4B) | Encrypted Payload (N bytes) ]`

*   **Scenario:** Packet A (Offset 0) arrives. Packet B (Offset 1000) is lost. Packet C (Offset 2000) arrives.
*   **Handling:**
    1.  Decrypt Packet A.
    2.  See Packet C has Offset 2000.
    3.  **Jump** the Key Stream Buffer to 2000.
    4.  Decrypt Packet C.
    *   *Result:* Glitch in video (expected), but **no crash** and **no desync**.

### 3.2 The Bottleneck Manager
The SDK will monitor the `KeyBuffer` health.
*   **If Buffer > 5s:** High Quality Video allowed.
*   **If Buffer < 1s:** Downgrade Video Bitrate automatically (Signal to Encoder).
*   **If Buffer Empty:** Pause Stream / Show "Buffering Security..."

## 4. Monetization (SaaS API)
We can offer the **Key Streaming Infrastructure** as a service.
*   **Free:** Self-hosted (User runs their own `zks-key` worker).
*   **Pro:** Use `api.zks.app` (We handle the massive bandwidth/storage for keys).
