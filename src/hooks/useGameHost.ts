import { useState, useEffect, useCallback, useRef } from 'react';
import { peerManager } from '../network/PeerManager';
import type { GameContextState, Player, ProtocolMessage, GameSettings, ChatMessage, DrawStroke, StrokeBatch } from '../network/types';
import { INITIAL_GAME_STATE } from '../network/types';
import { soundManager } from '../utils/SoundManager';
// import { WORD_BANK } from '../data/words';
import { wordCategoryManager } from '../utils/gameEnhancements';

type StrokeAction = DrawStroke | { type: 'UNDO' } | { type: 'START' } | { type: 'BATCH'; batch: StrokeBatch };

export const useGameHost = (enabled: boolean, myName: string, myAvatarId: string, _initialSettings?: GameSettings, onStrokeReceived?: (stroke: StrokeAction) => void) => {
    const [gameState, setGameState] = useState<GameContextState>(INITIAL_GAME_STATE);
    const timerRef = useRef<number | null>(null);
    const usedWordsRef = useRef<Set<string>>(new Set());
    const drawerQueueRef = useRef<string[]>([]);
    const currentRoundRef = useRef(1);
    const realPlayerIdRef = useRef<string | null>(null); // For future game modes
    const votesRef = useRef<Map<string, string>>(new Map());

    const broadcastState = useCallback((state: GameContextState) => {
        state.players.forEach(p => {
            if (p.id !== peerManager.myId && p.isConnected !== false) {
                // Create a sanitized view for each player to prevent cheating
                const isDrawer = p.id === state.currentDrawerId;
                const sanitizedState = { ...state };

                // Mask data for non-drawers
                if (!isDrawer) {
                    // Hide word choices during selection
                    if (state.currentState === 'WORD_SELECTION') {
                        sanitizedState.wordChoices = undefined;
                    }
                    // Hide target word during gameplay
                    if (state.currentState === 'DRAWING' || state.currentState === 'GUESSING') {
                        sanitizedState.wordToGuess = undefined;
                        sanitizedState.prompt = ''; // Hide the answer (game uses 'hint' for guessers)
                    }
                }

                peerManager.send(p.id, { type: 'GAME_STATE_UPDATE', payload: sanitizedState });
            }
        });
    }, []);

    const broadcastStroke = useCallback((fromId: string, stroke: DrawStroke) => {
        // Validation: Only current drawer can draw
        if (fromId !== gameState.currentDrawerId) return;

        gameState.players.forEach(p => {
            if (p.id !== peerManager.myId && p.id !== fromId && p.isConnected !== false) {
                peerManager.send(p.id, { type: 'DRAW_STROKE', payload: stroke });
            }
        });
        if (onStrokeReceived && fromId !== peerManager.myId) {
            onStrokeReceived(stroke);
        }
    }, [gameState.players, gameState.currentDrawerId, onStrokeReceived]);

    const broadcastStrokeBatch = useCallback((fromId: string, batch: { strokes: DrawStroke[], timestamp: number }) => {
        // Validation: Only current drawer can draw
        if (fromId !== gameState.currentDrawerId) return;

        gameState.players.forEach(p => {
            if (p.id !== peerManager.myId && p.id !== fromId && p.isConnected !== false) {
                peerManager.send(p.id, { type: 'STROKE_BATCH', payload: batch });
            }
        });
        if (onStrokeReceived && fromId !== peerManager.myId) {
            onStrokeReceived({ type: 'BATCH', batch });
        }
    }, [gameState.players, gameState.currentDrawerId, onStrokeReceived]);

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
                gameState.players.forEach(p => {
                    if (p.id !== peerManager.myId && p.id !== peerId && p.isConnected !== false) {
                        peerManager.send(p.id, { type: 'UNDO_STROKE', payload: {} });
                    }
                });
                if (onStrokeReceived) onStrokeReceived({ type: 'UNDO' });
                break;
            case 'STROKE_START':
                gameState.players.forEach(p => {
                    if (p.id !== peerManager.myId && p.id !== peerId && p.isConnected !== false) {
                        peerManager.send(p.id, { type: 'STROKE_START', payload: {} });
                    }
                });
                if (onStrokeReceived) onStrokeReceived({ type: 'START' });
                break;
        }
    };

    const handleDisconnect = (peerId: string) => {
        setGameState(prev => {
            const next = {
                ...prev,
                players: prev.players.map(p => p.id === peerId ? { ...p, isConnected: false } : p)
            };
            broadcastState(next);
            return next;
        });
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled, myName]);

    const addPlayer = (id: string, name: string, isHostPlayer: boolean = false, playerAvatarId?: string) => {
        setGameState(prev => {
            if (prev.players.find(p => p.id === id)) return prev;
            const newPlayer: Player = {
                id,
                name,
                isHost: isHostPlayer,
                avatarId: playerAvatarId || 'blob-yellow',
                score: 0,
                hasSubmittedDrawing: false,
                hasVoted: false
            };
            const next = { ...prev, players: [...prev.players, newPlayer] };
            setTimeout(() => {
                peerManager.send(id, { type: 'GAME_STATE_UPDATE', payload: next });
            }, 500);
            broadcastState(next);
            return next;
        });
    };

    const startGame = () => {
        currentRoundRef.current = 1;
        const queue = gameState.players.map(p => p.id);
        drawerQueueRef.current = queue;

        setGameState(prev => {
            const next = { ...prev, round: 1 };
            broadcastState(next);
            return next;
        });
        startNextTurn();
    };

    const startNextTurn = () => {
        if (drawerQueueRef.current.length === 0) {
            if (currentRoundRef.current < gameState.settings.rounds) {
                currentRoundRef.current += 1;
                drawerQueueRef.current = gameState.players.map(p => p.id);
                setGameState(prev => ({
                    ...prev,
                    chatMessages: [...prev.chatMessages, {
                        id: String(Date.now()),
                        playerId: 'SYSTEM',
                        playerName: 'System',
                        text: `Starting Round ${currentRoundRef.current}!`,
                        type: 'SYSTEM',
                        timestamp: Date.now()
                    }]
                }));
                startNextTurn();
            } else {
                setGameState(prev => {
                    const next: GameContextState = { ...prev, currentState: 'RESULTS' };
                    broadcastState(next);
                    return next;
                });
            }
            return;
        }

        const nextDrawerId = drawerQueueRef.current.shift()!;

        // NEW WORD LOGIC via Manager
        // Uses 'Mix' category which includes all words
        // Pass usedWordsRef to prevent repeats
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
            soundManager.playTurnStart();
            broadcastState(next);
            startTimer(30, 30);
            return next;
        });
    };

    const handleWordSelection = (playerId: string, word: string) => {
        // Mark as used immediately upon selection
        usedWordsRef.current.add(word);

        setGameState(prev => {
            if (prev.currentDrawerId !== playerId) return prev;

            const initialHint = word.split('').map(char => char === ' ' ? ' ' : '_').join('');

            const next: GameContextState = {
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
            broadcastState(next);
            startTimer(next.settings.drawTime, next.settings.drawTime, word);
            return next;
        });
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

                broadcastState(next);
                return next;
            });

            if (timeLeft <= 10 && timeLeft > 0) soundManager.playTick();

            if (timeLeft <= 0) {
                if (timerRef.current) clearInterval(timerRef.current);
                setGameState(latestState => {
                    if (latestState.currentState === 'WORD_SELECTION') {
                        const choices = latestState.wordChoices || ['Apple', 'Banana'];
                        const randomWord = choices[Math.floor(Math.random() * choices.length)] || 'Apple';
                        setTimeout(() => {
                            if (latestState.currentDrawerId) {
                                handleWordSelection(latestState.currentDrawerId, randomWord);
                            }
                        }, 0);
                        return latestState;
                    }
                    if (latestState.currentState === 'DRAWING' || latestState.currentState === 'GUESSING') {
                        setTimeout(() => startTurnResults(), 0);
                    }
                    return latestState;
                });
            }
        }, 1000);
    };

    const handleDrawingSubmission = (playerId: string, dataUrl: string) => {
        setGameState(prev => {
            const newDrawings = [...prev.drawings, { playerId, dataUrl }];
            return { ...prev, drawings: newDrawings };
        });
    };

    const handleVote = (voterId: string, votedForId: string) => {
        setGameState(prev => {
            const updatedPlayers = prev.players.map(p =>
                p.id === voterId ? { ...p, hasVoted: true } : p
            );
            const allVoted = updatedPlayers.every(p => p.hasVoted);

            if (allVoted) {
                setTimeout(() => {
                    endRound(updatedPlayers);
                }, 1000);
                return { ...prev, players: updatedPlayers };
            }

            votesRef.current.set(voterId, votedForId);
            return { ...prev, players: updatedPlayers };
        });
    };

    // UPDATED CHAT HANDLER
    const handleChatMessage = (msg: ChatMessage) => {
        setGameState(prev => {
            const isCorrect = prev.wordToGuess && msg.text.trim().toLowerCase() === prev.wordToGuess.trim().toLowerCase();
            const sender = prev.players.find(p => p.id === msg.playerId);
            const isDrawer = sender?.id === prev.currentDrawerId;

            if (isCorrect && sender && !sender.hasGuessed && prev.currentState === 'DRAWING') {
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
                    // Update the Sender (Guesser OR Drawer who is guessing correct)
                    if (p.id === msg.playerId) {
                        return { ...p, score: p.score + guesserPoints, hasGuessed: true };
                    }
                    // Drip feed points to Drawer (only if sender is NOT drawer)
                    if (p.id === prev.currentDrawerId && !isDrawer) {
                        return { ...p, score: p.score + drawerPoints };
                    }
                    return p;
                });

                // Updated Message
                const successMsg: ChatMessage = {
                    ...msg,
                    text: isDrawer ? `${sender.name} (The Drawer) finished the drawing!` : `${sender.name} guessed the word!`, // Custom msg for drawer? Or "guessed the word" is fine.
                    type: 'SYSTEM',
                    isCorrect: true
                };

                const nextState = {
                    ...prev,
                    players: nextPlayers,
                    chatMessages: [...prev.chatMessages, successMsg]
                };

                // Early End Check
                // If Drawer Guesses -> Does the round end? Usually yes for Impostor mode.
                // If standard mode, drawer shouldn't guess.
                // Assuming Deception/Impostor style: If drawer (impostor) guesses, they win/round ends?
                // For simplified logic: Just follow standard "All Guessers" logic.
                // If drawer hasGuessed=true, they are counted in 'currentGuessers'.

                const totalGuessers = nextPlayers.length - 1; // Everyone except Drawer (normally)
                // But if Drawer also guesses, logic is tricky.
                // Let's stick to "If everyone who CAN guess has guessed".
                // In this codebase, 'hasGuessed' flag is key.
                const currentGuessers = nextPlayers.filter(p => p.hasGuessed && p.id !== prev.currentDrawerId).length;
                // If Drawer guessed, we might want to end?

                if (currentGuessers >= totalGuessers && totalGuessers > 0) {
                    setTimeout(() => startTurnResults(), 2000);
                }

                broadcastState(nextState);
                return nextState;
            }

            const next = {
                ...prev,
                chatMessages: [...prev.chatMessages, msg]
            };
            broadcastState(next);
            return next;
        });
    };

    const startTurnResults = () => {
        setGameState(prev => {
            const next: GameContextState = {
                ...prev,
                currentState: 'TURN_RESULTS',
                timer: 5,
                prompt: prev.wordToGuess || prev.prompt
            };
            broadcastState(next);

            if (timerRef.current) clearInterval(timerRef.current);
            timerRef.current = window.setInterval(() => {
                setGameState(current => {
                    if (current.timer <= 1) {
                        clearInterval(timerRef.current!);
                        setTimeout(() => startNextTurn(), 0);
                        return current;
                    }
                    return { ...current, timer: current.timer - 1 };
                });
            }, 1000);

            return next;
        });
    };

    const endRound = (currentPlayers: Player[]) => {
        const targetId = realPlayerIdRef.current;
        const finalPlayers = [...currentPlayers];

        if (targetId) {
            // ... legacy deception logic kept for safety ...
            const votes = votesRef.current;
            // Use votes if needed here, otherwise logic handles it
            console.log('Votes processing', votes);
        }

        votesRef.current.clear();
        realPlayerIdRef.current = null;

        setGameState(prev => {
            const next: GameContextState = {
                ...prev,
                players: finalPlayers,
                currentState: 'RESULTS',
                round: prev.round,
                drawings: []
            };
            broadcastState(next);
            return next;
        });
    };

    const handleAvatarUpdate = (playerId: string, newAvatarId: string) => {
        setGameState(prev => {
            const next = {
                ...prev,
                players: prev.players.map(p => p.id === playerId ? { ...p, avatarId: newAvatarId } : p)
            };
            broadcastState(next);
            return next;
        });
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
            gameState.players.forEach(p => {
                if (p.id !== peerManager.myId && p.isConnected !== false) {
                    peerManager.send(p.id, { type: 'UNDO_STROKE', payload: {} });
                }
            });
        },
        broadcastStrokeStart: () => {
            gameState.players.forEach(p => {
                if (p.id !== peerManager.myId && p.isConnected !== false) {
                    peerManager.send(p.id, { type: 'STROKE_START', payload: {} });
                }
            });
        }
    };
};
