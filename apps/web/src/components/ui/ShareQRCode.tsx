import React from 'react';
import QRCode from 'react-qr-code';

interface ShareQRCodeProps {
    link: string;
}

export const ShareQRCode: React.FC<ShareQRCodeProps> = ({ link }) => {
    return (
        <div className="bg-white p-4 rounded-xl shadow-lg inline-block">
            <QRCode
                value={link}
                size={128}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                viewBox={`0 0 256 256`}
            />
        </div>
    );
};
