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
        <div className="card-cartoon p-4 h-full flex flex-col gap-4">
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
                            className={`
                                    flex items-center gap-3 p-2 rounded-xl border-[3px] transition-all
                                    ${isDrawer ? 'bg-yellow-50 border-black shadow-[4px_4px_0px_#000]' : 'bg-white border-transparent hover:border-gray-100'}
                                    ${player.hasGuessed ? 'bg-green-50/50' : ''}
                                `}
                        >
                            {/* Rank */}
                            <div className={`font-black text-lg w-6 text-center ${rankColor}`}>
                                {index + 1}
                            </div>

                            {/* Avatar */}
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full border-2 border-black bg-white overflow-hidden flex items-center justify-center p-1">
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
                                        <Pencil className="w-3 h-3 text-black animate-bounce" />
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
