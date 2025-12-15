import React from 'react';

interface PeerBadgeProps {
    seeders: number;
    leechers: number;
}

export const PeerBadge: React.FC<PeerBadgeProps> = ({ seeders, leechers }) => {
    return (
        <div className="flex gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-green-400">{seeders} Seeders</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-xs font-medium text-blue-400">{leechers} Leechers</span>
            </div>
        </div>
    );
};
