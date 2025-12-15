import React from 'react';
import { LandingUploadWidget } from './LandingUploadWidget';
import { LandingStats } from './LandingStats';

import { LandingFooter } from './LandingFooter';

import type { SecurityMode } from '../ui/ModeToggle';

interface Props {
    onFileSelected: (file: File) => void;
    mode: SecurityMode;
    onModeChange: (mode: SecurityMode) => void;
}

export const LandingHero: React.FC<Props> = ({ onFileSelected, mode, onModeChange }) => {
    return (
        <div className="h-full">
            <div className="min-h-full md:px-4 relative z-0 grid px-3.5 text-white">
                <div className="md:grid-cols-[minmax(0,1fr)] grid h-full w-full grid-cols-1 grid-rows-1">
                    <main className="min-h-full w-full">
                        <div className="flex h-full flex-col items-center pt-6">
                            <div className="sm:max-w-md md:max-w-[33rem] mx-auto max-w-sm text-center mb-8">
                                <div className="flex flex-col items-center gap-y-2">
                                    <h1 className="text-center flex flex-col items-center">
                                        <span className="block text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter bg-[linear-gradient(#1a9e5d,#d2f54d)] bg-clip-text text-transparent [text-shadow:0_4px_20px_rgba(26,158,93,0.3)] mb-2">
                                            Zero-Knowledge Swarm
                                        </span>
                                        <span className="block text-lg md:text-xl font-medium text-gray-200 tracking-wide">
                                            Anonymous File Sharing
                                        </span>
                                    </h1>
                                    <p className="mt-4 max-w-lg text-center text-sm md:text-base text-gray-400 leading-relaxed font-light">
                                        The Next-Generation Protocol. Hidden IPs, End-to-End Encryption, and 100% Uptime via Mesh Relay.
                                    </p>
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col items-center justify-center w-full gap-y-8">
                                <div className="relative">
                                    <div className="flex flex-col gap-y-4 text-center">
                                        <LandingUploadWidget onFileSelected={onFileSelected} />
                                    </div>
                                </div>
                                <LandingStats mode={mode} onModeChange={onModeChange} />
                            </div>
                            <LandingFooter />
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};
