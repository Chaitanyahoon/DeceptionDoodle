
// Massive Word Bank for Deception Doodle
// Categories for variety, but primarily used for random selection.

const ANIMALS = [
    'Cat', 'Dog', 'Rabbit', 'Elephant', 'Lion', 'Tiger', 'Bear', 'Fox', 'Wolf', 'Deer',
    'Giraffe', 'Monkey', 'Snake', 'Shark', 'Whale', 'Dolphin', 'Penguin', 'Frog', 'Duck', 'Horse',
    'Cow', 'Pig', 'Sheep', 'Chicken', 'Mouse', 'Rat', 'Bat', 'Owl', 'Eagle', 'Parrot',
    'Butterfly', 'Spider', 'Ant', 'Bee', 'Crab', 'Octopus', 'Jellyfish', 'Starfish', 'Seahorse',
    'Zebra', 'Panda', 'Koala', 'Kangaroo', 'Camel', 'Rhino', 'Hippo', 'Gorilla', 'Chimpanzee', 'Lemur',
    'Sloth', 'Otter', 'Beaver', 'Badger', 'Hedgehog', 'Squirrel', 'Chipmunk', 'Racoon', 'Skunk', 'Flamingo',
    'Peacock', 'Ostrich', 'Turkey', 'Swan', 'Goose', 'Pigeon', 'Crow', 'Raven', 'Vulture', 'Hawk',
    'Falcon', 'Woodpecker', 'Hummingbird', 'Toucan', 'Chameleon', 'Gecko', 'Iguana', 'Komodo Dragon', 'Crocodile', 'Alligator',
    'Turtle', 'Tortoise', 'Lobster', 'Shrimp', 'Squid', 'Clownfish', 'Goldfish', 'Pufferfish', 'Stingray', 'Manta Ray'
];

const FOOD = [
    'Pizza', 'Burger', 'Sushi', 'Taco', 'Sandwich', 'Pasta', 'Steak', 'Salad', 'Soup', 'Cake',
    'Ice Cream', 'Chocolate', 'Bread', 'Cheese', 'Egg', 'Apple', 'Banana', 'Orange', 'Grape', 'Strawberry',
    'Watermelon', 'Pineapple', 'Cherry', 'Peach', 'Pear', 'Lemon', 'Lime', 'Potato', 'Tomato', 'Onion',
    'Carrot', 'Corn', 'Broccoli', 'Cookie', 'Donut', 'Pancake', 'Waffle', 'Bacon', 'Sausage', 'Hot Dog',
    'Burrito', 'Nachos', 'Fries', 'Chips', 'Popcorn', 'Pretzel', 'Toast', 'Bagel', 'Croissant', 'Muffin',
    'Pie', 'Tart', 'Brownie', 'Cupcake', 'Candy', 'Lollipop', 'Gum', 'Soda', 'Juice', 'Milk',
    'Coffee', 'Tea', 'Water', 'Beer', 'Wine', 'Cocktail', 'Smoothie', 'Milkshake', 'Yogurt', 'Butter',
    'Cream', 'Jam', 'Honey', 'Sugar', 'Salt', 'Pepper', 'Spice', 'Herb', 'Garlic', 'Ginger',
    'Rice', 'Noodle', 'Dumpling', 'Curry', 'Stew', 'Roast', 'Grill', 'BBQ', 'Fried Chicken', 'Fish and Chips'
];

const OBJECTS = [
    'Chair', 'Table', 'Lamp', 'Computer', 'Phone', 'Book', 'Pen', 'Clock', 'Key', 'Bag',
    'Shoes', 'Glasses', 'Hat', 'Watch', 'Ring', 'Necklace', 'Guitar', 'Piano', 'Drum', 'Violin',
    'Camera', 'TV', 'Radio', 'Headphones', 'Speaker', 'Car', 'Bike', 'Bus', 'Train', 'Plane',
    'Boat', 'Ship', 'Rocket', 'Robot', 'Doll', 'Ball', 'Bat', 'Racket', 'Helmet', 'Umbrella',
    'Bed', 'Sofa', 'Desk', 'Mirror', 'Window', 'Door', 'Wall', 'Floor', 'Ceiling', 'Roof',
    'House', 'Building', 'School', 'Hospital', 'Bank', 'Store', 'Park', 'Bridge', 'Road', 'Street',
    'Map', 'Flag', 'Money', 'Card', 'Ticket', 'Passport', 'Wallet', 'Purse', 'Backpack', 'Suitcase',
    'Box', 'Bottle', 'Can', 'Cup', 'Mug', 'Glass', 'Plate', 'Bowl', 'Spoon', 'Fork'
];

const ACTIONS = [
    'Run', 'Jump', 'Swim', 'Fly', 'Sleep', 'Eat', 'Drink', 'Read', 'Write', 'Draw',
    'Sing', 'Dance', 'Play', 'Fight', 'Cry', 'Laugh', 'Smile', 'Cook', 'Clean', 'Wash',
    'Drive', 'Ride', 'Walk', 'Climb', 'Dig', 'Build', 'Break', 'Fix', 'Cut', 'Sew',
    'Paint', 'Type', 'Call', 'Text', 'Shop', 'Buy', 'Sell', 'Pay', 'Give', 'Take',
    'Think', 'Dream', 'Work', 'Study', 'Learn', 'Teach', 'Help', 'Love', 'Hate', 'Fear',
    'Win', 'Lose', 'Start', 'Stop', 'Open', 'Close', 'Enter', 'Exit', 'Push', 'Pull',
    'Throw', 'Catch', 'Hit', 'Kick', 'Punch', 'Kiss', 'Hug', 'Hold', 'Carry', 'Lift'
];

const PLACES_NATURE = [
    'Beach', 'Mountain', 'Forest', 'Desert', 'Jungle', 'Island', 'Ocean', 'River', 'Lake', 'Waterfall',
    'Volcano', 'Cave', 'Valley', 'Canyon', 'Park', 'Garden', 'Farm', 'Zoo', 'City', 'Village',
    'Space', 'Moon', 'Sun', 'Star', 'Planet', 'Galaxy', 'Cloud', 'Rain', 'Snow', 'Storm',
    'Wind', 'Fire', 'Earth', 'Water', 'Tree', 'Flower', 'Grass', 'Leaf', 'Rock', 'Sand'
];

export const WORD_BANK = [
    ...ANIMALS,
    ...FOOD,
    ...OBJECTS,
    ...ACTIONS,
    ...PLACES_NATURE
];

// For Categories if needed later
export const CATEGORIZED_WORDS = {
    Animals: ANIMALS,
    Food: FOOD,
    Objects: OBJECTS,
    Actions: ACTIONS,
    Nature: PLACES_NATURE
};
