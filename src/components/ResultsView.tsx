import React from 'react';
import { motion } from 'framer-motion';
import type { Player } from '../network/types';
import { Trophy, Crown } from 'lucide-react';

interface ResultsViewProps {
    players: Player[];
    onPlayAgain: () => void;
    isHost: boolean;
}

const ResultsView: React.FC<ResultsViewProps> = ({ players, onPlayAgain, isHost }) => {
    // Sort players by score
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    const winner = sortedPlayers[0];

    return (
        <div className="w-full max-w-4xl mx-auto space-y-10 text-center py-10">

            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="space-y-4"
            >
                <div className="inline-block p-6 rounded-full bg-gradient-to-b from-yellow-300 to-yellow-600 shadow-[0_0_50px_rgba(234,179,8,0.5)] mb-4">
                    <Crown className="w-16 h-16 text-white" />
                </div>
                <h1 className="text-6xl font-black text-white drop-shadow-xl">
                    {winner.name} Wins!
                </h1>
                <p className="text-2xl text-yellow-400 font-bold tracking-widest uppercase">
                    Master Deceiver
                </p>
            </motion.div>

            <div className="grid gap-4 max-w-2xl mx-auto">
                {sortedPlayers.map((player, index) => (
                    <motion.div
                        key={player.id}
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.1 + 0.5 }}
                        className={`
              flex items-center justify-between p-4 rounded-xl border border-white/10
              ${index === 0 ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50' : 'bg-surface/50'}
            `}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`
                w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg
                ${index === 0 ? 'bg-yellow-500 text-black' :
                                    index === 1 ? 'bg-gray-300 text-black' :
                                        index === 2 ? 'bg-amber-700 text-white' : 'bg-white/10 text-gray-400'}
              `}>
                                {index + 1}
                            </div>
                            <div className="text-left">
                                <h3 className="text-lg font-bold text-white">{player.name}</h3>
                                <p className="text-xs text-gray-400 font-mono">
                                    {/* Role reveal logic could go here */}
                                    Score: {player.score}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {index === 0 && <Trophy className="w-5 h-5 text-yellow-500" />}
                            <span className="text-2xl font-black text-white">{player.score}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {isHost && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2 }}
                >
                    <button
                        onClick={onPlayAgain}
                        className="px-10 py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl shadow-lg shadow-primary/20 text-xl transition-all transform hover:-translate-y-1 active:scale-95"
                    >
                        Play Again
                    </button>
                </motion.div>
            )}
        </div>
    );
};

export default ResultsView;
