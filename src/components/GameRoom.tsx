import React, { useState, useRef } from 'react';
import { useGameHost } from '../hooks/useGameHost';
import { useGameClient } from '../hooks/useGameClient';
import { useParams, useLocation } from 'react-router-dom';
import { usePeer } from '../network/PeerContext';
import GameCanvas, { type CanvasRef } from './GameCanvas';
import VotingPanel from './VotingPanel';
import ResultsView from './ResultsView';
import { Users, Clock, Palette, CheckCircle, Copy, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import DrawingToolbar from './DrawingToolbar';

const GameRoom = () => {
    const { id: roomId } = useParams<{ id: string }>();
    const location = useLocation();
    const playerName = location.state?.playerName || "Anonymous";
    const settings = location.state?.settings;

    const { peerId, manager, isInitialized } = usePeer();

    // Host Logic
    const isHost = peerId === roomId;
    const hostLogic = useGameHost(isHost, playerName, settings);

    // Client Logic
    const clientLogic = useGameClient(roomId, playerName, isHost);

    // Unified State
    const gameState = isHost ? hostLogic.gameState : clientLogic.gameState;
    const isConnected = isHost ? true : clientLogic.isConnected;

    const [hasCopied, setHasCopied] = useState(false);
    const canvasRef = useRef<CanvasRef>(null);

    // Drawing State
    const [drawingColor, setDrawingColor] = useState('#000000');
    const [brushSize, setBrushSize] = useState(5);
    const [isEraser, setIsEraser] = useState(false);

    const copyRoomLink = () => {
        navigator.clipboard.writeText(roomId || '');
        setHasCopied(true);
        setTimeout(() => setHasCopied(false), 2000);
    };

    const handleSubmitDrawing = () => {
        const dataUrl = canvasRef.current?.exportImage();
        if (dataUrl) {
            if (isHost) {
                hostLogic.handleDrawingSubmission(peerId, dataUrl);
            } else {
                clientLogic.submitDrawing(dataUrl);
            }
        }
    };

    if (!isInitialized) return (
        <div className="flex items-center justify-center h-screen bg-background">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="flex h-screen w-full bg-background overflow-hidden relative">
            {/* Sidebar - Players & Info */}
            <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="w-80 bg-surface/50 backdrop-blur-xl border-r border-white/5 flex flex-col z-20"
            >
                <div className="p-6 border-b border-white/5 space-y-4">
                    <h1 className="font-display font-bold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                        Room
                    </h1>

                    <button
                        onClick={copyRoomLink}
                        className="w-full flex items-center justify-between px-3 py-2 bg-black/20 rounded-lg border border-white/5 hover:border-primary/50 transition-colors group"
                    >
                        <span className="text-xs text-gray-400 font-mono truncate max-w-[150px]">{roomId}</span>
                        {hasCopied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-500 group-hover:text-primary" />}
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                        <Users className="w-4 h-4" />
                        <span>Players ({gameState.players.length})</span>
                    </div>

                    {[...gameState.players]
                        .sort((a, b) => b.score - a.score)
                        .map((player, index) => (
                            <motion.div
                                layout
                                key={player.id}
                                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${player.id === peerId
                                    ? 'bg-primary/10 border-primary/20'
                                    : 'bg-white/5 border-white/5 hover:bg-white/10'
                                    }`}
                            >
                                <div className={`w-2 h-2 rounded-full ${player.isHost ? 'bg-amber-400' : 'bg-gray-400'}`} />
                                <div className="flex-1">
                                    <span className={`block text-sm font-medium ${player.id === peerId ? 'text-primary' : 'text-gray-200'}`}>
                                        {player.name || 'Anonymous'} {player.id === peerId && '(You)'}
                                    </span>
                                    {player.hasSubmittedDrawing && gameState.currentState === 'DRAWING' && (
                                        <span className="text-[10px] text-green-400 flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3" /> Ready
                                        </span>
                                    )}
                                </div>
                                <div className="text-xs font-bold text-gray-500">{player.score} pts</div>
                            </motion.div>
                        ))}
                </div>

                <div className="p-6 border-t border-white/5 bg-black/20">
                    <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                        <span>Status</span>
                        <span className={`flex items-center gap-1 ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                            {isConnected ? 'LIVE' : 'OFFLINE'}
                        </span>
                    </div>
                </div>
            </motion.div>

            {/* Main Game Area */}
            <div className="flex-1 relative flex flex-col">
                <AnimatePresence mode="wait">
                    {/* LOBBY VIEW */}
                    {gameState.currentState === 'LOBBY' && (
                        <motion.div
                            key="lobby"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6"
                        >
                            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-accent blur-2xl absolute opacity-20 animate-pulse-slow" />
                            <h2 className="text-4xl font-display font-bold">Waiting for players...</h2>
                            <p className="text-gray-400 max-w-md">The host will start the game when everyone is ready.</p>

                            {isHost ? (
                                <button
                                    onClick={hostLogic.startGame}
                                    className="px-8 py-4 bg-white text-black font-bold rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] shadow-red-500"
                                >
                                    START GAME
                                </button>
                            ) : (
                                <div className="text-center space-y-2">
                                    <h3 className="text-xl font-bold text-white">You're in!</h3>
                                    <p className="text-gray-400">Waiting for host to start...</p>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* DRAWING VIEW */}
                    {gameState.currentState === 'DRAWING' && (
                        <motion.div
                            key="drawing"
                            className="flex-1 flex flex-col h-full"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <div className="h-16 flex items-center justify-between px-8 border-b border-white/5 bg-surface/30 backdrop-blur-md z-10">
                                <div className="flex items-center gap-4">
                                    <div className="text-sm text-gray-400 uppercase tracking-widest">Draw This</div>
                                    <div className="text-2xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent to-primary">
                                        {gameState.prompt || '???'}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-black/40 rounded-full border border-white/10">
                                    <Clock className="w-4 h-4 text-secondary" />
                                    <span className={`font-mono font-bold ${gameState.timer < 10 ? 'text-red-400' : 'text-white'}`}>
                                        {gameState.timer}s
                                    </span>
                                </div>
                            </div>

                            <div className="flex-1 relative bg-black/40 p-4 flex items-center justify-center overflow-hidden">
                                <GameCanvas
                                    ref={canvasRef}
                                    color={drawingColor}
                                    brushSize={brushSize}
                                    isEraser={isEraser}
                                    onExport={(dataUrl) => {
                                        // Auto-save logic handled by canvas or manual submit below
                                    }}
                                    isAdmin={false}
                                />

                                <DrawingToolbar
                                    color={drawingColor}
                                    setColor={setDrawingColor}
                                    brushSize={brushSize}
                                    setBrushSize={setBrushSize}
                                    isEraser={isEraser}
                                    setIsEraser={setIsEraser}
                                    onClear={() => canvasRef.current?.clear()}
                                />
                            </div>

                            <div className="absolute bottom-8 right-8">
                                <button
                                    onClick={handleSubmitDrawing}
                                    className="px-6 py-3 bg-secondary hover:bg-secondary/90 rounded-xl font-bold shadow-lg shadow-secondary/20 transition-all text-white"
                                >
                                    Submit Drawing
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* VOTING VIEW */}
                    {gameState.currentState === 'GUESSING' && (
                        <motion.div
                            key="guessing"
                            className="flex-1 overflow-y-auto bg-black/50"
                        >
                            <VotingPanel
                                drawings={gameState.drawings}
                                myId={peerId}
                                category={gameState.category || "Unknown"}
                                onVote={(targetId) => {
                                    if (isHost) {
                                        // Host local vote logic
                                    } else {
                                        clientLogic.submitVote(targetId);
                                    }
                                }}
                                hasVoted={gameState.players.find(p => p.id === peerId)?.hasVoted || false}
                            />
                        </motion.div>
                    )}

                    {/* RESULTS VIEW */}
                    {gameState.currentState === 'RESULTS' && (
                        <motion.div
                            key="results"
                            className="flex-1 overflow-y-auto bg-black/50"
                        >
                            <ResultsView
                                players={gameState.players}
                                isHost={isHost}
                                onPlayAgain={() => {
                                    if (isHost) hostLogic.startGame();
                                }}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default GameRoom;
