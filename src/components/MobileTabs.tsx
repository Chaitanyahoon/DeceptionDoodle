import { Pencil, MessageSquare, Users } from 'lucide-react';

interface MobileTabsProps {
    activeTab: 'GAME' | 'CHAT' | 'PLAYERS';
    onTabChange: (tab: 'GAME' | 'CHAT' | 'PLAYERS') => void;
    unreadCount: number;
}

const MobileTabs = ({ activeTab, onTabChange, unreadCount }: MobileTabsProps) => {
    return (
        <div className="md:hidden h-16 bg-white border-t-[3px] border-black flex items-center justify-around px-4 z-50 shrink-0 shadow-[0px_-4px_0px_rgba(0,0,0,0.1)]">
            <button
                onClick={() => onTabChange('GAME')}
                className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${activeTab === 'GAME' ? 'text-black scale-110' : 'text-gray-400'}`}
            >
                <div className={`p-2 rounded-xl border-2 ${activeTab === 'GAME' ? 'bg-yellow-300 border-black shadow-[2px_2px_0px_#000]' : 'border-transparent'}`}>
                    <Pencil size={24} strokeWidth={activeTab === 'GAME' ? 3 : 2} />
                </div>
            </button>

            <button
                onClick={() => onTabChange('CHAT')}
                className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all relative ${activeTab === 'CHAT' ? 'text-black scale-110' : 'text-gray-400'}`}
            >
                <div className={`p-2 rounded-xl border-2 ${activeTab === 'CHAT' ? 'bg-blue-300 border-black shadow-[2px_2px_0px_#000]' : 'border-transparent'}`}>
                    <MessageSquare size={24} strokeWidth={activeTab === 'CHAT' ? 3 : 2} />
                </div>
                {unreadCount > 0 && activeTab !== 'CHAT' && (
                    <div className="absolute top-1 right-1 w-5 h-5 bg-red-500 border-2 border-white rounded-full flex items-center justify-center">
                        <span className="text-[10px] font-black text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>
                    </div>
                )}
            </button>

            <button
                onClick={() => onTabChange('PLAYERS')}
                className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${activeTab === 'PLAYERS' ? 'text-black scale-110' : 'text-gray-400'}`}
            >
                <div className={`p-2 rounded-xl border-2 ${activeTab === 'PLAYERS' ? 'bg-green-300 border-black shadow-[2px_2px_0px_#000]' : 'border-transparent'}`}>
                    <Users size={24} strokeWidth={activeTab === 'PLAYERS' ? 3 : 2} />
                </div>
            </button>
        </div>
    );
};

export default MobileTabs;
