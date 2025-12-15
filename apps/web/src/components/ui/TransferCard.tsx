import React from 'react';

interface TransferCardProps {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    onClose?: () => void;
}

export const TransferCard: React.FC<TransferCardProps> = ({ title, subtitle, children, onClose }) => {
    return (
        <div className="relative w-full max-w-2xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-white/5 rounded-2xl blur-xl"></div>
            <div className="relative bg-[#010914]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1">{title}</h2>
                        {subtitle && <p className="text-gray-400 text-sm">{subtitle}</p>}
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            ✕
                        </button>
                    )}
                </div>
                {children}
            </div>
        </div>
    );
};
