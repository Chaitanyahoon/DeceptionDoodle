export type GameState = 'LOBBY' | 'STARTING' | 'WORD_SELECTION' | 'DRAWING' | 'GUESSING' | 'TURN_RESULTS' | 'RESULTS';
export type GameMode = 'CLASSIC' | 'FAKE_ARTIST';

export interface GameContextState {
    currentState: GameState;
    players: Player[];
    timer: number;
    round: number;
    // Turn Logic
    currentDrawerId?: string;
    fakeArtistId?: string; // For Fake Artist mode
    wordChoices?: string[]; 
    wordToGuess?: string; 

    // Legacy / Shared
    prompt: string; 
    category?: string;
    drawings: DrawingSubmission[];
    settings: GameSettings;
    chatMessages: ChatMessage[];
    hint?: string;
    gameMode: GameMode;
}

export const INITIAL_GAME_STATE: GameContextState = {
    currentState: 'LOBBY',
    players: [],
    timer: 0,
    round: 1,
    prompt: '',
    category: '',
    drawings: [],
    settings: {
        rounds: 3,
        drawTime: 60
    },
    chatMessages: [],
    gameMode: 'CLASSIC'
};

export interface Player {
    id: string; // Peer ID
    name: string;
    avatarId: string; 
    isHost: boolean;
    score: number;
    hasSubmittedDrawing: boolean;
    hasVoted: boolean;
    hasGuessed?: boolean;
    isConnected?: boolean;
}

export interface DrawingSubmission {
    playerId: string;
    dataUrl: string; 
}

export interface GameSettings {
    rounds: number;
    drawTime: number;
    gameMode?: GameMode;
}



// ...

// Messages
export interface ChatMessage {
    id: string;
    playerId: string;
    playerName: string;
    text: string;
    type: 'CHAT' | 'GUESS' | 'SYSTEM'; // GUESS = Hidden if correct, SYSTEM = Green "Player guessed it!"
    isCorrect?: boolean;
    timestamp: number;
}

/** Represents a single drawing stroke on canvas */
export interface DrawStroke {
    x: number;
    y: number;
    lastX: number;
    lastY: number;
    color: string;
    size: number;
    isEraser: boolean;
}

/** Batched strokes for network efficiency */
export interface StrokeBatch {
    strokes: DrawStroke[];
    timestamp: number;
}

export type ProtocolMessage =
    | { type: 'JOIN_REQUEST'; payload: { name: string; avatarId: string } }
    | { type: 'GAME_STATE_UPDATE'; payload: GameContextState }
    | { type: 'PLAYER_UPDATE'; payload: { prompt?: string; category?: string } }
    | { type: 'SUBMIT_DRAWING'; payload: string }
    | { type: 'SUBMIT_VOTE'; payload: string }
    | { type: 'CHAT_MESSAGE'; payload: ChatMessage }
    | { type: 'SELECT_WORD'; payload: string }
    | { type: 'DRAW_STROKE'; payload: DrawStroke }
    | { type: 'STROKE_BATCH'; payload: StrokeBatch }
    | { type: 'STROKE_START'; payload: Record<string, never> }
    | { type: 'UNDO_STROKE'; payload: Record<string, never> }
    | { type: 'AVATAR_UPDATE'; payload: { avatarId: string } }
    | { type: 'PING'; payload: Record<string, never> }
    | { type: 'PONG'; payload: Record<string, never> };

export interface CanvasRef {
    exportImage: () => string;
    clear: () => void;
    drawRemoteStroke: (stroke: DrawStroke) => void;
    drawRemoteBatch: (batch: StrokeBatch) => void;
    saveHistory: () => void;
    undo: () => void;
}
