import { useState, useEffect, useCallback, useRef } from 'react';
import { peerManager } from '../network/PeerManager';
import type { GameContextState, Player, ProtocolMessage, GameSettings, ChatMessage } from '../network/types';
import { INITIAL_GAME_STATE } from '../network/types';
import { PROMPTS, getRandomPrompts } from '../data/prompts';
import { soundManager } from '../utils/SoundManager'; // Import soundManager

export const useGameHost = (enabled: boolean, myName: string, myAvatarId: string, initialSettings?: GameSettings, onStrokeReceived?: (stroke: any) => void) => {
    const [gameState, setGameState] = useState<GameContextState>(INITIAL_GAME_STATE);
    const timerRef = useRef<number | null>(null);

    const broadcastState = useCallback((state: GameContextState) => {
        // Send to all connected players (except self)
        state.players.forEach(p => {
            if (p.id !== peerManager.myId && p.isConnected !== false) {
                peerManager.send(p.id, { type: 'GAME_STATE_UPDATE', payload: state });
            }
        });
    }, []);

    const broadcastStroke = useCallback((fromId: string, stroke: any) => {
        gameState.players.forEach(p => {
            if (p.id !== peerManager.myId && p.id !== fromId && p.isConnected !== false) {
                peerManager.send(p.id, { type: 'DRAW_STROKE', payload: stroke });
            }
        });
        // Also call local callback if it's from remote
        if (onStrokeReceived && fromId !== peerManager.myId) {
            onStrokeReceived(stroke);
        }
    }, [gameState.players, onStrokeReceived]);
    const handleData = ({ peerId, data }: { peerId: string, data: ProtocolMessage }) => {
        switch (data.type) {
            case 'JOIN_REQUEST':
                addPlayer(peerId, data.payload.name, false, data.payload.avatarId);
                break;
            case 'SUBMIT_DRAWING':
            // ...
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
                // Relay to all other players
                broadcastStroke(peerId, data.payload);
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

    // Handle incoming messages from clients
    useEffect(() => {
        if (!enabled) return;

        peerManager.on('DATA', handleData);
        peerManager.on('DISCONNECT', handleDisconnect);

        return () => {
            peerManager.off('DATA', handleData);
            peerManager.off('DISCONNECT', handleDisconnect);
        };
    }, [enabled, broadcastState]);

    // Auto-register Host
    useEffect(() => {
        if (enabled && peerManager.myId && myName) {
            addPlayer(peerManager.myId, myName, true, myAvatarId);
        }
    }, [enabled, peerManager.myId, myName]);

    const addPlayer = (id: string, name: string, isHostPlayer: boolean = false, playerAvatarId?: string) => {
        setGameState(prev => {
            // Avoid duplicates
            if (prev.players.find(p => p.id === id)) return prev;

            const newPlayer: Player = {
                id,
                name,
                isHost: isHostPlayer,
                avatarId: playerAvatarId || 'blob-yellow', // Use passed ID, fallback to default
                score: 0,
                hasSubmittedDrawing: false,
                hasVoted: false
            };

            const next = {
                ...prev,
                players: [...prev.players, newPlayer]
            };
            // Send immediate update to new player
            setTimeout(() => {
                peerManager.send(id, { type: 'GAME_STATE_UPDATE', payload: next });
            }, 500);
            broadcastState(next);
            return next;
        });
    };

    const drawerQueueRef = useRef<string[]>([]);
    const currentRoundRef = useRef(1);

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
            // End of Round
            if (currentRoundRef.current < gameState.settings.rounds) {
                currentRoundRef.current += 1;
                // Refill Queue
                drawerQueueRef.current = gameState.players.map(p => p.id);
                // Maybe a short "Round Over" screen here?
                startNextTurn();
            } else {
                // End of Game
                setGameState(prev => {
                    const next = { ...prev, currentState: 'RESULTS' as const };
                    broadcastState(next);
                    return next;
                });
            }
            return;
        }

        const nextDrawerId = drawerQueueRef.current.shift()!;

        // Generate Words
        const allWords = PROMPTS.flatMap(set => set.items);
        const shuffled = allWords.sort(() => 0.5 - Math.random());
        const words = shuffled.slice(0, 3);

        setGameState(prev => {
            const next: GameContextState = {
                ...prev,
                currentState: 'WORD_SELECTION',
                currentDrawerId: nextDrawerId,
                round: currentRoundRef.current,
                wordChoices: words,
                timer: 15,
                prompt: '',
                wordToGuess: '', // Reset
                players: prev.players.map(p => ({ ...p, hasGuessed: false })), // Reset
                chatMessages: [...prev.chatMessages, {
                    id: String(Date.now()),
                    playerId: 'SYSTEM',
                    playerName: 'System',
                    text: `Round ${currentRoundRef.current}. ${prev.players.find(p => p.id === nextDrawerId)?.name} is choosing a word!`,
                    type: 'SYSTEM',
                    timestamp: Date.now()
                }]
            };
            soundManager.playTurnStart(); // FX
            broadcastState(next);

            startTimer(15, 15); // Word selection timer (no hint word)
            return next;
        });
    };

    const handleWordSelection = (playerId: string, word: string) => {
        setGameState(prev => {
            if (prev.currentDrawerId !== playerId) return prev;

            // Initialize Hint (underscores)
            // Keep spaces, replace others with _
            const initialHint = word.split('').map(char => char === ' ' ? ' ' : '_').join('');

            const next: GameContextState = {
                ...prev,
                currentState: 'DRAWING',
                prompt: word,
                wordToGuess: word, // CRITICAL: Host stores the secret word for checking guesses
                hint: initialHint,
                category: 'Standard', // Placeholder
                timer: prev.settings.drawTime,
                players: prev.players.map(p => ({ ...p, hasGuessed: false })), // Reset Guessed Flags
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
        const revealThresholds = [0.75, 0.50, 0.25]; // Reveal at 75%, 50%, 25% time remaining

        timerRef.current = window.setInterval(() => {
            timeLeft--;
            setGameState(prev => {
                let next = { ...prev, timer: timeLeft };

                // HINT REVEAL LOGIC
                if (wordForHints && prev.hint && timeLeft > 0) {
                    const ratio = timeLeft / totalTime;
                    // Check if we just crossed a threshold
                    // Simple check: if current ratio is <= threshold AND (ratio + 1/totalTime) > threshold
                    // Or just check specific seconds if easier? simpler to check specific counts based on length?
                    // Let's do simple: Reveal a letter if (TimeLeft % interval === 0)? No.
                    // Let's do: Reveal if we are close to 75%, 50%, 25%
                    // actually, simpler:
                    // Max hints = word length / 2 (ceiling)
                    // Distribute them.
                    // For MVP: Simple random reveal every X seconds?
                    // Let's stick to thresholds.

                    const isThreshold = revealThresholds.some(t => Math.floor(totalTime * t) === timeLeft);
                    if (isThreshold) {
                        // Reveal one unrevealed letter
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

            // SFX: Ticking Clock
            if (timeLeft <= 10 && timeLeft > 0) {
                soundManager.playTick();
            }

            if (timeLeft <= 0) {
                if (timerRef.current) clearInterval(timerRef.current);
                startNextTurn(); // Auto-advance? previously was onComplete callback
            }
        }, 1000);
    };

    const endDrawingPhase = () => {
        setGameState(prev => {
            const next: GameContextState = {
                ...prev,
                currentState: 'GUESSING',
                timer: 30
            };
            broadcastState(next);
            return next;
        });
    };

    const handleDrawingSubmission = (playerId: string, dataUrl: string) => {
        setGameState(prev => {
            const newDrawings = [...prev.drawings, { playerId, dataUrl }];
            // Check if all submitted? For now just store.
            return { ...prev, drawings: newDrawings };
        });
    };

    // Scoring Logic State
    const realPlayerIdRef = useRef<string | null>(null);

    // ... (inside startGame)

    const handleVote = (voterId: string, votedForId: string) => {
        setGameState(prev => {
            // Mark voter as having voted
            const updatedPlayers = prev.players.map(p =>
                p.id === voterId ? { ...p, hasVoted: true } : p
            );

            // Check if everyone has voted
            const allVoted = updatedPlayers.every(p => p.hasVoted);

            if (allVoted) {
                // Calculate Scores
                const realId = realPlayerIdRef.current;
                let newPlayers = [...updatedPlayers];

                if (realId) {
                    // 1. Identify "Fake" (The one who didn't get the prompt? Or the one who DID?)
                    // "Deception Doodle": Assume 1 Fake, Rest Real.
                    // realPlayerIdRef tracks the "Real" guy? 
                    // Wait, in "Fake Artist", the Fake is the TARGET. 
                    // startGame logic: "const isReal = index === realIndex;"
                    // So ONE person is "Real" (Unique)? Or ONE person is "Fake"?
                    // Earlier logic: "const prompt = isReal ? real : fakes[index...]"
                    // If 'real' is the Target Item (e.g. "Cat"), and 'fakes' are Decoys (e.g. "Dog").
                    // Usually MAJORITY get "Cat", ONE gets "Dog" (or nothing).
                    // But code says: `isReal` (Single Index) gets `real`. Others get `fakes`.
                    // This implies the "Real" guy is the ODD ONE OUT.
                    // So if you vote for the "Real" Guy (The Odd One), you win points.

                    // Scoring:
                    // Votes against Real Guy (Odd One) -> +Points for Voter
                    // Real Guy Survives -> +Points for Real Guy

                    // Count votes for Real Guy
                    // ACTUALLY: Let's assume standard Spyfall.
                    // The "Odd One" (RealIndex here) is the Target.

                    let votesForTarget = 0;
                    // We need to store votes. gameState currently doesn't store WHO voted for WHOM in types.
                    // Simplify: For now, we process votes individually or we need to store them in a temp map?
                    // handleVote is called one by one. logic needs to accumulate.
                    // WE NEED A VOTE MAP in the Ref?
                    // For MVP: We define "End of Round" triggering here.
                    // We need to store votes in a Ref before processing end of round.
                }

                setTimeout(() => {
                    endRound(newPlayers);
                }, 1000);

                return { ...prev, players: updatedPlayers }; // Just update 'hasVoted' status for now
            }

            // We need to store the vote!
            // Let's add a votesRef
            votesRef.current.set(voterId, votedForId);

            return { ...prev, players: updatedPlayers };
        });
    };

    const handleChatMessage = (msg: ChatMessage) => {
        setGameState(prev => {
            // Check if it's a correct guess
            const isCorrect = prev.wordToGuess && msg.text.trim().toLowerCase() === prev.wordToGuess.trim().toLowerCase();
            const sender = prev.players.find(p => p.id === msg.playerId);

            if (isCorrect && sender && !sender.hasGuessed && prev.currentState === 'DRAWING') {
                // --- SCORING LOGIC ---
                // 1. Guesser Score
                // Formula: Base(50) + (TimeLeft / TotalTime * 450)
                // Order Bonus: 1st (+50), 2nd (+25)
                const totalTime = prev.settings.drawTime;
                const timeLeft = prev.timer;
                const timeRatio = timeLeft / totalTime;

                const baseScore = 50;
                const timeBonus = Math.ceil(timeRatio * 450);

                // Count how many already guessed to determine rank
                const alreadyGuessedCount = prev.players.filter(p => p.hasGuessed).length;
                let orderBonus = 0;
                if (alreadyGuessedCount === 0) orderBonus = 50;
                else if (alreadyGuessedCount === 1) orderBonus = 25;

                const guesserPoints = baseScore + timeBonus + orderBonus;

                // 2. Drawer Score
                // Formula: (TimeLeft / TotalTime * 100) per guess
                const drawerPoints = Math.ceil(timeRatio * 100);

                // Update Players
                const nextPlayers = prev.players.map(p => {
                    if (p.id === msg.playerId) {
                        return { ...p, score: p.score + guesserPoints, hasGuessed: true };
                    }
                    if (p.id === prev.currentDrawerId) {
                        return { ...p, score: p.score + drawerPoints };
                    }
                    return p;
                });

                // System Message
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

                // Check Early End (Everyone but drawer has guessed)
                const totalGuessers = nextPlayers.length - 1; // Exclude drawer
                const currentGuessers = nextPlayers.filter(p => p.hasGuessed).length;

                if (currentGuessers >= totalGuessers && totalGuessers > 0) {
                    // End Turn Immediately
                    setTimeout(() => startNextTurn(), 2000); // Small delay to see success
                }

                broadcastState(nextState);
                return nextState;
            }

            // Normal Chat
            const next = {
                ...prev,
                chatMessages: [...prev.chatMessages, msg]
            };
            broadcastState(next);
            return next;
        });
    };

    // Helper to finish round
    const endRound = (currentPlayers: Player[]) => {
        const targetId = realPlayerIdRef.current;
        const votes = votesRef.current;
        let finalPlayers = [...currentPlayers];

        if (targetId) {
            let votesForTarget = 0;
            votes.forEach((votedId) => {
                if (votedId === targetId) votesForTarget++;
            });

            // Simple Scoring:
            // +100pts to anyone who voted for Target
            // +200pts to Target if they have < 50% of votes (Surived)

            const playerCount = finalPlayers.length;
            const majority = Math.floor(playerCount / 2) + 1;

            const targetCaught = votesForTarget >= majority;

            finalPlayers = finalPlayers.map(p => {
                let scoreToAdd = 0;
                // If you are NOT target and you voted for target -> Points
                if (p.id !== targetId && votes.get(p.id) === targetId) {
                    scoreToAdd += 100;
                }
                // If you ARE target and NOT caught -> Points
                if (p.id === targetId && !targetCaught) {
                    scoreToAdd += 200;
                }
                return { ...p, score: p.score + scoreToAdd };
            });
        }

        // Reset Logic
        votesRef.current.clear();
        realPlayerIdRef.current = null;

        setGameState(prev => {
            const next: GameContextState = {
                ...prev,
                players: finalPlayers,
                currentState: 'RESULTS',
                round: prev.round, // Increment?
                drawings: []
            };
            broadcastState(next);
            return next;
        });
    };

    const votesRef = useRef<Map<string, string>>(new Map());

    return {
        gameState,
        startGame,
        handleDrawingSubmission,
        handleChatMessage,
        sendStroke: (stroke: any) => broadcastStroke(peerManager.myId || 'host', stroke),
        selectWord: (word: string) => handleWordSelection(peerManager.myId || 'host', word)
    };
};
