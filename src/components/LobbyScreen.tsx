import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePeer } from '../network/PeerContext';
import { Play, Users, ArrowRight, Stars, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const LobbyScreen = () => {
    console.log('LobbyScreen component rendering...');
    const [joinId, setJoinId] = useState('');
    const [name, setName] = useState('');
    const navigate = useNavigate();
    const { initialize } = usePeer();
    const [isCreating, setIsCreating] = useState(false);

    const [showSettings, setShowSettings] = useState(false);
    const [settings, setSettings] = useState({ rounds: 3, drawTime: 60 });

    const handleCreateClick = () => {
        if (!name.trim()) return;
        setShowSettings(true);
    };

    const handleStartGame = async () => {
        setIsCreating(true);
        try {
            const id = await initialize();
            navigate(`/room/${id}`, { state: { playerName: name, settings } });
        } catch (err) {
            console.error("Failed to create room", err);
            setIsCreating(false);
        }
    };

    const handleJoinRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!joinId.trim() || !name.trim()) return;
        try {
            await initialize();
            navigate(`/room/${joinId}`, { state: { playerName: name } });
        } catch (err) {
            console.error("Failed to join", err);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 relative z-10">
            {/* Settings Modal */}
            {showSettings && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-surface border border-white/10 p-6 rounded-3xl w-full max-w-sm space-y-6 shadow-2xl relative"
                    >
                        <h2 className="text-2xl font-bold text-center">Game Settings</h2>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400 font-bold uppercase tracking-wider">Rounds</label>
                                <div className="flex gap-2">
                                    {[3, 5, 10].map(r => (
                                        <button
                                            key={r}
                                            onClick={() => setSettings(s => ({ ...s, rounds: r }))}
                                            className={`flex-1 py-2 rounded-xl font-bold border transition-all ${settings.rounds === r
                                                    ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                                                    : 'bg-black/20 border-white/10 text-gray-400 hover:bg-white/5'
                                                }`}
                                        >
                                            {r}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm text-gray-400 font-bold uppercase tracking-wider">Draw Time</label>
                                <div className="flex gap-2">
                                    {[60, 90, 120].map(t => (
                                        <button
                                            key={t}
                                            onClick={() => setSettings(s => ({ ...s, drawTime: t }))}
                                            className={`flex-1 py-2 rounded-xl font-bold border transition-all ${settings.drawTime === t
                                                    ? 'bg-secondary border-secondary text-white shadow-lg shadow-secondary/20'
                                                    : 'bg-black/20 border-white/10 text-gray-400 hover:bg-white/5'
                                                }`}
                                        >
                                            {t}s
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowSettings(false)}
                                className="flex-1 py-3 rounded-xl font-bold text-gray-400 hover:bg-white/5 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleStartGame}
                                disabled={isCreating}
                                className="flex-[2] py-3 rounded-xl font-bold bg-gradient-to-r from-primary to-accent text-white shadow-lg hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                {isCreating ? 'Creating...' : 'Start Game'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md space-y-10"
            >
                {/* Header */}
                <div className="text-center space-y-4">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="mx-auto w-20 h-20 bg-gradient-to-tr from-primary to-accent rounded-full blur-xl opacity-50 absolute top-10 left-1/2 -translate-x-1/2"
                    />
                    <h1 className="relative text-6xl md:text-7xl font-display font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/50 drop-shadow-[0_0_30px_rgba(139,92,246,0.5)]">
                        DECEPTION
                        <span className="block text-4xl md:text-5xl text-accent mt-[-10px]">DOODLE</span>
                    </h1>
                    <p className="text-gray-400 font-sans tracking-widest uppercase text-xs flex items-center justify-center gap-2">
                        <Stars className="w-3 h-3 text-secondary" />
                        Draw • Bluff • Detect
                        <Zap className="w-3 h-3 text-secondary" />
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-surface/40 backdrop-blur-2xl border border-white/5 p-8 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] space-y-8 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />



                    {/* Join Form */}
                    <form onSubmit={handleJoinRoom} className="space-y-4">
                        <div className="space-y-4">
                            <div className="relative group/input">
                                <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within/input:text-accent transition-colors" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your Display Name"
                                    className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-lg font-medium focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all outline-none placeholder:text-gray-600 shadow-inner"
                                    required
                                />
                            </div>
                            <div className="relative group/input">
                                <Zap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within/input:text-accent transition-colors" />
                                <input
                                    type="text"
                                    value={joinId}
                                    onChange={(e) => setJoinId(e.target.value)}
                                    placeholder="Room Code (if joining)"
                                    className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-lg font-medium focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all outline-none placeholder:text-gray-600 shadow-inner"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={handleCreateClick}
                                disabled={isCreating || !name.trim()}
                                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-primary to-violet-600 text-white shadow-lg hover:shadow-primary/50 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Play className="w-6 h-6 mb-1 fill-current" />
                                <span className="font-bold text-sm tracking-wide">CREATE</span>
                            </button>
                            <button
                                type="submit"
                                disabled={!name.trim() || !joinId.trim()}
                                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-surface border border-white/10 hover:bg-white/5 text-gray-200 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ArrowRight className="w-6 h-6 mb-1" />
                                <span className="font-bold text-sm tracking-wide">JOIN</span>
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default LobbyScreen;
