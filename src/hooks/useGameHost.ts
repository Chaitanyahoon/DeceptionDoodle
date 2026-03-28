import { useState, useEffect, useCallback, useRef } from 'react';
import { peerManager } from '../network/PeerManager';
import type { GameContextState, Player, ProtocolMessage, GameSettings, ChatMessage, DrawStroke, StrokeBatch, GameMode } from '../network/types';
import { INITIAL_GAME_STATE } from '../network/types';
import { soundManager } from '../utils/SoundManager';
import { wordCategoryManager } from '../utils/gameEnhancements';

type StrokeAction = DrawStroke | { type: 'UNDO' } | { type: 'START' } | { type: 'BATCH'; batch: StrokeBatch };

export const useGameHost = (enabled: boolean, myName: string, myAvatarId: string, _initialSettings?: GameSettings, onStrokeReceived?: (stroke: StrokeAction) => void) => {
    const [gameState, setGameState] = useState<GameContextState>(INITIAL_GAME_STATE);
    const stateRef = useRef<GameContextState>(INITIAL_GAME_STATE);
    const lastBroadcastRef = useRef<number>(0);
    const broadcastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const usedWordsRef = useRef<Set<string>>(new Set());
    const drawerQueueRef = useRef<string[]>([]);
    const currentRoundRef = useRef(1);
    const votesRef = useRef<Map<string, string>>(new Map());

    // Update ref whenever state changes
    useEffect(() => {
        stateRef.current = gameState;
    }, [gameState]);

    // Throttled Broadcast Function
    const broadcastState = useCallback((state: GameContextState, immediate = false) => {
        const now = Date.now();
        const MIN_BROADCAST_INTERVAL = 100; // 100ms throttle for general state

        const performBroadcast = () => {
            state.players.forEach(p => {
                if (p.id !== peerManager.myId && p.isConnected !== false) {
                    // Create a sanitized view for each player to prevent cheating
                    const isDrawer = p.id === state.currentDrawerId;
                    const sanitizedState = { ...state };

                    // Mask data for non-drawers or Fake Artist
                    if (state.gameMode === 'FAKE_ARTIST') {
                        const isFakeArtist = p.id === state.fakeArtistId;
                        if (isFakeArtist) {
                            sanitizedState.wordToGuess = '???';
                            sanitizedState.prompt = '???';
                            sanitizedState.wordChoices = undefined;
                        }
                    } else if (!isDrawer) {
                        if (state.currentState === 'WORD_SELECTION') {
                            sanitizedState.wordChoices = undefined;
                        }
                        if (state.currentState === 'DRAWING' || state.currentState === 'GUESSING') {
                            sanitizedState.wordToGuess = undefined;
                            sanitizedState.prompt = ''; 
                        }
                    }

                    peerManager.send(p.id, { type: 'GAME_STATE_UPDATE', payload: sanitizedState });
                }
            });
            lastBroadcastRef.current = Date.now();
            if (broadcastTimeoutRef.current) {
                clearTimeout(broadcastTimeoutRef.current);
                broadcastTimeoutRef.current = null;
            }
        };

        if (immediate || (now - lastBroadcastRef.current > MIN_BROADCAST_INTERVAL)) {
            performBroadcast();
        } else if (!broadcastTimeoutRef.current) {
            broadcastTimeoutRef.current = setTimeout(performBroadcast, MIN_BROADCAST_INTERVAL);
        }
    }, []);

    // Broadcast on meaningful state changes
    useEffect(() => {
        if (!enabled) return;
        broadcastState(gameState);
    }, [gameState, enabled, broadcastState]);

    const broadcastStroke = useCallback((fromId: string, stroke: DrawStroke) => {
        const currentState = stateRef.current;
        if (fromId !== currentState.currentDrawerId) return;

        currentState.players.forEach(p => {
            if (p.id !== peerManager.myId && p.id !== fromId && p.isConnected !== false) {
                peerManager.send(p.id, { type: 'DRAW_STROKE', payload: stroke });
            }
        });
        if (onStrokeReceived && fromId !== peerManager.myId) {
            onStrokeReceived(stroke);
        }
    }, [onStrokeReceived]);

    const broadcastStrokeBatch = useCallback((fromId: string, batch: { strokes: DrawStroke[], timestamp: number }) => {
        const currentState = stateRef.current;
        if (fromId !== currentState.currentDrawerId) return;

        currentState.players.forEach(p => {
            if (p.id !== peerManager.myId && p.id !== fromId && p.isConnected !== false) {
                peerManager.send(p.id, { type: 'STROKE_BATCH', payload: batch });
            }
        });
        if (onStrokeReceived && fromId !== peerManager.myId) {
            onStrokeReceived({ type: 'BATCH', batch });
        }
    }, [onStrokeReceived]);

    const handleData = ({ peerId, data }: { peerId: string, data: ProtocolMessage }) => {
        switch (data.type) {
            case 'JOIN_REQUEST':
                addPlayer(peerId, data.payload.name, false, data.payload.avatarId);
                break;
            case 'SUBMIT_DRAWING':
                handleDrawingSubmission(peerId, data.payload);
                break;
            case 'SUBMIT_VOTE':
                handleVote(peerId, data.payload);
                break;
            case 'CHAT_MESSAGE':
                handleChatMessage(data.payload);
                break;
            case 'SELECT_WORD':
                handleWordSelection(peerId, data.payload);
                break;
            case 'DRAW_STROKE':
                broadcastStroke(peerId, data.payload);
                break;
            case 'STROKE_BATCH':
                broadcastStrokeBatch(peerId, data.payload);
                break;
            case 'AVATAR_UPDATE':
                handleAvatarUpdate(peerId, data.payload.avatarId);
                break;
            case 'UNDO_STROKE':
                stateRef.current.players.forEach((p: Player) => {
                    if (p.id !== peerManager.myId && p.id !== peerId && p.isConnected !== false) {
                        peerManager.send(p.id, { type: 'UNDO_STROKE', payload: {} });
                    }
                });
                if (onStrokeReceived) onStrokeReceived({ type: 'UNDO' });
                break;
            case 'STROKE_START':
                stateRef.current.players.forEach((p: Player) => {
                    if (p.id !== peerManager.myId && p.id !== peerId && p.isConnected !== false) {
                        peerManager.send(p.id, { type: 'STROKE_START', payload: {} });
                    }
                });
                if (onStrokeReceived) onStrokeReceived({ type: 'START' });
                break;
        }
    };

    const handleDisconnect = (peerId: string) => {
        setGameState(prev => ({
            ...prev,
            players: prev.players.map(p => p.id === peerId ? { ...p, isConnected: false } : p)
        }));
    };

    useEffect(() => {
        if (!enabled) return;
        peerManager.on('DATA', handleData);
        peerManager.on('DISCONNECT', handleDisconnect);
        return () => {
            peerManager.off('DATA', handleData);
            peerManager.off('DISCONNECT', handleDisconnect);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled]);

    useEffect(() => {
        if (enabled && peerManager.myId && myName) {
            addPlayer(peerManager.myId, myName, true, myAvatarId);
        }
    }, [enabled, myName, myAvatarId]);

    const addPlayer = (id: string, name: string, isHostPlayer: boolean = false, playerAvatarId?: string) => {
        setGameState((prev: GameContextState) => {
            if (prev.players.find((p: Player) => p.id === id)) return prev;
            const newPlayer: Player = {
                id,
                name,
                isHost: isHostPlayer,
                avatarId: playerAvatarId || 'blob-yellow',
                score: 0,
                hasSubmittedDrawing: false,
                hasVoted: false
            };
            return { ...prev, players: [...prev.players, newPlayer] };
        });
    };

    const startGame = (mode: GameMode = 'CLASSIC') => {
        currentRoundRef.current = 1;
        const queue = stateRef.current.players.map((p: Player) => p.id);
        drawerQueueRef.current = queue;

        setGameState((prev: GameContextState) => ({ 
            ...prev, 
            round: 1, 
            gameMode: mode,
            chatMessages: [...prev.chatMessages, {
                id: String(Date.now()),
                playerId: 'SYSTEM',
                playerName: 'System',
                text: `Game Started! Mode: ${mode}`,
                type: 'SYSTEM',
                timestamp: Date.now()
            }]
        }));
        startNextTurn();
    };

    const startNextTurn = () => {
        const currentState = stateRef.current;
        
        // FAKE ARTIST MODE LOGIC
        if (currentState.gameMode === 'FAKE_ARTIST') {
            if (drawerQueueRef.current.length === 0) {
                // End turn and go to voting
                setGameState(prev => ({ ...prev, currentState: 'GUESSING', timer: 30 }));
                startTimer(30, 30);
                return;
            }

            const nextDrawerId = drawerQueueRef.current.shift()!;
            
            // If it's the first turn of the round, pick the word and fake artist
            if (currentState.players.every((p: Player) => !p.hasGuessed)) {
                const words = wordCategoryManager.getRandomWords('Mix', 3, usedWordsRef.current);
                const word = words[Math.floor(Math.random() * words.length)];
                const otherPlayers = currentState.players.map((p: Player) => p.id);
                const fakeId = otherPlayers[Math.floor(Math.random() * otherPlayers.length)];

                setGameState((prev: GameContextState) => ({
                    ...prev,
                    currentState: 'DRAWING',
                    currentDrawerId: nextDrawerId,
                    fakeArtistId: fakeId,
                    wordToGuess: word,
                    prompt: word,
                    timer: 15, // Short turns for Fake Artist
                    players: prev.players.map((p: Player) => ({ ...p, hasGuessed: p.id === nextDrawerId }))
                }));
                startTimer(15, 15, word);
            } else {
                setGameState((prev: GameContextState) => ({
                    ...prev,
                    currentState: 'DRAWING',
                    currentDrawerId: nextDrawerId,
                    timer: 15,
                    players: prev.players.map((p: Player) => p.id === nextDrawerId ? { ...p, hasGuessed: true } : p)
                }));
                startTimer(15, 15, currentState.wordToGuess);
            }
            return;
        }

        // CLASSIC MODE LOGIC
        if (drawerQueueRef.current.length === 0) {
            if (currentRoundRef.current < currentState.settings.rounds) {
                currentRoundRef.current += 1;
                drawerQueueRef.current = currentState.players.map(p => p.id);
                startNextTurn();
            } else {
                setGameState(prev => ({ ...prev, currentState: 'RESULTS' }));
            }
            return;
        }

        const nextDrawerId = drawerQueueRef.current.shift()!;
        const words = wordCategoryManager.getRandomWords('Mix', 3, usedWordsRef.current);

        setGameState(prev => {
            const next: GameContextState = {
                ...prev,
                currentState: 'WORD_SELECTION',
                currentDrawerId: nextDrawerId,
                round: currentRoundRef.current,
                wordChoices: words,
                timer: 30,
                prompt: '',
                wordToGuess: '',
                players: prev.players.map(p => ({ ...p, hasGuessed: false })),
                chatMessages: [...prev.chatMessages, {
                    id: String(Date.now()),
                    playerId: 'SYSTEM',
                    playerName: 'System',
                    text: `Round ${currentRoundRef.current}. ${prev.players.find(p => p.id === nextDrawerId)?.name} is choosing a word!`,
                    type: 'SYSTEM',
                    timestamp: Date.now()
                }]
            };
            return next;
        });
        
        soundManager.playTurnStart();
        startTimer(30, 30);
    };

    const handleWordSelection = (playerId: string, word: string) => {
        usedWordsRef.current.add(word);

        setGameState(prev => {
            if (prev.currentDrawerId !== playerId) return prev;

            const initialHint = word.split('').map(char => char === ' ' ? ' ' : '_').join('');

            return {
                ...prev,
                currentState: 'DRAWING',
                prompt: word,
                wordToGuess: word,
                hint: initialHint,
                category: 'Standard',
                timer: prev.settings.drawTime,
                players: prev.players.map(p => ({ ...p, hasGuessed: false })),
                chatMessages: [...prev.chatMessages, {
                    id: String(Date.now()),
                    playerId: 'SYSTEM',
                    playerName: 'System',
                    text: `${prev.players.find(p => p.id === playerId)?.name} is drawing!`,
                    type: 'SYSTEM',
                    timestamp: Date.now()
                }]
            };
        });
        
        const drawTime = stateRef.current.settings.drawTime;
        startTimer(drawTime, drawTime, word);
    };

    const startTimer = (seconds: number, totalTime: number, wordForHints?: string) => {
        if (timerRef.current) clearInterval(timerRef.current);
        let timeLeft = seconds;
        const revealThresholds = [0.75, 0.50, 0.25];

        timerRef.current = window.setInterval(() => {
            timeLeft--;
            
            setGameState(prev => {
                let next = { ...prev, timer: timeLeft };

                // Hint Logic
                if (wordForHints && prev.hint && timeLeft > 0) {
                    const isThreshold = revealThresholds.some(t => Math.floor(totalTime * t) === timeLeft);
                    if (isThreshold) {
                        const unrevealedIndices = prev.hint.split('').map((c, i) => c === '_' ? i : -1).filter(i => i !== -1);
                        if (unrevealedIndices.length > 0) {
                            const randomIndex = unrevealedIndices[Math.floor(Math.random() * unrevealedIndices.length)];
                            const newHintArr = prev.hint.split('');
                            newHintArr[randomIndex] = wordForHints[randomIndex];
                            next = { ...next, hint: newHintArr.join('') };
                        }
                    }
                }
                return next;
            });

            if (timeLeft <= 10 && timeLeft > 0) soundManager.playTick();

            if (timeLeft <= 0) {
                if (timerRef.current) clearInterval(timerRef.current);
                const latestState = stateRef.current;
                if (latestState.currentState === 'WORD_SELECTION') {
                    const choices = latestState.wordChoices || ['Apple', 'Banana'];
                    const randomWord = choices[Math.floor(Math.random() * choices.length)] || 'Apple';
                    if (latestState.currentDrawerId) {
                        handleWordSelection(latestState.currentDrawerId, randomWord);
                    }
                } else if (latestState.currentState === 'DRAWING' || latestState.currentState === 'GUESSING') {
                    startTurnResults();
                }
            }
        }, 1000);
    };

    const handleDrawingSubmission = (playerId: string, dataUrl: string) => {
        setGameState(prev => ({
            ...prev,
            drawings: [...prev.drawings, { playerId, dataUrl }]
        }));
    };

    const handleVote = (voterId: string, votedForId: string) => {
        setGameState(prev => {
            const updatedPlayers = prev.players.map(p =>
                p.id === voterId ? { ...p, hasVoted: true } : p
            );
            const allVoted = updatedPlayers.every(p => p.hasVoted);

            if (allVoted) {
                setTimeout(() => endRound(updatedPlayers), 1000);
            }

            votesRef.current.set(voterId, votedForId);
            return { ...prev, players: updatedPlayers };
        });
    };

    const handleChatMessage = (msg: ChatMessage) => {
        setGameState(prev => {
            const isCorrect = prev.wordToGuess && msg.text.trim().toLowerCase() === prev.wordToGuess.trim().toLowerCase();
            const sender = prev.players.find(p => p.id === msg.playerId);
            const isDrawer = sender?.id === prev.currentDrawerId;

            // FIX: Drawer cannot guess their own word for points
            if (isCorrect && sender && !sender.hasGuessed && prev.currentState === 'DRAWING' && !isDrawer) {
                const totalTime = prev.settings.drawTime;
                const timeLeft = prev.timer;
                const timeRatio = timeLeft / totalTime;

                // Scoring
                const baseScore = 50;
                const timeBonus = Math.ceil(timeRatio * 450);

                const alreadyGuessedCount = prev.players.filter(p => p.hasGuessed).length;
                let orderBonus = 0;
                if (alreadyGuessedCount === 0) orderBonus = 50;
                else if (alreadyGuessedCount === 1) orderBonus = 25;

                const guesserPoints = baseScore + timeBonus + orderBonus;
                const drawerPoints = Math.ceil(timeRatio * 100);

                const nextPlayers = prev.players.map(p => {
                    if (p.id === msg.playerId) {
                        return { ...p, score: p.score + guesserPoints, hasGuessed: true };
                    }
                    if (p.id === prev.currentDrawerId) {
                        return { ...p, score: p.score + drawerPoints };
                    }
                    return p;
                });

                const successMsg: ChatMessage = {
                    ...msg,
                    text: `${sender.name} guessed the word!`,
                    type: 'SYSTEM',
                    isCorrect: true
                };

                const nextState = {
                    ...prev,
                    players: nextPlayers,
                    chatMessages: [...prev.chatMessages, successMsg]
                };

                // Check if everyone guessed
                const totalGuessers = nextPlayers.filter(p => p.id !== prev.currentDrawerId).length;
                const currentGuessers = nextPlayers.filter(p => p.hasGuessed && p.id !== prev.currentDrawerId).length;

                if (currentGuessers >= totalGuessers && totalGuessers > 0) {
                    setTimeout(() => startTurnResults(), 2000);
                }

                return nextState;
            }

            return {
                ...prev,
                chatMessages: [...prev.chatMessages, msg]
            };
        });
    };

    const startTurnResults = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        
        setGameState(prev => ({
            ...prev,
            currentState: 'TURN_RESULTS',
            timer: 5,
            prompt: prev.wordToGuess || prev.prompt
        }));

        let timeLeft = 5;
        timerRef.current = window.setInterval(() => {
            timeLeft--;
            setGameState(prev => ({ ...prev, timer: timeLeft }));
            
            if (timeLeft <= 0) {
                if (timerRef.current) clearInterval(timerRef.current);
                startNextTurn();
            }
        }, 1000);
    };

    const endRound = (currentPlayers: Player[]) => {
        votesRef.current.clear();

        setGameState((prev: GameContextState) => ({
            ...prev,
            players: currentPlayers,
            currentState: 'RESULTS',
            drawings: []
        }));
    };

    const handleAvatarUpdate = (playerId: string, newAvatarId: string) => {
        setGameState(prev => ({
            ...prev,
            players: prev.players.map(p => p.id === playerId ? { ...p, avatarId: newAvatarId } : p)
        }));
    };

    return {
        gameState,
        startGame,
        handleDrawingSubmission,
        handleChatMessage,
        sendStroke: (stroke: DrawStroke) => broadcastStroke(peerManager.myId || 'host', stroke),
        sendStrokeBatch: (batch: StrokeBatch) => broadcastStrokeBatch(peerManager.myId || 'host', batch),
        selectWord: (word: string) => handleWordSelection(peerManager.myId || 'host', word),
        updateAvatar: (avatarId: string) => handleAvatarUpdate(peerManager.myId || 'host', avatarId),
        broadcastUndo: () => {
            stateRef.current.players.forEach(p => {
                if (p.id !== peerManager.myId && p.isConnected !== false) {
                    peerManager.send(p.id, { type: 'UNDO_STROKE', payload: {} });
                }
            });
        },
        broadcastStrokeStart: () => {
            stateRef.current.players.forEach(p => {
                if (p.id !== peerManager.myId && p.isConnected !== false) {
                    peerManager.send(p.id, { type: 'STROKE_START', payload: {} });
                }
            });
        }
    };
};

