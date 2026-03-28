// import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, CheckCircle } from 'lucide-react';
import type { Player } from '../network/types';
import { getAvatarById } from '../data/avatars';

interface PlayerListProps {
    players: Player[];
    currentDrawerId?: string;
    myId?: string;
}

const PlayerList = ({ players, currentDrawerId, myId }: PlayerListProps) => {
    // Sort: Score descending
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

    return (
        <div className="card-cartoon p-4 h-full flex flex-col gap-4" role="list" aria-label="Players">
            <h3 className="font-bold text-black uppercase tracking-wider text-sm border-b-2 border-gray-100 pb-2">
                Players ({players.length})
            </h3>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {sortedPlayers.map((player, index) => {
                    const isDrawer = player.id === currentDrawerId;
                    const isMe = player.id === myId;
                    const avatar = getAvatarById(player.avatarId); // Ensure you handle missing ID in helper or here

                    // Dynamic rank logic (basic)
                    const rankColor = index === 0 ? "text-yellow-500" : index === 1 ? "text-gray-400" : index === 2 ? "text-orange-400" : "text-gray-300";

                    return (
                        <div
                            key={player.id}
                            role="listitem"
                            aria-current={isDrawer ? 'true' : undefined}
                            className={`flex items-center gap-3 p-2 rounded-xl transition-all transform \n                                ${isDrawer ? 'bg-yellow-50 border-l-4 border-yellow-500 shadow-[6px_6px_0px_#F59E0B] -translate-x-0' : 'bg-white border-transparent hover:border-gray-100'}\n                                ${player.hasGuessed ? 'bg-green-50/50' : ''}`}
                        >
                            {/* Rank */}
                            <div className={`font-black text-lg w-7 text-center ${rankColor}`}>
                                {index + 1}
                            </div>

                            {/* Avatar */}
                            <div className="relative">
                                <div className={`w-14 h-14 rounded-full border-2 border-black bg-white overflow-hidden flex items-center justify-center p-2 ${isMe ? 'ring-2 ring-indigo-200' : ''} ${isDrawer ? 'ring-4 ring-yellow-200' : ''}`}>
                                    {avatar ? avatar.component : <div className="bg-gray-200 w-full h-full rounded-full" />}
                                </div>
                                {player.isConnected === false && (
                                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                                        <span className="text-[10px] text-white">OFF</span>
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className={`block text-sm font-bold truncate ${isMe ? 'text-indigo-600' : 'text-black'}`}>
                                        {player.name} {isMe && '(You)'}
                                    </span>
                                    {isDrawer && (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-black bg-yellow-300 border-2 border-yellow-500 rounded-full">
                                            <Pencil className="w-3 h-3" />
                                            Drawer
                                        </span>
                                    )}
                                </div>
                                <div className="text-xs text-gray-600 font-mono font-bold">
                                    {player.score} pts
                                </div>
                            </div>

                            {/* Status Indicators */}
                            <div className="flex flex-col gap-1 items-end">
                                {player.hasGuessed && (
                                    <CheckCircle className="w-5 h-5 text-green-500 fill-current" />
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PlayerList;
