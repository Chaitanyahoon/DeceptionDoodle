# Error Handling Guide

## Overview

This guide explains how to handle errors properly in Deception Doodle and how the system recovers from failures.

---

## Error Categories

### 1. Network Errors

**Type:** Connection failures, timeouts, message delivery issues

**How It's Handled:**
```typescript
try {
  await peerManager.connect(hostId);
  setIsConnected(true);
} catch (err) {
  console.error("Connection failed", err);
  // Exponential backoff retry kicks in automatically
  setIsConnected(false);
}
```

**User Experience:**
- Connection status indicator shows "Reconnecting..."
- Auto-retry with exponential backoff
- After 5 failed attempts, show "Connection Error" with manual retry button
- Toast notification on reconnection success

### 2. Data Validation Errors

**Type:** Invalid input from players (bad names, malformed data, etc.)

**How It's Handled:**
```typescript
const isValidName = validatePlayerName(userInput);
if (!isValidName) {
  useToast().showToast('Name must be 1-20 characters', 'error');
  return;
}
```

**Prevention:**
- Input validated before processing
- Type-safe protocol messages
- Rate limiting prevents spam

**User Experience:**
- Toast notification with error reason
- Input field highlights error
- Clear guidance on requirements

### 3. Game Logic Errors

**Type:** Invalid game state transitions, scoring issues, etc.

**How It's Handled:**
```typescript
const startGame = () => {
  if (gameState.players.length < 2) {
    useToast().showToast('Need at least 2 players', 'error');
    return;
  }
  // Proceed with game start
};
```

**Prevention:**
- State machine validates transitions
- Host validates all player submissions
- Duplicate guesses detected and ignored

**User Experience:**
- Clear error messages
- Game state remains consistent
- Smooth recovery to previous valid state

### 4. UI/Component Errors

**Type:** React rendering errors, ref issues, etc.

**How It's Handled:**
```typescript
<ErrorBoundary>
  <GameRoom />
</ErrorBoundary>
```

**Prevention:**
- Error boundary catches unhandled errors
- Proper effect cleanup prevents memory leaks
- Type safety prevents common mistakes

**User Experience:**
- Error modal displayed instead of blank page
- Option to retry or reload
- Error details visible in dev mode

### 5. Drawing/Canvas Errors

**Type:** Drawing submission issues, canvas rendering problems

**How It's Handled:**
```typescript
const drawingValid = validateDrawingSubmission(canvasDataUrl);
if (!drawingValid.valid) {
  useToast().showToast(`Drawing invalid: ${drawingValid.reason}`, 'error');
  return;
}
```

**Prevention:**
- Drawing submission validated
- Canvas history preserved locally
- Fallback to re-submit

---

## Error Recovery Strategies

### Automatic Retry

Used for transient network failures:

```typescript
async function retryWithBackoff(
  fn: () => Promise<T>,
  maxRetries: number = 5
): Promise<T> {
  // Exponential backoff: 1s → 2s → 4s → 8s → 16s
  // With 10% jitter to prevent thundering herd
}
```

**When to use:**
- Network timeouts
- Temporary connection loss
- Transient server errors

**When NOT to use:**
- Invalid input (don't retry forever)
- Authentication errors (don't retry unauthorized)
- Business logic errors

### Graceful Degradation

Game continues with reduced functionality:

```typescript
if (!isConnected) {
  // Show connection status
  // Disable sending actions
  // Queue actions for when reconnected
  // Show message to user
}
```

**Examples:**
- Player disconnects → marked as `isConnected: false`
- Game continues with remaining players
- Reconnection restores player to game
- Score preserved, game continues

### State Reconciliation

When client reconnects, host resends full state:

```typescript
// Client receives GAME_STATE_UPDATE
// Completely overwrites local state
// No data loss, always synced with host
```

---

## Error Handling Checklist

When adding new features:

- [ ] **Input Validation** - All user inputs validated
- [ ] **Error Messages** - Clear, actionable error messages
- [ ] **Type Safety** - No `any` types, proper interfaces
- [ ] **Error Boundaries** - UI sections protected
- [ ] **Network Retry** - Transient failures handled
- [ ] **Cleanup** - Effects properly cleaned up
- [ ] **Logging** - Errors logged for debugging
- [ ] **Testing** - Error paths tested
- [ ] **Documentation** - Error scenarios documented

---

## Common Error Scenarios & Solutions

### Scenario 1: Player Joins with Duplicate Name

**Error:**
```
Player "Alice" already joined
```

**Solution:**
```typescript
if (players.some(p => p.name === newPlayerName)) {
  throw new Error('Name already taken');
}
```

**User Experience:**
- Error toast shown
- Player prompted to choose different name
- Game doesn't start until resolved

### Scenario 2: Drawing Submission Fails

**Error:**
```
Failed to submit drawing - network error
```

**Automatic Recovery:**
```typescript
// Client retries up to 5 times with backoff
// If still fails, show manual retry button
// Drawing preserved in canvas, can redraw if needed
```

**User Experience:**
- "Retrying..." indicator shown
- Manual retry button after 5 attempts
- Option to continue without submitting (forfeit round)

### Scenario 3: Connection Lost During Game

**Error:**
```
Connection lost - attempting to reconnect...
```

**Automatic Recovery:**
```typescript
// 1. Stop sending new messages
// 2. Retry connection with backoff
// 3. On reconnect, request full game state
// 4. Resume playing from where you left off
```

**User Experience:**
- Connection status shows "Reconnecting..."
- Game paused (not accepting inputs)
- Auto-resumes when connected
- No data loss

### Scenario 4: Host Disconnects

**Error:**
```
Host disconnected - game cannot continue
```

**Manual Recovery:**
```typescript
// Host must rejoin to continue
// If host is gone > 5 minutes, room closed
// Players can join new room
```

**User Experience:**
- Clear message: "Waiting for host..."
- Option to leave and start new game
- Timeout warning after 3 minutes

---

## Logging Best Practices

### Log Levels

```typescript
// DEBUG - Detailed tracing
console.log('Received stroke:', stroke);

// INFO - Important state changes
console.info('Game started, round 1');

// WARN - Recoverable problems
console.warn('Retrying connection, attempt 2/5');

// ERROR - Unrecoverable failures
console.error('Drawing submission validation failed:', err);
```

### What to Log

✅ **DO Log:**
- Game state transitions
- Network errors and retries
- Validation failures
- Unexpected conditions

❌ **DON'T Log:**
- Every stroke (too verbose)
- Sensitive player data
- Passwords or tokens
- Internal peerId details

### Log Format

```typescript
console.error('Component: Action failed', {
  reason: 'Network error',
  attempt: 2,
  nextRetryMs: 2000,
  error: err.message
});
```

---

## Testing Error Scenarios

### Unit Tests

```typescript
it('should handle connection timeout', async () => {
  const mockFn = vi.fn();
  await retryWithBackoff(mockFn, 3);
  
  expect(mockFn).toHaveBeenCalledTimes(3);
  expect(backoff.getRetryCount()).toBe(3);
});
```

### Integration Tests

```typescript
it('should recover game state on reconnect', async () => {
  // 1. Simulate disconnection
  // 2. Attempt reconnection
  // 3. Verify game state restored
  // 4. Verify player can continue playing
});
```

---

## Debugging Tips

### Enable Debug Logging

```typescript
const DEBUG = import.meta.env.DEV;

if (DEBUG) {
  console.log('Game State:', gameState);
  console.log('Connection Status:', isConnected);
}
```

### Check Browser Console

- `Ctrl+Shift+J` (Windows/Linux)
- `Cmd+Option+J` (Mac)

### Network Tab

- View WebRTC connections
- Check message delivery
- Monitor bandwidth usage

### Error Boundary Details

In dev mode, error boundary shows:
- Error message
- Component stack
- Retry button

---

## Error Prevention Best Practices

### 1. Use TypeScript Strict Mode

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noUncheckedIndexedAccess": true
  }
}
```

### 2. Validate All Inputs

```typescript
const input = userInput;
if (!validatePlayerName(input)) {
  return; // Don't proceed with invalid input
}
```

### 3. Handle All Code Paths

```typescript
switch (data.type) {
  case 'JOIN_REQUEST':
    // ...
  case 'GAME_STATE_UPDATE':
    // ...
  default:
    // TypeScript error if not exhaustive!
    const _exhaustive: never = data;
}
```

### 4. Clean Up Resources

```typescript
useEffect(() => {
  const timer = setInterval(() => {
    // Do something
  }, 5000);

  return () => clearInterval(timer); // Cleanup!
}, []);
```

### 5. Test Error Paths

```typescript
it('should handle empty input', () => {
  expect(validatePlayerName('')).toBe(false);
});

it('should handle very long input', () => {
  expect(validatePlayerName('a'.repeat(100))).toBe(false);
});
```

---

## Further Reading

- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [TypeScript Error Handling](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html)
- [PeerJS Error Handling](https://peerjs.com/docs/#api-errors)
- [Resilient Systems Design](https://resilience4j.readme.io/)
