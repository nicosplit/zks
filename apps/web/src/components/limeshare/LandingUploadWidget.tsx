import React, { useRef, useState } from 'react';

interface Props {
    onFileSelected: (file: File) => void;
}

export const LandingUploadWidget: React.FC<Props> = ({ onFileSelected }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onFileSelected(e.target.files[0]);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onFileSelected(e.dataTransfer.files[0]);
        }
    };

    const handleClick = (e: React.MouseEvent) => {
        // Don't trigger if clicking the folder input or its container
        if ((e.target as HTMLElement).closest('.folder-select')) {
            return;
        }
        fileInputRef.current?.click();
    };

    return (
        <div
            className={`relative mx-auto h-[19.25rem] w-[19.25rem] p-3.5 group/0 cursor-pointer transition-transform duration-300 ${isDragging ? 'scale-105' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
        >
            <svg className="fill-none absolute left-0 top-0 h-full w-full overflow-x-visible overflow-y-visible motion-safe:group-hover/0:scale-105 transition-all duration-[1.05s] ease-in-out delay-[50ms]" viewBox="0 0 309 309" xmlns="http://www.w3.org/2000/svg">
                <path className="fill-white/20" d="M267.17 259.553C252.792 274.971 235.409 287.279 216.091 295.719C196.774 304.158 175.932 308.55 154.851 308.624C133.771 308.698 112.898 304.451 93.5224 296.147C74.1463 287.842 56.6773 275.655 42.193 260.339L44.4354 258.218C58.63 273.229 75.7496 285.171 94.7382 293.31C113.727 301.448 134.181 305.61 154.84 305.538C175.499 305.466 195.925 301.161 214.856 292.891C233.787 284.62 250.823 272.558 264.912 257.449L267.17 259.553Z"></path>
                <path className={`fill-[#98c000] blur transition-opacity ease-in-out duration-1000 ${isDragging ? 'opacity-70' : 'opacity-0 group-hover/0:opacity-70'}`} d="M36.1023 253.503C17.2798 231.071 5.22836 203.747 1.35555 174.721C-2.51725 145.696 1.94846 116.168 14.2311 89.5858C26.5137 63.0038 46.1062 40.4652 70.7201 24.6026C95.3341 8.73996 123.953 0.208191 153.235 0.00376053C182.517 -0.20067 211.253 7.93068 236.086 23.4481C260.919 38.9655 280.824 61.2283 293.477 87.6363C306.129 114.044 311.007 143.507 307.539 172.584C304.072 201.66 292.404 229.15 273.896 251.843L271.504 249.892C289.642 227.653 301.077 200.713 304.475 172.218C307.873 143.723 303.093 114.85 290.693 88.9698C278.294 63.09 258.787 41.2724 234.45 26.0654C210.114 10.8583 181.953 2.88959 153.257 3.08993C124.561 3.29027 96.5137 11.6514 72.392 27.1968C48.2703 42.7421 29.0697 64.8299 17.0327 90.8803C4.99573 116.931 0.619334 145.868 4.41468 174.313C8.21003 202.758 20.0204 229.536 38.4665 251.519L36.1023 253.503Z"></path>
                <path className="fill-[#bef000]" d="M36.1023 253.503C17.2798 231.071 5.22836 203.747 1.35555 174.721C-2.51725 145.696 1.94846 116.168 14.2311 89.5858C26.5137 63.0038 46.1062 40.4652 70.7201 24.6026C95.3341 8.73996 123.953 0.208191 153.235 0.00376053C182.517 -0.20067 211.253 7.93068 236.086 23.4481C260.919 38.9655 280.824 61.2283 293.477 87.6363C306.129 114.044 311.007 143.507 307.539 172.584C304.072 201.66 292.404 229.15 273.896 251.843L271.504 249.892C289.642 227.653 301.077 200.713 304.475 172.218C307.873 143.723 303.093 114.85 290.693 88.9698C278.294 63.09 258.787 41.2724 234.45 26.0654C210.114 10.8583 181.953 2.88959 153.257 3.08993C124.561 3.29027 96.5137 11.6514 72.392 27.1968C48.2703 42.7421 29.0697 64.8299 17.0327 90.8803C4.99573 116.931 0.619334 145.868 4.41468 174.313C8.21003 202.758 20.0204 229.536 38.4665 251.519L36.1023 253.503Z"></path>
            </svg>
            <div className="relative h-full w-full">
                <div className={`absolute left-0 top-0 hidden h-full w-full rounded-full border border-[#bef000] bg-white/50 animate-[0.725s_landing-pulse_infinite] ${isDragging ? 'block' : ''}`}></div>
                <div className="absolute left-0 top-0 h-full w-full rounded-full bg-[linear-gradient(#fff,#f9fafb)] shadow-[0_0_#0000,0_0_#0000,0_12px_16px_-4px_#10182814,0_4px_6px_-2px_#10182808] motion-safe:group-hover/0:scale-105 transition-all duration-[0.65s]"></div>
                <div className="absolute left-0 top-0 h-full w-full rounded-full transition-colors duration-150 ease-in-out">
                    <div className="flex h-full w-full items-center justify-center">
                        <div className="flex flex-col items-center justify-center gap-y-5">
                            <div className="relative h-12 w-12 rounded-full group/1">
                                <span aria-hidden="true" tabIndex={0} className="[clip:rect(0_0_0_0)] whitespace-nowrap w-px h-px fixed overflow-x-hidden overflow-y-hidden -m-px left-0 top-0"></span>
                                <span className="relative flex whitespace-nowrap rounded-full shadow-[0_0_#0000,0_0_#0000,0_1px_2px_#1018280d] h-full w-full items-center justify-center bg-[#00934b] text-white outline-4 outline-solid outline-transparent transition-colors duration-150 ease-in-out group-hover/1:bg-[#027a48]">
                                    <span className="block h-6 w-6 flex-none bg-current [mask-size:contain] [mask-position:50%] [mask-repeat:no-repeat] [mask-image:url('https://proxy.extractcss.dev/https://limewire.com/build/assets/upload-area-add-files-icon-DWETVMJZ.svg')]"></span>
                                    <span className="[clip:rect(0,0,0,0)] whitespace-nowrap w-px h-px absolute overflow-x-hidden overflow-y-hidden -m-px">Upload Files</span>
                                </span>
                                <input
                                    ref={fileInputRef}
                                    id="landing-files"
                                    className="hidden"
                                    type="file"
                                    onChange={handleFileChange}
                                />
                            </div>
                            <div className="flex flex-col items-center justify-center gap-y-0.5 tracking-[0] font-dm text-sm font-medium leading-5">
                                <span className="text-[#1d2939] hover:text-[#101828]">Click or drag-and-drop<br />your files here</span>
                                <span className="flex whitespace-nowrap relative items-center justify-center gap-x-2 rounded text-[#00934b] underline outline-4 outline-solid outline-transparent transition-colors duration-150 ease-in-out tracking-[0] font-dm text-sm font-medium leading-5 hover:bg-[#f7fbf8] hover:text-[#027a48] folder-select">
                                    <span className="gap-x-2 flex items-center justify-center [overflow:inherit] [text-overflow:inherit]">
                                        <span className="[overflow:inherit] [text-overflow:inherit]">Or select a folder
                                            <input
                                                id="landing-folder"
                                                className="appearance-none text-[100%] placeholder:text-[#666] [clip:rect(0,0,0,0)] whitespace-nowrap w-px h-px absolute overflow-x-hidden overflow-y-hidden -m-px border-0 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-[#00934b] peer/1"
                                                autoComplete="off"
                                                type="file"
                                                multiple
                                                {...{ webkitdirectory: "" }}
                                                onChange={handleFileChange}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                            <label htmlFor="landing-folder" className="absolute left-0 top-0 h-full w-full cursor-pointer rounded-sm"></label>
                                        </span>
                                    </span>
                                </span>
                            </div>
                            <div className="mx-5 flex flex-wrap items-center justify-center gap-y-1 gap-x-1">
                                <span className="text-[#667085] tracking-[0] font-dm text-sm leading-5">Up to ∞ free</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
