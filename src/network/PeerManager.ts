import { Peer } from 'peerjs';
import type { DataConnection } from 'peerjs';
import type { ProtocolMessage } from './types';

export type PeerEvent = 'CONNECT' | 'DISCONNECT' | 'DATA';

type EventPayload<E extends PeerEvent> = E extends 'CONNECT' | 'DISCONNECT'
    ? string
    : E extends 'DATA'
    ? { peerId: string; data: ProtocolMessage }
    : never;

type EventCallback<E extends PeerEvent> = (payload: EventPayload<E>) => void;

export class PeerManager {
    private peer: Peer | null = null;
    private connections: Map<string, DataConnection> = new Map();
    private handlers: Map<PeerEvent, EventCallback<PeerEvent>[]> = new Map();
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 5;
    private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    private _isDestroyed: boolean = false;
    public myId: string = '';
    public isHost: boolean = false;

    constructor() {
        // Handlers initialized
    }

    /**
     * Initialize peer connection with optional host ID
     * @param hostId - Optional ID to claim (for host mode)
     * @returns Promise resolving to the peer ID
     */
    initialize(hostId?: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const idToClaim = hostId || this.generateShortId();

            this.peer = new Peer(idToClaim, {
                debug: 2
            });

            this.peer.on('open', (id) => {
                console.log('My Peer ID is: ' + id);
                this.myId = id;
                resolve(id);
            });

            this.peer.on('connection', (conn) => {
                this.handleConnection(conn);
            });

            this.peer.on('error', (err) => {
                console.error('Peer initialization error:', err);
                reject(err);
            });

            // Keep alive logic with improved reconnection
            this.peer.on('disconnected', () => {
                console.warn('Peer disconnected from signaling server. Attempting to reconnect...');
                this.attemptReconnection();
            });

            this.peer.on('close', () => {
                console.warn('Peer connection closed');
                this.attemptReconnection();
            });
        });
    }

    /**
     * Attempt to reconnect to signaling server
     */
    private attemptReconnection(): void {
        if (this._isDestroyed || this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Max reconnection attempts reached or peer manager destroyed');
            return;
        }

        this.reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000); // Exponential backoff

        console.log(`Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);

        this.reconnectTimer = setTimeout(() => {
            if (this.peer && !this._isDestroyed) {
                this.peer.reconnect();
            }
        }, delay);
    }

    /**
     * Generate a 5-character alphanumeric ID
     * @returns Random short ID
     */
    private generateShortId(): string {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let result = '';
        for (let i = 0; i < 5; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    /**
     * Connect to another peer
     * @param peerId - ID of peer to connect to
     */
    connect(peerId: string): Promise<void> {
        if (!this.peer) throw new Error("Peer not initialized");

        return new Promise((resolve, reject) => {
            const conn = this.peer!.connect(peerId);

            // Timeout to prevent hanging forever
            const timeoutId = setTimeout(() => {
                conn.close();
                reject(new Error("Connection attempt timed out (5s)"));
            }, 5000);

            conn.on('open', () => {
                clearTimeout(timeoutId);
                this.handleConnection(conn);
                resolve();
            });

            conn.on('error', (err) => {
                clearTimeout(timeoutId);
                reject(err);
            });
        });
    }

    /**
     * Handle incoming connection with improved error handling
     */
    private handleConnection(conn: DataConnection) {
        if (this._isDestroyed) return;

        console.log(`Connected to: ${conn.peer}`);
        this.connections.set(conn.peer, conn);

        // Reset reconnection attempts on successful connection
        this.reconnectAttempts = 0;

        this.emit('CONNECT', conn.peer);

        conn.on('data', (data) => {
            try {
                this.emit('DATA', { peerId: conn.peer, data: data as ProtocolMessage });
            } catch (err) {
                console.error('Error processing data from peer:', conn.peer, err);
            }
        });

        conn.on('close', () => {
            console.log(`Connection closed: ${conn.peer}`);
            this.connections.delete(conn.peer);
            this.emit('DISCONNECT', conn.peer);
        });

        conn.on('error', (err) => {
            console.error(`Connection error with peer ${conn.peer}:`, err);
            // Don't emit disconnect here as close event will handle it
        });
    }

    /**
     * Broadcast message to all connected peers
     */
    broadcast(data: ProtocolMessage) {
        this.connections.forEach(conn => {
            if (conn.open) {
                conn.send(data);
            }
        });
    }

    /**
     * Send message to specific peer
     */
    send(peerId: string, data: ProtocolMessage) {
        const conn = this.connections.get(peerId);
        if (conn && conn.open) {
            conn.send(data);
        }
    }

    /**
     * Register event handler
     */
    on<E extends PeerEvent>(event: E, callback: EventCallback<E>) {
        const key = event as unknown as PeerEvent;
        if (!this.handlers.has(key)) {
            this.handlers.set(key, []);
        }
        const callbacks = this.handlers.get(key);
        if (callbacks) {
            callbacks.push(callback as unknown as EventCallback<PeerEvent>);
        }
    }

    /**
     * Unregister event handler
     */
    off<E extends PeerEvent>(event: E, callback: EventCallback<E>) {
        const key = event as unknown as PeerEvent;
        const callbacks = this.handlers.get(key);
        if (callbacks) {
            this.handlers.set(key, callbacks.filter(cb => cb !== callback as unknown as EventCallback<PeerEvent>));
        }
    }

    /**
     * Emit internal event
     */
    private emit<E extends PeerEvent>(event: E, payload: EventPayload<E>) {
        const callbacks = this.handlers.get(event as unknown as PeerEvent);
        callbacks?.forEach(cb => {
            (cb as EventCallback<E>)(payload);
        });
    }

    /**
     * Destroy the peer manager and clean up all resources
     */
    destroy(): void {
        this._isDestroyed = true;

        // Clear reconnect timer
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }

        // Close all connections
        this.connections.forEach(conn => {
            try {
                conn.close();
            } catch (err) {
                console.warn('Error closing connection:', err);
            }
        });
        this.connections.clear();

        // Destroy peer
        if (this.peer) {
            try {
                this.peer.destroy();
            } catch (err) {
                console.warn('Error destroying peer:', err);
            }
            this.peer = null;
        }

        // Clear handlers
        this.handlers.clear();

        // Reset state
        this.myId = '';
        this.isHost = false;
        this.reconnectAttempts = 0;
    }

    /**
     * Check if peer manager is destroyed
     */
    isDestroyed(): boolean {
        return this._isDestroyed;
    }
}

export const peerManager = new PeerManager();
