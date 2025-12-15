import { useState, useEffect } from 'react';
import { zksFileTransfer } from '../services/FileTransfer';
import type { TransferProgress } from '../services/FileTransfer';
import { TransferCard } from './ui/TransferCard';
import { ProgressBar } from './ui/ProgressBar';
import { ShareQRCode } from './ui/ShareQRCode';

interface ShareFileProps {
    onLinkGenerated?: (link: string) => void;
    file?: File | null;
    onClose?: () => void;
}

export function ShareFile({ onLinkGenerated, file, onClose }: ShareFileProps) {
    const [progress, setProgress] = useState<TransferProgress | null>(null);
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
        zksFileTransfer.setOnProgress(setProgress);
        zksFileTransfer.setOnPeerCount((count) => {
            setPeerCount(count);
        });

        try {
            const zksLink = await zksFileTransfer.shareFile(file);
            const fullLink = `${window.location.origin}/?file=${encodeURIComponent(zksLink)}`;
            setLink(fullLink);
            onLinkGenerated?.(fullLink);
        } catch (error) {
            console.error('Share failed:', error);
        }
    };

    const copyLink = () => {
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <TransferCard title="ZKS Standard" subtitle="AES-256 • Secure Direct Transfer" onClose={onClose}>
            {!link ? (
                <div className="space-y-6">
                    {progress ? (
                        <ProgressBar
                            progress={progress.progress}
                            label={`${progress.fileName} - ${progress.progress}%`}
                            color="blue"
                        />
                    ) : (
                        <div className="text-center text-gray-400 py-8 animate-pulse">
                            Initializing encrypted transfer...
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-sm text-gray-400">Share Link</span>
                            <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
                                <div className={`w-2 h-2 rounded-full ${peerCount > 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                                <span className="text-xs font-medium text-blue-300">
                                    {peerCount > 0 ? `${peerCount} Receiver Connected` : 'Waiting for receiver...'}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                value={link}
                                readOnly
                                className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-blue-500/50"
                            />
                            <button
                                onClick={copyLink}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        </div>

                        <div className="flex justify-center">
                            <button
                                onClick={() => setShowQR(!showQR)}
                                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
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

                    {progress?.status === 'transferring' && (
                        <ProgressBar
                            progress={progress.progress}
                            label="Sending to receiver..."
                            color="blue"
                        />
                    )}

                    {progress?.status === 'complete' && (
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
