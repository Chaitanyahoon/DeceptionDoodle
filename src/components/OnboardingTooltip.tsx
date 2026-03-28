import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

const ONBOARDING_KEY = 'deception-doodle-has-seen-onboarding';

const OnboardingTooltip: React.FC = () => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        try {
            const v = localStorage.getItem(ONBOARDING_KEY);
            if (!v) setVisible(true);
        } catch (e) {
            setVisible(true);
        }
    }, []);

    if (!visible) return null;

    const handleClose = () => {
        try { localStorage.setItem(ONBOARDING_KEY, '1'); } catch {}
        setVisible(false);
    };

    return (
        <div className="fixed bottom-6 right-6 md:left-1/2 md:bottom-28 md:-translate-x-1/2 z-50 card-cartoon p-3 md:p-4 w-64 md:w-80 shadow-[10px_10px_0_rgba(0,0,0,0.15)] transition-opacity duration-200">
            <div className="flex items-start gap-3">
                <div className="flex-1">
                    <h4 className="font-black text-sm mb-1">Quick Tip</h4>
                    <p className="text-xs text-gray-700">Brush & color control the stroke. Press <span className="font-mono">U</span> to undo, <span className="font-mono">C</span> to clear.</p>
                </div>
                <button onClick={handleClose} aria-label="Dismiss tooltip" className="btn-icon btn-primary">
                    <X className="w-4 h-4 text-black" />
                </button>
            </div>
        </div>
    );
};

export default OnboardingTooltip;
