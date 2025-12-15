import { useState, useCallback, useEffect } from 'react';
import { meshFileTransfer } from '../services/MeshFileTransfer';
import type { MeshProgress } from '../services/MeshFileTransfer';
import { TransferCard } from './ui/TransferCard';
import { ProgressBar } from './ui/ProgressBar';
import { PeerBadge } from './ui/PeerBadge';

interface MeshReceiveProps {
    onClose?: () => void;
}

export function MeshReceive({ onClose }: MeshReceiveProps) {
    const [link, setLink] = useState('');
    const [progress, setProgress] = useState<MeshProgress | null>(null);
    const [receivedFile, setReceivedFile] = useState<File | null>(null);
    const [seeders, setSeeders] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const fileLink = params.get('file');
        if (fileLink) {
            setLink(fileLink);
        }
    }, []);

    const handleReceive = useCallback(async () => {
        if (!link.startsWith('zkv://')) {
            setError('Invalid link. Must start with zkv://');
            return;
        }

        setError(null);
        setIsConnecting(true);

        meshFileTransfer.setOnProgress(setProgress);
        meshFileTransfer.setOnPeer((s, _l) => {
            setSeeders(s);
            setIsConnecting(false);
        });
        meshFileTransfer.setOnComplete((file) => {
            setReceivedFile(file);
            // Auto-download
            const url = URL.createObjectURL(file);
            const a = document.createElement('a');
            a.href = url;
            a.download = file.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
        meshFileTransfer.setOnError((err) => {
            setError(err);
            setIsConnecting(false);
        });

        try {
            await meshFileTransfer.receiveFile(link);
        } catch (err) {
            console.error('Mesh receive failed:', err);
            setError('Failed to connect');
            setIsConnecting(false);
        }
    }, [link]);

    const getStageLabel = (stage: string) => {
        switch (stage) {
            case 'connecting': return '🔗 Connecting to peers...';
            case 'transferring': return '📥 Downloading...';
            case 'seeding': return '🌱 Seeding (sharing with others)';
            case 'complete': return '✅ Complete!';
            default: return stage;
        }
    };

    return (
        <TransferCard title="🌐 P2P Download" subtitle="Mesh Network • High Speed" onClose={onClose}>
            {!receivedFile ? (
                <div className="space-y-6">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Paste mesh link (zkv://...)"
                            value={link}
                            onChange={(e) => setLink(e.target.value)}
                            className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-green-500/50"
                        />
                        <button
                            onClick={handleReceive}
                            disabled={!link || isConnecting}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!link || isConnecting
                                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                    : 'bg-[#00934b] hover:bg-[#007a3e] text-white'
                                }`}
                        >
                            {isConnecting ? 'Connecting...' : 'Download'}
                        </button>
                    </div>

                    {error && (
                        <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                            ❌ {error}
                        </div>
                    )}

                    {seeders > 0 && (
                        <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                            <span className="text-sm text-gray-400">Availability</span>
                            <PeerBadge seeders={seeders} leechers={0} />
                        </div>
                    )}

                    {progress && (
                        <div className="space-y-4">
                            <ProgressBar
                                progress={progress.progress}
                                label={getStageLabel(progress.stage)}
                                color="green"
                            />

                            {progress.sources && (
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="bg-blue-500/10 p-2 rounded text-blue-300 text-center">
                                        📡 Relay: {progress.sources.relay} chunks
                                    </div>
                                    <div className="bg-green-500/10 p-2 rounded text-green-300 text-center">
                                        🌐 P2P: {progress.sources.p2p} chunks
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-6 text-center">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">✅</span>
                    </div>

                    <h3 className="text-xl font-bold text-white">Download Complete!</h3>
                    <p className="text-gray-400">{receivedFile.name}</p>

                    <div className="bg-green-500/10 p-4 rounded-xl border border-green-500/20">
                        <p className="text-green-400 text-sm font-medium mb-1">🌱 You are now seeding</p>
                        <p className="text-gray-500 text-xs">Keep this tab open to help others download faster.</p>
                    </div>

                    {progress?.sources && (
                        <div className="text-xs text-gray-500">
                            Source: {progress.sources.relay} relay • {progress.sources.p2p} P2P
                        </div>
                    )}
                </div>
            )}
        </TransferCard>
    );
}
