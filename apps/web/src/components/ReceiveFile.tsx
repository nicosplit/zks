import { useState, useCallback } from 'react';
import { zksFileTransfer } from '../services/FileTransfer';
import type { TransferProgress } from '../services/FileTransfer';

export function ReceiveFile() {
    const [link, setLink] = useState('');
    const [progress, setProgress] = useState<TransferProgress | null>(null);
    const [receivedFile, setReceivedFile] = useState<File | null>(null);
    const [senderOnline, setSenderOnline] = useState<boolean | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);

    const handleReceive = useCallback(async () => {
        if (!link.startsWith('zks://')) {
            setError('Invalid ZKS link. Must start with zks://');
            return;
        }

        setError(null);
        setIsConnecting(true);

        zksFileTransfer.setOnProgress(setProgress);
        zksFileTransfer.setOnPeerCount((_count, isOnline) => {
            setSenderOnline(isOnline);
            setIsConnecting(false);
        });
        zksFileTransfer.setOnComplete((file) => {
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
        zksFileTransfer.setOnError((err) => {
            setError(err);
            setIsConnecting(false);
        });

        try {
            await zksFileTransfer.receiveFile(link);
        } catch (err) {
            console.error('Receive failed:', err);
            setError('Failed to connect. Please try again.');
            setIsConnecting(false);
        }
    }, [link]);

    return (
        <div className="receive-file">
            <h2>📥 Receive a File</h2>

            {!receivedFile ? (
                <>
                    <div className="link-input">
                        <input
                            type="text"
                            placeholder="Paste ZKS link here (zks://...)"
                            value={link}
                            onChange={(e) => setLink(e.target.value)}
                        />
                        <button onClick={handleReceive} disabled={!link || isConnecting}>
                            {isConnecting ? 'Connecting...' : 'Download'}
                        </button>
                    </div>

                    {senderOnline !== null && (
                        <div className={`status-indicator ${senderOnline ? 'online' : 'offline'}`}>
                            <span className={`status-dot ${senderOnline ? 'online' : 'offline'}`}></span>
                            <span>{senderOnline ? 'Sender is online - receiving file...' : 'Waiting for sender to come online...'}</span>
                        </div>
                    )}

                    {error && (
                        <div className="error-message">
                            ❌ {error}
                        </div>
                    )}

                    {progress && (
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${progress.progress}%` }} />
                            <span>{progress.fileName} - {progress.progress}%</span>
                        </div>
                    )}
                </>
            ) : (
                <div className="download-complete">
                    <p>✅ Downloaded: {receivedFile.name}</p>
                    <p className="hint">File saved to your Downloads folder.</p>
                </div>
            )}
        </div>
    );
}
