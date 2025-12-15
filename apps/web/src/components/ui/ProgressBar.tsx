import React from 'react';

interface ProgressBarProps {
    progress: number;
    label?: string;
    color?: 'green' | 'blue' | 'purple';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, label, color = 'green' }) => {
    const colorClasses = {
        green: 'bg-[#00934b]',
        blue: 'bg-blue-500',
        purple: 'bg-purple-500',
    };

    return (
        <div className="w-full">
            {label && (
                <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-300">{label}</span>
                    <span className="text-sm font-medium text-gray-300">{Math.round(progress)}%</span>
                </div>
            )}
            <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div
                    className={`${colorClasses[color]} h-2.5 rounded-full transition-all duration-300 ease-out`}
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>
    );
};
