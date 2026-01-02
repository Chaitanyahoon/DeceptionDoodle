import { Peer } from 'peerjs';
import type { DataConnection } from 'peerjs';

export type PeerEvent = 'CONNECT' | 'DISCONNECT' | 'DATA';

export class PeerManager {
    private peer: Peer | null = null;
    private connections: Map<string, DataConnection> = new Map(); // peerId -> Connection
    private handlers: Map<string, Function[]> = new Map();
    public myId: string = '';
    public isHost: boolean = false;

    constructor() {
        // Handlers
    }

    initialize(hostId?: string): Promise<string> {
        return new Promise((resolve, reject) => {
            // Generate a 5-char alphanumeric ID if one isn't provided (Host mode)
            // Or use the provided ID (Join mode - actually PeerJS client doesn't pick their own ID usually when joining, 
            // but for 'Host' we want a specific ID. 
            // WAIT: 'hostId' arg here seems unused in previous logic? 
            // Let's make it so:
            // 1. If we are HOSTING, we generate a short ID and claim it.
            // 2. If we are JOINING, we let PeerJS assign us a random ID (default behavior) or we claim a random one.
            // Actually, for simplicity, everyone can use a random short ID or random PeerJS ID.
            // The constraint is: The HOST needs a short, shareable ID.

            // Let's just try to claim a short ID.
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
                console.error(err);
                // If ID is taken (unavailable-id), we should retry with a new one if we generated it.
                // For MVP, just reject.
                reject(err);
            });
        });
    }

    private generateShortId(): string {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed I, O, 0, 1 for clarity
        let result = '';
        for (let i = 0; i < 5; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    connect(peerId: string): Promise<void> {
        if (!this.peer) throw new Error("Peer not initialized");

        return new Promise((resolve, reject) => {
            const conn = this.peer!.connect(peerId);

            conn.on('open', () => {
                this.handleConnection(conn);
                resolve();
            });

            conn.on('error', (err) => {
                reject(err);
            });
        });
    }

    private handleConnection(conn: DataConnection) {
        console.log(`Connected to: ${conn.peer}`);
        this.connections.set(conn.peer, conn);

        // Convert PeerJS events to our internal event system
        this.emit('CONNECT', conn.peer);

        conn.on('data', (data) => {
            this.emit('DATA', { peerId: conn.peer, data });
        });

        conn.on('close', () => {
            console.log(`Connection closed: ${conn.peer}`);
            this.connections.delete(conn.peer);
            this.emit('DISCONNECT', conn.peer);
        });
    }

    broadcast(data: any) {
        this.connections.forEach(conn => {
            if (conn.open) {
                conn.send(data);
            }
        });
    }

    send(peerId: string, data: any) {
        const conn = this.connections.get(peerId);
        if (conn && conn.open) {
            conn.send(data);
        }
    }

    on(event: string, callback: Function) {
        if (!this.handlers.has(event)) {
            this.handlers.set(event, []);
        }
        this.handlers.get(event)?.push(callback);
    }

    off(event: string, callback: Function) {
        const callbacks = this.handlers.get(event);
        if (callbacks) {
            this.handlers.set(event, callbacks.filter(cb => cb !== callback));
        }
    }

    private emit(event: string, payload: any) {
        this.handlers.get(event)?.forEach(cb => cb(payload));
    }
}

export const peerManager = new PeerManager();
