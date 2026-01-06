
import { AVATARS } from '../data/avatars';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface AvatarSelectorProps {
    currentAvatarId: string;
    onSelect: (avatarId: string) => void;
}

const AvatarSelector = ({ currentAvatarId, onSelect }: AvatarSelectorProps) => {
    const currentIndex = AVATARS.findIndex(a => a.id === currentAvatarId);
    const [index, setIndex] = useState(currentIndex === -1 ? 0 : currentIndex);

    const handlePrev = () => {
        const next = (index - 1 + AVATARS.length) % AVATARS.length;
        setIndex(next);
        onSelect(AVATARS[next].id);
    };

    const handleNext = () => {
        const next = (index + 1) % AVATARS.length;
        setIndex(next);
        onSelect(AVATARS[next].id);
    };

    const currentAvatar = AVATARS[index];

    return (
        <div className="flex flex-col items-center gap-4 bg-white p-4 rounded-3xl border-[3px] border-black shadow-[4px_4px_0px_#000]">
            <h3 className="font-black uppercase tracking-widest text-sm text-gray-400">Choose Your Avatar</h3>

            <div className="flex items-center gap-4">
                <button
                    onClick={handlePrev}
                    className="p-2 bg-white text-black border-[3px] border-black rounded-full hover:bg-gray-100 active:translate-y-[1px] transition-all"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>

                <div className="relative w-24 h-24">
                    <div
                        key={currentAvatar.id}
                        className="w-full h-full rounded-2xl bg-white border-[3px] border-black flex items-center justify-center relative overflow-hidden animate-in zoom-in duration-200"
                    >
                        <div className="absolute inset-0 opacity-20" style={{ backgroundColor: currentAvatar.color }} />
                        <div className="w-16 h-16 z-10">{currentAvatar.component}</div>
                    </div>
                </div>

                <button
                    onClick={handleNext}
                    className="p-2 bg-white text-black border-[3px] border-black rounded-full hover:bg-gray-100 active:translate-y-[1px] transition-all"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>

            <div className="text-center">
                <span className="font-mono font-bold text-xs text-gray-400">
                    {index + 1} / {AVATARS.length}
                </span>
            </div>
        </div>
    );
};

export default AvatarSelector;
