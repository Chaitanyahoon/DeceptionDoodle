# Deception Doodle

A real-time multiplayer social deduction drawing game where creativity meets deception.

## 🎮 How to Play

1.  **Create a Room**: One player hosts the game and shares the Room ID/Link.
2.  **Join**: Friends join using the Room ID.
3.  **The Roles**:
    *   **The Target (1 Player)**: Receives a specific prompt (e.g., "Cat").
    *   **The Detectives (Everyone Else)**: Receive different prompts from the *same category* (e.g., "Dog", "Rabbit", "Bear").
4.  **Draw**: Everyone draws their prompt simultaneously on the canvas.
5.  **Vote**: Players analyze the drawings. The Detectives must deduce who the **Target** is. The Target must blend in and avoid detection.
6.  **Win**:
    *   **Detectives Win**: If the majority successfully identifies the Target.
    *   **Target Wins**: If they survive the vote without being caught.

## ✨ Features

*   **Real-time Multiplayer**: Powered by PeerJS for seamless P2P connections.
*   **Drawing Tools**:
    *   Full Color Palette ("Cosmic Glass" aesthetic)
    *   Brush Size Slider
    *   Pencil & Eraser modes
    *   Clear Canvas
*   **Game Settings**: Customize the number of **Rounds** (3, 5, 10) and **Draw Time** (60s, 90s, 120s).
*   **Responsive UI**: Mobile-friendly "Glassmorphism" design.
*   **Short Room IDs**: Easy-to-share 5-character codes.

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
