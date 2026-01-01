import React from 'react';
import { Pencil, Eraser, Trash2, Undo } from 'lucide-react';

interface DrawingToolbarProps {
    color: string;
    setColor: (color: string) => void;
    brushSize: number;
    setBrushSize: (size: number) => void;
    isEraser: boolean;
    setIsEraser: (isEraser: boolean) => void;
    onClear: () => void;
    onUndo?: () => void;
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
    onClear,
    onUndo
}) => {
    return (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-surface/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl flex items-center gap-6 z-20">
            {/* Tools */}
            <div className="flex items-center gap-2 border-r border-white/10 pr-6">
                <button
                    onClick={() => setIsEraser(false)}
                    className={`p-3 rounded-xl transition-all ${!isEraser ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                >
                    <Pencil className="w-5 h-5" />
                </button>
                <button
                    onClick={() => setIsEraser(true)}
                    className={`p-3 rounded-xl transition-all ${isEraser ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                >
                    <Eraser className="w-5 h-5" />
                </button>
                <div className="w-[1px] h-8 bg-white/10 mx-2" />
                <button
                    onClick={onClear}
                    className="p-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Clear Canvas"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>

            {/* Brush Size */}
            <div className="flex flex-col gap-2 w-32 border-r border-white/10 pr-6">
                <div className="flex justify-between text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                    <span>Size</span>
                    <span>{brushSize}px</span>
                </div>
                <input
                    type="range"
                    min="2"
                    max="40"
                    value={brushSize}
                    onChange={(e) => setBrushSize(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-black/40 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
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
                                ? 'border-white scale-110 shadow-lg shadow-white/20'
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
