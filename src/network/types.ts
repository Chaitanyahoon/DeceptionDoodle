export type GameState = 'LOBBY' | 'STARTING' | 'DRAWING' | 'GUESSING' | 'RESULTS';

export interface Player {
    id: string; // Peer ID
    name: string;
    avatar?: string;
    isHost: boolean;
    score: number;
    hasSubmittedDrawing: boolean;
    hasVoted: boolean;
}

export interface DrawingSubmission {
    playerId: string;
    dataUrl: string; // Base64 image
}

export interface GameSettings {
    rounds: number;
    drawTime: number;
}

export interface GameContextState {
    currentState: GameState;
    players: Player[];
    timer: number;
    round: number;
    prompt: string; // Only set for the specific player (Real or Fake)
    category?: string;
    drawings: DrawingSubmission[]; // Only visible in GUESSING state
    settings: GameSettings;
}

// ...

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
    }
};
