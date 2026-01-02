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
    isFillMode?: boolean;
    onStroke?: (stroke: { x: number, y: number, lastX: number, lastY: number, color: string, size: number, isEraser: boolean }) => void;
}

const GameCanvas = forwardRef<CanvasRef, GameCanvasProps>(({
    color = '#000000',
    brushSize = 5,
    isEraser = false,
    isAdmin = false,
    isFillMode = false,
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
            x: Math.floor(clientX - rect.left),
            y: Math.floor(clientY - rect.top)
        };
    };

    // Flood Fill Algorithm
    const floodFill = (startX: number, startY: number, fillColor: string) => {
        if (!ctx || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const width = canvas.width;
        const height = canvas.height;

        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        // Helper to get color at pixel
        const getColorAt = (x: number, y: number) => {
            const index = (y * width + x) * 4;
            return {
                r: data[index],
                g: data[index + 1],
                b: data[index + 2],
                a: data[index + 3]
            };
        };

        // Parse hex color to RGB
        const hexToRgb = (hex: string) => {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return { r, g, b, a: 255 };
        };

        const targetColor = getColorAt(startX, startY);
        const replacementColor = hexToRgb(fillColor);

        // Don't fill if same color
        if (targetColor.r === replacementColor.r &&
            targetColor.g === replacementColor.g &&
            targetColor.b === replacementColor.b) return;

        const stack = [[startX, startY]];

        while (stack.length) {
            const [x, y] = stack.pop()!;
            let currentX = x;

            let index = (y * width + currentX) * 4;
            while (currentX >= 0 && matchColor(data, index, targetColor)) {
                currentX--;
                index -= 4;
            }
            currentX++;
            index += 4;

            let spanAbove = false;
            let spanBelow = false;

            while (currentX < width && matchColor(data, index, targetColor)) {
                setColor(data, index, replacementColor);

                if (y > 0) {
                    const aboveIndex = index - width * 4;
                    if (matchColor(data, aboveIndex, targetColor)) {
                        if (!spanAbove) {
                            stack.push([currentX, y - 1]);
                            spanAbove = true;
                        }
                    } else if (spanAbove) {
                        spanAbove = false;
                    }
                }

                if (y < height - 1) {
                    const belowIndex = index + width * 4;
                    if (matchColor(data, belowIndex, targetColor)) {
                        if (!spanBelow) {
                            stack.push([currentX, y + 1]);
                            spanBelow = true;
                        }
                    } else if (spanBelow) {
                        spanBelow = false;
                    }
                }

                currentX++;
                index += 4;
            }
        }

        ctx.putImageData(imageData, 0, 0);

        // Notify Remote (Simplified: Send Center coordinate + Color, receiver runs fill)
        if (onStroke) {
            onStroke({
                x: startX, y: startY,
                lastX: startX, lastY: startY,
                color: fillColor,
                size: 0, // 0 size marks a Fill event
                isEraser: false
            });
        }
    };

    const matchColor = (data: Uint8ClampedArray, index: number, target: { r: number, g: number, b: number, a: number }) => {
        return data[index] === target.r &&
            data[index + 1] === target.g &&
            data[index + 2] === target.b;
        // Ignore Alpha for basic check or match it too
    };

    const setColor = (data: Uint8ClampedArray, index: number, color: { r: number, g: number, b: number, a: number }) => {
        data[index] = color.r;
        data[index + 1] = color.g;
        data[index + 2] = color.b;
        data[index + 3] = 255;
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || !ctx || !canvasRef.current || isAdmin || isFillMode) return; // Ignore draw in fill mode

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
        const { x, y } = getPos(e);

        if (isFillMode) {
            floodFill(x, y, color);
            return;
        }

        setIsDrawing(true);
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
