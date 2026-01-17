/* eslint-disable react-refresh/only-export-components */

// Individual Avatar Images
const AvatarImage = ({ src }: { src: string }) => (
    <div
        className="w-full h-full rounded-full bg-white bg-cover bg-center"
        style={{
            backgroundImage: `url(${src})`,
        }}
    />
);

export const AVATARS = [
    {
        id: 'detective',
        color: '#FCD34D',
        component: <AvatarImage src="/avatars/detective.png" />
    },
    {
        id: 'secret-agent',
        color: '#60A5FA',
        component: <AvatarImage src="/avatars/agent.png" />
    },
    {
        id: 'ninja',
        color: '#8B5CF6',
        component: <AvatarImage src="/avatars/ninja.png" />
    },
    {
        id: 'bandit-raccoon',
        color: '#9CA3AF',
        component: <AvatarImage src="/avatars/raccoon.png" />
    },
    {
        id: 'incognito-alien',
        color: '#10B981',
        component: <AvatarImage src="/avatars/alien.png" />
    },
    {
        id: 'femme-fatale',
        color: '#F472B6',
        component: <AvatarImage src="/avatars/femme_fatale.png" />
    },
    {
        id: 'villain',
        color: '#F87171',
        component: <AvatarImage src="/avatars/villain.png" />
    },
    {
        id: 'hacker',
        color: '#818CF8',
        component: <AvatarImage src="/avatars/hacker.png" />
    },
    {
        id: 'cop',
        color: '#3B82F6',
        component: <AvatarImage src="/avatars/cop.png" />
    }
];

export const getAvatarById = (id: string) => AVATARS.find(a => a.id === id) || AVATARS[0];
