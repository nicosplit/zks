import { useState, useEffect } from 'react';
import { vernamFileTransfer } from '../services/VernamFileTransfer';
import type { VernamProgress } from '../services/VernamFileTransfer';
import { TransferCard } from './ui/TransferCard';
import { ProgressBar } from './ui/ProgressBar';
import { ShareQRCode } from './ui/ShareQRCode';

interface VernamShareProps {
    onLinkGenerated?: (link: string) => void;
    file?: File | null;
    onClose?: () => void;
}

export function VernamShare({ onLinkGenerated, file, onClose }: VernamShareProps) {
    const [progress, setProgress] = useState<VernamProgress | null>(null);
    const [link, setLink] = useState<string>('');
    const [peerCount, setPeerCount] = useState(0);
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
        vernamFileTransfer.setOnProgress(setProgress);
        vernamFileTransfer.setOnPeer((count) => setPeerCount(count));

        try {
            const vernamLink = await vernamFileTransfer.shareFile(file);
            const fullLink = `${window.location.origin}/?file=${encodeURIComponent(vernamLink)}`;
            setLink(fullLink);
            onLinkGenerated?.(fullLink);
        } catch (error) {
            console.error('Vernam share failed:', error);
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
            case 'encrypting': return '🔐 Encrypting...';
            case 'transferring': return '📤 Transferring...';
            case 'complete': return '✅ Complete!';
            default: return stage;
        }
    };

    return (
        <TransferCard title="ZKS Vernam" subtitle="Perfect Secrecy • One-Time Pad" onClose={onClose}>
            {!link ? (
                <div className="space-y-6">
                    {progress ? (
                        <ProgressBar
                            progress={progress.progress}
                            label={getStageLabel(progress.stage)}
                            color="purple"
                        />
                    ) : (
                        <div className="text-center text-gray-400 py-8 animate-pulse">
                            Initializing secure transfer...
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-sm text-gray-400">Secure Link</span>
                            <div className="flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full">
                                <div className={`w-2 h-2 rounded-full ${peerCount > 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                                <span className="text-xs font-medium text-purple-300">
                                    {peerCount > 0 ? `${peerCount} Receiver Connected` : 'Waiting for receiver...'}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                value={link}
                                readOnly
                                className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-purple-500/50"
                            />
                            <button
                                onClick={copyLink}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        </div>

                        <div className="flex justify-center">
                            <button
                                onClick={() => setShowQR(!showQR)}
                                className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
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

                    <div className="space-y-2 text-sm text-gray-400 bg-black/20 p-4 rounded-lg">
                        <div className="flex items-center gap-2">
                            <span>🔑</span> KeyA: Generated locally
                        </div>
                        <div className="flex items-center gap-2">
                            <span>🔑</span> KeyB: From zks-key worker
                        </div>
                        <div className="flex items-center gap-2 text-purple-300">
                            <span>📤</span> Both keys sent securely via relay
                        </div>
                    </div>

                    {progress?.stage === 'transferring' && (
                        <ProgressBar
                            progress={progress.progress}
                            label="Sending..."
                            color="purple"
                        />
                    )}

                    {progress?.stage === 'complete' && (
                        <div className="text-center text-green-400 font-medium bg-green-500/10 p-2 rounded-lg">
                            ✅ Transfer complete!
                        </div>
                    )}

                    <div className="text-xs text-gray-500 text-center">
                        ⚠️ Keep tab open until receiver downloads.
                    </div>
                </div>
            )}
        </TransferCard>
    );
}
