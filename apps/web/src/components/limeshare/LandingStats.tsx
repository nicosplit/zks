import React from 'react';
import type { SecurityMode } from '../ui/ModeToggle';

interface Props {
    mode: SecurityMode;
    onModeChange: (mode: SecurityMode) => void;
}

export const LandingStats: React.FC<Props> = ({ mode, onModeChange }) => {
    return (
        <div className="mx-auto w-fit rounded-2xl border border-white/15 bg-black/55 px-8 py-4 shadow-[0_0_44px_14px_#0000005c]">
            <div className="flex items-center justify-center">
                <div className="inline-flex bg-white/10 p-1 rounded-full backdrop-blur-sm border border-white/10">
                    <button
                        onClick={() => onModeChange('mesh')}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${mode === 'mesh'
                                ? 'bg-[#00934b] text-white shadow-lg'
                                : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        🌐 Swarm
                    </button>
                    <button
                        onClick={() => onModeChange('vernam')}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${mode === 'vernam'
                                ? 'bg-purple-600 text-white shadow-lg'
                                : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        🔐 Vernam
                    </button>
                    <button
                        onClick={() => onModeChange('aes')}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${mode === 'aes'
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        🔒 Standard
                    </button>
                </div>
            </div>
        </div>
    );
};
