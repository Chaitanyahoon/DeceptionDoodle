# Contributing to Deception Doodle

Welcome! This guide will help you contribute to Deception Doodle.

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- Basic knowledge of React, TypeScript, and WebRTC

### Development Setup

```bash
# Clone the repository
git clone https://github.com/Chaitanyahoon/DeceptionDoodle.git
cd DeceptionDoodle

# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
# http://localhost:5173
```

### Project Structure

```
src/
├── components/          # React UI components
├── hooks/              # Custom React hooks for game logic
├── network/            # P2P networking layer
├── utils/              # Utilities (validation, networking, etc.)
├── data/               # Static data (words, avatars)
└── App.tsx             # Entry point
```

---

## Code Standards

### TypeScript

All code must be **strictly typed** - no `any` types!

```typescript
// ❌ Bad
const handleData = (data: any) => {
  // ...
};

// ✅ Good
import type { ProtocolMessage } from '../network/types';

const handleData = (data: ProtocolMessage) => {
  // ...
};
```

### Function Documentation

All public functions should have JSDoc comments:

```typescript
/**
 * Validates a player name
 * @param name - The name to validate
 * @returns True if valid (1-20 chars, non-empty)
 */
export const validatePlayerName = (name: string): boolean => {
  return name.trim().length > 0 && name.trim().length <= 20;
};
```

### React Components

Use functional components with hooks:

```typescript
/**
 * Shows player list with scores and status
 */
export const PlayerList: React.FC<PlayerListProps> = ({
  players,
  currentDrawerId
}) => {
  return (
    <div className="...">
      {/* Component JSX */}
    </div>
  );
};
```

---

## Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/my-feature
# or
git checkout -b fix/my-bugfix
```

**Branch naming:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation
- `refactor/` - Code refactoring

### 2. Make Your Changes

Follow the code standards above.

### 3. Test Your Changes

```bash
# Run linter
npm run lint

# Run unit tests
npm run test

# Run tests with UI
npm run test:ui

# Build to check for errors
npm run build
```

### 4. Commit Your Changes

```bash
git add .
git commit -m "feat: add player reconnection timeout"
```

**Commit message format:**
```
<type>(<scope>): <description>

[optional body]
[optional footer]
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Code style (formatting)
- `refactor` - Code refactoring
- `test` - Adding tests
- `perf` - Performance improvement

**Examples:**
```
feat(network): add heartbeat-based connection monitoring
fix(canvas): prevent eraser from erasing outside bounds
docs: update architecture guide with new flow diagrams
refactor(hooks): extract game timer logic to separate hook
```

### 5. Push and Create Pull Request

```bash
git push origin feature/my-feature
```

Then create a pull request on GitHub with:
- Clear description of changes
- Related issue numbers (if any)
- Screenshots for UI changes

---

## Adding a New Feature

### Example: Add a "Hint" Button

#### Step 1: Update Types

```typescript
// src/network/types.ts
export type ProtocolMessage =
  // ... existing types
  | { type: 'REQUEST_HINT'; payload: Record<string, never> }
  | { type: 'HINT_REVEALED'; payload: { hint: string } };
```

#### Step 2: Add Host Logic

```typescript
// src/hooks/useGameHost.ts
const handleHintRequest = (peerId: string) => {
  const hint = generateHint(gameState.prompt);
  peerManager.send(peerId, {
    type: 'HINT_REVEALED',
    payload: { hint }
  });
};
```

#### Step 3: Add Client Logic

```typescript
// src/hooks/useGameClient.ts
case 'HINT_REVEALED':
  setGameState(prev => ({
    ...prev,
    hint: data.payload.hint
  }));
  useToast().showToast('Hint revealed!', 'info');
  break;
```

#### Step 4: Create UI Component

```typescript
// src/components/HintButton.tsx
export const HintButton: React.FC<HintButtonProps> = ({
  hint,
  onRequest,
  disabled
}) => {
  return (
    <button
      onClick={onRequest}
      disabled={disabled || !hint}
      className="..."
    >
      💡 {hint || 'Request Hint'}
    </button>
  );
};
```

#### Step 5: Add to GameRoom

```typescript
// src/components/GameRoom.tsx
<HintButton
  hint={gameState.hint}
  onRequest={() => {
    clientLogic.requestHint?.();
  }}
  disabled={gameState.currentState !== 'GUESSING'}
/>
```

#### Step 6: Write Tests

```typescript
// src/utils/gameLogic.test.ts
describe('Hint Generation', () => {
  it('should generate hint with partial word revealed', () => {
    const hint = generateHint('Tornado');
    expect(hint).toMatch(/T.+o$/);
  });
});
```

#### Step 7: Update Documentation

Update `ARCHITECTURE.md` to mention the new feature in the protocol section.

---

## Writing Tests

### Testing Validation Functions

```typescript
import { describe, it, expect } from 'vitest';
import { validatePlayerName } from '../src/utils/validation';

describe('Input Validation', () => {
  it('should accept valid names', () => {
    expect(validatePlayerName('Alice')).toBe(true);
  });

  it('should reject empty names', () => {
    expect(validatePlayerName('')).toBe(false);
  });

  it('should reject names longer than 20 chars', () => {
    expect(validatePlayerName('a'.repeat(21))).toBe(false);
  });
});
```

### Testing Network Functions

```typescript
describe('Connection Monitoring', () => {
  it('should detect timeout after threshold', () => {
    const monitor = new ConnectionMonitor(1000, 3000);
    let timedOut = false;

    monitor.start(
      () => {}, // onHeartbeat
      () => { timedOut = true; } // onTimeout
    );

    vi.advanceTimersByTime(3500);
    expect(timedOut).toBe(true);
  });
});
```

---

## Performance Guidelines

### Don't

❌ Send drawing strokes on every pixel movement
❌ Broadcast full game state on every change
❌ Keep unlimited undo history
❌ Create new functions on every render

### Do

✅ Batch strokes (10 strokes or 100ms)
✅ Debounce/throttle frequent updates
✅ Limit history to 20 items
✅ Memoize expensive computations
✅ Use `useCallback` for event handlers

```typescript
// ❌ Bad
const draw = (e) => {
  onStroke(stroke); // Fired on every pixel
};

// ✅ Good
const throttledSendStroke = throttle((stroke) => {
  onStroke(stroke);
}, 100);

const draw = (e) => {
  throttledSendStroke(stroke);
};
```

---

## Code Review Guidelines

### Before Submitting

- [ ] Code follows TypeScript strict mode
- [ ] No ESLint warnings
- [ ] All new functions have JSDoc
- [ ] Tests pass (`npm run test`)
- [ ] Build succeeds (`npm run build`)
- [ ] No `any` types added
- [ ] Error handling considered
- [ ] Documentation updated

### During Review

- Be respectful and constructive
- Ask questions if unclear
- Suggest improvements, don't demand
- Test locally before approving

---

## Debugging

### Enable Debug Logging

```typescript
const DEBUG = import.meta.env.DEV;

if (DEBUG) {
  console.log('Game State:', gameState);
  console.log('Message sent:', data);
}
```

### Check Network Messages

Open DevTools → Network tab (or Console tab for WebRTC):

```typescript
// Monitor all peer messages
peerManager.on('DATA', ({ peerId, data }) => {
  console.log(`Message from ${peerId}:`, data);
});
```

### Local Testing with Multiple Browsers

1. Open `http://localhost:5173` in two browser windows
2. In Window 1: Create room (you're the host)
3. In Window 2: Join with room ID
4. Test game flow

---

## Common Issues

### Issue: "Peer not initialized"

**Cause:** PeerProvider not initialized yet

**Fix:**
```typescript
useEffect(() => {
  if (!isInitialized) return;
  // Use peer
}, [isInitialized]);
```

### Issue: "Type error: Property 'xyz' does not exist"

**Cause:** Missing TypeScript interface

**Fix:**
```typescript
// Make sure to import type
import type { ProtocolMessage } from '../network/types';

// Ensure message type is defined in union
```

### Issue: "Drawing not syncing"

**Cause:** Drawing strokes not being sent

**Fix:**
```typescript
// Ensure onStroke callback is connected
<GameCanvas
  onStroke={(stroke) => {
    peerManager.send(hostId, {
      type: 'DRAW_STROKE',
      payload: stroke
    });
  }}
/>
```

---

## Resources

- **Architecture Guide:** See `ARCHITECTURE.md`
- **Error Handling:** See `ERROR_HANDLING.md`
- **TypeScript Docs:** https://www.typescriptlang.org/docs/
- **React Hooks:** https://react.dev/reference/react
- **Vitest:** https://vitest.dev/
- **PeerJS:** https://peerjs.com/docs

---

## Questions?

- Check existing issues on GitHub
- Read through `ARCHITECTURE.md` and `ERROR_HANDLING.md`
- Open a discussion on GitHub
- Ask in pull request comments

---

## Thank You!

Your contributions help make Deception Doodle better! 🎨
