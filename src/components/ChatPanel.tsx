import React, { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import type { ChatMessage } from '../network/types';
// import { motion, AnimatePresence } from 'framer-motion';

interface ChatPanelProps {
    messages: ChatMessage[];
    onSendMessage: (text: string) => void;
    myPlayerId: string;
    drawerId?: string; // To disabled guessing if you are drawing
}

const ChatPanel: React.FC<ChatPanelProps> = ({ messages, onSendMessage, myPlayerId }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        onSendMessage(input.trim());
        setInput('');
    };

    return (
        <div className="flex flex-col h-full overflow-hidden bg-transparent">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 relative">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`text-sm break-words ${msg.type === 'SYSTEM'
                            ? 'text-green-600 font-bold text-center py-1 bg-green-50 rounded-lg my-1 border-2 border-green-200'
                            : msg.type === 'GUESS' && msg.isCorrect
                                ? 'text-green-600 font-bold'
                                : 'text-black'
                            }`}
                    >
                        {msg.type === 'SYSTEM' ? (
                            <span>{msg.text}</span>
                        ) : (
                            <>
                                <span className={`${msg.playerId === myPlayerId ? 'text-purple-600' : 'text-gray-600'
                                    } font-black mr-2`}>
                                    {msg.playerName}:
                                </span>
                                <span className={msg.isCorrect ? 'text-green-600 font-bold' : 'text-gray-900 font-medium'}>
                                    {msg.text}
                                </span>
                            </>
                        )}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-4 bg-transparent">
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your guess here..."
                        className="w-full bg-white border-2 border-black rounded-xl py-3 pl-4 pr-12 text-black placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-purple-200 shadow-[2px_2px_0px_#000]"
                    />
                    <button
                        type="submit"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-purple-400 hover:text-purple-300 transition-colors"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatPanel;
