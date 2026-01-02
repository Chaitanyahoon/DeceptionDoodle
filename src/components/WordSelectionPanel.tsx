import React from 'react';
// import { motion } from 'framer-motion';

interface WordSelectionPanelProps {
    words: string[];
    onSelect: (word: string) => void;
    isDrawer: boolean;
    drawerName?: string;
}

const WordSelectionPanel: React.FC<WordSelectionPanelProps> = ({ words, onSelect, isDrawer, drawerName }) => {
    if (!isDrawer) {
        return (
            <div className="card-cartoon max-w-md w-full p-8 text-center space-y-6 flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-blue-100 animate-pulse flex items-center justify-center text-4xl border-4 border-blue-500 shadow-[4px_4px_0px_#3B82F6]">
                    🤔
                </div>
                <h2 className="text-3xl font-black text-black leading-tight">
                    <span className="text-blue-600">{drawerName || 'Drawer'}</span> is choosing a word!
                </h2>
                <p className="text-gray-500 font-bold bg-gray-100 px-4 py-2 rounded-xl border-2 border-gray-200">
                    Get ready to guess...
                </p>
            </div>
        );
    }

    return (
        <div className="card-cartoon max-w-2xl w-full p-8 text-center space-y-8">
            <h2 className="text-4xl font-black text-black">
                Choose a Word!
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {words.map((word) => (
                    <button
                        key={word}
                        onClick={() => onSelect(word)}
                        className="px-6 py-6 bg-white border-[3px] border-black rounded-2xl shadow-[6px_6px_0px_#000] hover:bg-yellow-100 hover:shadow-[4px_4px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all group relative overflow-hidden"
                    >
                        <span className="relative z-10 text-xl font-black text-black">
                            {word}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default WordSelectionPanel;
