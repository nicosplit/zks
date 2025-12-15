import React, { useState, useEffect } from 'react';
import { LandingBackground } from './LandingBackground';
import { LandingNavbar } from './LandingNavbar';
import { LandingHero } from './LandingHero';
import { MeshShare } from '../MeshShare';
import { VernamShare } from '../VernamShare';
import { ShareFile } from '../ShareFile'; // AES
import { MeshReceive } from '../MeshReceive';
import type { SecurityMode } from '../ui/ModeToggle';

export const LandingPage: React.FC = () => {
    const [view, setView] = useState<'home' | 'share' | 'receive'>('home');
    const [mode, setMode] = useState<SecurityMode>('mesh');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('file')) {
            setView('receive');
        }
    }, []);

    const handleFileSelected = (file: File) => {
        setSelectedFile(file);
        setView('share');
    };

    const handleCloseTransfer = () => {
        setView('home');
        setSelectedFile(null);
    };

    return (
        <div className="tracking-[0] font-dm text-base leading-6 relative z-0 grid min-h-full min-w-full bg-[#010914] disabled:cursor-default">
            <LandingBackground />
            <div className="z-10 grid min-h-full grid-cols-1 grid-rows-[auto_auto_minmax(0,1fr)]">
                <div className="z-50"></div>
                <LandingNavbar />
                {view === 'home' && <LandingHero onFileSelected={handleFileSelected} mode={mode} onModeChange={setMode} />}

                {view === 'share' && (
                    <div className="flex items-center justify-center min-h-[60vh] text-white p-4">
                        {mode === 'mesh' && <MeshShare file={selectedFile} onClose={handleCloseTransfer} />}
                        {mode === 'vernam' && <VernamShare file={selectedFile} onClose={handleCloseTransfer} />}
                        {mode === 'aes' && <ShareFile file={selectedFile} onClose={handleCloseTransfer} />}
                    </div>
                )}

                {view === 'receive' && (
                    <div className="flex items-center justify-center min-h-[60vh] text-white p-4">
                        <MeshReceive onClose={handleCloseTransfer} />
                    </div>
                )}
            </div>
        </div>
    );
};
