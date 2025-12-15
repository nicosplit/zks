import React from 'react';

export const LandingFooter: React.FC = () => {
    return (
        <div className="mt-auto w-full flex flex-col md:flex-row items-center md:items-end justify-between gap-y-4 py-6 px-4 md:px-8 text-white/50 tracking-[0] font-dm text-xs leading-[1.125rem]">
            <div className="text-center md:text-left order-2 md:order-1">
                Copyright © 2025 ZKS™. All Rights Reserved.<br />
                Created by <a href="https://github.com/cswasif" target="_blank" rel="noreferrer" className="font-bold hover:text-white transition-colors">Md. Wasif Faisal</a>.
            </div>
            <div className="flex gap-x-6 order-1 md:order-2">
                <a href="/blog" className="hover:text-white transition-colors font-semibold text-[#00934b]">Blog</a>
                <a href="/terms" className="hover:text-white transition-colors">Terms & conditions</a>
                <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="/security" className="hover:text-white transition-colors">How it Works (Security)</a>
            </div>
        </div>
    );
};
