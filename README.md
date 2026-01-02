# Deception Doodle

A real-time multiplayer social deduction drawing game where creativity meets deception.

## 🎮 How to Play

1.  **Lobby**: Host creates a room, players join and pick their fun **Avatars** (Robot, Pizza, Alien, etc.).
2.  **The Loop**: The game creates a turn-based experiences.
3.  **The Artist**: One player is chosen to draw. They pick a secret word (e.g., "Tornado") and have 60s to draw it.
4.  **The Guessers**: Everyone else watches the live drawing and types guesses in the chat.
    *   **Points**: The faster you guess, the more points you get. The Artist gets points if people guess correctly.
5.  **Hints**: The game automatically reveals hints (letters) as time runs out.
6.  **Victory**: After all rounds, the player with the highest score wins!

## ✨ Features

*   **Real-time Multiplayer**: Seamless P2P drawing via PeerJS.
*   **Interactive Canvas**:
    *   Brush Size & Color Palette
    *   Eraser & Clear Tools
    *   Live broadcasting of strokes
*   **Visual Polish**:
    *   Custom Doodle Avatars
    *   Animated "Sharpening Pencils" Loading Screen
    *   Glassmorphism UI
*   **Audio**:
    *   Satisfying interaction SFX (Ticks, Chimes, Clicks)
    *   No annoying continuous loops
*   **Game Settings**: Configurable rounds and draw times.

## 🛠️ Tech Stack

*   **Frontend**: React, TypeScript, Vite
*   **Styling**: Tailwind CSS, Framer Motion
*   **Networking**: PeerJS (WebRTC)
*   **Icons**: Lucide React

## 🚀 Getting Started

1.  Clone the repository:
    ```bash
    git clone https://github.com/Chaitanyahoon/DeceptionDoodle.git
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the development server:
    ```bash
    npm run dev
    ```
4.  Open `http://localhost:5173` in your browser.
