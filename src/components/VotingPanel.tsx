import React from 'react';
import { motion } from 'framer-motion';
import type { Player, DrawingSubmission } from '../network/types';
import { AlertCircle } from 'lucide-react';

interface VotingPanelProps {
    drawings: DrawingSubmission[];
    players: Player[];
    myId: string;
    category: string;
    onVote: (playerId: string) => void;
    hasVoted: boolean;
}

const VotingPanel: React.FC<VotingPanelProps> = ({
    drawings,
    myId,
    category,
    onVote,
    hasVoted
}) => {
    return (
        <div className="space-y-8 w-full max-w-6xl mx-auto">
            <div className="text-center space-y-4">
                <motion.h2
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-5xl font-black text-white"
                >
                    Who drew the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">{category}</span>?
                </motion.h2>
                <p className="text-gray-400 text-lg">
                    {hasVoted
                        ? "Vote submitted! Waiting for others..."
                        : "Select the drawing that best matches the real prompt."}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {drawings.map((drawing, index) => {
                    const isMyDrawing = drawing.playerId === myId;

                    return (
                        <motion.div
                            key={drawing.playerId}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={!hasVoted && !isMyDrawing ? { scale: 1.03, y: -5 } : {}}
                            className={`
                relative group rounded-2xl overflow-hidden bg-white/5 backdrop-blur-sm border border-white/5 shadow-2xl transition-all duration-300
                ${isMyDrawing ? 'ring-2 ring-yellow-500/50' : ''}
                ${!hasVoted && !isMyDrawing ? 'cursor-pointer hover:border-primary/50 hover:shadow-primary/20' : 'cursor-default opacity-80'}
              `}
                            onClick={() => {
                                if (!isMyDrawing && !hasVoted) {
                                    onVote(drawing.playerId);
                                }
                            }}
                        >
                            <div className="aspect-[4/3] bg-black/20 p-4 flex items-center justify-center relative overflow-hidden">
                                <img
                                    src={drawing.dataUrl}
                                    alt="Drawing"
                                    className="max-w-full max-h-full object-contain pointer-events-none"
                                />

                                {/* Overlay for hover/voted state */}
                                {!hasVoted && !isMyDrawing && (
                                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/20 transition-colors flex items-center justify-center">
                                        <span className="opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all bg-primary text-white font-bold px-6 py-2 rounded-full shadow-lg">
                                            Vote This
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Tag for user's own drawing */}
                            {isMyDrawing && (
                                <div className="absolute top-3 right-3 bg-yellow-500 text-black text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    YOU
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default VotingPanel;
