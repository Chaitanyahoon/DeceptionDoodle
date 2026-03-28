import { useState, useRef, useEffect } from 'react';
import { useGameHost } from '../hooks/useGameHost';
import { useGameClient } from '../hooks/useGameClient';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { usePeer } from '../network/PeerContext';
import GameCanvas from './GameCanvas';
import type { CanvasRef, DrawStroke, StrokeBatch } from '../network/types';
import ResultsView from './ResultsView';
import { Clock, Copy, Volume2, VolumeX, LogOut } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';

import DrawingToolbar from './DrawingToolbar';
import ChatPanel from './ChatPanel';
import WordSelectionPanel from './WordSelectionPanel';
import PlayerList from './PlayerList';
import LoadingScreen from './LoadingScreen'; // New Import
import { v4 as uuidv4 } from 'uuid';
import { soundManager } from '../utils/SoundManager';
import { getAvatarById } from '../data/avatars';
import AvatarSelector from './AvatarSelector';
import MobileTabs from './MobileTabs';
import OnboardingTooltip from './OnboardingTooltip';
// Connection status indicator removed from header simplification

// Session storage keys
const ROOM_SESSION_KEY = 'deception-doodle-room-session';
const ROOM_STATE_KEY = 'deception-doodle-room-state';

interface RoomSession {
    roomId: string;
    playerName: string;
    avatarId: string;
    settings?: {
        rounds?: number;
        drawTime?: number;
    };
    timestamp: number;
}

const GameRoom = () => {
    // ... (rest of imports/hooks logic kept same for now) ...
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
    const navigate = useNavigate();

    // Try to restore session data, fallback to location state
    const getSessionData = () => {
        const stored = localStorage.getItem(ROOM_SESSION_KEY);
        if (stored) {
            try {
                const session: RoomSession = JSON.parse(stored);
                // Check if this is the same room and session is recent (< 1 hour)
                if (session.roomId === roomId && (Date.now() - session.timestamp) < 3600000) {
                    return session;
                }
            } catch (e) {
                console.warn('Failed to parse room session:', e);
            }
        }
        // Fallback to location state
        return {
            playerName: location.state?.playerName || "Anonymous",
            avatarId: location.state?.avatarId || 'blob-yellow',
            settings: location.state?.settings
        };
    };

    const sessionData = getSessionData();
    const playerName = sessionData.playerName;
    const avatarId = sessionData.avatarId;
    const settings = sessionData.settings;

    const { peerId, isInitialized, initialize, clearSession } = usePeer();
    const loadTimeRef = useRef(Date.now());
    const initAttempted = useRef(false);
    const [isReconnecting, setIsReconnecting] = useState(false);

    // Auto-initialize if page refreshed or direct link
    useEffect(() => {
        if (!isInitialized && !initAttempted.current) {
            console.log("GameRoom: Auto-initializing peer...");
            initAttempted.current = true;
            initialize().catch(err => console.error("Auto-init failed", err));
        }
    }, [isInitialized, initialize]);

    // Save room session when we have valid data
    useEffect(() => {
        if (roomId && playerName && peerId) {
            const session: RoomSession = {
                roomId,
                playerName,
                avatarId,
                settings,
                timestamp: Date.now()
            };
            localStorage.setItem(ROOM_SESSION_KEY, JSON.stringify(session));
            console.log('Saved room session:', session);
        }
    }, [roomId, playerName, avatarId, settings, peerId]);

    // Handle page visibility changes (tab switching, minimizing)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                console.log('Page hidden - game may continue in background');
            } else {
                console.log('Page visible - checking connection...');
                // Could add reconnection logic here if needed
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    const leaveGame = () => {
        // Clear room session
        localStorage.removeItem(ROOM_SESSION_KEY);
        localStorage.removeItem(ROOM_STATE_KEY);

        // Clear peer session if not host (hosts keep their ID for creating new games)
        if (!isHost) {
            clearSession();
        }

        // Navigate back to lobby
        navigate('/');
    };

    type StrokeAction = DrawStroke | { type: 'UNDO' } | { type: 'START' } | { type: 'BATCH'; batch: StrokeBatch };

    const handleRemoteStroke = (stroke: StrokeAction) => {
        if (canvasRef.current) {
            if ('type' in stroke) {
                if (stroke.type === 'UNDO') {
                    canvasRef.current.undo();
                } else if (stroke.type === 'START') {
                    canvasRef.current.saveHistory();
                } else if (stroke.type === 'BATCH') {
                    canvasRef.current.drawRemoteBatch(stroke.batch);
                }
            } else {
                canvasRef.current.drawRemoteStroke(stroke);
            }
        }
    };

    // Host Logic
    const isHost = peerId === roomId;
    const hostLogic = useGameHost(isHost, playerName, avatarId, settings, handleRemoteStroke);

    // Client Logic
    const clientLogic = useGameClient(roomId, playerName, avatarId, isHost, handleRemoteStroke);

    // Unified State
    const gameState = isHost ? hostLogic.gameState : clientLogic.gameState;
    const connectionStatus = isHost ? 'connected' : clientLogic.connectionStatus; // ConnectionStatus type

    // Refs for stable handlers and to avoid calling setState directly inside effects
    const gameStateRef = useRef(gameState);
    useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

    const roomIdRef = useRef(roomId);
    useEffect(() => { roomIdRef.current = roomId; }, [roomId]);

    const isHostRef = useRef(isHost);
    useEffect(() => { isHostRef.current = isHost; }, [isHost]);

    // Handle beforeunload to save state using refs so the handler can remain stable
    useEffect(() => {
        const handleBeforeUnload = () => {
            const gs = gameStateRef.current;
            const rid = roomIdRef.current;
            const host = isHostRef.current;
            if (gs && rid) {
                try {
                    localStorage.setItem(ROOM_STATE_KEY, JSON.stringify({
                        roomId: rid,
                        gameState: gs,
                        isHost: host,
                        timestamp: Date.now()
                    }));
                } catch (e) {
                    console.warn('Failed to persist ROOM_STATE on unload', e);
                }
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, []);

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameState.chatMessages.length]);

    

    const [hasCopied, setHasCopied] = useState(false);
    const canvasRef = useRef<CanvasRef>(null);

    // Drawing State
    const [drawingColor, setDrawingColor] = useState('#000000');
    const [brushSize, setBrushSize] = useState(5);
    const [isEraser, setIsEraser] = useState(false);
    const [isFillMode, setIsFillMode] = useState(false);

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

    // Check for session restoration when `roomId` changes.
    useEffect(() => {
        try {
            const stored = localStorage.getItem(ROOM_SESSION_KEY);
            if (stored) {
                const s = JSON.parse(stored) as { roomId?: string } | null;
                if (s && s.roomId === roomId) {
                    console.log('Found valid session data, attempting reconnection...');
                    setIsReconnecting(true);
                }
            }
        } catch {
            // ignore parse errors
        }
    }, [roomId]);

    // Clear reconnection state when connected
    useEffect(() => {
        if (isReconnecting && (connectionStatus === 'connected' || isHost)) {
            console.log('Reconnection successful');
            setIsReconnecting(false);
        }
    }, [isReconnecting, connectionStatus, isHost]);

    // Fun Loading State (REMOVED: Using LoadingScreen now)
    // const [loadingText, setLoadingText] = useState("SHARPENING PENCILS...");
    // useEffect(() => { ... });

    // Mobile State
    const [mobileTab, setMobileTab] = useState<'GAME' | 'CHAT' | 'PLAYERS'>('GAME');
    const [unreadChatCount, setUnreadChatCount] = useState(0);

    // Track unread messages for mobile
    useEffect(() => {
        if (mobileTab !== 'CHAT') {
            const lastMsg = gameState.chatMessages[gameState.chatMessages.length - 1];
            if (lastMsg && lastMsg.timestamp > (loadTimeRef.current || 0)) { // Simple check, could be better
                // Actually better: just increment if we are not on chat tab
                if (gameState.chatMessages.length > prevMsgCount.current) {
                    setUnreadChatCount(prev => prev + 1);
                }
            }
        } else {
            setUnreadChatCount(0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameState.chatMessages.length, mobileTab]);

    const showBlockingLoad = !isInitialized || (!isHost && connectionStatus === 'connecting' && gameState.players.length === 0);

    // Explicitly handle "connecting" (Initial) or "reconnecting" (Background)

    // Case 1: Blocking Load (First time or critical)
    if (showBlockingLoad) {
        return (
            <LoadingScreen
                status="connecting"
                text={isReconnecting ? "Reconnecting to Game..." : "Joining Game..."}
            />
        );
    }

    if (connectionStatus === 'error') {
        return (
            <LoadingScreen
                status="error"
                text="Connection Failed"
                onRetry={() => window.location.reload()}
            />
        );
    }

    return (
        <div className="flex flex-col h-screen bg-pink-50 overflow-hidden relative selection:bg-yellow-200">
            {/* Reconnecting Banner */}
            {!isHost && connectionStatus === 'connecting' && (
                <div className="absolute top-0 left-0 right-0 z-[60] bg-yellow-400 border-b-[3px] border-black p-2 flex items-center justify-center gap-2 animate-in slide-in-from-top">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
                    <span className="font-black font-mono text-sm uppercase">Reconnecting...</span>
                </div>
            )}
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                    backgroundImage: `radial-gradient(#000 1px, transparent 1px)`,
                    backgroundSize: '24px 24px'
                }}
            />

            {/* HEADER */}
            <header className="h-16 bg-white border-b-[3px] border-black flex items-center justify-between px-4 md:px-6 z-20 shrink-0">
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                        <div
                            role="status"
                            aria-live="polite"
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl border-[3px] border-black min-w-[80px] justify-center bg-gradient-to-br from-yellow-300 to-yellow-200 shadow-[3px_3px_0px_#000] transition-transform ${gameState.timer <= 10 ? 'animate-pulse scale-105 ring-2 ring-red-300' : ''}`}
                        >
                            <Clock className="w-4 h-4 text-black" />
                            <span className="font-black font-mono ml-2">{gameState.timer}s</span>
                        </div>

                        <div className="hidden md:flex items-center gap-6 ml-4">
                            <div className="text-sm font-black">Round {gameState.round}/{gameState.settings.rounds}</div>
                            <div className="text-sm font-black">Drawer: {gameState.players.find(p => p.id === gameState.currentDrawerId)?.name || 'Waiting...'}</div>
                            <div className="text-sm font-black">Mode: {gameState.gameMode.toUpperCase()}</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={toggleMute} className="btn-icon hidden md:inline-flex" title="Toggle sound">
                            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                        </button>
                        <button onClick={copyRoomLink} className="btn-secondary px-3 py-1.5 flex items-center gap-2" title="Copy join link">
                            <span className="font-mono hidden md:inline">{roomId?.slice(0, 6)}...</span>
                            <span className="font-mono md:hidden">CODE</span>
                        </button>
                        <button onClick={leaveGame} className="btn-icon text-red-500" title="Leave Game">
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex overflow-hidden relative">

                {/* LEFT SIDEBAR - PLAYERS (Desktop: Always Visible, Mobile: Tab) */}
                <div className={`${mobileTab === 'PLAYERS' ? 'absolute inset-0 z-40 bg-white' : 'hidden'} md:block md:relative md:w-64 md:border-r-[3px] md:border-black md:p-4 z-10`}>
                    <PlayerList
                        players={gameState.players}
                        currentDrawerId={gameState.currentDrawerId}
                        myId={peerId}
                    />
                </div>

                {/* CENTER - GAME AREA (Visible if Tab=GAME or Desktop) */}
                <div className={`flex-1 relative bg-gray-50 flex flex-col ${mobileTab !== 'GAME' ? 'hidden md:flex' : 'flex'}`}>

                    {/* ANIMATED TRANSITION CONTAINER */}
                    {/* Removed AnimatePresence to fix crash */}
                    {/* LOBBY VIEW */}
                    {
                        gameState.currentState === 'LOBBY' && (
                            <div
                                key="lobby"
                                className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 space-y-4 md:space-y-8 overflow-y-auto"
                            >
                                <div className="w-full max-w-2xl bg-white border-[3px] border-black rounded-3xl p-4 md:p-8 shadow-[4px_4px_0px_#000] md:shadow-[8px_8px_0px_#000] text-center space-y-4 md:space-y-6">
                                    <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-black">Waiting for Players...</h2>
                                    <div className="flex justify-center flex-wrap gap-4">
                                        {gameState.players.map(p => {
                                            const avatar = getAvatarById(p.avatarId);
                                            return (
                                                <div key={p.id} className="animate-bounce-slow flex flex-col items-center">
                                                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-white border-[3px] border-black flex items-center justify-center relative overflow-hidden shadow-[4px_4px_0px_#000]">
                                                        <div className="absolute inset-0 opacity-20" style={{ backgroundColor: avatar.color }} />
                                                        <div className="w-8 h-8 md:w-12 md:h-12 z-10">{avatar.component}</div>
                                                    </div>
                                                    <span className="mt-2 text-[10px] md:text-xs font-black uppercase bg-black text-white px-2 py-0.5 rounded-full">{p.name || 'Anonymous'}</span>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="py-2 w-full flex justify-center scale-90 md:scale-100 origin-center">
                                        <AvatarSelector
                                            currentAvatarId={gameState.players.find(p => p.id === peerId)?.avatarId || avatarId}
                                            onSelect={(newId) => isHost ? hostLogic.updateAvatar(newId) : clientLogic.changeAvatar(newId)}
                                        />
                                    </div>

                                    <div className="py-4 border-t-2 border-dashed border-gray-300 w-full flex flex-col items-center gap-2">
                                        <span className="text-xs md:text-sm font-black uppercase tracking-wider text-gray-500">Invite Friends</span>
                                        <button
                                            onClick={copyRoomLink}
                                            className="btn-primary w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 text-lg"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span>{hasCopied ? 'COPIED!' : 'COPY JOIN LINK'}</span>
                                                {!hasCopied && <Copy className="w-5 h-5" />}
                                            </div>
                                        </button>
                                    </div>

                                    {isHost && (
                                        <div className="space-y-4">
                                            <div className="flex justify-center gap-4">
                                                <button
                                                    onClick={() => hostLogic.startGame('CLASSIC')}
                                                    disabled={gameState.players.length < 2}
                                                    className="btn-bubble bg-green-400 text-black border-[3px] border-black rounded-xl font-black text-xl shadow-[4px_4px_0px_#000] transition-all px-6 py-4 w-full md:w-auto"
                                                >
                                                    CLASSIC MODE
                                                </button>
                                                <button
                                                    onClick={() => hostLogic.startGame('FAKE_ARTIST')}
                                                    disabled={gameState.players.length < 3}
                                                    className="btn-bubble bg-red-400 text-black border-[3px] border-black rounded-xl font-black text-xl shadow-[4px_4px_0px_#000] transition-all px-6 py-4 w-full md:w-auto"
                                                >
                                                    FAKE ARTIST
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    {!isHost && (
                                        <p className="text-gray-500 font-bold animate-pulse">Host will start the game soon...</p>
                                    )}
                                </div>
                            </div>
                        )
                    }


                    {/* WORD SELECTION VIEW */}
                    {
                        gameState.currentState === 'WORD_SELECTION' && (
                            <div
                                key="word-selection"
                                className="flex-1 flex items-center justify-center p-4 md:p-8 absolute inset-0 z-20 bg-black/50 backdrop-blur-sm"
                            >
                                <WordSelectionPanel
                                    words={gameState.wordChoices || gameState.prompt?.split(',') || ['Apple', 'Banana', 'Car', 'Dog']}
                                    onSelect={(word) => isHost ? hostLogic.selectWord(word) : clientLogic.selectWord(word)}
                                    isDrawer={peerId === gameState.currentDrawerId}
                                    drawerName={gameState.players.find(p => p.id === gameState.currentDrawerId)?.name}
                                />
                            </div>
                        )
                    }

                    {/* DRAWING/GUESSING VIEW */}
                    {
                        (gameState.currentState === 'DRAWING' || gameState.currentState === 'GUESSING') && (
                            <div
                                key="drawing"
                                className="flex-1 flex flex-col relative h-full"
                            >
                                {/* Game Status / Hints - Moved OUTSIDE canvas to prevent overlap */}
                                <div className="px-4 pt-2 pb-1 flex justify-center min-h-[50px]">
                                    {gameState.currentState === 'DRAWING' && (
                                        <div className={`${peerId === gameState.fakeArtistId ? 'bg-red-100 border-red-400' : 'bg-yellow-100 border-yellow-400'} border-[3px] px-6 py-2 rounded-full shadow-[4px_4px_0px_rgba(0,0,0,0.1)] flex flex-col items-center min-w-[200px] animate-in slide-in-from-top-4`}>
                                            <span className={`text-[10px] font-bold ${peerId === gameState.fakeArtistId ? 'text-red-800' : 'text-yellow-800'} uppercase tracking-widest leading-none mb-1`}>
                                                {peerId === gameState.currentDrawerId ? 'Your Turn to Draw' : 
                                                 peerId === gameState.fakeArtistId ? 'You are the Fake Artist!' : 'Drawing'}
                                            </span>
                                            <span className="text-xl font-black text-black uppercase tracking-wider leading-none">
                                                {peerId === gameState.currentDrawerId ? (gameState.wordToGuess || gameState.prompt) : '???'}
                                            </span>
                                        </div>
                                    )}
                                    {gameState.currentState === 'DRAWING' && peerId !== gameState.currentDrawerId && gameState.hint && (
                                        <div className="bg-white border-[3px] border-black px-6 py-2 rounded-xl shadow-[4px_4px_0px_#000] animate-in slide-in-from-top-4">
                                            <span className="text-2xl font-black font-mono tracking-[0.5em] text-black">
                                                {gameState.hint}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 mx-2 md:mx-4 mb-2 bg-white border-[3px] border-black rounded-2xl shadow-[4px_4px_0px_rgba(0,0,0,0.1)] overflow-hidden relative cursor-crosshair touch-none">
                                    <GameCanvas
                                        ref={canvasRef}
                                        onStroke={isHost ? hostLogic.sendStroke : clientLogic.sendStroke}
                                        onStrokeBatch={isHost ? hostLogic.sendStrokeBatch : clientLogic.sendStrokeBatch}
                                        color={drawingColor}
                                        brushSize={brushSize}
                                        isEraser={isEraser}
                                        isFillMode={isFillMode}
                                        onStrokeStart={() => isHost ? hostLogic.broadcastStrokeStart() : clientLogic.sendStrokeStart()}
                                        isAdmin={peerId !== gameState.currentDrawerId}
                                    />
                                </div>

                                {/* Toolbar - Only for drawer */}
                                {peerId === gameState.currentDrawerId && (
                                    <div className="pb-2 md:pb-4 px-2 md:px-4 flex justify-center">
                                        <DrawingToolbar
                                            color={drawingColor}
                                            setColor={setDrawingColor}
                                            brushSize={brushSize}
                                            setBrushSize={setBrushSize}
                                            isEraser={isEraser}
                                            setIsEraser={setIsEraser}
                                            isFillMode={isFillMode}
                                            setIsFillMode={setIsFillMode}
                                            onClear={() => canvasRef.current?.clear()}
                                            onUndo={() => {
                                                canvasRef.current?.undo();
                                                if (isHost) hostLogic.broadcastUndo();
                                                else clientLogic.sendUndo();
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        )
                    }

                    {/* TURN RESULTS VIEW (Intermediate Scoreboard) */}
                    {
                        gameState.currentState === 'TURN_RESULTS' && (
                            <div
                                key="turn-results"
                                className="flex-1 bg-black/80 backdrop-blur-md absolute inset-0 z-30 flex flex-col items-center justify-center p-4 md:p-8 space-y-4 md:space-y-8 animate-in fade-in zoom-in duration-300"
                            >
                                <div className="bg-white border-[4px] border-black rounded-3xl p-4 md:p-8 shadow-[8px_8px_0px_#FFF] text-center max-w-2xl w-full">
                                    <h2 className="text-lg md:text-2xl font-black uppercase tracking-widest text-gray-500 mb-2">The word was</h2>
                                    <h1 className="text-4xl md:text-6xl font-black text-purple-600 uppercase tracking-tighter mb-4 md:mb-8">
                                        {gameState.prompt || "???"}
                                    </h1>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 mb-4 md:mb-8 max-h-[40vh] overflow-y-auto">
                                        {gameState.players.sort((a, b) => b.score - a.score).slice(0, 4).map((p, i) => (
                                            <div key={p.id} className="flex items-center justify-between bg-gray-50 p-3 md:p-4 rounded-xl border-2 border-dashed border-gray-300 text-black">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-white ${i === 0 ? 'bg-yellow-400' : 'bg-gray-400'}`}>
                                                        {i + 1}
                                                    </div>
                                                    <span className="font-bold">{p.name}</span>
                                                </div>
                                                <span className="font-mono font-bold text-xl">{p.score}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex flex-col items-center gap-2">
                                        <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-gray-400">Next round in</span>
                                        <div className="text-3xl md:text-4xl font-black font-mono text-black">{gameState.timer}</div>
                                    </div>
                                </div>
                            </div>
                        )
                    }

                    {/* FINAL RESULTS VIEW */}
                    {
                        gameState.currentState === 'RESULTS' && (
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
                        )
                    }
                </div>

                {/* RIGHT SIDEBAR - CHAT (Desktop: Always Visible, Mobile: Tab) */}
                <div className={`${mobileTab === 'CHAT' ? 'absolute inset-0 z-40 flex' : 'hidden'} md:flex md:relative md:w-80 md:border-l-[3px] md:border-black flex-col z-10 shrink-0 bg-white md:bg-transparent`}>
                    <ChatPanel
                        messages={gameState.chatMessages}
                        onSendMessage={handleSendMessage}
                        myPlayerId={peerId}
                        drawerId={gameState.currentDrawerId}
                    />
                </div>
            </div>

            {/* MOBILE TABS (Visible on Mobile Only) */}
            <MobileTabs
                activeTab={mobileTab}
                onTabChange={setMobileTab}
                unreadCount={unreadChatCount}
            />

            {/* Onboarding tooltip (dismissible) */}
            <OnboardingTooltip />
        </div>
    );
};

export default GameRoom;
