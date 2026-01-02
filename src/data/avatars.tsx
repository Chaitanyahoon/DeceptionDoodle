
export const AVATARS = [
    {
        id: 'blob-yellow',
        color: '#FCD34D',
        svg: (
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <path d="M50,15 C25,15 10,35 10,60 C10,95 30,95 50,95 C70,95 90,95 90,60 C90,35 75,15 50,15 Z" fill="#FCD34D" stroke="black" strokeWidth="4" />
                <circle cx="35" cy="45" r="8" fill="white" stroke="black" strokeWidth="2" />
                <circle cx="35" cy="45" r="3" fill="black" />
                <circle cx="65" cy="45" r="8" fill="white" stroke="black" strokeWidth="2" />
                <circle cx="65" cy="45" r="3" fill="black" />
                <path d="M40,70 Q50,80 60,70" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" />
            </svg>
        )
    },
    {
        id: 'cyclops-blue',
        color: '#60A5FA',
        svg: (
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <rect x="20" y="20" width="60" height="70" rx="10" ry="10" fill="#60A5FA" stroke="black" strokeWidth="4" />
                <circle cx="50" cy="45" r="15" fill="white" stroke="black" strokeWidth="3" />
                <circle cx="50" cy="45" r="6" fill="black" />
                <rect x="35" y="75" width="30" height="5" fill="black" rx="2" />
                <path d="M20,40 L10,50 L20,60" fill="none" stroke="black" strokeWidth="3" />
                <path d="M80,40 L90,50 L80,60" fill="none" stroke="black" strokeWidth="3" />
            </svg>
        )
    },
    {
        id: 'monster-green',
        color: '#34D399',
        svg: (
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <path d="M20,80 L20,30 Q50,10 80,30 L80,80 Z" fill="#34D399" stroke="black" strokeWidth="4" />
                <path d="M20,80 Q50,90 80,80" fill="#34D399" stroke="black" strokeWidth="4" />
                <circle cx="30" cy="40" r="5" fill="white" stroke="black" strokeWidth="2" />
                <circle cx="30" cy="40" r="2" fill="black" />
                <circle cx="50" cy="35" r="6" fill="white" stroke="black" strokeWidth="2" />
                <circle cx="50" cy="35" r="2.5" fill="black" />
                <circle cx="70" cy="40" r="5" fill="white" stroke="black" strokeWidth="2" />
                <circle cx="70" cy="40" r="2" fill="black" />
                <path d="M30,65 Q50,55 70,65" fill="none" stroke="black" strokeWidth="3" />
                <path d="M35,65 L40,70 L45,65 L50,70 L55,65 L60,70 L65,65" fill="none" stroke="black" strokeWidth="2" />
            </svg>
        )
    },
    {
        id: 'ghost-pink',
        color: '#F472B6',
        svg: (
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <path d="M20,90 L20,50 C20,20 80,20 80,50 L80,90 L65,80 L50,90 L35,80 L20,90 Z" fill="#F472B6" stroke="black" strokeWidth="4" strokeLinejoin="round" />
                <circle cx="35" cy="45" r="4" fill="black" />
                <circle cx="65" cy="45" r="4" fill="black" />
                <ellipse cx="30" cy="55" rx="3" ry="2" fill="#FbcFe8" opacity="0.6" />
                <ellipse cx="70" cy="55" rx="3" ry="2" fill="#FbcFe8" opacity="0.6" />
            </svg>
        )
    },
    {
        id: 'cat-orange',
        color: '#FB923C',
        svg: (
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <path d="M25,35 L15,15 L40,25" fill="#FB923C" stroke="black" strokeWidth="4" strokeLinejoin="round" />
                <path d="M75,35 L85,15 L60,25" fill="#FB923C" stroke="black" strokeWidth="4" strokeLinejoin="round" />
                <ellipse cx="50" cy="55" rx="35" ry="30" fill="#FB923C" stroke="black" strokeWidth="4" />
                <path d="M35,50 L65,50 L50,65 Z" fill="white" stroke="black" strokeWidth="3" strokeLinejoin="round" />
                <circle cx="40" cy="45" r="3" fill="black" />
                <circle cx="60" cy="45" r="3" fill="black" />
                <path d="M20,60 L5,55" fill="none" stroke="black" strokeWidth="2" />
                <path d="M20,65 L5,70" fill="none" stroke="black" strokeWidth="2" />
                <path d="M80,60 L95,55" fill="none" stroke="black" strokeWidth="2" />
                <path d="M80,65 L95,70" fill="none" stroke="black" strokeWidth="2" />
            </svg>
        )
    },
    {
        id: 'robot-gray',
        color: '#9CA3AF',
        svg: (
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <rect x="25" y="25" width="50" height="50" rx="4" fill="#9CA3AF" stroke="black" strokeWidth="4" />
                <rect x="20" y="40" width="5" height="20" rx="1" fill="#4B5563" stroke="black" strokeWidth="2" />
                <rect x="75" y="40" width="5" height="20" rx="1" fill="#4B5563" stroke="black" strokeWidth="2" />
                <circle cx="35" cy="45" r="5" fill="#EF4444" stroke="black" strokeWidth="2" />
                <circle cx="65" cy="45" r="5" fill="#EF4444" stroke="black" strokeWidth="2" />
                <line x1="50" y1="25" x2="50" y2="10" stroke="black" strokeWidth="3" />
                <circle cx="50" cy="10" r="4" fill="yellow" stroke="black" strokeWidth="2" />
                <rect x="35" y="60" width="30" height="8" rx="2" fill="black" />
                <path d="M38,64 L62,64" stroke="#10B981" strokeWidth="2" strokeDasharray="4 2" />
            </svg>
        )
    },
    {
        id: 'ninja-purple',
        color: '#8B5CF6',
        svg: (
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <circle cx="50" cy="50" r="35" fill="#8B5CF6" stroke="black" strokeWidth="4" />
                <path d="M30,45 Q50,55 70,45 L70,35 Q50,25 30,35 Z" fill="#4C1D95" stroke="black" strokeWidth="2" />
                <rect x="25" y="45" width="50" height="15" rx="5" fill="#FDBA74" />
                <circle cx="40" cy="52" r="3" fill="black" />
                <circle cx="60" cy="52" r="3" fill="black" />
                <path d="M20,60 Q50,20 80,60" fill="none" stroke="black" strokeWidth="4" />
            </svg>
        )
    },
    {
        id: 'pizza-slice',
        color: '#FCD34D',
        svg: (
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <path d="M50,15 L85,85 L15,85 Z" fill="#FCD34D" stroke="black" strokeWidth="4" strokeLinejoin="round" />
                <path d="M15,85 Q50,95 85,85" fill="#EF4444" stroke="black" strokeWidth="4" />
                <circle cx="50" cy="40" r="4" fill="#EF4444" opacity="0.8" />
                <circle cx="40" cy="60" r="4" fill="#EF4444" opacity="0.8" />
                <circle cx="60" cy="70" r="4" fill="#EF4444" opacity="0.8" />
                <path d="M50,15 L50,30" stroke="black" strokeWidth="2" />
            </svg>
        )
    },
    {
        id: 'icecream-pink',
        color: '#F9A8D4',
        svg: (
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <path d="M50,90 L30,50 L70,50 Z" fill="#F59E0B" stroke="black" strokeWidth="4" strokeLinejoin="round" />
                <circle cx="50" cy="40" r="22" fill="#F9A8D4" stroke="black" strokeWidth="4" />
                <path d="M40,50 L60,50" stroke="black" strokeWidth="2" />
                <rect x="40" y="30" width="5" height="10" rx="2" fill="#BE185D" transform="rotate(20 42 35)" />
                <rect x="55" y="25" width="5" height="10" rx="2" fill="#10B981" transform="rotate(-10 57 30)" />
            </svg>
        )
    },
    {
        id: 'alien-green',
        color: '#10B981',
        svg: (
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <path d="M20,50 Q20,10 50,10 Q80,10 80,50 Q80,90 50,90 Q20,90 20,50" fill="#10B981" stroke="black" strokeWidth="4" />
                <path d="M30,50 Q40,60 50,50 Q60,60 70,50" fill="none" stroke="black" strokeWidth="2" />
                <ellipse cx="35" cy="40" rx="6" ry="10" fill="black" transform="rotate(-20 35 40)" />
                <ellipse cx="65" cy="40" rx="6" ry="10" fill="black" transform="rotate(20 65 40)" />
                <circle cx="33" cy="38" r="2" fill="white" />
                <circle cx="67" cy="38" r="2" fill="white" />
            </svg>
        )
    }
];

export const getAvatarById = (id: string) => AVATARS.find(a => a.id === id) || AVATARS[0];
