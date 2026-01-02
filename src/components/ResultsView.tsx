import React from 'react';
// import { motion } from 'framer-motion';
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
            <div
                className="space-y-4"
            >
                <div className="inline-block p-6 rounded-full bg-yellow-300 border-4 border-black shadow-[4px_4px_0px_#000] mb-4">
                    <Crown className="w-16 h-16 text-black" />
                </div>
                <h1 className="text-6xl font-black text-black drop-shadow-[4px_4px_0px_#FFF] stroke-black" style={{ WebkitTextStroke: "2px white" }}>
                    {winner.name} Wins!
                </h1>
                <p className="text-2xl text-yellow-500 font-black tracking-widest uppercase bg-white inline-block px-4 py-1 rounded-xl border-2 border-black transform rotate-2">
                    Master Deceiver
                </p>
            </div>

            <div className="grid gap-4 max-w-2xl mx-auto">
                {sortedPlayers.map((player, index) => (
                    <div
                        key={player.id}
                        className={`
              flex items-center justify-between p-4 rounded-xl border-[3px] border-black shadow-[4px_4px_0px_#000]
              ${index === 0 ? 'bg-yellow-300 transform scale-105 z-10' : 'bg-white'}
            `}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`
                w-10 h-10 rounded-full flex items-center justify-center font-black text-lg border-2 border-black
                ${index === 0 ? 'bg-white text-black' : 'bg-gray-100 text-gray-500'}
              `}>
                                {index + 1}
                            </div>
                            <div className="text-left">
                                <h3 className="text-lg font-black text-black">{player.name}</h3>
                                <p className="text-xs text-gray-500 font-mono font-bold">
                                    Score: {player.score}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {index === 0 && <Trophy className="w-6 h-6 text-black fill-yellow-500" />}
                            <span className="text-2xl font-black text-black">{player.score}</span>
                        </div>
                    </div>
                ))}
            </div>

            {
                isHost && (
                    <div>
                        <button
                            onClick={onPlayAgain}
                            className="px-10 py-4 btn-primary text-xl shadow-[6px_6px_0px_#000]"
                        >
                            Play Again
                        </button>
                    </div>
                )
            }
        </div>
    );
};

export default ResultsView;
