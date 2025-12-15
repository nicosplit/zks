import React from 'react';
import { LandingNavbar } from '../limeshare/LandingNavbar';
import { LandingFooter } from '../limeshare/LandingFooter';

export const Security: React.FC = () => {
    return (
        <div className="flex min-h-screen flex-col bg-white">
            <LandingNavbar />
            <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl">
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl mb-8">
                        How ZKS Works
                    </h1>

                    <div className="prose prose-lg prose-slate text-slate-600">
                        <p className="lead text-xl text-slate-700">
                            ZKS (Zero-Knowledge Swarm) is not just another file sharing service. It is a new protocol designed to make mass surveillance of file transfers mathematically impossible.
                        </p>

                        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">The Vernam Cipher (One-Time Pad)</h2>
                        <p>
                            Most secure apps use AES-256. While strong, it relies on the hope that computers won't get fast enough to crack it.
                            ZKS uses a <strong>Vernam Cipher approximation</strong>.
                        </p>
                        <p className="mt-4">
                            <strong>Where does the randomness come from?</strong><br />
                            We use <strong>Cloudflare LavaRand</strong>. This system uses physical entropy (from lava lamps and chaotic pendulums) to seed a Cryptographically Secure Pseudorandom Number Generator (CSPRNG).
                            While not "True Quantum" (which requires physics hardware), it provides <strong>Computational Security</strong> that is statistically indistinguishable from true randomness and effectively unbreakable.
                        </p>
                        <p className="mt-4">
                            When you upload a file, we generate two keys:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 my-4">
                            <li><strong>Key A (Local):</strong> Generated in your browser. Never leaves your device except via direct P2P channels.</li>
                            <li><strong>Key B (Remote):</strong> Streamed from our secure worker.</li>
                        </ul>
                        <p>
                            The file is encrypted using XOR: <code>Ciphertext = File ⊕ KeyA ⊕ KeyB</code>.
                            Without <strong>both</strong> keys, the data is just random noise. Even if our servers are seized, we cannot decrypt your files because we never have Key A.
                        </p>

                        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">Mesh Networking</h2>
                        <p>
                            ZKS uses WebRTC to create a direct <strong>Peer-to-Peer (P2P)</strong> mesh for every transfer.
                        </p>
                        <ul className="list-disc pl-6 space-y-2 my-4">
                            <li><strong>Direct Transfer:</strong> Data moves directly from Sender to Receiver. It doesn't sit on a server.</li>
                            <li><strong>Swarm Speed:</strong> If multiple people download the same file, they help each other. The more people downloading, the faster it gets.</li>
                            <li><strong>Ephemeral:</strong> Once all peers leave the room, the "swarm" dissolves. The file ceases to exist on the network.</li>
                        </ul>

                        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">Zero-Knowledge Architecture</h2>
                        <p>
                            We designed ZKS so that we <strong>cannot</strong> know what you are sharing.
                        </p>
                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 my-6">
                            <h3 className="font-bold text-slate-900 mb-2">What We See:</h3>
                            <ul className="list-disc pl-6 space-y-1 text-sm">
                                <li>Encrypted binary blobs (random noise)</li>
                                <li>Temporary IP addresses (for connection routing only)</li>
                                <li>File size and encrypted metadata</li>
                            </ul>
                            <h3 className="font-bold text-slate-900 mt-4 mb-2">What We Don't See:</h3>
                            <ul className="list-disc pl-6 space-y-1 text-sm">
                                <li>Your file content</li>
                                <li>Your file name (encrypted)</li>
                                <li>Your decryption keys (Key A is local)</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>
            <LandingFooter />
        </div>
    );
};
