import React from 'react';
import { Pencil, Eraser, Trash2, PaintBucket } from 'lucide-react';

interface DrawingToolbarProps {
    color: string;
    setColor: (color: string) => void;
    brushSize: number;
    setBrushSize: (size: number) => void;
    isEraser: boolean;
    setIsEraser: (isEraser: boolean) => void;
    isFillMode: boolean;
    setIsFillMode: (isFillMode: boolean) => void;
    onClear: () => void;
}

const COLORS = [
    '#000000', // Black
    '#ffffff', // White
    '#ef4444', // Red
    '#f97316', // Orange
    '#eab308', // Yellow
    '#22c55e', // Green
    '#3b82f6', // Blue
    '#a855f7', // Purple
    '#ec4899', // Pink
    '#78716c', // Gray
];

const DrawingToolbar: React.FC<DrawingToolbarProps> = ({
    color,
    setColor,
    brushSize,
    setBrushSize,
    isEraser,
    setIsEraser,
    isFillMode,
    setIsFillMode,
    onClear,
}) => {
    return (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 card-bubble p-4 flex items-center gap-6 z-20 bg-white/90">
            {/* Tools */}
            <div className="flex items-center gap-2 border-r border-gray-200 pr-6">
                <button
                    onClick={() => {
                        setIsEraser(false);
                        setIsFillMode(false);
                    }}
                    className={`p-3 transition-all rounded-xl ${!isEraser && !isFillMode ? 'bg-primary text-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-y-1' : 'text-gray-400 hover:text-black hover:bg-black/5'
                        }`}
                >
                    <Pencil className="w-6 h-6" />
                </button>
                <button
                    onClick={() => {
                        setIsEraser(true);
                        setIsFillMode(false);
                    }}
                    className={`p-3 transition-all rounded-xl ${isEraser ? 'bg-primary text-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-y-1' : 'text-gray-400 hover:text-black hover:bg-black/5'
                        }`}
                >
                    <Eraser className="w-6 h-6" />
                </button>
                <button
                    onClick={() => {
                        setIsEraser(false);
                        setIsFillMode(true);
                    }}
                    className={`p-3 transition-all rounded-xl ${isFillMode ? 'bg-primary text-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-y-1' : 'text-gray-400 hover:text-black hover:bg-black/5'
                        }`}
                >
                    <PaintBucket className="w-6 h-6" />
                </button>
                <div className="w-[2px] h-8 bg-black/10 mx-2 rounded-full" />
                <button
                    onClick={onClear}
                    className="p-3 text-red-500 hover:bg-red-100 rounded-xl transition-colors font-bold"
                    title="Clear Canvas"
                >
                    <Trash2 className="w-6 h-6" />
                </button>
            </div>

            {/* Brush Size */}
            <div className="flex flex-col gap-2 w-32 border-r border-gray-200 pr-6">
                <div className="flex justify-between text-[10px] text-gray-500 uppercase font-black tracking-wider">
                    <span>Size</span>
                    <span>{brushSize}px</span>
                </div>
                <input
                    type="range"
                    min="2"
                    max="40"
                    value={brushSize}
                    onChange={(e) => setBrushSize(parseInt(e.target.value))}
                    className="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer border-2 border-black [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-black"
                />
            </div>

            {/* Colors */}
            <div className="flex items-center gap-2">
                {COLORS.map((c) => (
                    <button
                        key={c}
                        onClick={() => {
                            setColor(c);
                            setIsEraser(false);
                        }}
                        className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${color === c && !isEraser
                            ? 'border-black scale-110 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                            : 'border-transparent opacity-80 hover:opacity-100'
                            }`}
                        style={{ backgroundColor: c }}
                    />
                ))}
            </div>
        </div>
    );
};

export default DrawingToolbar;
