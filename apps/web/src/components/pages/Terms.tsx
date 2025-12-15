import React from 'react';
import { LandingNavbar } from '../limeshare/LandingNavbar';
import { LandingFooter } from '../limeshare/LandingFooter';

export const Terms: React.FC = () => {
    return (
        <div className="flex min-h-screen flex-col bg-white">
            <LandingNavbar />
            <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl">
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl mb-8">
                        Terms of Service
                    </h1>

                    <div className="prose prose-lg prose-slate text-slate-600">
                        <p className="lead text-xl text-slate-700">
                            By using ZKS, you agree to the following terms.
                        </p>

                        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">1. Acceptable Use</h2>
                        <p>
                            ZKS is a tool for privacy. You agree not to use this tool for:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 my-4">
                            <li>Sharing illegal content (CSAM, malware, etc.).</li>
                            <li>Harassment or abuse.</li>
                            <li>Violating intellectual property rights.</li>
                        </ul>

                        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">2. Liability</h2>
                        <p>
                            ZKS is provided "as is". We are not responsible for:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 my-4">
                            <li>Data loss (e.g., if you close the tab before the transfer finishes).</li>
                            <li>The content shared by users (we cannot see it, so we cannot moderate it).</li>
                            <li>Any damages resulting from the use of this service.</li>
                        </ul>

                        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">3. Content Moderation</h2>
                        <p>
                            Because ZKS is a Zero-Knowledge system, we cannot technically view or remove specific files.
                            However, we reserve the right to ban IP addresses or block access to our relay servers if we detect abuse of the network protocol itself (e.g., DDoS attacks).
                        </p>

                        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">4. Changes</h2>
                        <p>
                            We may update these terms at any time. Continued use of the service constitutes acceptance of the new terms.
                        </p>
                    </div>
                </div>
            </main>
            <LandingFooter />
        </div>
    );
};
