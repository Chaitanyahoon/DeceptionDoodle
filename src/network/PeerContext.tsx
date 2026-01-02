import React, { createContext, useContext, useState } from 'react';

import { peerManager, PeerManager } from './PeerManager';
// Mock for testing
// const peerManager = { initialize: async () => "mock-id" } as any;
// type PeerManager = any;

interface PeerContextType {
    peerId: string;
    isInitialized: boolean;
    manager: PeerManager;
    error: string | null;
    initialize: () => Promise<string>;
}

const PeerContext = createContext<PeerContextType | null>(null);

export const PeerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    console.log('PeerProvider rendering...');
    const [peerId, setPeerId] = useState<string>('');
    const [isInitialized, setIsInitialized] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const initialize = async () => {
        try {
            const id = await peerManager.initialize();
            setPeerId(id);
            setIsInitialized(true);
            return id;
        } catch (err: any) {
            setError(err.message);
            setIsInitialized(false);
            throw err;
        }
    };

    return (
        <PeerContext.Provider value={{ peerId, isInitialized, manager: peerManager, error, initialize }}>
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
