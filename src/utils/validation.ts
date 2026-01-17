/**
 * Input validation utilities for game logic
 */

/**
 * Validate a word selection
 */
export const validateWordSelection = (word: string): boolean => {
    return (
        typeof word === 'string' &&
        word.trim().length > 0 &&
        word.trim().length < 50
    );
};

/**
 * Validate a player name
 */
export const validatePlayerName = (name: string): boolean => {
    return (
        typeof name === 'string' &&
        name.trim().length > 0 &&
        name.trim().length <= 20
    );
};

/**
 * Validate a guess/message
 */
export const validateGuess = (guess: string): boolean => {
    return (
        typeof guess === 'string' &&
        guess.trim().length > 0 &&
        guess.trim().length < 100
    );
};

/**
 * Sanitize player name - removes extra whitespace and limits length
 */
export const sanitizeName = (name: string): string => {
    return name.trim().slice(0, 20);
};

/**
 * Sanitize message text - removes extra whitespace and limits length
 */
export const sanitizeMessage = (message: string): string => {
    return message.trim().slice(0, 100);
};

/**
 * Check if guess is a duplicate in chat history
 */
export const isDuplicateGuess = (
    newGuess: string,
    playerId: string,
    chatHistory: Array<{ playerId: string; text: string }>
): boolean => {
    const normalizedGuess = newGuess.toLowerCase().trim();
    return chatHistory.some(
        msg =>
            msg.playerId === playerId &&
            msg.text.toLowerCase().trim() === normalizedGuess
    );
};

/**
 * Rate limit checker - returns true if message can be sent
 */
export class RateLimiter {
    private timestamps: number[] = [];
    private readonly maxMessages: number;
    private readonly windowMs: number;

    constructor(maxMessages: number = 5, windowMs: number = 1000) {
        this.maxMessages = maxMessages;
        this.windowMs = windowMs;
    }

    canSend(): boolean {
        const now = Date.now();
        // Remove old timestamps outside the window
        this.timestamps = this.timestamps.filter(t => now - t < this.windowMs);
        
        if (this.timestamps.length < this.maxMessages) {
            this.timestamps.push(now);
            return true;
        }
        return false;
    }

    reset(): void {
        this.timestamps = [];
    }
}

/**
 * Validate drawing was actually created (not blank)
 */
export const validateDrawingSubmission = (
    dataUrl: string
): { valid: boolean; reason?: string } => {
    if (!dataUrl || typeof dataUrl !== 'string') {
        return { valid: false, reason: 'Invalid data URL format' };
    }

    if (!dataUrl.startsWith('data:image')) {
        return { valid: false, reason: 'Invalid image data' };
    }

    // Check if image is not entirely blank (rough check)
    // In production, might want to check pixel data
    if (dataUrl.length < 100) {
        return { valid: false, reason: 'Drawing appears to be blank' };
    }

    return { valid: true };
};

/**
 * Validate game settings
 */
export const validateGameSettings = (
    rounds: unknown,
    drawTime: unknown
): { valid: boolean; reason?: string } => {
    if (typeof rounds !== 'number' || rounds < 1 || rounds > 20) {
        return { valid: false, reason: 'Rounds must be between 1 and 20' };
    }

    if (typeof drawTime !== 'number' || drawTime < 10 || drawTime > 300) {
        return {
            valid: false,
            reason: 'Draw time must be between 10 and 300 seconds'
        };
    }

    return { valid: true };
};
