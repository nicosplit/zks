import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Cpu, Network, Lock } from 'lucide-react';

export const Innovation = () => {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-lime-500/30">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl">
                <div className="mx-auto max-w-7xl px-6">
                    <div className="flex h-16 items-center justify-between">
                        <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tighter">
                            <div className="h-8 w-8 rounded-full bg-lime-400 blur-[2px]" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-emerald-400">
                                ZKS Protocol
                            </span>
                        </Link>
                        <Link
                            to="/"
                            className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium transition-all hover:border-lime-400/50 hover:bg-lime-400/10"
                        >
                            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                            Back to Home
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="pt-32 pb-20">
                <div className="mx-auto max-w-4xl px-6">
                    {/* Header */}
                    <header className="mb-16 text-center">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-lime-400/30 bg-lime-400/10 px-3 py-1 text-xs font-medium text-lime-400">
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime-400 opacity-75"></span>
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-lime-500"></span>
                            </span>
                            Innovation Paper
                        </div>
                        <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
                            The <span className="text-lime-400">ZKS Protocol</span> & Split-Streamed Vernam Cipher
                        </h1>
                        <div className="flex flex-col items-center gap-4 text-zinc-400">
                            <p className="text-lg">Date: December 16, 2025</p>
                            <p className="text-lg">Author: <span className="text-white">Md. Wasif Faisal</span></p>
                        </div>
                    </header>

                    {/* Abstract */}
                    <section className="mb-16 rounded-2xl border border-white/10 bg-zinc-900/50 p-8 backdrop-blur-sm">
                        <h2 className="mb-4 text-2xl font-bold text-white">Abstract</h2>
                        <p className="text-lg leading-relaxed text-zinc-300">
                            This paper documents the invention of the <strong>Zero-Knowledge Swarm (ZKS) Protocol</strong> and its underlying cryptographic mechanism, the <strong>Split-Streamed Vernam Cipher</strong>. This system represents a paradigm shift from traditional computational security (Public Key Infrastructure) to information-theoretic security (One-Time Pad) by solving the historical key distribution problem through decentralized cloud streaming.
                        </p>
                    </section>

                    {/* Core Invention */}
                    <section className="mb-20">
                        <div className="mb-8 flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-lime-400/10 text-lime-400">
                                <Lock className="h-6 w-6" />
                            </div>
                            <h2 className="text-3xl font-bold">1. The Core Invention</h2>
                        </div>

                        <div className="space-y-12">
                            <div>
                                <h3 className="mb-4 text-xl font-semibold text-white">1.1 The Problem with Traditional Vernam</h3>
                                <p className="mb-4 text-zinc-400">
                                    The Vernam Cipher (One-Time Pad) is the <strong>only</strong> encryption mathematically proven to be unbreakable. If the key is random, the same length as the message, and never reused, the ciphertext cannot be cracked, even with infinite computing power.
                                </p>
                                <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-red-200">
                                    <strong>Historical Flaw:</strong> You need to physically transport a key (e.g., a hard drive) as big as the data you want to send. This made it impractical for the internet.
                                </div>
                            </div>

                            <div>
                                <h3 className="mb-4 text-xl font-semibold text-white">1.2 The ZKS Solution</h3>
                                <p className="mb-6 text-zinc-400">
                                    We invented a method to generate and distribute the One-Time Pad <strong>on the fly</strong> without pre-sharing it.
                                </p>

                                <div className="grid gap-6 md:grid-cols-3">
                                    <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-6">
                                        <div className="mb-4 text-lime-400"><Cpu className="h-6 w-6" /></div>
                                        <h4 className="mb-2 font-semibold">1. Split-Key Generation</h4>
                                        <p className="text-sm text-zinc-400">
                                            <strong>Key A:</strong> Local Browser CSPRNG<br />
                                            <strong>Key B:</strong> Decentralized Cloudflare Worker (LavaRand)
                                        </p>
                                    </div>
                                    <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-6">
                                        <div className="mb-4 text-lime-400"><Shield className="h-6 w-6" /></div>
                                        <h4 className="mb-2 font-semibold">2. "Sandwich" Encryption</h4>
                                        <code className="text-sm text-lime-400">Ciphertext = Plaintext ⊕ Key A ⊕ Key B</code>
                                    </div>
                                    <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-6">
                                        <div className="mb-4 text-lime-400"><Network className="h-6 w-6" /></div>
                                        <h4 className="mb-2 font-semibold">3. Disjoint Path Routing</h4>
                                        <p className="text-sm text-zinc-400">
                                            Keys and data travel through completely different network paths (WebRTC vs WebSocket).
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Comparison */}
                    <section className="mb-20">
                        <h2 className="mb-8 text-3xl font-bold">2. Comparison with Standards</h2>

                        <div className="mb-12">
                            <h3 className="mb-6 text-xl font-semibold text-lime-400">2.1 ZKS vs. Public Key Encryption (RSA/ECC)</h3>
                            <div className="overflow-hidden rounded-xl border border-white/10">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-white/5 text-zinc-400">
                                        <tr>
                                            <th className="p-4 font-medium">Feature</th>
                                            <th className="p-4 font-medium">Public Key (Standard TLS/SSL)</th>
                                            <th className="p-4 font-medium text-white">ZKS (Split-Streamed Vernam)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/10 bg-zinc-900/50">
                                        <tr>
                                            <td className="p-4 font-medium text-zinc-400">Security Basis</td>
                                            <td className="p-4 text-zinc-300">Computational Hardness</td>
                                            <td className="p-4 font-semibold text-lime-400">Information Theoretic</td>
                                        </tr>
                                        <tr>
                                            <td className="p-4 font-medium text-zinc-400">Quantum Threat</td>
                                            <td className="p-4 text-red-400">Vulnerable (Shor's Algorithm)</td>
                                            <td className="p-4 font-semibold text-lime-400">Immune</td>
                                        </tr>
                                        <tr>
                                            <td className="p-4 font-medium text-zinc-400">Key Exchange</td>
                                            <td className="p-4 text-zinc-300">Complex Handshake (Certificates)</td>
                                            <td className="p-4 font-semibold text-lime-400">No Handshake (Live Stream)</td>
                                        </tr>
                                        <tr>
                                            <td className="p-4 font-medium text-zinc-400">Trust Model</td>
                                            <td className="p-4 text-zinc-300">Trust Certificate Authority</td>
                                            <td className="p-4 font-semibold text-lime-400">Trust No One (Zero Knowledge)</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div>
                            <h3 className="mb-6 text-xl font-semibold text-lime-400">2.2 ZKS vs. Traditional Vernam</h3>
                            <div className="overflow-hidden rounded-xl border border-white/10">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-white/5 text-zinc-400">
                                        <tr>
                                            <th className="p-4 font-medium">Feature</th>
                                            <th className="p-4 font-medium">Traditional Vernam</th>
                                            <th className="p-4 font-medium text-white">ZKS (Split-Streamed Vernam)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/10 bg-zinc-900/50">
                                        <tr>
                                            <td className="p-4 font-medium text-zinc-400">Key Distribution</td>
                                            <td className="p-4 text-zinc-300">Physical Courier</td>
                                            <td className="p-4 font-semibold text-lime-400">Cloud Streaming</td>
                                        </tr>
                                        <tr>
                                            <td className="p-4 font-medium text-zinc-400">Usability</td>
                                            <td className="p-4 text-zinc-300">Extremely Low</td>
                                            <td className="p-4 font-semibold text-lime-400">High (One-click)</td>
                                        </tr>
                                        <tr>
                                            <td className="p-4 font-medium text-zinc-400">Key Storage</td>
                                            <td className="p-4 text-zinc-300">Must store huge keys</td>
                                            <td className="p-4 font-semibold text-lime-400">Ephemeral (Vanish after use)</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>

                    {/* Protocol */}
                    <section className="mb-20">
                        <h2 className="mb-8 text-3xl font-bold">3. The ZKS Protocol</h2>
                        <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-8">
                            <p className="mb-6 text-lg text-zinc-300">
                                The <strong>ZKS Protocol</strong> is the novel networking standard designed to carry this encryption. It defines a new State Machine for secure communication:
                            </p>
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="rounded-lg bg-black/50 p-4 text-center">
                                    <div className="mb-2 text-xs font-mono text-zinc-500">PHASE 1</div>
                                    <div className="font-bold text-white">STATE_INIT</div>
                                    <div className="text-sm text-zinc-400">Negotiate Entropy</div>
                                </div>
                                <div className="rounded-lg bg-lime-400/10 p-4 text-center border border-lime-400/20">
                                    <div className="mb-2 text-xs font-mono text-lime-400">PHASE 2</div>
                                    <div className="font-bold text-white">STATE_STREAM</div>
                                    <div className="text-sm text-zinc-400">Parallel Streaming</div>
                                </div>
                                <div className="rounded-lg bg-black/50 p-4 text-center">
                                    <div className="mb-2 text-xs font-mono text-zinc-500">PHASE 3</div>
                                    <div className="font-bold text-white">STATE_MERGE</div>
                                    <div className="text-sm text-zinc-400">XOR Reconstruction</div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Conclusion */}
                    <section className="rounded-2xl bg-gradient-to-br from-lime-400/20 to-emerald-400/20 p-8 text-center backdrop-blur-sm">
                        <h2 className="mb-4 text-2xl font-bold text-white">Conclusion</h2>
                        <p className="mx-auto max-w-2xl text-lg text-zinc-200">
                            The <strong>ZKS Protocol</strong> and <strong>Split-Streamed Vernam Cipher</strong> constitute a novel invention. By decoupling the key from the storage medium and streaming it via a decentralized swarm, ZKS makes the unbreakable security of the One-Time Pad accessible to the average internet user for the first time.
                        </p>
                    </section>
                </div>
            </main>
        </div>
    );
};
