/**
 * Mobile Optimization
 * Touch gestures, responsive design, haptic feedback
 */

export interface TouchGesture {
  type: 'swipe' | 'pinch' | 'tap' | 'long-press';
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
  scale?: number;
  timestamp: number;
}

/**
 * Touch gesture detector
 */
export class TouchGestureDetector {
  private startX = 0;
  private startY = 0;
  private startTime = 0;
  private initialDistance = 0;
  private longPressTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly swipeThreshold = 50;
  private readonly longPressDuration = 500;
  private listeners: Map<string, Array<(gesture: TouchGesture) => void>> = new Map();

  public init(element: HTMLElement): void {
    element.addEventListener('touchstart', (e) => this.handleTouchStart(e));
    element.addEventListener('touchmove', (e) => this.handleTouchMove(e));
    element.addEventListener('touchend', (e) => this.handleTouchEnd(e));
    element.addEventListener('touchcancel', () => this.cancelLongPress());
    console.log('[Mobile] Touch gesture detector initialized');
  }

  private handleTouchStart(event: TouchEvent): void {
    const touch = event.touches[0];
    this.startX = touch.clientX;
    this.startY = touch.clientY;
    this.startTime = Date.now();

    // Calculate initial distance for pinch
    if (event.touches.length === 2) {
      const touch2 = event.touches[1];
      this.initialDistance = this.getDistance(
        this.startX,
        this.startY,
        touch2.clientX,
        touch2.clientY
      );
    }

    // Start long press timer
    this.longPressTimer = setTimeout(() => {
      this.emit('long-press', {
        type: 'long-press',
        timestamp: Date.now()
      });
      this.longPressTimer = null;
    }, this.longPressDuration);
  }

  private handleTouchMove(event: TouchEvent): void {
    if (event.touches.length === 2) {
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      const currentDistance = this.getDistance(
        touch1.clientX,
        touch1.clientY,
        touch2.clientX,
        touch2.clientY
      );

      const scale = currentDistance / this.initialDistance;
      this.emit('pinch', {
        type: 'pinch',
        scale,
        timestamp: Date.now()
      });

      // Cancel long press on pinch
      this.cancelLongPress();
    }
  }

  private handleTouchEnd(event: TouchEvent): void {
    if (event.touches.length > 0) return;

    const touch = event.changedTouches[0];
    const endX = touch.clientX;
    const endY = touch.clientY;
    const endTime = Date.now();

    const deltaX = endX - this.startX;
    const deltaY = endY - this.startY;
    const duration = endTime - this.startTime;

    // Cancel long press on touch end
    this.cancelLongPress();

    // Detect swipe
    if (Math.abs(deltaX) > this.swipeThreshold) {
      const direction = deltaX > 0 ? 'right' : 'left';
      this.emit('swipe', {
        type: 'swipe',
        direction: direction as 'left' | 'right',
        distance: Math.abs(deltaX),
        timestamp: endTime
      });
    } else if (Math.abs(deltaY) > this.swipeThreshold) {
      const direction = deltaY > 0 ? 'down' : 'up';
      this.emit('swipe', {
        type: 'swipe',
        direction: direction as 'up' | 'down',
        distance: Math.abs(deltaY),
        timestamp: endTime
      });
    } else if (duration < 200) {
      // Tap
      this.emit('tap', {
        type: 'tap',
        timestamp: endTime
      });
    }
  }

  private getDistance(x1: number, y1: number, x2: number, y2: number): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private cancelLongPress(): void {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }

  public on(type: string, callback: (gesture: TouchGesture) => void): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)!.push(callback);
  }

  private emit(type: string, gesture: TouchGesture): void {
    const callbacks = this.listeners.get(type);
    if (callbacks) {
      callbacks.forEach(callback => callback(gesture));
    }
  }
}

/**
 * Responsive helper for mobile detection
 */
export class ResponsiveHelper {
  private mediaQueries: Map<string, MediaQueryList> = new Map();
  private listeners: Map<string, Array<(matches: boolean) => void>> = new Map();

  public init(): void {
    this.registerMediaQuery('mobile', '(max-width: 768px)');
    this.registerMediaQuery('tablet', '(min-width: 768px) and (max-width: 1024px)');
    this.registerMediaQuery('desktop', '(min-width: 1025px)');
    this.registerMediaQuery('landscape', '(orientation: landscape)');
    this.registerMediaQuery('portrait', '(orientation: portrait)');
    console.log('[Mobile] Responsive helper initialized');
  }

  private registerMediaQuery(name: string, query: string): void {
    if (typeof window === 'undefined') return;

    const mq = window.matchMedia(query);
    this.mediaQueries.set(name, mq);

    mq.addEventListener('change', (e) => {
      const callbacks = this.listeners.get(name);
      if (callbacks) {
        callbacks.forEach(callback => callback(e.matches));
      }
    });
  }

  public isMobile(): boolean {
    return this.mediaQueries.get('mobile')?.matches ?? false;
  }

  public isTablet(): boolean {
    return this.mediaQueries.get('tablet')?.matches ?? false;
  }

  public isDesktop(): boolean {
    return this.mediaQueries.get('desktop')?.matches ?? false;
  }

  public isLandscape(): boolean {
    return this.mediaQueries.get('landscape')?.matches ?? false;
  }

  public isPortrait(): boolean {
    return this.mediaQueries.get('portrait')?.matches ?? false;
  }

  public on(breakpoint: string, callback: (matches: boolean) => void): void {
    if (!this.listeners.has(breakpoint)) {
      this.listeners.set(breakpoint, []);
    }
    this.listeners.get(breakpoint)!.push(callback);
  }

  public getViewportSize(): { width: number; height: number } {
    return {
      width: window.innerWidth,
      height: window.innerHeight
    };
  }
}

/**
 * Haptic feedback for mobile devices
 */
export class HapticFeedback {
  private isSupported = false;

  constructor() {
    this.isSupported = 'vibrate' in navigator;
  }

  /**
   * Light vibration
   */
  public light(): void {
    this.vibrate(10);
  }

  /**
   * Medium vibration
   */
  public medium(): void {
    this.vibrate(30);
  }

  /**
   * Strong vibration
   */
  public strong(): void {
    this.vibrate(50);
  }

  /**
   * Pattern: tap-tap
   */
  public tap(): void {
    this.vibrate([10, 10, 10]);
  }

  /**
   * Pattern: double tap
   */
  public doubleTap(): void {
    this.vibrate([20, 20, 20]);
  }

  /**
   * Pattern: success
   */
  public success(): void {
    this.vibrate([30, 20, 30]);
  }

  /**
   * Pattern: error
   */
  public error(): void {
    this.vibrate([100, 30, 100]);
  }

  /**
   * Custom vibration pattern
   */
  public vibrate(pattern: number | number[]): void {
    if (!this.isSupported) return;

    try {
      const nav = navigator as unknown as { vibrate: (pattern: number | number[]) => boolean };
      nav.vibrate(pattern);
    } catch (error) {
      console.warn('[Mobile] Haptic feedback failed:', error);
    }
  }

  /**
   * Stop vibration
   */
  public stop(): void {
    if (!this.isSupported) return;
    navigator.vibrate(0);
  }

  public getSupported(): boolean {
    return this.isSupported;
  }
}

/**
 * Mobile-optimized canvas helper
 */
export class MobileCanvasHelper {
  private dpr: number;

  constructor(private canvas: HTMLCanvasElement) {
    let deviceRatio = 1;
    if (typeof globalThis !== 'undefined' && 'devicePixelRatio' in globalThis) {
      const dpr = Object.getOwnPropertyDescriptor(globalThis, 'devicePixelRatio')?.value;
      if (typeof dpr === 'number') {
        deviceRatio = dpr;
      }
    }
    this.dpr = deviceRatio;
  }

  /**
   * Scale canvas for device pixel ratio
   */
  public scaleCanvas(): void {
    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;

    const width = this.canvas.offsetWidth;
    const height = this.canvas.offsetHeight;

    this.canvas.width = width * this.dpr;
    this.canvas.height = height * this.dpr;

    ctx.scale(this.dpr, this.dpr);
  }

  /**
   * Get touch position relative to canvas
   */
  public getTouchPosition(event: TouchEvent): { x: number; y: number } {
    const touch = event.touches[0];
    const rect = this.canvas.getBoundingClientRect();

    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };
  }

  /**
   * Prevent zoom on double tap (iOS)
   */
  public preventZoom(): void {
    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    }, { passive: false });
  }

  /**
   * Optimize for mobile drawing
   */
  public optimizeForMobile(): void {
    this.scaleCanvas();
    this.preventZoom();
    console.log('[Mobile] Canvas optimized for mobile');
  }
}

/**
 * Mobile safe area helper (notch support)
 */
export class SafeAreaHelper {
  public getCSSVariables(): {
    '--safe-area-inset-top': string;
    '--safe-area-inset-bottom': string;
    '--safe-area-inset-left': string;
    '--safe-area-inset-right': string;
  } {
    const top = this.getCSSVariable('safe-area-inset-top') || '0px';
    const bottom = this.getCSSVariable('safe-area-inset-bottom') || '0px';
    const left = this.getCSSVariable('safe-area-inset-left') || '0px';
    const right = this.getCSSVariable('safe-area-inset-right') || '0px';

    return {
      '--safe-area-inset-top': top,
      '--safe-area-inset-bottom': bottom,
      '--safe-area-inset-left': left,
      '--safe-area-inset-right': right
    };
  }

  private getCSSVariable(name: string): string | null {
    if (typeof window === 'undefined') return null;
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  public applyToElement(element: HTMLElement): void {
    const vars = this.getCSSVariables();
    Object.entries(vars).forEach(([key, value]) => {
      element.style.setProperty(key, value);
    });
  }
}

// Global instances
export const touchGestureDetector = new TouchGestureDetector();
export const responsiveHelper = new ResponsiveHelper();
export const hapticFeedback = new HapticFeedback();
export const safeAreaHelper = new SafeAreaHelper();

/**
 * Mobile optimization hook
 */
export const useMobileOptimizations = () => {
  return {
    isMobile: responsiveHelper.isMobile(),
    isTablet: responsiveHelper.isTablet(),
    isDesktop: responsiveHelper.isDesktop(),
    haptic: {
      light: () => hapticFeedback.light(),
      medium: () => hapticFeedback.medium(),
      strong: () => hapticFeedback.strong(),
      success: () => hapticFeedback.success(),
      error: () => hapticFeedback.error()
    },
    safeArea: safeAreaHelper.getCSSVariables()
  };
};
