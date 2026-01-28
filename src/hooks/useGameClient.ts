import { useState, useEffect, useRef } from 'react';
import { peerManager } from '../network/PeerManager';
import type { GameContextState, ProtocolMessage, ChatMessage, DrawStroke, StrokeBatch } from '../network/types';
import { INITIAL_GAME_STATE } from '../network/types';
import { ConnectionMonitor, retryWithBackoff } from '../utils/networkUtils';

type StrokeAction = DrawStroke | { type: 'UNDO' } | { type: 'START' } | { type: 'BATCH'; batch: StrokeBatch };
type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error';

export const useGameClient = (hostId: string | undefined, myName: string, myAvatarId: string, isHost: boolean, onRemoteStroke?: (stroke: StrokeAction) => void) => {
    const [gameState, setGameState] = useState<GameContextState>(INITIAL_GAME_STATE);
    // Explicit connection status for UI
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
    const [isConnected, setIsConnected] = useState(false); // Keep for compatibility

    // Network resilience refs
    const monitorRef = useRef<ConnectionMonitor | null>(null);
    // const joinRetriesRef = useRef(0);

    // Initialize monitor
    useEffect(() => {
        if (!isHost) {
            monitorRef.current = new ConnectionMonitor(3000, 8000); // Faster detection (was 5000/15000)
        }
        return () => {
            monitorRef.current?.stop();
        };
    }, [isHost]);

    useEffect(() => {
        if (!hostId || isHost) {
            setConnectionStatus('connected'); // Host is always connected
            return;
        }

        const connectToHost = async () => {
            setConnectionStatus('connecting');
            try {
                console.log(`Attempting to connect to host: ${hostId}`);

                await retryWithBackoff(
                    async () => {
                        await peerManager.connect(hostId);
                    },
                    10, // increased retries (was 5)
                    300 // faster initial retry (was 1000)
                );

                setIsConnected(true);
                setConnectionStatus('connected');

                // Start monitoring
                monitorRef.current?.start(
                    () => {
                        // Send PING
                        if (hostId) peerManager.send(hostId, { type: 'PING' } as any);
                    },
                    () => {
                        console.warn('Connection heartbeat timed out');
                        // Optional: Trigger reconnect logic or show warning
                        setConnectionStatus(prev => prev === 'connected' ? 'disconnected' : prev);
                    }
                );

                // Auto-join after connection
                if (myName) {
                    joinGame(myName, myAvatarId);
                }
            } catch (err) {
                console.error("Connection failed after retries", err);
                setIsConnected(false);
                setConnectionStatus('error');
            }
        };

        const handleConnect = (peerId: string) => {
            if (peerId === hostId) {
                setIsConnected(true);
                setConnectionStatus('connected');
                monitorRef.current?.recordHeartbeat();
            }
        };

        const handleDisconnect = (peerId: string) => {
            if (peerId === hostId) {
                setIsConnected(false);
                setConnectionStatus('disconnected');
                monitorRef.current?.stop();
            }
        };

        peerManager.on('CONNECT', handleConnect);
        peerManager.on('DISCONNECT', handleDisconnect);

        // Initiate connection
        connectToHost();

        return () => {
            peerManager.off('CONNECT', handleConnect);
            peerManager.off('DISCONNECT', handleDisconnect);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hostId, isHost, myName]);

    const handleData = ({ peerId, data }: { peerId: string, data: ProtocolMessage }) => {
        if (peerId !== hostId) return; // Ignore non-host messages

        // Record heartbeat on any message from host
        monitorRef.current?.recordHeartbeat();

        switch (data.type) {
            case 'PING':
                // Reply with PONG
                peerManager.send(hostId, { type: 'PONG' } as any);
                break;
            case 'GAME_STATE_UPDATE':
                setGameState(data.payload);
                break;
            case 'PLAYER_UPDATE':
                // Merge private info into state
                if (data.payload.prompt) {
                    setGameState(prev => ({
                        ...prev,
                        prompt: data.payload.prompt || '',
                        category: data.payload.category
                    }));
                }
                break;
            case 'DRAW_STROKE':
                if (onRemoteStroke) onRemoteStroke(data.payload);
                break;
            case 'STROKE_BATCH':
                if (onRemoteStroke) onRemoteStroke({ type: 'BATCH', batch: data.payload });
                break;
            case 'UNDO_STROKE':
                if (onRemoteStroke) onRemoteStroke({ type: 'UNDO' });
                break;
            case 'STROKE_START':
                if (onRemoteStroke) onRemoteStroke({ type: 'START' });
                break;
        }
    };

    useEffect(() => {
        if (!hostId) return;
        peerManager.on('DATA', handleData);
        return () => {
            peerManager.off('DATA', handleData);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hostId]);

    const joinGame = (name: string, avatarId: string) => {
        if (hostId) {
            peerManager.send(hostId, {
                type: 'JOIN_REQUEST',
                payload: { name, avatarId }
            });
        }
    };

    const submitDrawing = (dataUrl: string) => {
        if (hostId) {
            peerManager.send(hostId, {
                type: 'SUBMIT_DRAWING',
                payload: dataUrl
            });
        }
    };

    const selectWord = (word: string) => {
        if (hostId) {
            peerManager.send(hostId, {
                type: 'SELECT_WORD',
                payload: word
            });
        }
    };

    const submitVote = (votedForId: string) => {
        if (hostId) {
            peerManager.send(hostId, {
                type: 'SUBMIT_VOTE',
                payload: votedForId
            });
        }
    };

    const sendChatMessage = (msg: ChatMessage) => {
        if (hostId) {
            peerManager.send(hostId, {
                type: 'CHAT_MESSAGE',
                payload: msg
            });
        }
    };

    const sendStroke = (stroke: DrawStroke) => {
        if (hostId) {
            peerManager.send(hostId, {
                type: 'DRAW_STROKE',
                payload: stroke
            });
        }
    };

    const sendStrokeBatch = (batch: StrokeBatch) => {
        if (hostId) {
            peerManager.send(hostId, {
                type: 'STROKE_BATCH',
                payload: batch
            });
        }
    };

    const changeAvatar = (avatarId: string) => {
        if (hostId) {
            peerManager.send(hostId, {
                type: 'AVATAR_UPDATE',
                payload: { avatarId }
            });
        }
    };

    return {
        gameState,
        isConnected,
        connectionStatus, // Expose status
        joinGame,
        submitDrawing,
        submitVote,
        sendChatMessage,
        selectWord,
        sendStroke,
        sendStrokeBatch,
        changeAvatar,
        sendUndo: () => {
            if (hostId) peerManager.send(hostId, { type: 'UNDO_STROKE', payload: {} });
        },
        sendStrokeStart: () => {
            if (hostId) peerManager.send(hostId, { type: 'STROKE_START', payload: {} });
        }
    };
};
