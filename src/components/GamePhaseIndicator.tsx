import React from 'react';
import { motion } from 'framer-motion';
import type { GameState } from '../network/types';

interface GamePhaseIndicatorProps {
    currentPhase: GameState;
    round: number;
    maxRounds: number;
}

/**
 * Game Phase Indicator Component
 * Shows current game phase with visual progression
 */
export const GamePhaseIndicator: React.FC<GamePhaseIndicatorProps> = ({
    currentPhase,
    round,
    maxRounds
}) => {
    const phases: { key: GameState; label: string; description: string }[] = [
        { key: 'LOBBY', label: 'Lobby', description: 'Joining game...' },
        {
            key: 'STARTING',
            label: 'Starting',
            description: 'Preparing game...'
        },
        {
            key: 'WORD_SELECTION',
            label: 'Word Selection',
            description: 'Choose a word to draw'
        },
        {
            key: 'DRAWING',
            label: 'Drawing',
            description: 'Time to draw!'
        },
        {
            key: 'GUESSING',
            label: 'Guessing',
            description: 'Guess the drawing'
        },
        {
            key: 'TURN_RESULTS',
            label: 'Results',
            description: 'Round results'
        },
        { key: 'RESULTS', label: 'Final', description: 'Game over!' }
    ];

    const currentIndex = phases.findIndex(p => p.key === currentPhase);

    return (
        <div className="flex flex-col gap-3">
            {/* Phase Progress */}
            <div className="flex items-center gap-2">
                {phases.map((phase, idx) => {
                    const isActive = idx === currentIndex;
                    const isCompleted = idx < currentIndex;

                    return (
                        <motion.div
                            key={phase.key}
                            className="flex items-center"
                        >
                            {/* Dot */}
                            <motion.div
                                animate={{
                                    scale: isActive ? [1, 1.2, 1] : 1,
                                    backgroundColor: isActive
                                        ? '#3b82f6'
                                        : isCompleted
                                        ? '#10b981'
                                        : '#6b7280'
                                }}
                                transition={{
                                    duration: 1,
                                    repeat: isActive ? Infinity : 0
                                }}
                                className="w-2 h-2 rounded-full"
                            />

                            {/* Connector */}
                            {idx < phases.length - 1 && (
                                <div
                                    className={`w-2 h-0.5 mx-1 ${
                                        isCompleted
                                            ? 'bg-green-500'
                                            : 'bg-gray-600'
                                    }`}
                                />
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* Current Phase Info */}
            {currentIndex !== -1 && (
                <motion.div
                    key={currentPhase}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-blue-950/50 border border-blue-500/30 rounded-lg p-3"
                >
                    <p className="text-sm font-bold text-blue-300">
                        {phases[currentIndex].label}
                    </p>
                    <p className="text-xs text-blue-200">
                        {phases[currentIndex].description}
                    </p>
                </motion.div>
            )}

            {/* Round Info */}
            <div className="text-xs text-gray-400 text-center">
                Round {round} of {maxRounds}
            </div>
        </div>
    );
};
