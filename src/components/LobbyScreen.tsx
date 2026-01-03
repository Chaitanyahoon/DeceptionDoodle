import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePeer } from '../network/PeerContext';
import { Play, Users, ArrowRight, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { AVATARS } from '../data/avatars';
import AvatarSelector from './AvatarSelector';

const LobbyScreen = () => {
    const [joinId, setJoinId] = useState('');
    const [name, setName] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0].id);
    const navigate = useNavigate();
    const location = useLocation();
    const { initialize } = usePeer();
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const joinCode = params.get('join');
        if (joinCode) {
            setJoinId(joinCode);
        }
    }, [location]);

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
            navigate(`/room/${id}`, { state: { playerName: name, avatarId: selectedAvatar, settings } });
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
            navigate(`/room/${joinId}`, { state: { playerName: name, avatarId: selectedAvatar } });
        } catch (err) {
            console.error("Failed to join", err);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 relative z-10 transition-colors duration-500">
            {/* Settings Modal */}
            {showSettings && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="card-cartoon p-6 w-full max-w-md space-y-6 relative"
                    >
                        <h2 className="text-3xl font-black text-center text-black">Game Settings</h2>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm text-black font-black uppercase tracking-wider">Rounds</label>
                                <div className="flex gap-3">
                                    {[3, 5, 10].map(r => (
                                        <button
                                            key={r}
                                            onClick={() => setSettings(s => ({ ...s, rounds: r }))}
                                            className={`flex-1 py-3 rounded-xl font-black border-[3px] transition-all transform active:scale-95 ${settings.rounds === r
                                                ? 'bg-[#FFEB3B] border-black text-black shadow-[4px_4px_0px_#000] -translate-y-1'
                                                : 'bg-white border-black text-gray-400 hover:bg-gray-50 shadow-[2px_2px_0px_#ccc]'
                                                }`}
                                        >
                                            {r}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm text-black font-black uppercase tracking-wider">Draw Time</label>
                                <div className="flex gap-3">
                                    {[60, 90, 120].map(t => (
                                        <button
                                            key={t}
                                            onClick={() => setSettings(s => ({ ...s, drawTime: t }))}
                                            className={`flex-1 py-3 rounded-xl font-black border-[3px] transition-all transform active:scale-95 ${settings.drawTime === t
                                                ? 'bg-[#FFEB3B] border-black text-black shadow-[4px_4px_0px_#000] -translate-y-1'
                                                : 'bg-white border-black text-gray-400 hover:bg-gray-50 shadow-[2px_2px_0px_#ccc]'
                                                }`}
                                        >
                                            {t}s
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-2">
                            <button
                                onClick={() => setShowSettings(false)}
                                className="flex-1 py-3 rounded-xl font-black text-gray-500 hover:bg-gray-100 transition-colors border-2 border-transparent"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleStartGame}
                                disabled={isCreating}
                                className="flex-[2] py-4 btn-primary text-lg shadow-[4px_4px_0px_#000]"
                            >
                                {isCreating ? 'Creating...' : 'Start Game'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            <div
                className="w-full max-w-md space-y-10"
            >
                {/* Header */}
                <div className="text-center space-y-4 flex flex-col items-center">
                    <img src="/logo.png" alt="Deception Doodle Logo" className="w-24 h-24 md:w-32 md:h-32 drop-shadow-[4px_4px_0px_#000] hover:scale-110 transition-transform mb-2" />
                    <h1 className="relative text-6xl md:text-7xl font-display font-black tracking-tighter text-white drop-shadow-[4px_4px_0px_#000] stroke-black" style={{ WebkitTextStroke: "2px black" }}>
                        DECEPTION
                        <span className="block text-4xl md:text-5xl text-[#FFEB3B] mt-[-10px] drop-shadow-[4px_4px_0px_#000]" style={{ WebkitTextStroke: "2px black" }}>DOODLE</span>
                    </h1>
                </div>

                {/* Main Card */}
                <div className="card-cartoon p-8 space-y-8 relative overflow-hidden">
                    <div className="absolute inset-0 bg-yellow-50/50 pointer-events-none" />

                    {/* Join Form */}
                    <form onSubmit={handleJoinRoom} className="space-y-6 relative z-10">

                        {/* Avatar Selector */}
                        <AvatarSelector
                            currentAvatarId={selectedAvatar}
                            onSelect={setSelectedAvatar}
                        />

                        <div className="space-y-4">
                            <div className="relative group/input">
                                <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your Display Name"
                                    className="w-full input-cartoon pl-12"
                                    required
                                />
                            </div>
                            <div className="relative group/input">
                                <Zap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="text"
                                    value={joinId}
                                    onChange={(e) => setJoinId(e.target.value)}
                                    placeholder="Room Code (if joining)"
                                    className="w-full input-cartoon pl-12"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={handleCreateClick}
                                    disabled={isCreating || !name.trim()}
                                    className="flex flex-col items-center justify-center p-4 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Play className="w-6 h-6 mb-1 fill-current" />
                                    <span className="font-bold text-sm tracking-wide">CREATE</span>
                                </button>
                                <button
                                    type="submit"
                                    disabled={!name.trim() || !joinId.trim()}
                                    className="flex flex-col items-center justify-center p-4 btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ArrowRight className="w-6 h-6 mb-1" />
                                    <span className="font-bold text-sm tracking-wide">JOIN</span>
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LobbyScreen;
