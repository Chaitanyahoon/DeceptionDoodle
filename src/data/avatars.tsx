
export const AVATARS = [
    {
        id: 'detective',
        color: '#FCD34D',
        svg: (
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                {/* Dog Face */}
                <path d="M30,50 Q20,30 35,25 Q50,10 65,25 Q80,30 70,50 L75,70 Q80,95 50,95 Q20,95 25,70 Z" fill="#D97706" stroke="black" strokeWidth="4" />
                {/* Snout */}
                <ellipse cx="50" cy="65" rx="15" ry="12" fill="#FDE68A" stroke="black" strokeWidth="3" />
                <path d="M45,60 C45,55 55,55 55,60 L50,65 Z" fill="black" />
                {/* Hat */}
                <path d="M20,35 Q50,15 80,35" fill="none" stroke="black" strokeWidth="4" />
                <path d="M25,35 Q50,5 75,35 Z" fill="#7C2D12" stroke="black" strokeWidth="4" />
                <path d="M25,35 L75,35" stroke="black" strokeWidth="3" />
                {/* Pipe */}
                <path d="M60,70 Q70,70 70,80 Q70,90 85,85" fill="none" stroke="#5D4037" strokeWidth="4" strokeLinecap="round" />
                <path d="M85,85 L85,75 L95,75 L95,85 L85,85" fill="#5D4037" stroke="black" strokeWidth="2" />
                {/* Magnifying Glass */}
                <circle cx="30" cy="85" r="12" fill="#93C5FD" stroke="black" strokeWidth="3" opacity="0.8" />
                <line x1="38" y1="93" x2="45" y2="100" stroke="black" strokeWidth="4" />
            </svg>
        )
    },
    {
        id: 'secret-agent',
        color: '#60A5FA',
        svg: (
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                {/* Face */}
                <path d="M30,30 Q30,10 50,10 Q70,10 70,30 L70,60 Q70,80 50,80 Q30,80 30,60 Z" fill="#FCA5A5" stroke="black" strokeWidth="4" />
                {/* Hair */}
                <path d="M30,30 Q50,40 70,25 Q70,10 50,10 Q30,10 30,30" fill="#1F2937" stroke="black" strokeWidth="3" />
                {/* Suit */}
                <path d="M20,95 L20,80 Q20,70 30,70 L70,70 Q80,70 80,80 L80,95 Z" fill="#1F2937" stroke="black" strokeWidth="4" />
                <path d="M50,70 L50,95" stroke="white" strokeWidth="2" />
                <path d="M50,70 L40,80 L50,95 L60,80 Z" fill="white" />
                <path d="M50,70 L50,85" stroke="black" strokeWidth="2" />
                {/* Sunglasses */}
                <path d="M25,40 L75,40 L75,55 Q65,60 55,55 L50,50 L45,55 Q35,60 25,55 Z" fill="black" stroke="black" strokeWidth="2" />
                <path d="M30,42 L45,52" stroke="#4B5563" strokeWidth="2" opacity="0.5" />
                <path d="M55,42 L70,52" stroke="#4B5563" strokeWidth="2" opacity="0.5" />
                {/* Earpiece */}
                <path d="M70,40 Q75,40 75,45 Q75,50 72,50" fill="none" stroke="black" strokeWidth="2" />
                <path d="M72,50 Q85,60 85,80" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeDasharray="3 2" />
            </svg>
        )
    },
    {
        id: 'ninja',
        color: '#8B5CF6',
        svg: (
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <circle cx="50" cy="50" r="35" fill="#8B5CF6" stroke="black" strokeWidth="4" />
                {/* Hood Opening */}
                <path d="M30,45 Q50,55 70,45 L70,35 Q50,25 30,35 Z" fill="#4C1D95" stroke="black" strokeWidth="4" />
                {/* Skin */}
                <rect x="25" y="45" width="50" height="15" rx="5" fill="#FDBA74" />
                {/* Headband */}
                <rect x="15" y="25" width="70" height="10" transform="rotate(-5 50 30)" fill="#FCD34D" stroke="black" strokeWidth="3" />
                <path d="M80,30 L95,20 L95,40 Z" fill="#FCD34D" stroke="black" strokeWidth="3" />
                {/* Eyes */}
                <path d="M35,48 L45,52" stroke="black" strokeWidth="3" strokeLinecap="round" />
                <path d="M65,48 L55,52" stroke="black" strokeWidth="3" strokeLinecap="round" />
                <circle cx="40" cy="54" r="2" fill="black" />
                <circle cx="60" cy="54" r="2" fill="black" />
            </svg>
        )
    },
    {
        id: 'incognito-alien',
        color: '#10B981',
        svg: (
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                {/* Alien Head */}
                <path d="M50,90 Q15,70 15,40 Q15,5 50,5 Q85,5 85,40 Q85,70 50,90 Z" fill="#10B981" stroke="black" strokeWidth="4" />
                {/* Eyes */}
                <ellipse cx="35" cy="40" rx="10" ry="15" fill="black" transform="rotate(-15 35 40)" />
                <ellipse cx="65" cy="40" rx="10" ry="15" fill="black" transform="rotate(15 65 40)" />
                {/* Disguise Glasses */}
                <path d="M20,35 Q35,35 35,45 Q35,55 20,55 Q5,55 5,45 Q5,35 20,35 " fill="#FCD34D" stroke="black" strokeWidth="3" opacity="0.9" />
                <path d="M80,35 Q95,35 95,45 Q95,55 80,55 Q65,55 65,45 Q65,35 80,35 " fill="#FCD34D" stroke="black" strokeWidth="3" opacity="0.9" />
                <line x1="35" y1="45" x2="65" y2="45" stroke="black" strokeWidth="3" />
                {/* Fake Mustache */}
                <path d="M35,65 Q50,55 65,65 Q65,75 50,70 Q35,75 35,65" fill="#4B5563" stroke="black" strokeWidth="2" />
            </svg>
        )
    },
    {
        id: 'bandit-raccoon',
        color: '#9CA3AF',
        svg: (
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                {/* Face */}
                <path d="M20,60 L10,30 L50,20 L90,30 L80,60 Q50,70 20,60" fill="#9CA3AF" stroke="black" strokeWidth="4" />
                <path d="M10,30 L15,10 L30,25" fill="#4B5563" stroke="black" strokeWidth="3" />
                <path d="M90,30 L85,10 L70,25" fill="#4B5563" stroke="black" strokeWidth="3" />
                {/* Mask */}
                <path d="M15,45 Q50,60 85,45 L80,35 Q50,50 20,35 Z" fill="#1F2937" stroke="black" strokeWidth="3" />
                <circle cx="35" cy="45" r="3" fill="white" />
                <circle cx="65" cy="45" r="3" fill="white" />
                {/* Beanie */}
                <path d="M15,25 Q50,0 85,25" fill="#1F2937" stroke="black" strokeWidth="4" />
                <rect x="15" y="22" width="70" height="10" rx="2" fill="#374151" stroke="black" strokeWidth="3" />
                {/* Money Bag */}
                <path d="M60,70 Q60,90 80,95 Q95,90 90,70 Q80,60 75,65" fill="#FCD34D" stroke="black" strokeWidth="3" />
                <path d="M75,65 L70,60" stroke="black" strokeWidth="2" />
                <text x="72" y="85" fontSize="16" fontWeight="bold" fill="#059669">$</text>
            </svg>
        )
    },
    {
        id: 'femme-fatale',
        color: '#F472B6',
        svg: (
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                {/* Hair */}
                <path d="M20,90 Q10,50 30,30 Q50,10 70,30 Q90,50 80,90" fill="#1F2937" stroke="black" strokeWidth="3" />
                {/* Face */}
                <path d="M30,30 Q30,10 50,10 Q70,10 70,30 L70,60 Q70,85 50,85 Q30,85 30,60 Z" fill="#FCA5A5" stroke="black" strokeWidth="4" />
                <path d="M50,60 L55,60 L52,65 Z" fill="#F87171" opacity="0.6" />
                {/* Hat */}
                <path d="M5,40 Q50,20 95,40" fill="#BE123C" stroke="black" strokeWidth="4" />
                <ellipse cx="50" cy="35" rx="30" ry="20" fill="#9F1239" stroke="black" strokeWidth="3" />
                {/* Shadow */}
                <path d="M20,40 L80,40 L60,70 L40,70 Z" fill="black" opacity="0.3" />
                {/* Lips */}
                <path d="M45,75 Q50,80 55,75" fill="#BE123C" stroke="black" strokeWidth="2" />
                {/* Cigarette */}
                <line x1="60" y1="75" x2="80" y2="65" stroke="white" strokeWidth="3" />
                <circle cx="82" cy="64" r="2" fill="orange" opacity="0.6" />
                <path d="M82,64 Q85,55 90,50" fill="none" stroke="gray" strokeWidth="2" strokeDasharray="2 2" />
            </svg>
        )
    },
    {
        id: 'villain',
        color: '#F87171',
        svg: (
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                {/* Face */}
                <path d="M25,30 L25,70 Q50,90 75,70 L75,30 Q50,10 25,30 Z" fill="#FCA5A5" stroke="black" strokeWidth="4" />
                {/* Top Hat */}
                <rect x="20" y="20" width="60" height="10" fill="#1F2937" stroke="black" strokeWidth="3" />
                <rect x="30" y="5" width="40" height="20" fill="#1F2937" stroke="black" strokeWidth="3" />
                <rect x="30" y="20" width="40" height="5" fill="#7C3AED" />
                {/* Monocle */}
                <circle cx="40" cy="45" r="8" fill="#93C5FD" stroke="gold" strokeWidth="3" opacity="0.6" />
                <line x1="48" y1="45" x2="48" y2="70" stroke="gold" strokeWidth="1" />
                {/* Evil Grin */}
                <path d="M35,65 Q50,75 65,65" fill="none" stroke="black" strokeWidth="2" />
                <path d="M35,65 L65,65" stroke="black" strokeWidth="1" />
                <path d="M42,65 L42,70" stroke="black" strokeWidth="1" />
                <path d="M50,65 L50,71" stroke="black" strokeWidth="1" />
                <path d="M58,65 L58,70" stroke="black" strokeWidth="1" />
                {/* Mustache */}
                <path d="M35,62 Q50,55 65,62" fill="none" stroke="black" strokeWidth="2" />
            </svg>
        )
    },
    {
        id: 'hacker',
        color: '#818CF8',
        svg: (
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                {/* Hoodie */}
                <path d="M20,95 L20,40 Q50,10 80,40 L80,95" fill="#312E81" stroke="black" strokeWidth="4" />
                <path d="M30,40 Q50,20 70,40 L70,70 Q50,90 30,70 Z" fill="black" />
                {/* Glitch Face */}
                <rect x="35" y="45" width="10" height="2" fill="#00FF00" />
                <rect x="55" y="50" width="8" height="2" fill="#00FF00" />
                <rect x="40" y="55" width="20" height="2" fill="#00FF00" />
                <rect x="38" y="60" width="4" height="4" fill="#00FF00" />
                <rect x="60" y="42" width="2" height="6" fill="#00FF00" />
            </svg>
        )
    },
    {
        id: 'cop',
        color: '#3B82F6',
        svg: (
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                {/* Face */}
                <rect x="30" y="40" width="40" height="40" rx="10" fill="#FCA5A5" stroke="black" strokeWidth="4" />
                {/* Hat */}
                <path d="M25,40 L75,40 L70,25 L30,25 Z" fill="#1E40AF" stroke="black" strokeWidth="3" />
                <path d="M45,25 L55,25 L55,20 Q50,15 45,20 Z" fill="gold" />
                <rect x="25" y="38" width="50" height="5" fill="black" />
                {/* Sunglasses */}
                <rect x="35" y="50" width="12" height="8" fill="black" />
                <rect x="53" y="50" width="12" height="8" fill="black" />
                <line x1="47" y1="54" x2="53" y2="54" stroke="black" strokeWidth="2" />
                {/* Donut */}
                <circle cx="75" cy="80" r="15" fill="#FBCFE8" stroke="black" strokeWidth="3" />
                <circle cx="75" cy="80" r="5" fill="#1E40AF" stroke="black" strokeWidth="2" />
                <circle cx="70" cy="75" r="1" fill="white" />
                <circle cx="80" cy="85" r="1" fill="white" />
            </svg>
        )
    }
];

export const getAvatarById = (id: string) => AVATARS.find(a => a.id === id) || AVATARS[0];
