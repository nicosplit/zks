import React from 'react';
import { LandingNavbar } from '../limeshare/LandingNavbar';
import { LandingFooter } from '../limeshare/LandingFooter';

export const Blog: React.FC = () => {
    return (
        <div className="flex min-h-screen flex-col bg-white">
            <LandingNavbar />
            <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl">
                    <div className="mb-10">
                        <span className="text-sm font-semibold text-[#00934b] tracking-wide uppercase">Engineering Blog</span>
                        <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                            ZKS: The Death of Mass Surveillance
                        </h1>
                        <p className="mt-4 text-xl text-slate-500">
                            How I built a "Split-Key" Mesh Protocol that makes file transfer mathematically private.
                        </p>
                        <div className="mt-6 flex items-center">
                            <div className="flex-shrink-0">
                                <span className="sr-only">Md. Wasif Faisal</span>
                                <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">WF</div>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-slate-900">
                                    Md. Wasif Faisal
                                </p>
                                <div className="flex space-x-1 text-sm text-slate-500">
                                    <time dateTime="2025-12-15">Dec 15, 2025</time>
                                    <span aria-hidden="true">&middot;</span>
                                    <span>5 min read</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="prose prose-lg prose-slate text-slate-600 mx-auto">
                        <p>
                            We live in an era where "End-to-End Encryption" (E2EE) is the gold standard. Signal uses it. WhatsApp uses it. But there's a catch: E2EE usually relies on a single key negotiation. If that negotiation is compromised, or if the endpoint is compromised, the game is over.
                        </p>
                        <p>
                            I wanted to build something different. Something that doesn't just <em>hide</em> the data, but makes it <strong>mathematically impossible</strong> for any single entity—including myself—to reconstruct it.
                        </p>
                        <p>
                            Enter <strong>ZKS (Zero-Knowledge Swarm)</strong>.
                        </p>
                        <p>
                            It’s not just an app. It’s a new Application-Layer Protocol built on top of WebRTC, Rust, and Cloudflare Workers. Here is the deep technical dive into how it works.
                        </p>

                        <hr className="my-8 border-slate-200" />

                        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">1. The Core Innovation: Split-Streamed Vernam Cipher</h2>
                        <p>
                            The <strong>Vernam Cipher</strong> (or One-Time Pad) is the only encryption scheme proven to be unbreakable. It requires a random key as long as the message itself.
                        </p>
                        <p>
                            In traditional systems, generating and distributing a 1GB key for a 1GB file is impractical. ZKS solves this with a <strong>Split-Key Architecture</strong>:
                        </p>
                        <ol className="list-decimal pl-6 space-y-2 my-4">
                            <li><strong>Key A (Local):</strong> Generated inside your browser using the Web Crypto API. It <strong>never</strong> leaves your device.</li>
                            <li><strong>Key B (Remote):</strong> Streamed in real-time from a secure Cloudflare Worker.</li>
                            <li><strong>The XOR Operation:</strong><br />
                                <code className="bg-slate-100 px-2 py-1 rounded text-sm">Ciphertext = File ⊕ KeyA ⊕ KeyB</code>
                            </li>
                        </ol>
                        <p>
                            Because <code>KeyA</code> is local and <code>KeyB</code> is remote, the server never has both keys. The file is encrypted with a key that <strong>never exists in one place</strong>.
                        </p>

                        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">2. The Architecture: Rust, WASM, and The Edge</h2>
                        <p>
                            I built ZKS using a high-performance stack designed for speed and security.
                        </p>

                        <h3 className="text-xl font-bold text-slate-900 mt-8 mb-3">Component A: The Key Node (Rust + Cloudflare Workers)</h3>
                        <p>
                            I needed a source of high-quality entropy that could scale infinitely. I chose Cloudflare Workers running Rust.
                        </p>
                        <ul className="list-disc pl-6 space-y-2 my-4">
                            <li><strong>Entropy Source:</strong> I use <strong>LavaRand</strong> (Cloudflare’s physical entropy source from lava lamps) mixed with Linux <code>urandom</code>.</li>
                            <li><strong>Streaming:</strong> The worker doesn't just send a key; it <em>streams</em> it over a WebSocket.</li>
                        </ul>
                        <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto my-6">
                            <pre className="text-sm text-slate-50">
                                <code>{`// workers/key-node/src/lib.rs
async fn stream_random_key(ws: &WebSocket, total_size: usize) {
    let mut chunk = vec![0u8; CHUNK_SIZE];
    // getrandom uses the system's CSPRNG (LavaRand seeded)
    getrandom::getrandom(&mut chunk).unwrap(); 
    ws.send_with_bytes(&chunk).unwrap();
}`}</code>
                            </pre>
                        </div>

                        <h3 className="text-xl font-bold text-slate-900 mt-8 mb-3">Component B: The Relay (Durable Objects)</h3>
                        <p>
                            For the Peer-to-Peer connection, I needed a signaling server. Instead of a monolithic Node.js server, I used <strong>Cloudflare Durable Objects</strong>.
                        </p>
                        <ul className="list-disc pl-6 space-y-2 my-4">
                            <li><strong>Isolation:</strong> Each transfer room is a separate Durable Object. This ensures memory isolation and massive scalability.</li>
                            <li><strong>Dumb Pipe:</strong> The relay only forwards SDP (Session Description Protocol) packets. It has no logic to inspect data.</li>
                        </ul>

                        <h3 className="text-xl font-bold text-slate-900 mt-8 mb-3">Component C: The WASM Core</h3>
                        <p>
                            JavaScript is fast, but XORing gigabytes of data requires native speed. I wrote the core encryption logic in <strong>Rust</strong> and compiled it to <strong>WebAssembly (WASM)</strong>.
                        </p>
                        <ul className="list-disc pl-6 space-y-2 my-4">
                            <li><strong>Performance:</strong> Processing 64-bit chunks in WASM is ~10x faster than JS loops.</li>
                            <li><strong>Memory Safety:</strong> Rust ensures we don't accidentally leak key data in memory.</li>
                        </ul>

                        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">3. The Trade-off: Bandwidth vs. Security</h2>
                        <p>
                            You might ask: <em>"If I download a 1GB key to encrypt a 1GB file, doesn't that double my bandwidth usage?"</em>
                        </p>
                        <p>
                            <strong>Yes, it does.</strong> To send a 1GB file, you consume ~2GB of data (1GB Key Stream + 1GB Encrypted Transfer).
                        </p>
                        <p>
                            <strong>Why is this worth it?</strong><br />
                            If you generate both keys locally, a compromised browser tab has everything it needs to decrypt your data. By streaming <code>Key B</code> from the server:
                        </p>
                        <ol className="list-decimal pl-6 space-y-2 my-4">
                            <li><strong>Your Browser</strong> has the File + Key A.</li>
                            <li><strong>The Server</strong> has Key B.</li>
                            <li><strong>Neither side</strong> has the full picture.</li>
                        </ol>
                        <p>
                            This enforces <strong>"Two-Party Consent"</strong> for decryption. Even if your device is compromised, the attacker cannot decrypt past files without the server's cooperation. In the world of high-threat privacy, bandwidth is a cheap price to pay for mathematical security.
                        </p>

                        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">4. The Swarm: WebRTC Mesh Networking</h2>
                        <p>
                            ZKS doesn't store files. It streams them directly from Sender to Receiver.
                        </p>
                        <ul className="list-disc pl-6 space-y-2 my-4">
                            <li><strong>Protocol:</strong> I use <strong>WebRTC DataChannels</strong> (SCTP) for the transfer.</li>
                            <li><strong>Mesh:</strong> If multiple people join a room, they form a swarm.</li>
                            <li><strong>Ephemeral:</strong> Once the transfer is done, the "room" dissolves. The keys vanish. The data vanishes.</li>
                        </ul>

                        <hr className="my-8 border-slate-200" />

                        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">Conclusion</h2>
                        <p>
                            ZKS is an experiment in <strong>Absolute Privacy</strong>. By splitting the encryption key and decentralizing the transfer, I have removed the "Trusted Third Party" from the equation.
                        </p>
                        <p className="font-medium text-slate-900">
                            I don't need you to trust me. I built a system where I <strong>cannot</strong> betray you.
                        </p>

                        <div className="mt-8 p-6 bg-slate-50 rounded-xl border border-slate-200">
                            <h3 className="text-lg font-bold text-slate-900 mb-2">ZKS is Open Source</h3>
                            <p className="mb-4">Check out the code and contribute to the future of privacy.</p>
                            <a href="https://github.com/cswasif/ZKS" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-md border border-transparent bg-[#00934b] px-5 py-2 text-base font-medium text-white hover:bg-[#007a3e]">
                                View on GitHub
                            </a>
                        </div>
                    </div>
                </div>
            </main>
            <LandingFooter />
        </div>
    );
};
