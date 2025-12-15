import React, { useEffect, useState } from 'react';

export const LandingBackground: React.FC = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        let animationFrameId: number;
        let targetX = 0;
        let targetY = 0;

        const handleMouseMove = (event: MouseEvent) => {
            targetX = (event.clientX / window.innerWidth) * 2 - 1;
            targetY = (event.clientY / window.innerHeight) * 2 - 1;
        };

        const updatePosition = () => {
            setMousePosition(prev => {
                // Smooth interpolation (optional, but good for lag reduction)
                const dx = targetX - prev.x;
                const dy = targetY - prev.y;
                if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) return prev;
                return {
                    x: prev.x + dx * 0.1,
                    y: prev.y + dy * 0.1
                };
            });
            animationFrameId = requestAnimationFrame(updatePosition);
        };

        window.addEventListener('mousemove', handleMouseMove);
        animationFrameId = requestAnimationFrame(updatePosition);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    // Calculate rotation values based on mouse position
    // Adjust intensity to match the video's subtle movement (approx 2-5 degrees)
    const rotationIntensity = 3;
    const rotateX = -mousePosition.y * rotationIntensity;
    const rotateY = mousePosition.x * rotationIntensity;

    return (
        <>
            <svg className="fixed top-0 left-0 w-0 h-0 pointer-events-none overflow-hidden">
                <filter id="landing-blur" colorInterpolationFilters="sRGB">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="20"></feGaussianBlur>
                    <feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0 1"></feColorMatrix>
                </filter>
                <filter xmlns="http://www.w3.org/2000/svg" id="landing-noise" x="0" y="0">
                    <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"></feTurbulence>
                </filter>
            </svg>
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden bg-scroll pointer-events-none">
                <div className="w-full h-full absolute opacity-100 transition-opacity duration-[3.5s] sm:peer-data-[paper-shader]/shader:opacity-75" style={{ filter: 'url(#landing-blur)', zIndex: 0 }}>
                    <div className="w-full h-full absolute top-0 left-0 bg-cover bg-center bg-scroll" style={{ backgroundImage: "url('https://proxy.extractcss.dev/https://limewire.com/build/assets/landing-horizontal-bg-CEVXo4MQ.webp')" }}></div>
                    <div className="w-full h-full absolute top-0 left-0 bg-cover bg-center bg-scroll xs:hidden" style={{ backgroundImage: "url('https://proxy.extractcss.dev/https://limewire.com/build/assets/landing-vertical-bg-DU0uf3oE.webp')" }}></div>
                </div>
                <div className="w-full h-full absolute top-0 left-0 opacity-10" style={{ filter: 'url(#landing-noise)', zIndex: 2 }}></div>


                <div className="absolute top-0 left-0 w-full h-full hidden xs:block [perspective:100vw]" style={{ zIndex: 4 }}>
                    {/* Left Group */}
                    <div className="absolute top-0 left-0 w-full h-full translate-x-[calc(-50%+400px)] lg:translate-x-0 transition-transform duration-500">
                        <div className="w-full h-full transition-transform duration-100 ease-out" style={{ transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)` }}>

                            {/* Tile 1 Left */}
                            <div className="absolute animate-[floating_6s_ease-in-out_infinite]" style={{ width: 'max(186px, 12.9%)', height: 'max(145px, 16.1%)', left: 'calc(50% - max(512px, 41.5%))', top: 'calc(50% - max(212px, 23%))' }}>
                                <div className="w-full h-full bg-contain bg-center bg-no-repeat transition-opacity [transform-style:preserve-3d] opacity-30" style={{ backgroundImage: "url('https://proxy.extractcss.dev/https://limewire.com/build/assets/landing-tile-left-play-C4JzP4ox.svg')", transform: 'translateX(13.8086px) translateY(9.95277px) rotateZ(6.41357deg)' }}></div>
                            </div>

                            {/* Tile 2 Left */}
                            <div className="absolute animate-[floating-delayed_7s_ease-in-out_infinite_1s]" style={{ width: 'max(104px, 12.9%)', height: 'max(98px, 16.1%)', left: 'calc(50% - max(451px, 45.2%))', top: 'calc(50% - max(36px, 4%))' }}>
                                <div className="w-full h-full bg-contain bg-center bg-no-repeat transition-opacity [transform-style:preserve-3d] opacity-40" style={{ backgroundImage: "url('https://proxy.extractcss.dev/https://limewire.com/build/assets/landing-tile-left-below-play-CGFEidvo.svg')", transform: 'translateX(25.3158px) translateY(-17.915px) rotateX(-10.1263deg) rotateY(-4.37922deg)' }}></div>
                            </div>

                            {/* Tile 3 Left */}
                            <div className="absolute animate-[floating-reverse_8s_ease-in-out_infinite_0.5s]" style={{ width: 'max(82px, 5.69%)', height: 'max(125px, 13.8%)', left: 'calc(50% - max(556px, 38.6%))', top: 'calc(50% + max(377px, 41.8%))' }}>
                                <div className="w-full h-full bg-contain bg-center bg-no-repeat transition-opacity [transform-style:preserve-3d] opacity-20" style={{ backgroundImage: "url('https://proxy.extractcss.dev/https://limewire.com/build/assets/landing-tile-left-bottom-7N0KFB_m.svg')", transform: 'translateX(13.8086px) translateY(13.9339px) rotateX(23.0143deg) rotateZ(4.58112deg)' }}></div>
                            </div>

                            {/* Tile 4 Left */}
                            <div className="absolute animate-[floating_9s_ease-in-out_infinite_2s]" style={{ width: 'max(288px, 20%)', height: 'max(301px, 33.4%)', left: 'calc(50% - max(930px, 64.58%))', top: 'calc(50% + max(164px, 18.2%))' }}>
                                <div className="w-full h-full bg-contain bg-center bg-no-repeat transition-opacity [transform-style:preserve-3d]" style={{ backgroundImage: "url('https://proxy.extractcss.dev/https://limewire.com/build/assets/landing-tile-left-CNrXuFS7.svg')", transform: 'translateX(6.9043px) translateY(-3.98111px) rotateZ(-2.74867deg)' }}></div>
                            </div>

                        </div>
                    </div>

                    {/* Right Group */}
                    <div className="absolute top-0 left-0 w-full h-full translate-x-[calc(45%-400px)] lg:translate-x-0 transition-transform duration-500">
                        <div className="w-full h-full transition-transform duration-100 ease-out" style={{ transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)` }}>

                            {/* Tile 1 Right */}
                            <div className="absolute animate-[floating-reverse_6.5s_ease-in-out_infinite_1.5s]" style={{ width: 'max(196px, 13.6%)', height: 'max(141px, 15.6%)', left: 'calc(50% + max(370px, 29.5%))', top: 'calc(50% - max(171px, 18.2%))' }}>
                                <div className="w-full h-full bg-contain bg-center bg-no-repeat transition-opacity [transform-style:preserve-3d] opacity-20" style={{ backgroundImage: "url('https://proxy.extractcss.dev/https://limewire.com/build/assets/landing-tile-right-tick-DyOBp0tS.svg')", transform: 'translateX(-13.8086px) translateY(-7.96221px) rotateZ(9.16225deg)' }}></div>
                            </div>

                            {/* Tile 2 Right */}
                            <div className="absolute animate-[floating_7.5s_ease-in-out_infinite_0.2s]" style={{ width: 'max(106px, 7.3%)', height: 'max(109px, 12.1%)', left: 'calc(50% + max(279px, 24.3%))', top: 'calc(50% - max(251px, 31%))' }}>
                                <div className="w-full h-full bg-contain bg-center bg-no-repeat transition-opacity [transform-style:preserve-3d] opacity-10" style={{ backgroundImage: "url('https://proxy.extractcss.dev/https://limewire.com/build/assets/landing-tile-right-above-tick-W8AhC-Qu.svg')", transform: 'translateX(-18.4115px) translateY(19.9055px) rotateX(-13.8086deg) rotateY(-11.9433deg)' }}></div>
                            </div>

                            {/* Tile 3 Right */}
                            <div className="absolute animate-[floating-delayed_8.5s_ease-in-out_infinite_1.8s]" style={{ width: 'max(96px, 6.6%)', height: 'max(101px, 11.2%)', left: 'calc(50% + max(490px, 35.5%))', top: 'calc(50% + max(32px, 9.2%))' }}>
                                <div className="w-full h-full bg-contain bg-center bg-no-repeat transition-opacity [transform-style:preserve-3d] opacity-40" style={{ backgroundImage: "url('https://proxy.extractcss.dev/https://limewire.com/build/assets/landing-tile-right-below-tick-CVRFkoSI.svg')", transform: 'translateX(-27.6172px) translateY(-27.8677px) rotateX(13.8086deg) rotateY(11.9433deg)' }}></div>
                            </div>

                            {/* Tile 4 Right */}
                            <div className="absolute animate-[floating_9.5s_ease-in-out_infinite_0.8s]" style={{ width: 'max(309px, 21.4%)', height: 'max(300px, 33.3%)', left: 'calc(50% + max(356px, 24.7%))', top: 'calc(50% + max(303px, 36.6%))' }}>
                                <div className="w-full h-full bg-contain bg-center bg-no-repeat transition-opacity [transform-style:preserve-3d]" style={{ backgroundImage: "url('https://proxy.extractcss.dev/https://limewire.com/build/assets/landing-tile-right-bottom-CCwUo_Yf.svg')", transform: 'translateX(-9.20573px) translateY(-3.98111px) rotateZ(-2.74867deg)' }}></div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
