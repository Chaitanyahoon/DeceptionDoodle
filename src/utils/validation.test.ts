import { describe, it, expect, beforeEach } from 'vitest';
import {
    validateWordSelection,
    validatePlayerName,
    validateGuess,
    sanitizeName,
    sanitizeMessage,
    isDuplicateGuess,
    RateLimiter,
    validateDrawingSubmission,
    validateGameSettings
} from './validation';

describe('Validation Utilities', () => {
    describe('validateWordSelection', () => {
        it('should accept valid words', () => {
            expect(validateWordSelection('Cat')).toBe(true);
            expect(validateWordSelection('Tornado')).toBe(true);
        });

        it('should reject empty words', () => {
            expect(validateWordSelection('')).toBe(false);
            expect(validateWordSelection('   ')).toBe(false);
        });

        it('should reject words longer than 50 characters', () => {
            expect(validateWordSelection('a'.repeat(51))).toBe(false);
        });

        it('should reject non-string input', () => {
            expect(validateWordSelection(null as unknown as string)).toBe(false);
        });
    });

    describe('validatePlayerName', () => {
        it('should accept valid names', () => {
            expect(validatePlayerName('Alice')).toBe(true);
            expect(validatePlayerName('Bob')).toBe(true);
        });

        it('should reject names longer than 20 characters', () => {
            expect(validatePlayerName('a'.repeat(21))).toBe(false);
        });

        it('should reject empty names', () => {
            expect(validatePlayerName('')).toBe(false);
        });
    });

    describe('validateGuess', () => {
        it('should accept valid guesses', () => {
            expect(validateGuess('Cat')).toBe(true);
            expect(validateGuess('Is this a dog?')).toBe(true);
        });

        it('should reject empty guesses', () => {
            expect(validateGuess('')).toBe(false);
        });

        it('should reject guesses longer than 100 characters', () => {
            expect(validateGuess('a'.repeat(101))).toBe(false);
        });
    });

    describe('sanitizeName', () => {
        it('should trim whitespace', () => {
            expect(sanitizeName('  Alice  ')).toBe('Alice');
        });

        it('should truncate long names', () => {
            expect(sanitizeName('a'.repeat(25))).toHaveLength(20);
        });
    });

    describe('sanitizeMessage', () => {
        it('should trim whitespace', () => {
            expect(sanitizeMessage('  Hello  ')).toBe('Hello');
        });

        it('should truncate long messages', () => {
            expect(sanitizeMessage('a'.repeat(150))).toHaveLength(100);
        });
    });

    describe('isDuplicateGuess', () => {
        const chatHistory = [
            { playerId: 'player1', text: 'Cat' },
            { playerId: 'player1', text: 'Dog' },
            { playerId: 'player2', text: 'Cat' }
        ];

        it('should detect duplicate guesses from same player', () => {
            expect(isDuplicateGuess('Cat', 'player1', chatHistory)).toBe(true);
        });

        it('should allow same guess from different player', () => {
            expect(isDuplicateGuess('Cat', 'player3', chatHistory)).toBe(false);
        });

        it('should ignore case differences', () => {
            expect(isDuplicateGuess('cat', 'player1', chatHistory)).toBe(true);
        });
    });

    describe('RateLimiter', () => {
        let limiter: RateLimiter;

        beforeEach(() => {
            limiter = new RateLimiter(3, 1000);
        });

        it('should allow messages within limit', () => {
            expect(limiter.canSend()).toBe(true);
            expect(limiter.canSend()).toBe(true);
            expect(limiter.canSend()).toBe(true);
        });

        it('should reject messages exceeding limit', () => {
            limiter.canSend();
            limiter.canSend();
            limiter.canSend();
            expect(limiter.canSend()).toBe(false);
        });

        it('should reset on reset()', () => {
            limiter.canSend();
            limiter.canSend();
            limiter.canSend();
            expect(limiter.canSend()).toBe(false);
            limiter.reset();
            expect(limiter.canSend()).toBe(true);
        });
    });

    describe('validateDrawingSubmission', () => {
        it('should accept valid drawing data', () => {
            const validDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
            expect(validateDrawingSubmission(validDataUrl).valid).toBe(true);
        });

        it('should reject non-image data', () => {
            expect(validateDrawingSubmission('data:text/plain,hello').valid).toBe(false);
        });

        it('should reject invalid format', () => {
            expect(validateDrawingSubmission('not-a-data-url').valid).toBe(false);
        });
    });

    describe('validateGameSettings', () => {
        it('should accept valid settings', () => {
            expect(validateGameSettings(3, 60).valid).toBe(true);
            expect(validateGameSettings(5, 120).valid).toBe(true);
        });

        it('should reject invalid round counts', () => {
            expect(validateGameSettings(0, 60).valid).toBe(false);
            expect(validateGameSettings(21, 60).valid).toBe(false);
        });

        it('should reject invalid draw times', () => {
            expect(validateGameSettings(3, 5).valid).toBe(false);
            expect(validateGameSettings(3, 400).valid).toBe(false);
        });
    });
});
