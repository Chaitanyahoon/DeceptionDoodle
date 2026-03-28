/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';

import { peerManager, PeerManager } from './PeerManager';

interface PeerContextType {
    peerId: string;
    isInitialized: boolean;
    manager: PeerManager;
    error: string | null;
    initialize: () => Promise<string>;
    clearSession: () => void;
}

const PeerContext = createContext<PeerContextType | null>(null);

// Session storage keys
const PEER_ID_KEY = 'deception-doodle-peer-id';
const SESSION_TIMESTAMP_KEY = 'deception-doodle-session-timestamp';

// Session expires after 24 hours
const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000;

export const PeerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    console.log('PeerProvider rendering...');
    const [peerId, setPeerId] = useState<string>(() => {
        // Try to restore peer ID from session storage
        const storedId = localStorage.getItem(PEER_ID_KEY);
        const storedTimestamp = localStorage.getItem(SESSION_TIMESTAMP_KEY);

        if (storedId && storedTimestamp) {
            const age = Date.now() - parseInt(storedTimestamp);
            if (age < SESSION_EXPIRY_MS) {
                console.log('Restoring peer ID from session:', storedId);
                return storedId;
            } else {
                // Session expired, clean up
                localStorage.removeItem(PEER_ID_KEY);
                localStorage.removeItem(SESSION_TIMESTAMP_KEY);
            }
        }
        return '';
    });
    const [isInitialized, setIsInitialized] = useState(() => !!peerId);
    const [error, setError] = useState<string | null>(null);

    const initialize = async () => {
        try {
            let id: string;

            if (peerId) {
                // Try to reuse existing peer ID
                console.log('Attempting to reuse peer ID:', peerId);
                try {
                    await peerManager.initialize(peerId);
                    id = peerId;
                } catch (reuseError) {
                    console.warn('Failed to reuse peer ID, generating new one:', reuseError);
                    id = await peerManager.initialize();
                }
            } else {
                id = await peerManager.initialize();
            }

            setPeerId(id);
            setIsInitialized(true);
            setError(null);

            // Store in session storage
            localStorage.setItem(PEER_ID_KEY, id);
            localStorage.setItem(SESSION_TIMESTAMP_KEY, Date.now().toString());

            return id;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            setError(message);
            setIsInitialized(false);
            throw err;
        }
    };

    const clearSession = () => {
        setPeerId('');
        setIsInitialized(false);
        setError(null);
        localStorage.removeItem(PEER_ID_KEY);
        localStorage.removeItem(SESSION_TIMESTAMP_KEY);
    };

    // Auto-cleanup expired sessions on mount
    useEffect(() => {
        const storedTimestamp = localStorage.getItem(SESSION_TIMESTAMP_KEY);
        if (storedTimestamp) {
            const age = Date.now() - parseInt(storedTimestamp);
            if (age >= SESSION_EXPIRY_MS) {
                console.log('Cleaning up expired session');
                clearSession();
            }
        }
    }, []);

    return (
        <PeerContext.Provider value={{ peerId, isInitialized, manager: peerManager, error, initialize, clearSession }}>
            {children}
        </PeerContext.Provider>
    );
};

export const usePeer = () => {
    const context = useContext(PeerContext);
    if (!context) {
        throw new Error('usePeer must be used within a PeerProvider');
    }
    return context;
};
