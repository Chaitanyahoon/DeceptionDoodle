export interface PromptSet {
    category: string;
    items: string[];
}

// Expanded Word List for "Skribbl-style" variety
export const PROMPTS: PromptSet[] = [
    {
        category: 'Easy (Animals)',
        items: [
            'Cat', 'Dog', 'Rabbit', 'Elephant', 'Lion', 'Tiger', 'Bear', 'Fox', 'Wolf', 'Deer',
            'Giraffe', 'Monkey', 'Snake', 'Shark', 'Whale', 'Dolphin', 'Penguin', 'Frog', 'Duck', 'Horse',
            'Cow', 'Pig', 'Sheep', 'Chicken', 'Mouse', 'Rat', 'Bat', 'Owl', 'Eagle', 'Parrot',
            'Butterfly', 'Spider', 'Ant', 'Bee', 'Crab', 'Octopus', 'Jellyfish', 'Starfish', 'Seahorse'
        ]
    },
    {
        category: 'Food',
        items: [
            'Pizza', 'Burger', 'Sushi', 'Taco', 'Sandwich', 'Pasta', 'Steak', 'Salad', 'Soup', 'Cake',
            'Ice Cream', 'Chocolate', 'Bread', 'Cheese', 'Egg', 'Apple', 'Banana', 'Orange', 'Grape', 'Strawberry',
            'Watermelon', 'Pineapple', 'Cherry', 'Peach', 'Pear', 'Lemon', 'Lime', 'Potato', 'Tomato', 'Onion',
            'Carrot', 'Corn', 'Broccoli', 'Cookie', 'Donut', 'Pancake', 'Waffle', 'Bacon', 'Sausage', 'Hot Dog'
        ]
    },
    {
        category: 'Objects',
        items: [
            'Chair', 'Table', 'Lamp', 'Computer', 'Phone', 'Book', 'Pen', 'Clock', 'Key', 'Bag',
            'Shoes', 'Glasses', 'Hat', 'Watch', 'Ring', 'Necklace', 'Guitar', 'Piano', 'Drum', 'Violin',
            'Camera', 'TV', 'Radio', 'Headphones', 'Speaker', 'Car', 'Bike', 'Bus', 'Train', 'Plane',
            'Boat', 'Ship', 'Rocket', 'Robot', 'Doll', 'Ball', 'Bat', 'Racket', 'Helmet', 'Umbrella'
        ]
    },
    {
        category: 'Actions (Verbs)',
        items: [
            'Run', 'Jump', 'Swim', 'Fly', 'Sleep', 'Eat', 'Drink', 'Read', 'Write', 'Draw',
            'Sing', 'Dance', 'Play', 'Fight', 'Cry', 'Laugh', 'Smile', 'Cook', 'Clean', 'Wash',
            'Drive', 'Ride', 'Walk', 'Climb', 'Dig', 'Build', 'Break', 'Fix', 'Cut', 'Sew',
            'Paint', 'Type', 'Call', 'Text', 'Shop', 'Buy', 'Sell', 'Pay', 'Give', 'Take'
        ]
    },
    {
        category: 'Pop Culture & Mixed',
        items: [
            'Star Wars', 'Harry Potter', 'Pokemon', 'Minecraft', 'Fortnite', 'Youtube', 'Facebook', 'Tiktok', 'Netflix',
            'Batman', 'Superman', 'Spiderman', 'Iron Man', 'Hulk', 'Thor', 'Joker', 'Thanos', 'Voldemort',
            'Spongebob', 'Pikachu', 'Mario', 'Luigi', 'Sonic', 'Zelda', 'Link', 'Sora', 'Goku', 'Naruto',
            'Luffy', 'Totoro', 'Mickey', 'Minnie', 'Donald', 'Goofy', 'Simba', 'Elsa', 'Anna', 'Olaf'
        ]
    },
    {
        category: 'Hard / Abstract',
        items: [
            'Love', 'Hate', 'Fear', 'Joy', 'Sadness', 'Anger', 'Peace', 'War', 'Time', 'Space',
            'Dream', 'Idea', 'Thought', 'Memory', 'Future', 'Past', 'Soul', 'Mind', 'Life', 'Death',
            'Energy', 'Power', 'Magic', 'Force', 'Spirit', 'Ghost', 'Alien', 'Zombie', 'Vampire', 'Werewolf',
            'Angel', 'Demon', 'God', 'Devil', 'Dragon', 'Unicorn', 'Mermaid', 'Fairy', 'Elf', 'Giant'
        ]
    }
];

export const getRandomPrompts = (count: number): { category: string, real: string, fakes: string[] } => {
    // Helper function used by 'Deception' mode (legacy), but we can keep it functional
    const set = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
    const shuffled = [...set.items].sort(() => 0.5 - Math.random());
    const real = shuffled[0];
    const fakes = shuffled.slice(1, count);

    return {
        category: set.category,
        real,
        fakes
    };
};
