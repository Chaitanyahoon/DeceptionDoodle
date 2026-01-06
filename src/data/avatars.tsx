
export const AVATARS = [
    {
        id: 'blob-yellow',
        color: '#FCD34D',
        svg: (
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <defs>
                    <radialGradient id="grad1" cx="30%" cy="30%" r="70%">
                        <stop offset="0%" stopColor="#FDE68A" />
                        <stop offset="100%" stopColor="#F59E0B" />
                    </radialGradient>
                </defs>
                <circle cx="50" cy="50" r="40" fill="url(#grad1)" stroke="black" strokeWidth="4" />
                <circle cx="35" cy="45" r="5" fill="black" />
                <circle cx="65" cy="45" r="5" fill="black" />
                <path d="M35,65 Q50,75 65,65" fill="none" stroke="black" strokeWidth="4" strokeLinecap="round" />
                <ellipse cx="25" cy="55" rx="5" ry="3" fill="#FCA5A5" opacity="0.6" transform="rotate(-15 25 55)" />
                <ellipse cx="75" cy="55" rx="5" ry="3" fill="#FCA5A5" opacity="0.6" transform="rotate(15 75 55)" />
            </svg>
        )
    },
    {
        id: 'robot-blue',
        color: '#60A5FA',
        svg: (
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <rect x="20" y="25" width="60" height="55" rx="8" fill="#60A5FA" stroke="black" strokeWidth="4" />
                <rect x="15" y="40" width="5" height="15" rx="2" fill="#2563EB" stroke="black" strokeWidth="2" />
                <rect x="80" y="40" width="5" height="15" rx="2" fill="#2563EB" stroke="black" strokeWidth="2" />
                <path d="M30,25 L30,15" stroke="black" strokeWidth="3" />
                <circle cx="30" cy="12" r="4" fill="#EF4444" stroke="black" strokeWidth="2" />
                <path d="M70,25 L70,15" stroke="black" strokeWidth="3" />
                <circle cx="70" cy="12" r="4" fill="#EF4444" stroke="black" strokeWidth="2" />
                <rect x="30" y="35" width="40" height="15" rx="4" fill="#1E3A8A" />
                <circle cx="40" cy="42.5" r="3" fill="#00FF00" />
                <circle cx="60" cy="42.5" r="3" fill="#00FF00" />
                <rect x="35" y="60" width="30" height="8" rx="2" fill="white" stroke="black" strokeWidth="2" />
                <line x1="40" y1="60" x2="40" y2="68" stroke="black" strokeWidth="2" />
                <line x1="50" y1="60" x2="50" y2="68" stroke="black" strokeWidth="2" />
                <line x1="60" y1="60" x2="60" y2="68" stroke="black" strokeWidth="2" />
            </svg>
        )
    },
    {
        id: 'monster-green',
        color: '#34D399',
        svg: (
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <path d="M20,80 Q10,50 30,30 Q50,10 70,30 Q90,50 80,80 Q50,95 20,80" fill="#34D399" stroke="black" strokeWidth="4" />
                <path d="M40,20 L30,10 L35,25" fill="#FCD34D" stroke="black" strokeWidth="2" />
                <path d="M60,20 L70,10 L65,25" fill="#FCD34D" stroke="black" strokeWidth="2" />
                <circle cx="35" cy="45" r="6" fill="white" stroke="black" strokeWidth="2" />
                <circle cx="35" cy="45" r="2" fill="black" />
                <circle cx="65" cy="45" r="6" fill="white" stroke="black" strokeWidth="2" />
                <circle cx="65" cy="45" r="2" fill="black" />
                <circle cx="50" cy="35" r="8" fill="white" stroke="black" strokeWidth="2" />
                <circle cx="50" cy="35" r="3" fill="black" />
                <path d="M35,65 Q50,75 65,65" fill="none" stroke="black" strokeWidth="3" />
                <path d="M40,65 L45,70 L50,65 L55,70 L60,65" fill="none" stroke="black" strokeWidth="2" />
            </svg>
        )
    },
    {
        id: 'ghost-pink',
        color: '#F472B6',
        svg: (
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <path d="M20,90 L20,50 C20,20 80,20 80,50 L80,90 Q72,80 65,90 Q57,80 50,90 Q42,80 35,90 Q27,80 20,90 Z" fill="#F472B6" stroke="black" strokeWidth="4" strokeLinejoin="round" />
                <circle cx="35" cy="45" r="4" fill="black" />
                <circle cx="65" cy="45" r="4" fill="black" />
                <path d="M45,55 Q50,50 55,55" fill="none" stroke="black" strokeWidth="2" />
                <ellipse cx="28" cy="55" rx="4" ry="2" fill="#FbcFe8" opacity="0.8" />
                <ellipse cx="72" cy="55" rx="4" ry="2" fill="#FbcFe8" opacity="0.8" />
                <path d="M15,55 Q10,40 15,35" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" />
                <path d="M85,55 Q90,40 85,35" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" />
            </svg>
        )
    },
    {
        id: 'cat-orange',
        color: '#FB923C',
        svg: (
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <path d="M20,35 L10,15 L35,25" fill="#F97316" stroke="black" strokeWidth="4" strokeLinejoin="round" />
                <path d="M80,35 L90,15 L65,25" fill="#F97316" stroke="black" strokeWidth="4" strokeLinejoin="round" />
                <circle cx="50" cy="55" r="35" fill="#FB923C" stroke="black" strokeWidth="4" />
                <circle cx="35" cy="45" r="5" fill="white" stroke="black" strokeWidth="2" />
                <circle cx="35" cy="45" r="2" fill="black" />
                <circle cx="65" cy="45" r="5" fill="white" stroke="black" strokeWidth="2" />
                <circle cx="65" cy="45" r="2" fill="black" />
                <path d="M45,60 Q50,65 55,60" fill="none" stroke="black" strokeWidth="2" />
                <line x1="50" y1="55" x2="50" y2="62" stroke="black" strokeWidth="2" />
                <line x1="15" y1="55" x2="30" y2="55" stroke="black" strokeWidth="2" />
                <line x1="15" y1="65" x2="28" y2="62" stroke="black" strokeWidth="2" />
                <line x1="85" y1="55" x2="70" y2="55" stroke="black" strokeWidth="2" />
                <line x1="85" y1="65" x2="72" y2="62" stroke="black" strokeWidth="2" />
            </svg>
        )
    },
    {
        id: 'ninja-purple',
        color: '#8B5CF6',
        svg: (
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <circle cx="50" cy="50" r="35" fill="#8B5CF6" stroke="black" strokeWidth="4" />
                <path d="M25,40 Q50,65 75,40 L75,30 Q50,10 25,30 Z" fill="#4C1D95" stroke="black" strokeWidth="2" />
                <rect x="25" y="40" width="50" height="15" rx="4" fill="#FDBA74" />
                <path d="M35,45 L45,50" stroke="black" strokeWidth="2" />
                <path d="M65,45 L55,50" stroke="black" strokeWidth="2" />
                <circle cx="40" cy="48" r="2" fill="black" />
                <circle cx="60" cy="48" r="2" fill="black" />
                <path d="M15,50 L5,40" stroke="black" strokeWidth="3" strokeLinecap="round" />
                <path d="M85,50 L95,40" stroke="black" strokeWidth="3" strokeLinecap="round" />
            </svg>
        )
    },
    {
        id: 'pizza-cool',
        color: '#FCD34D',
        svg: (
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <path d="M50,10 L90,85 Q50,95 10,85 Z" fill="#FCD34D" stroke="black" strokeWidth="4" strokeLinejoin="round" />
                <path d="M50,10 Q20,10 10,25 Q50,20 90,25 Q80,10 50,10" fill="#D97706" stroke="black" strokeWidth="4" strokeLinejoin="round" />
                <circle cx="40" cy="45" r="6" fill="#EF4444" stroke="black" strokeWidth="2" />
                <circle cx="65" cy="65" r="5" fill="#EF4444" stroke="black" strokeWidth="2" />
                <circle cx="35" cy="70" r="5" fill="#EF4444" stroke="black" strokeWidth="2" />
                <path d="M30,50 L70,50 L65,65 L35,65 Z" fill="black" />
                <path d="M30,50 L70,50" stroke="black" strokeWidth="2" />
            </svg>
        )
    },
    {
        id: 'icecream-pink',
        color: '#F9A8D4',
        svg: (
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <path d="M50,95 L25,50 L75,50 Z" fill="#F59E0B" stroke="black" strokeWidth="4" strokeLinejoin="round" />
                <path d="M28,60 L72,60" stroke="#D97706" strokeWidth="2" transform="rotate(45 50 60)" />
                <path d="M28,60 L72,60" stroke="#D97706" strokeWidth="2" transform="rotate(-45 50 60)" />
                <circle cx="50" cy="40" r="25" fill="#F9A8D4" stroke="black" strokeWidth="4" />
                <circle cx="35" cy="40" r="2" fill="black" />
                <circle cx="65" cy="40" r="2" fill="black" />
                <path d="M45,45 Q50,50 55,45" fill="none" stroke="black" strokeWidth="2" />
                <circle cx="60" cy="25" r="3" fill="#F472B6" />
                <circle cx="40" cy="20" r="4" fill="#F472B6" />
                <path d="M50,15 Q60,10 65,25" fill="#BE185D" stroke="black" strokeWidth="3" strokeLinecap="round" />
            </svg>
        )
    },
    {
        id: 'alien-green',
        color: '#10B981',
        svg: (
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <path d="M50,90 Q15,70 15,40 Q15,5 50,5 Q85,5 85,40 Q85,70 50,90 Z" fill="#10B981" stroke="black" strokeWidth="4" />
                <ellipse cx="35" cy="40" rx="10" ry="15" fill="black" transform="rotate(-15 35 40)" />
                <ellipse cx="65" cy="40" rx="10" ry="15" fill="black" transform="rotate(15 65 40)" />
                <circle cx="38" cy="35" r="3" fill="white" />
                <circle cx="62" cy="35" r="3" fill="white" />
                <path d="M45,75 Q50,80 55,75" fill="none" stroke="black" strokeWidth="2" />
            </svg>
        )
    }
];

export const getAvatarById = (id: string) => AVATARS.find(a => a.id === id) || AVATARS[0];
