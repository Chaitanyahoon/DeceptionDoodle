import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { AVATARS } from '../data/avatars';

interface AvatarSelectorProps {
    selectedId: string;
    onSelect: (id: string) => void;
}

const AvatarSelector: React.FC<AvatarSelectorProps> = ({ selectedId, onSelect }) => {
    const currentIndex = AVATARS.findIndex(a => a.id === selectedId);
    const currentAvatar = AVATARS[currentIndex !== -1 ? currentIndex : 0];

    const handlePrev = () => {
        const nextIndex = (currentIndex - 1 + AVATARS.length) % AVATARS.length;
        onSelect(AVATARS[nextIndex].id);
    };

    const handleNext = () => {
        const nextIndex = (currentIndex + 1) % AVATARS.length;
        onSelect(AVATARS[nextIndex].id);
    };

    return (
        <div className="flex flex-col items-center space-y-2">
            <div className="flex items-center gap-4">
                <button
                    type="button"
                    onClick={handlePrev}
                    className="p-2 rounded-full bg-white border-2 border-black hover:bg-gray-100 transition-colors shadow-[2px_2px_0px_#000] active:translate-y-0.5 active:shadow-[1px_1px_0px_#000]"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="w-24 h-24 bg-white border-4 border-black rounded-2xl p-2 shadow-[4px_4px_0px_#000] flex items-center justify-center relative overflow-hidden">
                    {/* Background Pattern */}
                    <div
                        className="absolute inset-0 opacity-20"
                        style={{ backgroundColor: currentAvatar.color }}
                    />
                    <div className="w-20 h-20 relative z-10 transition-transform duration-200 transform scale-100 hover:scale-110">
                        {currentAvatar.svg}
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleNext}
                    className="p-2 rounded-full bg-white border-2 border-black hover:bg-gray-100 transition-colors shadow-[2px_2px_0px_#000] active:translate-y-0.5 active:shadow-[1px_1px_0px_#000]"
                >
                    <ArrowRight className="w-5 h-5" />
                </button>
            </div>
            <span className="text-xs font-black text-white bg-black px-2 py-0.5 rounded uppercase tracking-wider">
                Avatar {currentIndex + 1}/{AVATARS.length}
            </span>
        </div>
    );
};

export default AvatarSelector;
