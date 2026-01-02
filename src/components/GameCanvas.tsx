import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';

export interface CanvasRef {
    exportImage: () => string;
    clear: () => void;
    drawRemoteStroke: (stroke: { x: number, y: number, lastX: number, lastY: number, color: string, size: number, isEraser: boolean }) => void;
}

interface GameCanvasProps {
    color?: string;
    brushSize?: number;
    isEraser?: boolean;
    isAdmin?: boolean;
    onExport?: (dataUrl: string) => void;
    onStroke?: (stroke: { x: number, y: number, lastX: number, lastY: number, color: string, size: number, isEraser: boolean }) => void;
}

const GameCanvas = forwardRef<CanvasRef, GameCanvasProps>(({
    color = '#000000',
    brushSize = 5,
    isEraser = false,
    isAdmin = false,
    onExport,
    onStroke
}, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
    const lastPos = useRef<{ x: number, y: number } | null>(null);

    // Update Context when props change
    useEffect(() => {
        if (ctx) {
            ctx.strokeStyle = isEraser ? '#ffffff' : color;
            ctx.lineWidth = brushSize;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
        }
    }, [ctx, color, brushSize, isEraser]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (context) {
            context.lineCap = 'round';
            context.lineJoin = 'round';
            context.fillStyle = '#ffffff';
            context.fillRect(0, 0, canvas.width, canvas.height); // Initial white bg
            setCtx(context);
        }

        // Resize handler
        const resizeObserver = new ResizeObserver(() => {
            if (context && canvas.width > 0 && canvas.height > 0) {
                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                // Set canvas size to match parent container
                canvas.width = canvas.offsetWidth;
                canvas.height = canvas.offsetHeight;
                context.putImageData(imageData, 0, 0);

                // Restore context settings
                context.lineCap = 'round';
                context.lineJoin = 'round';
                context.strokeStyle = isEraser ? '#ffffff' : color;
                context.lineWidth = brushSize;
            } else {
                canvas.width = canvas.offsetWidth;
                canvas.height = canvas.offsetHeight;
                if (context) {
                    context.fillStyle = '#ffffff';
                    context.fillRect(0, 0, canvas.width, canvas.height);
                }
            }
        });

        if (canvas.parentElement) {
            resizeObserver.observe(canvas.parentElement);
        }

        return () => resizeObserver.disconnect();
    }, []);

    const getPos = (e: React.MouseEvent | React.TouchEvent) => {
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
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || !ctx || !canvasRef.current || isAdmin) return;

        const { x, y } = getPos(e);
        const currentLast = lastPos.current || { x, y };

        ctx.beginPath();
        ctx.moveTo(currentLast.x, currentLast.y);
        ctx.lineTo(x, y);
        ctx.stroke();

        if (onStroke) {
            onStroke({
                x, y,
                lastX: currentLast.x,
                lastY: currentLast.y,
                color: isEraser ? '#ffffff' : color,
                size: brushSize,
                isEraser
            });
        }

        lastPos.current = { x, y };
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDrawing(true);
        const { x, y } = getPos(e);
        lastPos.current = { x, y };
        draw(e);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        lastPos.current = null;
        ctx?.beginPath(); // Reset path
    };

    // Helper for remote strokes
    const drawRemoteStrokeInternal = (stroke: { x: number, y: number, lastX: number, lastY: number, color: string, size: number }) => {
        if (!ctx) return;
        const { x, y, lastX, lastY, color: strokeColor, size } = stroke;
        const prevStyle = ctx.strokeStyle;
        const prevWidth = ctx.lineWidth;

        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = size;
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();

        // Restore context if not admin (though usually admin is viewing so restoration isn't critical for them, but critical if they become drawer)
        if (!isAdmin) {
            ctx.strokeStyle = prevStyle;
            ctx.lineWidth = prevWidth;
        }
    };

    useImperativeHandle(ref, () => ({
        exportImage: () => {
            if (!canvasRef.current) return '';
            return canvasRef.current.toDataURL('image/png') || '';
        },
        clear: () => {
            const canvas = canvasRef.current;
            if (canvas && ctx) {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
        },
        drawRemoteStroke: (stroke) => {
            drawRemoteStrokeInternal(stroke);
        }
    }));

    return (
        <div className={`w-full h-[500px] bg-white rounded-xl shadow-2xl overflow-hidden border-4 border-primary/20 relative group ${isAdmin ? 'cursor-not-allowed pointer-events-none' : 'cursor-crosshair'}`}>
            <canvas
                ref={canvasRef}
                className="w-full h-full touch-none pb-[safe]"
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
