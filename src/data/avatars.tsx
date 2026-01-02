
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
    }
];

export const getAvatarById = (id: string) => AVATARS.find(a => a.id === id) || AVATARS[0];
