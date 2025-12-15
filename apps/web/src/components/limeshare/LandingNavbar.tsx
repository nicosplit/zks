import React from 'react';

export const LandingNavbar: React.FC = () => {
    return (
        <div className="sticky top-0 z-40 h-20">
            <nav className="relative h-full">
                <div className="pointer-events-none absolute left-0 top-0 -z-10 h-[300%] w-full opacity-60 bg-[linear-gradient(#01090a_0%,#0000_40%)]"></div>
                <div className="pointer-events-none absolute left-0 top-0 -z-10 h-[150%] w-full backdrop-blur [mask-image:linear-gradient(#000_30%,#0000_100%)]"></div>
                <div className="md:px-4 flex h-full items-center gap-x-4 px-3.5">
                    <a className="flex h-10 flex-none items-center rounded focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-[#00934b]" href="/">
                        <span className="text-2xl font-bold text-white tracking-tighter">ZKS</span>
                    </a>

                    <div className="ml-auto flex gap-x-4">
                        <a href="https://github.com/wasif-faisal/ZKS" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors">
                            GitHub
                        </a>
                    </div>
                </div>
            </nav>
        </div>
    );
};
