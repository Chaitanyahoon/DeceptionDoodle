// Sprite Sheet Configuration
// Grid: 3x3
// Positions: 0%, 50%, 100%
const SPRITE_SRC = '/avatars_sprite.png';

const AvatarSprite = ({ x, y }: { x: number, y: number }) => (
    <div
        className="w-full h-full rounded-full bg-white"
        style={{
            backgroundImage: `url(${SPRITE_SRC})`,
            backgroundSize: '300% 300%', // 3 columns, 3 rows -> 300% size
            backgroundPosition: `${x}% ${y}%`,
            imageRendering: 'pixelated'
        }}
    />
);

export const AVATARS = [
    {
        id: 'detective',
        color: '#FCD34D',
        component: <AvatarSprite x={0} y={0} /> // Row 1, Col 1
    },
    {
        id: 'secret-agent',
        color: '#60A5FA',
        component: <AvatarSprite x={50} y={0} /> // Row 1, Col 2
    },
    {
        id: 'ninja',
        color: '#8B5CF6',
        component: <AvatarSprite x={100} y={0} /> // Row 1, Col 3
    },
    {
        id: 'bandit-raccoon',
        color: '#9CA3AF',
        component: <AvatarSprite x={0} y={50} /> // Row 2, Col 1
    },
    {
        id: 'incognito-alien',
        color: '#10B981',
        component: <AvatarSprite x={50} y={50} /> // Row 2, Col 2
    },
    {
        id: 'femme-fatale',
        color: '#F472B6',
        component: <AvatarSprite x={100} y={50} /> // Row 2, Col 3
    },
    {
        id: 'villain',
        color: '#F87171',
        component: <AvatarSprite x={0} y={100} /> // Row 3, Col 1
    },
    {
        id: 'hacker',
        color: '#818CF8',
        component: <AvatarSprite x={50} y={100} /> // Row 3, Col 2
    },
    {
        id: 'cop',
        color: '#3B82F6',
        component: <AvatarSprite x={100} y={100} /> // Row 3, Col 3
    }
];

export const getAvatarById = (id: string) => AVATARS.find(a => a.id === id) || AVATARS[0];
