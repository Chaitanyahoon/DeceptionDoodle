import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';

export interface CanvasRef {
    exportImage: () => string;
    clear: () => void;
}

interface GameCanvasProps {
    color?: string;
    brushSize?: number;
    isEraser?: boolean;
    isAdmin?: boolean;
    onExport?: (dataUrl: string) => void;
}

const GameCanvas = forwardRef<CanvasRef, GameCanvasProps>(({
    color = '#000000',
    brushSize = 5,
    isEraser = false,
    isAdmin = false,
    onExport
}, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);

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
            // Save content? For now just reset.
            // Ideally we need an offscreen canvas to save content on resize.
            // But for this game, resizing mid-drawing is rare/acceptable to clear or clip.
            // Let's just avoid clearing if possible, but canvas needs clear on resize usually.

            // Simple fix: Don't clear if dimensions barely changed, or accept clear.
            // Better: Copy image data.
            if (context && canvas.width > 0 && canvas.height > 0) {
                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
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
        resizeObserver.observe(canvas.parentElement!);

        return () => resizeObserver.disconnect();
    }, []);

    useImperativeHandle(ref, () => ({
        exportImage: () => {
            if (!canvasRef.current) return '';
            // Ensure white background is exported if transparent parts exist
            // Actually, we fillRect white on init, so it should be fine unless erased with clearRect.
            // Eraser uses white stroke, so it's fine.
            return canvasRef.current.toDataURL('image/png') || '';
        },
        clear: () => {
            const canvas = canvasRef.current;
            if (canvas && ctx) {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
        }
    }));

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDrawing(true);
        draw(e);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        ctx?.beginPath();
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || !ctx || !canvasRef.current || isAdmin) return; // Prevent drawing if admin/view-only

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();

        let clientX, clientY;
        if ('touches' in e) {
            // Prevent scrolling while drawing
            // e.preventDefault(); // React synthetic event doesn't always support this directly in passive listeners
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        // Scale coordinates logic if canvas is scaled via CSS? 
        // Currently assuming 1:1 pixel mapping due to resize observer setting width/height.
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    return (
        <div className="w-full h-[500px] bg-white rounded-xl shadow-2xl overflow-hidden border-4 border-primary/20 relative group">
            <canvas
                ref={canvasRef}
                className="w-full h-full touch-none cursor-crosshair pb-[safe]"
                onMouseDown={startDrawing}
                onMouseUp={stopDrawing}
                onMouseOut={stopDrawing}
                onMouseMove={draw}
                onTouchStart={startDrawing}
                onTouchEnd={stopDrawing}
                onTouchMove={draw}
            />
            <div className="absolute top-4 right-4 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity text-black font-bold">
                Draw Here
            </div>
        </div>
    );
});

export default GameCanvas;
