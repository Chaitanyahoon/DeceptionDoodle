/**
 * Network resilience utilities for connection handling and retries
 */

/**
 * Exponential backoff calculator
 */
export class ExponentialBackoff {
    private retryCount: number = 0;
    private readonly maxRetries: number;
    private readonly initialDelayMs: number;
    private readonly maxDelayMs: number;

    constructor(
        maxRetries: number = 5,
        initialDelayMs: number = 1000,
        maxDelayMs: number = 30000
    ) {
        this.maxRetries = maxRetries;
        this.initialDelayMs = initialDelayMs;
        this.maxDelayMs = maxDelayMs;
    }

    /**
     * Get delay for current retry count
     */
    getDelay(): number {
        const delay = this.initialDelayMs * Math.pow(2, this.retryCount);
        return Math.min(delay, this.maxDelayMs);
    }

    /**
     * Get jitter to prevent thundering herd
     */
    getDelayWithJitter(): number {
        const delay = this.getDelay();
        const jitter = Math.random() * delay * 0.1; // 10% jitter
        return delay + jitter;
    }

    /**
     * Check if we can retry
     */
    canRetry(): boolean {
        return this.retryCount < this.maxRetries;
    }

    /**
     * Increment retry count
     */
    incrementRetry(): void {
        if (this.canRetry()) {
            this.retryCount++;
        }
    }

    /**
     * Reset retry count
     */
    reset(): void {
        this.retryCount = 0;
    }

    /**
     * Get current retry count
     */
    getRetryCount(): number {
        return this.retryCount;
    }
}

/**
 * Connection state manager with timeout detection
 */
export class ConnectionMonitor {
    private lastHeartbeatTime: number = Date.now();
    private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
    private timeoutTimer: ReturnType<typeof setTimeout> | null = null;
    private readonly heartbeatInterval: number;
    private readonly timeoutThreshold: number;
    private onTimeout: (() => void) | null = null;
    private onHeartbeat: (() => void) | null = null;

    constructor(
        heartbeatInterval: number = 5000,
        timeoutThreshold: number = 15000
    ) {
        this.heartbeatInterval = heartbeatInterval;
        this.timeoutThreshold = timeoutThreshold;
    }

    /**
     * Start monitoring connection
     */
    start(onHeartbeat: () => void, onTimeout: () => void): void {
        this.onHeartbeat = onHeartbeat;
        this.onTimeout = onTimeout;
        this.lastHeartbeatTime = Date.now();

        this.heartbeatTimer = setInterval(() => {
            this.onHeartbeat?.();
        }, this.heartbeatInterval);

        this.resetTimeoutDetection();
    }

    /**
     * Reset timeout detection timer
     */
    resetTimeoutDetection(): void {
        if (this.timeoutTimer !== null) {
            clearTimeout(this.timeoutTimer);
        }

        this.timeoutTimer = setTimeout(() => {
            console.warn('Connection timeout detected');
            this.onTimeout?.();
        }, this.timeoutThreshold);

        this.lastHeartbeatTime = Date.now();
    }

    /**
     * Record heartbeat received
     */
    recordHeartbeat(): void {
        this.lastHeartbeatTime = Date.now();
        this.resetTimeoutDetection();
    }

    /**
     * Stop monitoring
     */
    stop(): void {
        if (this.heartbeatTimer !== null) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
        if (this.timeoutTimer !== null) {
            clearTimeout(this.timeoutTimer);
            this.timeoutTimer = null;
        }
    }

    /**
     * Get time since last heartbeat
     */
    getTimeSinceLastHeartbeat(): number {
        return Date.now() - this.lastHeartbeatTime;
    }

    /**
     * Check if connection is suspected lost
     */
    isLikelyDisconnected(): boolean {
        return this.getTimeSinceLastHeartbeat() > this.timeoutThreshold;
    }
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 5,
    initialDelayMs: number = 1000
): Promise<T> {
    const backoff = new ExponentialBackoff(maxRetries, initialDelayMs);

    while (true) {
        try {
            return await fn();
        } catch (error) {
            if (!backoff.canRetry()) {
                throw error;
            }

            const delayMs = backoff.getDelayWithJitter();
            console.log(
                `Retry ${backoff.getRetryCount() + 1}/${maxRetries} after ${delayMs}ms`,
                error
            );

            await new Promise(resolve => setTimeout(resolve, delayMs));
            backoff.incrementRetry();
        }
    }
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
    fn: T,
    delayMs: number
): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    return (...args: Parameters<T>) => {
        if (timeoutId !== null) {
            clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(() => {
            fn(...args);
            timeoutId = null;
        }, delayMs);
    };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
    fn: T,
    delayMs: number
): (...args: Parameters<T>) => void {
    let lastCallTime: number = 0;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    return (...args: Parameters<T>) => {
        const now = Date.now();
        const timeSinceLastCall = now - lastCallTime;

        if (timeSinceLastCall >= delayMs) {
            fn(...args);
            lastCallTime = now;
        } else if (timeoutId === null) {
            timeoutId = setTimeout(() => {
                fn(...args);
                lastCallTime = Date.now();
                timeoutId = null;
            }, delayMs - timeSinceLastCall);
        }
    };
}
