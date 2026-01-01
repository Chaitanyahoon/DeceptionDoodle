import { useState, useEffect } from 'react';
import { peerManager } from '../network/PeerManager';
import type { GameContextState, Player, ProtocolMessage } from '../network/types';
import { INITIAL_GAME_STATE } from '../network/types';

export const useGameClient = (hostId: string | undefined, myName: string, isHost: boolean) => {
    const [gameState, setGameState] = useState<GameContextState>(INITIAL_GAME_STATE);

    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!hostId || isHost) return;

        const connectToHost = async () => {
            try {
                console.log(`Attempting to connect to host: ${hostId}`);
                await peerManager.connect(hostId);
                setIsConnected(true);
                // Auto-join after connection
                if (myName) {
                    joinGame(myName);
                }
            } catch (err) {
                console.error("Connection failed", err);
                setIsConnected(false);
            }
        };

        const handleConnect = (peerId: string) => {
            if (peerId === hostId) setIsConnected(true);
        };

        const handleDisconnect = (peerId: string) => {
            if (peerId === hostId) setIsConnected(false);
        };

        peerManager.on('CONNECT', handleConnect);
        peerManager.on('DISCONNECT', handleDisconnect);

        // Initiate connection
        connectToHost();

        return () => {
            peerManager.off('CONNECT', handleConnect);
            peerManager.off('DISCONNECT', handleDisconnect);
        };
    }, [hostId, isHost, myName]); // Retry if name changes? Maybe just keep it simple.

    const handleData = ({ peerId, data }: { peerId: string, data: ProtocolMessage }) => {
        if (peerId !== hostId) return; // Ignore non-host messages

        switch (data.type) {
            case 'GAME_STATE_UPDATE':
                setGameState(data.payload);
                break;
            case 'PLAYER_UPDATE':
                // Merge private info into state
                if (data.payload.prompt) {
                    setGameState(prev => ({ ...prev, prompt: data.payload.prompt, category: data.payload.category }));
                }
                break;
        }
    };

    useEffect(() => {
        if (!hostId) return;
        peerManager.on('DATA', handleData);
        return () => {
            peerManager.off('DATA', handleData);
        };
    }, [hostId]);

    const joinGame = (name: string) => {
        if (hostId) {
            peerManager.send(hostId, {
                type: 'JOIN_REQUEST',
                payload: { name }
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

    const submitVote = (votedForId: string) => {
        if (hostId) {
            peerManager.send(hostId, {
                type: 'SUBMIT_VOTE',
                payload: votedForId
            });
        }
    };

    return {
        gameState,
        isConnected, // Export this
        joinGame,
        submitDrawing,
        submitVote
    };
};
