import { useState, useRef, useEffect } from 'react';
import { useGameHost } from '../hooks/useGameHost';
import { useGameClient } from '../hooks/useGameClient';
import { useParams, useLocation } from 'react-router-dom';
import { usePeer } from '../network/PeerContext';
import GameCanvas, { type CanvasRef } from './GameCanvas';
import ResultsView from './ResultsView';
import { Clock, CheckCircle, Copy, Volume2, VolumeX } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';

import DrawingToolbar from './DrawingToolbar';
import ChatPanel from './ChatPanel';
import WordSelectionPanel from './WordSelectionPanel';
import PlayerList from './PlayerList';
import { v4 as uuidv4 } from 'uuid';
import { soundManager } from '../utils/SoundManager';
import { getAvatarById } from '../data/avatars';

const GameRoom = () => {
    // Play BGM on mount - DISABLED per user request for "Subtle Interaction" only
    // useEffect(() => {
    //     soundManager.playBGM();
    //     return () => soundManager.stopBGM();
    // }, []);



    const [isMuted, setIsMuted] = useState(false);
    const toggleMute = () => {
        const newMuted = !isMuted;
        setIsMuted(newMuted);
        soundManager.setMusicVolume(newMuted ? 0 : 0.3);
    };
    const { id: roomId } = useParams<{ id: string }>();
    const location = useLocation();
    const playerName = location.state?.playerName || "Anonymous";
    const avatarId = location.state?.avatarId || 'blob-yellow';
    const settings = location.state?.settings;

    const { peerId, isInitialized } = usePeer();

    const handleRemoteStroke = (stroke: any) => {
        if (canvasRef.current) {
            canvasRef.current.drawRemoteStroke(stroke);
        }
    };

    // Host Logic
    const isHost = peerId === roomId;
    const hostLogic = useGameHost(isHost, playerName, avatarId, settings, handleRemoteStroke);

    // Client Logic
    const clientLogic = useGameClient(roomId, playerName, avatarId, isHost, handleRemoteStroke);

    // Unified State
    const gameState = isHost ? hostLogic.gameState : clientLogic.gameState;
    const isConnected = isHost ? true : clientLogic.isConnected;

    // SFX: Player Join
    const prevPlayerCount = useRef(gameState.players.length);
    useEffect(() => {
        if (gameState.players.length > prevPlayerCount.current) {
            soundManager.playJoin();
        }
        prevPlayerCount.current = gameState.players.length;
    }, [gameState.players.length]);

    // SFX: Chat Message
    const prevMsgCount = useRef(gameState.chatMessages.length);
    useEffect(() => {
        if (gameState.chatMessages.length > prevMsgCount.current) {
            const lastMsg = gameState.chatMessages[gameState.chatMessages.length - 1];
            if (lastMsg.type !== 'SYSTEM') {
                soundManager.playMessage();
            }
        }
        prevMsgCount.current = gameState.chatMessages.length;
    }, [gameState.chatMessages.length]);

    const [hasCopied, setHasCopied] = useState(false);
    const canvasRef = useRef<CanvasRef>(null);

    // Drawing State
    const [drawingColor, setDrawingColor] = useState('#000000');
    const [brushSize, setBrushSize] = useState(5);
    const [isEraser, setIsEraser] = useState(false);

    const copyRoomLink = () => {
        const joinLink = `${window.location.origin}/?join=${roomId}`;
        navigator.clipboard.writeText(joinLink);
        setHasCopied(true);
        setTimeout(() => setHasCopied(false), 2000);
    };

    const handleSendMessage = (text: string) => {
        const msg = {
            id: uuidv4(),
            playerId: peerId,
            playerName: playerName,
            text: text,
            type: 'CHAT' as const, // Default for now, guessing logic later
            timestamp: Date.now()
        };

        if (isHost) {
            hostLogic.handleChatMessage(msg);
        } else {
            clientLogic.sendChatMessage(msg);
        }
    };

    // Fun Loading State
    const [loadingText, setLoadingText] = useState("SHARPENING PENCILS...");
    useEffect(() => {
        if (!isInitialized) {
            const messages = [
                "SHARPENING PENCILS...",
                "MIXING COLORS...",
                "SUMMONING ARTISTS...",
                "FINDING ERASERS...",
                "LOADING DOODLES..."
            ];
            let i = 0;
            const interval = setInterval(() => {
                i = (i + 1) % messages.length;
                setLoadingText(messages[i]);
            }, 800);
            return () => clearInterval(interval);
        }
    }, [isInitialized]);

    if (!isInitialized) return (
        <div className="flex flex-col items-center justify-center h-screen bg-yellow-50 relative overflow-hidden selection:bg-pink-200">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                    backgroundImage: `radial-gradient(#000 1.5px, transparent 1.5px)`,
                    backgroundSize: '24px 24px'
                }}
            />

            <div className="relative z-10 flex flex-col items-center">
                {/* Bouncing Pencil Container */}
                <div className="animate-bounce mb-8">
                    <div className="text-8xl filter drop-shadow-[5px_5px_0px_rgba(0,0,0,0.2)] transform -rotate-12">
                        ✏️
                    </div>
                </div>

                {/* Loading Text */}
                <div className="bg-white border-[4px] border-black px-12 py-6 rounded-3xl shadow-[8px_8px_0px_#000] rotate-2 transition-transform hover:rotate-0">
                    <h2 className="text-3xl md:text-5xl font-black font-mono tracking-tighter text-black animate-pulse">
                        {loadingText}
                    </h2>
                </div>

                {/* Loading Bar Decoration */}
                <div className="mt-8 flex gap-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="w-4 h-4 rounded-full bg-black animate-bounce" style={{ animationDelay: `${i * 100}ms` }} />
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col h-screen bg-pink-50 overflow-hidden relative selection:bg-yellow-200">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                    backgroundImage: `radial-gradient(#000 1px, transparent 1px)`,
                    backgroundSize: '24px 24px'
                }}
            />

            {/* HEADER */}
            <header className="h-16 bg-white border-b-[3px] border-black flex items-center justify-between px-6 z-20 shrink-0">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 bg-yellow-300 px-4 py-2 rounded-xl border-[3px] border-black shadow-[4px_4px_0px_#000] min-w-[100px] justify-center">
                        <Clock className="w-5 h-5 text-black" />
                        <span className="font-black font-mono text-xl">{gameState.timer}s</span>
                    </div>
                    <div className="bg-purple-100 px-4 py-2 rounded-xl border-[3px] border-black font-black text-sm shadow-[4px_4px_0px_#000]">
                        Round {gameState.round}/{gameState.settings.rounds}
                    </div>
                </div>

                <div className="absolute left-1/2 -translate-x-1/2 top-0 bg-black text-white px-8 py-2 rounded-b-xl font-black tracking-widest uppercase text-sm shadow-[0px_4px_0px_rgba(0,0,0,0.2)] z-30">
                    {gameState.currentState === 'DRAWING' ? 'Drawing Phase' :
                        gameState.currentState === 'GUESSING' ? 'Guessing Phase' :
                            gameState.currentState === 'WORD_SELECTION' ? 'Selecting Word' :
                                'Lobby'}
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={toggleMute}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors border-2 border-transparent hover:border-gray-200"
                    >
                        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                    <button
                        onClick={copyRoomLink}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg border-2 border-gray-300 transition-colors font-bold text-sm"
                    >
                        <span className="font-mono">{roomId?.slice(0, 6)}...</span>
                        {hasCopied ? <CheckCircle size={16} className="text-green-600" /> : <Copy size={16} />}
                    </button>
                </div>
            </header>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex overflow-hidden relative">

                {/* LEFT SIDEBAR - PLAYERS */}
                <div className="w-64 bg-white border-r-[3px] border-black p-4 z-10 hidden md:block">
                    <PlayerList
                        players={gameState.players}
                        currentDrawerId={gameState.currentDrawerId}
                        myId={peerId}
                    />
                </div>

                {/* CENTER - GAME AREA */}
                <div className="flex-1 relative bg-gray-50 flex flex-col">

                    {/* ANIMATED TRANSITION CONTAINER */}
                    {/* Removed AnimatePresence to fix crash */}
                    {/* LOBBY VIEW */}
                    {gameState.currentState === 'LOBBY' && (
                        <div
                            key="lobby"
                            className="flex-1 flex flex-col items-center justify-center p-8 space-y-8"
                        >
                            <div className="w-full max-w-2xl bg-white border-[3px] border-black rounded-3xl p-8 shadow-[8px_8px_0px_#000] text-center space-y-6">
                                <h2 className="text-4xl font-black uppercase tracking-tighter text-black">Waiting for Players...</h2>
                                <div className="flex justify-center flex-wrap gap-4">
                                    {gameState.players.map(p => {
                                        const avatar = getAvatarById(p.avatarId);
                                        return (
                                            <div key={p.id} className="animate-bounce-slow flex flex-col items-center">
                                                <div className="w-16 h-16 rounded-2xl bg-white border-[3px] border-black flex items-center justify-center relative overflow-hidden shadow-[4px_4px_0px_#000]">
                                                    <div className="absolute inset-0 opacity-20" style={{ backgroundColor: avatar.color }} />
                                                    <div className="w-12 h-12 z-10">{avatar.svg}</div>
                                                </div>
                                                <span className="mt-2 text-xs font-black uppercase bg-black text-white px-2 py-0.5 rounded-full">{p.name || 'Anonymous'}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                {isHost && (
                                    <button
                                        onClick={hostLogic.startGame}
                                        disabled={gameState.players.length < 2 && false} // Debug: allow 1 player to start
                                        className="w-full py-4 bg-green-400 hover:bg-green-500 text-black border-[3px] border-black rounded-xl font-black text-2xl shadow-[4px_4px_0px_#000] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        START GAME
                                    </button>
                                )}
                                {!isHost && (
                                    <p className="text-gray-500 font-bold animate-pulse">Host will start the game soon...</p>
                                )}
                            </div>
                        </div>
                    )}


                    {/* WORD SELECTION VIEW */}
                    {gameState.currentState === 'WORD_SELECTION' && (
                        <div
                            key="word-selection"
                            className="flex-1 flex items-center justify-center p-8 absolute inset-0 z-20 bg-black/50 backdrop-blur-sm"
                        >
                            <WordSelectionPanel
                                words={['Apple', 'Banana', 'Car', 'Dog']} // Mock words, replace with logic
                                onSelect={(word) => isHost ? hostLogic.selectWord(word) : null} // Client logic needed
                                isDrawer={peerId === gameState.currentDrawerId}
                                drawerName={gameState.players.find(p => p.id === gameState.currentDrawerId)?.name}
                            />
                        </div>
                    )}

                    {/* DRAWING/GUESSING VIEW */}
                    {(gameState.currentState === 'DRAWING' || gameState.currentState === 'GUESSING') && (
                        <div
                            key="drawing"
                            className="flex-1 flex flex-col relative h-full"
                        >
                            <div className="flex-1 m-4 bg-white border-[3px] border-black rounded-2xl shadow-[4px_4px_0px_rgba(0,0,0,0.1)] overflow-hidden relative cursor-crosshair">
                                <GameCanvas
                                    ref={canvasRef}
                                    onStroke={isHost ? hostLogic.sendStroke : clientLogic.sendStroke}
                                    color={drawingColor}
                                    brushSize={brushSize}
                                    isEraser={isEraser}
                                />
                                {gameState.currentState === 'DRAWING' && peerId === gameState.currentDrawerId && (
                                    <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-yellow-100 border-2 border-yellow-400 px-6 py-2 rounded-full shadow-lg pointer-events-none z-10 flex flex-col items-center min-w-[200px]">
                                        <span className="text-[10px] font-bold text-yellow-800 uppercase tracking-widest leading-none mb-1">Draw This</span>
                                        <span className="text-xl font-black text-black uppercase tracking-wider leading-none">{gameState.wordToGuess}</span>
                                    </div>
                                )}
                                {gameState.currentState === 'DRAWING' && peerId !== gameState.currentDrawerId && gameState.hint && (
                                    <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm border-2 border-black px-6 py-2 rounded-xl shadow-[4px_4px_0px_#000] pointer-events-none z-10">
                                        <span className="text-2xl font-black font-mono tracking-[0.5em] text-black">
                                            {gameState.hint}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Toolbar - Only for drawer */}
                            {peerId === gameState.currentDrawerId && (
                                <div className="pb-4 px-4 flex justify-center">
                                    <DrawingToolbar
                                        color={drawingColor}
                                        setColor={setDrawingColor}
                                        brushSize={brushSize}
                                        setBrushSize={setBrushSize}
                                        isEraser={isEraser}
                                        setIsEraser={setIsEraser}
                                        onClear={() => canvasRef.current?.clear()}
                                    // onUndo={() => canvasRef.current?.undo()} // Not implemented in CanvasRef yet
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* RESULTS VIEW */}
                    {gameState.currentState === 'RESULTS' && (
                        <div
                            key="results"
                            className="flex-1 overflow-y-auto bg-white absolute inset-0 z-30 flex items-center justify-center"
                        >
                            <ResultsView
                                players={gameState.players}
                                onPlayAgain={hostLogic.startGame}
                                isHost={isHost}
                            />
                        </div>
                    )}
                </div>

                {/* RIGHT SIDEBAR - CHAT */}
                <div className="w-80 bg-white border-l-[3px] border-black flex flex-col z-10 shrink-0">
                    <ChatPanel
                        messages={gameState.chatMessages}
                        onSendMessage={handleSendMessage}
                        myPlayerId={peerId}
                        drawerId={gameState.currentDrawerId}
                    />
                </div>
            </div>
        </div>
    );
};

export default GameRoom;
