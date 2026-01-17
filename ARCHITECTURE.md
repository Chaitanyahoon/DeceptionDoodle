# Deception Doodle - Architecture Guide

## Overview

**Deception Doodle** is a real-time multiplayer drawing game with a social deduction twist. Players take turns drawing words while others guess. It uses **WebRTC peer-to-peer** networking for low-latency, decentralized communication.

---

## System Architecture

### High-Level Components

```
┌─────────────────────────────────────────────────────────┐
│                    React App                             │
│  ┌──────────────────────────────────────────────────┐   │
│  │ ErrorBoundary (Error handling)                   │   │
│  │ ┌──────────────────────────────────────────────┐ │   │
│  │ │ ToastProvider (Notifications)                │ │   │
│  │ │ ┌──────────────────────────────────────────┐ │ │   │
│  │ │ │ PeerProvider (P2P Networking)            │ │ │   │
│  │ │ │ ┌──────────────────────────────────────┐ │ │ │   │
│  │ │ │ │ Router                               │ │ │ │   │
│  │ │ │ │  - LobbyScreen (Join/Create)         │ │ │ │   │
│  │ │ │ │  - GameRoom (Game Play)              │ │ │ │   │
│  │ │ │ └──────────────────────────────────────┘ │ │ │   │
│  │ │ └──────────────────────────────────────────┘ │ │   │
│  │ └──────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## Network Layer

### PeerManager (src/network/PeerManager.ts)

Manages all WebRTC peer-to-peer connections using **PeerJS**.

**Key Responsibilities:**
- Initialize peer connections with unique IDs (5-char alphanumeric)
- Handle incoming/outgoing connections
- Broadcast and unicast messaging
- Event emission system for connection lifecycle

**Type-Safe Event System:**
```typescript
on<E extends PeerEvent>(event: E, callback: EventCallback<E>): void
off<E extends PeerEvent>(event: E, callback: EventCallback<E>): void
```

**Connection Flow:**
```
Host:                    Client:
├─ Initialize peer       ├─ Initialize peer
├─ Emit: CONNECT        ├─ Connect to host
└─ Listen for incoming  │  (peerId = hostId)
                         ├─ Send: JOIN_REQUEST
                         └─ Listen for: GAME_STATE_UPDATE
```

### Protocol Messages (src/network/types.ts)

Strongly-typed protocol using discriminated unions:

```typescript
type ProtocolMessage =
  | { type: 'JOIN_REQUEST'; payload: { name: string; avatarId: string } }
  | { type: 'GAME_STATE_UPDATE'; payload: GameContextState }
  | { type: 'DRAW_STROKE'; payload: DrawStroke }
  | ... (and more)
```

**Benefits:**
- Type-safe message handling
- Exhaustive switch statements caught by TypeScript
- Clear protocol documentation

### Connection Resilience

The system includes three layers of resilience:

#### 1. **Exponential Backoff** (networkUtils.ts)
For automatic reconnection with exponential delays:
- Initial delay: 1s
- Max delay: 30s
- Jitter: ±10% to prevent thundering herd

#### 2. **Connection Monitoring** (networkUtils.ts)
Heartbeat-based connection verification:
- Periodic PING messages every 5 seconds
- Timeout detection if no PONG within 15 seconds
- Automatic disconnection detection

#### 3. **Graceful Degradation**
- Players marked as `isConnected: false` are skipped during broadcasts
- Game continues with remaining players
- Reconnection restores player state from host

---

## Game State Management

### Game State Machine

```
LOBBY
  ↓
STARTING (Initialize game, show readiness)
  ↓
WORD_SELECTION (Drawer chooses word)
  ↓
DRAWING (60s drawing phase)
  ↓
GUESSING (Other players guess)
  ↓
TURN_RESULTS (Show correct answer, award points)
  ↓
(Loop for next player) OR
RESULTS (All rounds complete, show winner)
```

### Host vs Client Architecture

**Host (useGameHost.ts):**
- Single source of truth for game state
- Manages turn order, scoring, word selection
- Broadcasts state updates to all clients
- Validates player submissions

**Client (useGameClient.ts):**
- Receives state updates from host
- Sends player actions (guesses, drawings)
- Local rendering of received strokes
- Handles connection failures gracefully

### State Structure

```typescript
interface GameContextState {
  currentState: GameState;
  players: Player[];
  timer: number;
  round: number;
  currentDrawerId?: string;
  wordChoices?: string[];        // Only sent to drawer
  wordToGuess?: string;          // Only sent to drawer at end
  drawings: DrawingSubmission[];
  chatMessages: ChatMessage[];
  settings: GameSettings;
}
```

**Privacy Principle:**
- `wordToGuess` only revealed to drawer until end of round
- `wordChoices` only sent to player selecting word
- Other players see only public game state

---

## Drawing Canvas

### Canvas Synchronization

**Local Drawing (Draw Phase):**
1. User draws on canvas
2. Strokes are **batched** (10 strokes or 100ms)
3. Batched strokes sent to host
4. Host relays to other players
5. Remote players redraw strokes

**Batch Optimization:**
```typescript
// Instead of: onStroke(stroke) for every pixel
// We do: onStroke(batch) every 100ms or 10 strokes
// Reduces network traffic by ~90%
```

### Drawing Tools

- **Brush**: Variable size and color
- **Eraser**: White strokes on white background
- **Flood Fill**: Smart tolerance-based color fill
- **Undo**: Last 20 steps preserved in history
- **Clear**: Reset canvas

### Canvas Performance

- Batch stroke updates to 100ms or 10 strokes
- Use throttling to prevent excessive network messages
- RequestAnimationFrame for smooth local rendering
- History limited to 20 steps to manage memory

---

## Input Validation & Security

### Validation Layer (src/utils/validation.ts)

All user inputs validated before processing:

```typescript
✓ Player names: 1-20 characters
✓ Word selections: 1-50 characters, non-empty
✓ Guesses: 1-100 characters, non-empty
✓ Drawing submissions: Valid base64 image data
✓ Game settings: Rounds 1-20, draw time 10-300s
```

### Rate Limiting

```typescript
const limiter = new RateLimiter(5, 1000);  // 5 msgs per second

if (limiter.canSend()) {
  peerManager.send(hostId, message);
}
```

Prevents:
- Message spam
- Network congestion
- DoS attacks from single client

### Data Sanitization

```typescript
const cleanName = sanitizeName(userInput);      // Trim + limit
const cleanMsg = sanitizeMessage(userInput);    // Trim + limit
```

Prevents:
- XSS (if using innerHTML)
- Excessive storage usage
- UI layout breaking

---

## UI Components

### Layout Hierarchy

```
App
├─ ErrorBoundary (crash handling)
├─ ToastProvider (notifications)
├─ PeerProvider (networking)
└─ Router
   ├─ LobbyScreen
   │  ├─ AvatarSelector
   │  └─ ConnectionStatusIndicator
   └─ GameRoom
      ├─ GamePhaseIndicator
      ├─ ConnectionStatusIndicator
      ├─ GameCanvas
      ├─ DrawingToolbar
      ├─ ChatPanel
      ├─ PlayerList
      ├─ WordSelectionPanel
      └─ VotingPanel
```

### Key UI Features

**ErrorBoundary:**
- Catches React errors
- Shows error details in dev mode
- Provides recovery options (Retry, Reload)

**ToastProvider:**
- Global notification system
- Type-aware (success/error/info/warning)
- Auto-dismiss or persistent

**ConnectionStatusIndicator:**
- Real-time connection state
- Retry button for errors
- Animated pulse for connecting state

**GamePhaseIndicator:**
- Visual phase progression
- Current phase description
- Round counter

---

## Keyboard Shortcuts

```
ESC       → Leave room
Ctrl+Z    → Undo drawing
Enter     → Submit guess
S         → Save drawing (debug)
```

---

## Testing Strategy

### Unit Tests (Vitest)

**Validation Tests** (`utils/validation.test.ts`):
- Input validation logic
- Sanitization functions
- Edge cases

**Network Tests** (`utils/networkUtils.test.ts`):
- Exponential backoff calculation
- Connection monitoring
- Debounce/throttle behavior
- Retry logic with backoff

### Test Execution

```bash
npm run test           # Run all tests
npm run test:ui       # Interactive test dashboard
```

---

## Performance Optimizations

### Code Splitting

Components lazy-loaded with React.lazy():
```typescript
const GameRoom = lazy(() => import('./components/GameRoom'));
```

### Drawing Optimization

- Throttle stroke broadcasts (100ms)
- Batch multiple strokes per message
- Limit undo history to 20 steps
- Use canvas compositing for efficiency

### Reduced Motion Support

```typescript
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion)'
).matches;

if (!prefersReducedMotion) {
  <ParticleBackground />;
}
```

### Memory Management

- Clear timers on component unmount
- Unsubscribe from event listeners
- Limit history and cache sizes

---

## Error Handling

### Error Boundary

Catches unhandled React errors with graceful fallback UI.

### Network Error Recovery

1. **Connection Lost**
   - Exponential backoff reconnection
   - Heartbeat monitoring
   - Automatic recovery when connection restored

2. **Message Delivery**
   - PeerJS handles automatic retries
   - Game state broadcasts periodically
   - Client reconciles state on reconnect

3. **Invalid Data**
   - All inputs validated
   - Malformed messages logged and ignored
   - Host re-broadcasts state on request

---

## Development Guidelines

### Adding a New Feature

1. **Define Types** → Update `src/network/types.ts`
2. **Add Protocol Message** → Discriminated union
3. **Host Logic** → Add handler in `useGameHost`
4. **Client Logic** → Add handler in `useGameClient`
5. **UI Component** → Create component
6. **Add Tests** → Write unit/integration tests
7. **Document** → Update this guide

### Code Quality

- All functions typed (no `any`)
- JSDoc comments on public functions
- Unit tests for logic functions
- Error boundaries for UI sections

### Debugging

Enable verbose logging:
```typescript
const DEBUG = import.meta.env.DEV;
if (DEBUG) console.log('Game state:', gameState);
```

---

## Deployment Considerations

### Browser Support

- Modern browsers with WebRTC support
- Fallback message for unsupported browsers
- Mobile responsive design

### Network Requirements

- WebRTC firewall traversal (STUN/TURN servers)
- Works on WiFi and cellular
- Graceful degradation on poor connections

### Scaling Limits

- Current architecture supports ~8-10 players per room
- Beyond 10 players: increased latency and bandwidth usage
- Consider multiple smaller rooms for large groups

---

## Future Improvements

- [ ] Audio chat during gameplay
- [ ] Replay recording and playback
- [ ] Custom word list support
- [ ] Game statistics and leaderboards
- [ ] Mobile app (React Native)
- [ ] Server-based relay for better P2P connectivity
- [ ] Spectator mode for larger games

---

## References

- [PeerJS Documentation](https://peerjs.com/)
- [React Hooks API](https://react.dev/reference/react)
- [Framer Motion](https://www.framer.com/motion/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
