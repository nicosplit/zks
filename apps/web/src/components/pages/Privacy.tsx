import React from 'react';
import { LandingNavbar } from '../limeshare/LandingNavbar';
import { LandingFooter } from '../limeshare/LandingFooter';

export const Privacy: React.FC = () => {
    return (
        <div className="flex min-h-screen flex-col bg-white">
            <LandingNavbar />
            <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl">
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl mb-8">
                        Privacy Policy
                    </h1>

                    <div className="prose prose-lg prose-slate text-slate-600">
                        <p className="lead text-xl text-slate-700">
                            We don't want your data. We built ZKS specifically so we wouldn't have to hold it.
                        </p>

                        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">1. No Data Storage</h2>
                        <p>
                            ZKS is a <strong>real-time transfer protocol</strong>. We do not store your files.
                            When you close the tab, the file is gone from our network. We have no database of uploaded files.
                        </p>

                        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">2. No Logs</h2>
                        <p>
                            We do not maintain access logs of who shared what. Our relay servers are designed to be "dumb pipes" that forward encrypted packets and forget them immediately.
                        </p>

                        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">3. IP Addresses</h2>
                        <p>
                            To establish a direct P2P connection, your IP address must be visible to the person you are sharing with (this is how the internet works).
                            However, our relay servers only use your IP to route traffic and do not store it.
                        </p>

                        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">4. Cookies & Tracking</h2>
                        <p>
                            We use <strong>zero</strong> tracking cookies. We don't use Google Analytics. We don't use Facebook Pixels.
                            The only data stored in your browser is the temporary encryption key required for your current transfer.
                        </p>

                        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">5. Government Requests</h2>
                        <p>
                            If a government agency asks us for your data, we cannot give it to them because <strong>we don't have it</strong>.
                            We cannot decrypt your files, and we cannot recover past transfers.
                        </p>
                    </div>
                </div>
            </main>
            <LandingFooter />
        </div>
    );
};
