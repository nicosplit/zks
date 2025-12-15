import React from 'react';

export type SecurityMode = 'mesh' | 'vernam' | 'aes';

interface ModeToggleProps {
  mode: SecurityMode;
  onChange: (mode: SecurityMode) => void;
}

export const ModeToggle: React.FC<ModeToggleProps> = ({ mode, onChange }) => {
  return (
    <div className="inline-flex bg-white/10 p-1 rounded-full backdrop-blur-sm border border-white/10">
      <button
        onClick={() => onChange('mesh')}
        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${mode === 'mesh'
            ? 'bg-[#00934b] text-white shadow-lg'
            : 'text-gray-400 hover:text-white'
          }`}
      >
        🌐 Swarm
      </button>
      <button
        onClick={() => onChange('vernam')}
        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${mode === 'vernam'
            ? 'bg-purple-600 text-white shadow-lg'
            : 'text-gray-400 hover:text-white'
          }`}
      >
        🔐 Vernam
      </button>
      <button
        onClick={() => onChange('aes')}
        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${mode === 'aes'
            ? 'bg-blue-600 text-white shadow-lg'
            : 'text-gray-400 hover:text-white'
          }`}
      >
        🔒 Standard
      </button>
    </div>
  );
};
