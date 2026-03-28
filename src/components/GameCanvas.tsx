import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef, useCallback } from 'react';
import type { CanvasRef, DrawStroke, StrokeBatch } from '../network/types';
import { hapticFeedback } from '../utils/mobile';

interface GameCanvasProps {
    color?: string;
    brushSize?: number;
    isEraser?: boolean;
    isAdmin?: boolean;
    isFillMode?: boolean;
    onStroke?: (stroke: DrawStroke) => void;
    onStrokeBatch?: (batch: StrokeBatch) => void;
    onStrokeStart?: () => void;
}

// Internal fixed resolution for coordinate synchronization
const INTERNAL_WIDTH = 2000;
const INTERNAL_HEIGHT = 2000;

const GameCanvas = forwardRef<CanvasRef, GameCanvasProps>(({
    color = '#000000',
    brushSize = 5,
    isEraser = false,
    isAdmin = false,
    isFillMode = false,
    onStroke,
    onStrokeBatch,
    onStrokeStart
}, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const offscreenRef = useRef<HTMLCanvasElement | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const offCtxRef = useRef<CanvasRenderingContext2D | null>(null);
    const lastPos = useRef<{ x: number, y: number } | null>(null);
    const strokeBatchRef = useRef<DrawStroke[]>([]);
    const lastBatchTimeRef = useRef<number>(0);
    const historyRef = useRef<ImageData[]>([]);

    // Initialize Offscreen Canvas
    useEffect(() => {
        const offscreen = document.createElement('canvas');
        offscreen.width = INTERNAL_WIDTH;
        offscreen.height = INTERNAL_HEIGHT;
        const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
        if (offCtx) {
            offCtx.fillStyle = '#ffffff';
            offCtx.fillRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);
            offCtx.lineCap = 'round';
            offCtx.lineJoin = 'round';
            offCtxRef.current = offCtx;
        }
        offscreenRef.current = offscreen;
    }, []);

    // Handle Visible Canvas Resize and DPR
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (ctx) ctxRef.current = ctx;

        const resizeObserver = new ResizeObserver(() => {
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            
            // Set display size
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            
            // Scale context to match DPR
            if (ctx) {
                ctx.scale(dpr, dpr);
                // Redraw from offscreen
                if (offscreenRef.current) {
                    ctx.drawImage(offscreenRef.current, 0, 0, rect.width, rect.height);
                }
            }
        });

        resizeObserver.observe(canvas);
        return () => resizeObserver.disconnect();
    }, []);

    // Sync context styles
    useEffect(() => {
        const offCtx = offCtxRef.current;
        if (offCtx) {
            offCtx.strokeStyle = isEraser ? '#ffffff' : color;
            // Map brush size from screen space to internal space
            // Assuming default screen width is around 1000px for scale 2
            offCtx.lineWidth = brushSize * (INTERNAL_WIDTH / 1000);
        }
    }, [color, brushSize, isEraser]);

    // Periodic batch flushing to prevent stuck strokes
    // flushBatch is defined below using useCallback so we declare the interval after
    // the function is available. We'll set up the interval in an effect that depends
    // on the stable flushBatch reference.

    const getInternalPos = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        
        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        // Map from client coordinates to internal fixed resolution
        return {
            x: Math.floor(((clientX - rect.left) / rect.width) * INTERNAL_WIDTH),
            y: Math.floor(((clientY - rect.top) / rect.height) * INTERNAL_HEIGHT)
        };
    };

    const drawLine = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, strokeColor: string, size: number) => {
        ctx.beginPath();
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = size;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    };

    const syncToVisible = () => {
        const canvas = canvasRef.current;
        const ctx = ctxRef.current;
        const offscreen = offscreenRef.current;
        if (!canvas || !ctx || !offscreen) return;
        
        const rect = canvas.getBoundingClientRect();
        ctx.clearRect(0, 0, rect.width, rect.height);
        ctx.drawImage(offscreen, 0, 0, rect.width, rect.height);
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if ('touches' in e) e.preventDefault();

        const offCtx = offCtxRef.current;
        if (!isDrawing || !offCtx || !canvasRef.current || isAdmin || isFillMode) return;

        const { x, y } = getInternalPos(e);
        const currentLast = lastPos.current || { x, y };

        const strokeColor = isEraser ? '#ffffff' : color;
        const internalSize = brushSize * (INTERNAL_WIDTH / 1000);

        drawLine(offCtx, currentLast.x, currentLast.y, x, y, strokeColor, internalSize);
        syncToVisible();

        const stroke: DrawStroke = {
            x, y,
            lastX: currentLast.x,
            lastY: currentLast.y,
            color: strokeColor,
            size: internalSize,
            isEraser
        };

        strokeBatchRef.current.push(stroke);
        if (strokeBatchRef.current.length >= 3) flushBatch(); // Reduced from 8 to 3 for better responsiveness

        lastPos.current = { x, y };
    };

    const flushBatch = useCallback((force = false) => {
        const now = Date.now();
        const timeSinceLastBatch = now - lastBatchTimeRef.current;

        if (strokeBatchRef.current.length > 0 && (force || strokeBatchRef.current.length >= 3 || timeSinceLastBatch > 100)) {
            if (onStrokeBatch) {
                onStrokeBatch({
                    strokes: [...strokeBatchRef.current],
                    timestamp: now
                });
            } else if (onStroke) {
                // Send the most recent stroke for immediate feedback
                onStroke(strokeBatchRef.current[strokeBatchRef.current.length - 1]);
            }
            strokeBatchRef.current = [];
            lastBatchTimeRef.current = now;
        }
    }, [onStrokeBatch, onStroke]);

    useEffect(() => {
        const interval = setInterval(() => {
            flushBatch();
        }, 50); // Flush every 50ms to ensure responsiveness

        return () => clearInterval(interval);
    }, [flushBatch]);

    const saveHistory = () => {
        const offCtx = offCtxRef.current;
        if (!offCtx) return;
        if (historyRef.current.length >= 20) historyRef.current.shift();
        historyRef.current.push(offCtx.getImageData(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT));
    };

    const undo = () => {
        const offCtx = offCtxRef.current;
        if (!offCtx || historyRef.current.length === 0) return;
        const previousState = historyRef.current.pop();
        if (previousState) {
            offCtx.putImageData(previousState, 0, 0);
            syncToVisible();
        }
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        if ('touches' in e) {
            e.preventDefault();
            hapticFeedback.light();
        }

        const { x, y } = getInternalPos(e);

        if (isFillMode) {
            saveHistory();
            if (onStrokeStart) onStrokeStart();
            floodFill(x, y, color);
            return;
        }

        setIsDrawing(true);
        saveHistory();
        if (onStrokeStart) onStrokeStart();

        lastPos.current = { x, y };
        strokeBatchRef.current = [];
        draw(e);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        lastPos.current = null;
        flushBatch(true); // Force flush any remaining strokes
    };

    const floodFill = (startX: number, startY: number, fillColor: string, emit = true) => {
        const offCtx = offCtxRef.current;
        if (!offCtx) return;

        const imageData = offCtx.getImageData(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);
        const data = imageData.data;

        const getColorAt = (px: number, py: number) => {
            const index = (py * INTERNAL_WIDTH + px) * 4;
            return { r: data[index], g: data[index + 1], b: data[index + 2], a: data[index + 3] };
        };

        const hexToRgb = (hex: string) => {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return { r, g, b, a: 255 };
        };

        const matchColor = (index: number, target: { r: number; g: number; b: number; a: number }) => {
            const dr = data[index] - target.r;
            const dg = data[index + 1] - target.g;
            const db = data[index + 2] - target.b;
            return (dr * dr + dg * dg + db * db) < 1024;
        };

        const targetColor = getColorAt(startX, startY);
        const replacementColor = hexToRgb(fillColor);

        if (targetColor.r === replacementColor.r && targetColor.g === replacementColor.g && targetColor.b === replacementColor.b) return;

        const stack = [[startX, startY]];
        while (stack.length) {
            const [curX, curY] = stack.pop()!;
            let xPos = curX;
            let idx = (curY * INTERNAL_WIDTH + xPos) * 4;

            while (xPos >= 0 && matchColor(idx, targetColor)) { xPos--; idx -= 4; }
            xPos++; idx += 4;

            let spanAbove = false, spanBelow = false;
            while (xPos < INTERNAL_WIDTH && matchColor(idx, targetColor)) {
                data[idx] = replacementColor.r;
                data[idx + 1] = replacementColor.g;
                data[idx + 2] = replacementColor.b;
                data[idx + 3] = 255;

                if (curY > 0) {
                    const aboveIdx = idx - INTERNAL_WIDTH * 4;
                    const aboveMatch = matchColor(aboveIdx, targetColor);
                    if (!spanAbove && aboveMatch) { stack.push([xPos, curY - 1]); spanAbove = true; }
                    else if (spanAbove && !aboveMatch) { spanAbove = false; }
                }
                if (curY < INTERNAL_HEIGHT - 1) {
                    const belowIdx = idx + INTERNAL_WIDTH * 4;
                    const belowMatch = matchColor(belowIdx, targetColor);
                    if (!spanBelow && belowMatch) { stack.push([xPos, curY + 1]); spanBelow = true; }
                    else if (spanBelow && !belowMatch) { spanBelow = false; }
                }
                xPos++; idx += 4;
            }
        }

        offCtx.putImageData(imageData, 0, 0);
        syncToVisible();

        if (onStroke && emit) {
            onStroke({ x: startX, y: startY, lastX: startX, lastY: startY, color: fillColor, size: 0, isEraser: false });
        }
    };

    useImperativeHandle(ref, () => ({
        exportImage: () => offscreenRef.current?.toDataURL('image/png') || '',
        clear: () => {
            if (offCtxRef.current) {
                offCtxRef.current.fillStyle = '#ffffff';
                offCtxRef.current.fillRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);
                syncToVisible();
            }
        },
        drawRemoteStroke: (stroke: DrawStroke) => {
            if (stroke.size === 0) floodFill(stroke.x, stroke.y, stroke.color, false);
            else if (offCtxRef.current) {
                drawLine(offCtxRef.current, stroke.lastX, stroke.lastY, stroke.x, stroke.y, stroke.color, stroke.size);
                syncToVisible();
            }
        },
        drawRemoteBatch: (batch: StrokeBatch) => {
            if (offCtxRef.current) {
                batch.strokes.forEach(s => drawLine(offCtxRef.current!, s.lastX, s.lastY, s.x, s.y, s.color, s.size));
                syncToVisible();
            }
        },
        saveHistory,
        undo
    }));

    return (
        <div className={`w-full h-full bg-white rounded-xl shadow-2xl overflow-hidden relative group ${isAdmin ? 'cursor-not-allowed pointer-events-none' : 'cursor-crosshair'}`}>
            <canvas
                ref={canvasRef}
                className="w-full h-full touch-none"
                style={{ touchAction: 'none' }}
                onMouseDown={startDrawing}
                onMouseUp={stopDrawing}
                onMouseOut={stopDrawing}
                onMouseMove={draw}
                onTouchStart={startDrawing}
                onTouchEnd={stopDrawing}
                onTouchMove={draw}
            />
            {!isAdmin && (
                <div className="absolute top-4 right-4 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity text-black font-bold">
                    Draw Here
                </div>
            )}
        </div>
    );
});

export default GameCanvas;

