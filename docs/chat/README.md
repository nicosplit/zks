# ZKS Chat Protocol: The "Red Phone" Architecture

## 🎯 Objective
Extend the ZKS Protocol to support **Real-Time, Vernam-Encrypted Messaging**.
Transform ZKS from a "File Transfer Tool" into a "Universal Private Communication Protocol".

## 🛡️ The Core Concept
**"The Digital Red Phone"**
*   **Ephemeral:** Messages exist only in RAM. Closing the tab destroys the conversation forever.
*   **Perfect Secrecy:** Every character is encrypted with a unique, never-reused One-Time Pad (Vernam Cipher).
*   **Zero Knowledge:** The relay server sees only encrypted noise.

## 🏗️ Technical Architecture

### 1. Key Management (The "Infinite Tape")
Unlike files where we know the size upfront, chat is infinite.
*   **Strategy:** **Pre-Buffered Key Streams.**
*   **Mechanism:**
    1.  On connection, the client requests a **1MB Key Buffer** from the Key Node (`Key B`).
    2.  Client generates a **1MB Local Key Buffer** (`Key A`).
    3.  As messages are typed, we consume bytes from the buffer.
    4.  When the buffer drops below 100KB, we silently fetch the next 1MB chunk in the background.

### 2. The Protocol (Packet Structure)
Messages are sent over the existing WebRTC DataChannel or WebSocket Relay.

```json
{
  "type": "zks_msg",
  "id": "uuid-v4",
  "timestamp": 1700000000,
  "offset": 1024, // Position in the Key Stream (Sync Marker)
  "len": 45,      // Length of message
  "data": "base64_encrypted_bytes" // Ciphertext = Message ⊕ KeyA ⊕ KeyB
}
```

### 3. UX / UI Design
*   **Interface:** Minimalist, terminal-like or "Dark Mode" messenger.
*   **"Burn" Timer:** Messages fade out after 60 seconds (optional toggle).
*   **Panic Button:** One click to `memset(0)` all keys and close the connection.

## 📂 Implementation Plan

### Phase 1: The Core Logic (`packages/wasm`)
*   [ ] Update WASM core to handle "Stream Mode" (continuous XOR buffer).
*   [ ] Implement `KeyBuffer` class in TypeScript to manage the "Infinite Tape".

### Phase 2: The UI (`apps/web`)
*   [ ] Create `apps/web/src/components/chat/ChatInterface.tsx`.
*   [ ] Add "Chat Mode" toggle in the Landing Page.

### Phase 3: The Relay (`workers/relay`)
*   [ ] No changes needed! (The relay already broadcasts JSON/Binary).

## ⚠️ Trade-offs
*   **Bandwidth:** Chat is lightweight, so the 2x bandwidth cost is negligible (text is bytes, not gigabytes).
*   **Latency:** Instant (WebRTC).

## 🚨 Threat Model (The "Browser Compromise" Scenario)

**Q: What if the user's browser is compromised (malware/extensions)?**

*   **Active Session:** 🔴 **Compromised.** If an attacker controls the browser runtime, they can read memory (RAM) and see the unencrypted text as it is typed. This is unavoidable for *any* web application (Signal Web, ProtonMail, etc.).
*   **Past Sessions:** 🟢 **Secure (Forward Secrecy).** Because ZKS never stores keys or logs to disk (LocalStorage/IndexedDB), a compromise *after* the fact reveals nothing. The keys are gone.
*   **Network Interception:** 🟢 **Secure.** Even if the attacker records all network traffic, they cannot decrypt it without the keys, which were never stored.

**Mitigation:**
*   **"Panic Button":** Instantly overwrites memory buffers with zeros (`0x00`) and forces a window reload.

