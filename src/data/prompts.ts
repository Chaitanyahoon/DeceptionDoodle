export interface PromptSet {
    category: string;
    items: string[];
}

export const PROMPTS: PromptSet[] = [
    {
        category: 'Animals',
        items: ['Cat', 'Dog', 'Rabbit', 'Elephant', 'Lion', 'Tiger', 'Bear', 'Fox', 'Wolf', 'Deer']
    },
    {
        category: 'Food',
        items: ['Pizza', 'Burger', 'Sushi', 'Taco', 'Sandwich', 'Pasta', 'Steak', 'Salad', 'Soup', 'Cake']
    },
    {
        category: 'Objects',
        items: ['Chair', 'Table', 'Lamp', 'Computer', 'Phone', 'Book', 'Pen', 'Mug', 'Clock', 'Key']
    },
    {
        category: 'Places',
        items: ['Beach', 'Forest', 'City', 'Mountain', 'Desert', 'Park', 'School', 'House', 'Hospital', 'Library']
    },
    {
        category: 'Jobs',
        items: ['Doctor', 'Teacher', 'Officer', 'Chef', 'Artist', 'Pilot', 'Driver', 'firefighter', 'Nurse', 'Lawyer']
    }
];

export const getRandomPrompts = (count: number): { category: string, real: string, fakes: string[] } => {
    const set = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
    // Shuffle items
    const shuffled = [...set.items].sort(() => 0.5 - Math.random());
    const real = shuffled[0];
    const fakes = shuffled.slice(1, count); // count-1 fakes

    return {
        category: set.category,
        real,
        fakes
    };
};
