import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Mock Data
const MOCK_CONTACTS = [
    { id: '0x7F...3A', status: 'online', lastMsg: 'Key exchange complete.', time: '10:42' },
    { id: '0x9B...1C', status: 'offline', lastMsg: 'File received.', time: 'Yesterday' },
    { id: '0x2A...9F', status: 'busy', lastMsg: 'Burn timer set to 60s.', time: 'Mon' },
];

const MOCK_MESSAGES = [
    { id: 1, sender: '0x7F...3A', text: 'Secure connection established.', time: '10:42 AM', type: 'system' },
    { id: 2, sender: 'me', text: 'Confirming key stream sync.', time: '10:42 AM', type: 'user' },
    { id: 3, sender: '0x7F...3A', text: 'Sync confirmed. Ready for encrypted transport.', time: '10:43 AM', type: 'peer' },
    { id: 4, sender: '0x7F...3A', text: 'This UI is a direct port of the Cinny layout structure, adapted for ZKS.', time: '10:43 AM', type: 'peer' },
];

// Cinny-style Avatar Component
const Avatar = ({ id, status }: { id: string, status?: string }) => (
    <div className="relative w-8 h-8 flex-shrink-0">
        <div className="w-full h-full rounded-lg bg-emerald-900/30 border border-emerald-500/20 flex items-center justify-center text-xs font-bold text-emerald-500">
            {id.substring(2, 4)}
        </div>
        {status === 'online' && (
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#050505] rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_4px_#10b981]" />
            </div>
        )}
    </div>
);

// Cinny-style Message Bubble
const MessageBubble = ({ msg }: { msg: any }) => {
    const isMe = msg.sender === 'me';

    if (msg.type === 'system') {
        return (
            <div className="flex justify-center my-4">
                <span className="text-[11px] text-emerald-600/70 font-mono bg-emerald-900/10 px-2 py-0.5 rounded">
                    {msg.text}
                </span>
            </div>
        );
    }

    return (
        <div className={`flex gap-3 group ${isMe ? 'flex-row-reverse' : ''} mb-1`}>
            {/* Avatar Column */}
            <div className="w-9 flex-shrink-0 flex flex-col items-center pt-1">
                {!isMe && <Avatar id={msg.sender} />}
            </div>

            {/* Content Column */}
            <div className={`flex flex-col max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                {/* Header (Name + Time) */}
                {!isMe && (
                    <div className="flex items-baseline gap-2 mb-0.5 ml-1">
                        <span className="text-sm font-bold text-emerald-500 cursor-pointer hover:underline">
                            {msg.sender}
                        </span>
                        <span className="text-[10px] text-gray-600">{msg.time}</span>
                    </div>
                )}

                {/* Bubble */}
                <div className={`relative px-4 py-2 text-[15px] leading-relaxed shadow-sm ${isMe
                        ? 'bg-emerald-600 text-white rounded-2xl rounded-tr-sm'
                        : 'bg-[#1a1a1a] text-gray-200 rounded-2xl rounded-tl-sm border border-gray-800'
                    }`}>
                    {msg.text}
                </div>

                {/* Timestamp for Me */}
                {isMe && <span className="text-[10px] text-gray-600 mt-1 mr-1">{msg.time}</span>}
            </div>
        </div>
    );
};

export const ChatLayout: React.FC = () => {
    const [activeContact, setActiveContact] = useState(MOCK_CONTACTS[0].id);
    const [messageInput, setMessageInput] = useState('');

    return (
        <div className="flex h-screen bg-[#050505] text-gray-300 font-sans overflow-hidden">
            {/* Sidebar (Cinny: PageNav) */}
            <div className="w-[300px] flex flex-col border-r border-gray-800 bg-[#080808]">
                {/* Header */}
                <div className="h-14 flex items-center px-4 border-b border-gray-800/50">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center border border-emerald-500/20 group-hover:border-emerald-500/50 transition-colors">
                            <span className="font-mono font-bold text-emerald-500">Z</span>
                        </div>
                        <span className="font-bold text-gray-200 tracking-tight">ZKS Chat</span>
                    </Link>
                </div>

                {/* Search */}
                <div className="p-3">
                    <div className="bg-[#121212] rounded-lg flex items-center px-3 py-2 border border-gray-800 focus-within:border-emerald-500/30 transition-colors">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        <input type="text" placeholder="Filter rooms..." className="bg-transparent border-none focus:ring-0 text-sm w-full ml-2 text-gray-300 placeholder-gray-600" />
                    </div>
                </div>

                {/* Room List (Cinny: VirtualTile) */}
                <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
                    <div className="text-xs font-bold text-gray-500 px-3 py-2 uppercase tracking-wider">Direct Messages</div>
                    {MOCK_CONTACTS.map((contact) => (
                        <div
                            key={contact.id}
                            onClick={() => setActiveContact(contact.id)}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${activeContact === contact.id
                                    ? 'bg-emerald-900/20 text-emerald-100'
                                    : 'hover:bg-[#151515] text-gray-400'
                                }`}
                        >
                            <Avatar id={contact.id} status={contact.status} />
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline">
                                    <span className={`text-sm font-medium truncate ${activeContact === contact.id ? 'text-emerald-400' : 'text-gray-300'}`}>
                                        {contact.id}
                                    </span>
                                    <span className="text-[10px] text-gray-600">{contact.time}</span>
                                </div>
                                <div className="text-xs text-gray-500 truncate">
                                    {contact.lastMsg}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content (Cinny: RoomView) */}
            <div className="flex-1 flex flex-col bg-[#050505] relative">
                {/* Room Header */}
                <div className="h-14 border-b border-gray-800 flex items-center justify-between px-6 bg-[#050505]/95 backdrop-blur z-10">
                    <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-gray-200"># {activeContact}</span>
                        <span className="text-xs text-emerald-600 bg-emerald-900/10 px-2 py-0.5 rounded border border-emerald-900/20">
                            Encrypted
                        </span>
                    </div>
                </div>

                {/* Timeline */}
                <div className="flex-1 overflow-y-auto p-4">
                    {MOCK_MESSAGES.map((msg) => (
                        <MessageBubble key={msg.id} msg={msg} />
                    ))}
                </div>

                {/* Message Input (Cinny: Editor) */}
                <div className="p-4 pt-0">
                    <div className="bg-[#121212] rounded-xl border border-gray-800 p-2 focus-within:border-emerald-500/40 transition-colors shadow-lg">
                        <textarea
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            placeholder={`Message #${activeContact}`}
                            className="w-full bg-transparent border-none focus:ring-0 text-gray-200 placeholder-gray-600 text-[15px] resize-none h-12 py-2 px-2 font-sans"
                        />
                        <div className="flex justify-between items-center px-2 pb-1">
                            <div className="flex gap-2 text-gray-500">
                                <button className="hover:text-gray-300 transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg></button>
                                <button className="hover:text-gray-300 transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></button>
                            </div>
                            <button className="bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-lg transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
