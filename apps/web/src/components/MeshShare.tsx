import { useState, useEffect } from 'react';
import { meshFileTransfer } from '../services/MeshFileTransfer';
import type { MeshProgress } from '../services/MeshFileTransfer';
import { TransferCard } from './ui/TransferCard';
import { ProgressBar } from './ui/ProgressBar';
import { PeerBadge } from './ui/PeerBadge';
import { ShareQRCode } from './ui/ShareQRCode';

interface MeshShareProps {
    onLinkGenerated?: (link: string) => void;
    file?: File | null;
    onClose?: () => void;
}

export function MeshShare({ onLinkGenerated, file, onClose }: MeshShareProps) {
    const [progress, setProgress] = useState<MeshProgress | null>(null);
    const [link, setLink] = useState<string>('');
    const [seeders, setSeeders] = useState(0);
    const [leechers, setLeechers] = useState(0);
    const [copied, setCopied] = useState(false);
    const [started, setStarted] = useState(false);
    const [showQR, setShowQR] = useState(false);

    useEffect(() => {
        if (file && !started) {
            setStarted(true);
            shareFile(file);
        }
    }, [file]);

    const shareFile = async (file: File) => {
        meshFileTransfer.setOnProgress(setProgress);
        meshFileTransfer.setOnPeer((s, l) => {
            setSeeders(s);
            setLeechers(l);
        });

        try {
            const meshLink = await meshFileTransfer.shareFile(file);
            const fullLink = `${window.location.origin}/?file=${encodeURIComponent(meshLink)}`;
            setLink(fullLink);
            onLinkGenerated?.(fullLink);
        } catch (error) {
            console.error('Mesh share failed:', error);
        }
    };

    const copyLink = () => {
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getStageLabel = (stage: string) => {
        switch (stage) {
            case 'hashing': return '📊 Hashing file...';
            case 'keys': return '🔑 Generating keys...';
            case 'connecting': return '🔗 Connecting...';
            case 'transferring': return '📤 Sending...';
            case 'seeding': return '🌱 Seeding (P2P active)';
            case 'complete': return '✅ Complete!';
            default: return stage;
        }
    };

    return (
        <TransferCard title="ZKS Swarm" subtitle="Anonymous • Multi-Peer • Resilient" onClose={onClose}>
            {!link ? (
                <div className="space-y-6">
                    {progress ? (
                        <ProgressBar
                            progress={progress.progress}
                            label={getStageLabel(progress.stage)}
                            color="green"
                        />
                    ) : (
                        <div className="text-center text-gray-400 py-8 animate-pulse">
                            Initializing transfer...
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-sm text-gray-400">Share Link</span>
                            <PeerBadge seeders={seeders} leechers={leechers} />
                        </div>

                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                value={link}
                                readOnly
                                className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-green-500/50"
                            />
                            <button
                                onClick={copyLink}
                                className="px-4 py-2 bg-[#00934b] hover:bg-[#007a3e] text-white rounded-lg text-sm font-medium transition-colors"
                            >
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        </div>

                        <div className="flex justify-center">
                            <button
                                onClick={() => setShowQR(!showQR)}
                                className="text-xs text-green-400 hover:text-green-300 flex items-center gap-1 transition-colors"
                            >
                                {showQR ? 'Hide QR Code' : 'Show QR Code'}
                            </button>
                        </div>

                        {showQR && (
                            <div className="mt-4 flex justify-center animate-in fade-in zoom-in duration-300">
                                <ShareQRCode link={link} />
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-green-400 bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        Seeding • Keep this tab open to share
                    </div>

                    {progress?.sources && (
                        <div className="text-xs text-gray-500 text-center">
                            Relay: {progress.sources.relay} chunks • P2P: {progress.sources.p2p} chunks
                        </div>
                    )}
                </div>
            )}
        </TransferCard>
    );
}

