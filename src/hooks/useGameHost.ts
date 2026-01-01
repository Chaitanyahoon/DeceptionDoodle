import { useState, useEffect, useCallback, useRef } from 'react';
import { peerManager } from '../network/PeerManager';
import type { GameContextState, Player, ProtocolMessage, GameSettings } from '../network/types';
import { INITIAL_GAME_STATE } from '../network/types';
import { getRandomPrompts } from '../data/prompts';

export const useGameHost = (enabled: boolean, myName: string, initialSettings?: GameSettings) => {
    // Merge provided settings with defaults if present
    const [gameState, setGameState] = useState<GameContextState>(() => ({
        ...INITIAL_GAME_STATE,
        settings: initialSettings || INITIAL_GAME_STATE.settings
    }));

    const timerRef = useRef<number | null>(null);

    const broadcastState = useCallback((state: GameContextState) => {
        peerManager.broadcast({
            type: 'GAME_STATE_UPDATE',
            payload: state
        });
    }, []);

    // ... (keep useEffects same)

    // Handle incoming messages from clients
    useEffect(() => {
        if (!enabled) return;

        const handleData = ({ peerId, data }: { peerId: string, data: ProtocolMessage }) => {
            switch (data.type) {
                case 'JOIN_REQUEST':
                    addPlayer(peerId, data.payload.name);
                    break;
                case 'SUBMIT_DRAWING':
                    handleDrawingSubmission(peerId, data.payload);
                    break;
                case 'SUBMIT_VOTE':
                    handleVote(peerId, data.payload);
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
            addPlayer(peerManager.myId, myName, true);
        }
    }, [enabled, peerManager.myId, myName]);

    const addPlayer = (id: string, name: string, isHostPlayer: boolean = false) => {
        setGameState(prev => {
            // Avoid duplicates
            if (prev.players.find(p => p.id === id)) return prev;

            const newPlayer: Player = {
                id,
                name,
                isHost: isHostPlayer,
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

    const startGame = () => {
        // 1. Assign Prompts
        const playerCount = gameState.players.length;
        // We need at least 2 players ideally, but allow 1 for testing
        const { category, real, fakes } = getRandomPrompts(playerCount);

        // Randomly pick who gets Real (The Target/Odd One)
        const realIndex = Math.floor(Math.random() * playerCount);

        // Track the target
        const targetId = gameState.players[realIndex].id;
        realPlayerIdRef.current = targetId;
        votesRef.current.clear();

        setGameState(prev => {
            const next: GameContextState = {
                ...prev,
                currentState: 'DRAWING',
                timer: prev.settings.drawTime, // Use configured time
                round: 1,
                category: category,
                prompt: '',
                drawings: []
            };
            broadcastState(next);

            startTimer(next.settings.drawTime, () => {
                endDrawingPhase();
            });
            return next;
        });

        setTimeout(() => {
            gameState.players.forEach((p, index) => {
                const isReal = index === realIndex;
                const prompt = isReal ? real : fakes[index % fakes.length];
                peerManager.send(p.id, {
                    type: 'PLAYER_UPDATE',
                    payload: { prompt, category }
                });
            });
        }, 500);
    };

    const startTimer = (seconds: number, onComplete: () => void) => {
        if (timerRef.current) clearInterval(timerRef.current);

        let timeLeft = seconds;
        timerRef.current = window.setInterval(() => {
            timeLeft--;
            setGameState(prev => {
                const next = { ...prev, timer: timeLeft };
                broadcastState(next); // Optimization: Maybe don't broadcast every second if generic timer on client?
                // For now, broadcast is safer to keep sync.
                return next;
            });

            if (timeLeft <= 0) {
                if (timerRef.current) clearInterval(timerRef.current);
                onComplete();
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
        isHost: true
    };
};
