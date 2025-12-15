import { useState, useCallback } from 'react';
import { vernamFileTransfer } from '../services/VernamFileTransfer';
import type { VernamProgress } from '../services/VernamFileTransfer';

export function VernamReceive() {
    const [link, setLink] = useState('');
    const [progress, setProgress] = useState<VernamProgress | null>(null);
    const [receivedFile, setReceivedFile] = useState<File | null>(null);
    const [senderOnline, setSenderOnline] = useState<boolean | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);

    const handleReceive = useCallback(async () => {
        if (!link.startsWith('zkv://')) {
            setError('Invalid Vernam link. Must start with zkv://');
            return;
        }

        setError(null);
        setIsConnecting(true);

        vernamFileTransfer.setOnProgress(setProgress);
        vernamFileTransfer.setOnPeer((_count, isOnline) => {
            setSenderOnline(isOnline);
            setIsConnecting(false);
        });
        vernamFileTransfer.setOnComplete((file) => {
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
        vernamFileTransfer.setOnError((err) => {
            setError(err);
            setIsConnecting(false);
        });

        try {
            await vernamFileTransfer.receiveFile(link);
        } catch (err) {
            console.error('Vernam receive failed:', err);
            setError('Failed to connect. Please try again.');
            setIsConnecting(false);
        }
    }, [link]);

    const getStageLabel = (stage: string) => {
        switch (stage) {
            case 'keys': return '🔑 Receiving keys...';
            case 'decrypting': return '🔓 Decrypting...';
            case 'complete': return '✅ Complete!';
            default: return stage;
        }
    };

    return (
        <div className="receive-file vernam">
            <h2>🔓 Vernam Receive</h2>
            <p className="vernam-badge">Split-Key Decryption</p>

            {!receivedFile ? (
                <>
                    <div className="link-input">
                        <input
                            type="text"
                            placeholder="Paste Vernam link (zkv://session/file)"
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
                            <span>{senderOnline ? 'Sender online - receiving...' : 'Waiting for sender...'}</span>
                        </div>
                    )}

                    {senderOnline && (
                        <div className="security-info">
                            <p>🔑 Receiving keyA + keyB from sender</p>
                            <p>🔓 Decrypting with split-key XOR</p>
                        </div>
                    )}

                    {error && <div className="error-message">❌ {error}</div>}

                    {progress && (
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${progress.progress}%` }} />
                            <span>{getStageLabel(progress.stage)} {progress.progress}%</span>
                        </div>
                    )}
                </>
            ) : (
                <div className="download-complete">
                    <p>✅ Downloaded: {receivedFile.name}</p>
                    <p className="hint">File decrypted with split-key one-time pad.</p>
                </div>
            )}
        </div>
    );
}
