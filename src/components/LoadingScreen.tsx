import React, { useEffect, useState } from 'react';
import { Zap, WifiOff } from 'lucide-react';

interface LoadingScreenProps {
    status: 'connecting' | 'reconnecting' | 'disconnected' | 'error';
    text?: string;
    onRetry?: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ status, text, onRetry }) => {
    const [loadingText, setLoadingText] = useState("SHARPENING PENCILS...");

    useEffect(() => {
        const messages = [
            "SHARPENING PENCILS...",
            "MIXING COLORS...",
            "SUMMONING ARTISTS...",
            "FINDING ERASERS...",
            "LOADING DOODLES..."
        ];
        let i = 0;
        const interval = setInterval(() => {
            i = (i + 1) % messages.length;
            setLoadingText(messages[i]);
        }, 800);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-yellow-50 relative overflow-hidden selection:bg-pink-200">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                    backgroundImage: `radial-gradient(#000 1.5px, transparent 1.5px)`,
                    backgroundSize: '24px 24px'
                }}
            />

            <div className="relative z-10 flex flex-col items-center max-w-md w-full px-8">
                {/* Visual */}
                <div className="mb-8 relative">
                    <div className="absolute inset-0 bg-yellow-300 rounded-full blur-xl opacity-50 animate-pulse" />
                    {status === 'disconnected' || status === 'error' ? (
                        <div className="w-32 h-32 md:w-48 md:h-48 flex items-center justify-center relative z-10 animate-shake">
                            <WifiOff size={80} className="text-red-500/80 drop-shadow-sm" />
                        </div>
                    ) : (
                        <img src="/logo.png" alt="Loading..." className="w-32 h-32 md:w-48 md:h-48 drop-shadow-xl animate-bounce relative z-10" />
                    )}
                </div>

                {/* Status Box */}
                <div className="bg-white border-[4px] border-black px-8 py-6 rounded-3xl shadow-[8px_8px_0px_#000] rotate-1 transition-transform hover:rotate-0 w-full text-center">

                    {status === 'reconnecting' && (
                        <div className="mb-4 flex justify-center">
                            <span className="bg-yellow-100 text-yellow-800 text-xs font-black uppercase px-3 py-1 rounded-full flex items-center gap-2 animate-pulse border-2 border-yellow-400">
                                <Zap size={14} /> Reconnecting...
                            </span>
                        </div>
                    )}

                    <h2 className={`text-2xl md:text-3xl font-black font-mono tracking-tighter ${status === 'error' ? 'text-red-600' : 'text-black'}`}>
                        {text || loadingText}
                    </h2>

                    {status === 'error' && onRetry && (
                        <button
                            onClick={onRetry}
                            className="mt-6 w-full py-3 bg-red-500 hover:bg-red-600 text-white font-black uppercase rounded-xl border-[3px] border-black shadow-[4px_4px_0px_#000] active:translate-y-[2px] active:shadow-[2px_2px_0px_#000] transition-all"
                        >
                            Try Again
                        </button>
                    )}
                </div>

                {/* Progress Indicators */}
                {(status === 'connecting' || status === 'reconnecting') && (
                    <div className="mt-8 flex gap-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-4 h-4 rounded-full bg-black animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoadingScreen;
