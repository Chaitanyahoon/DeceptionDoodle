import { describe, expect, test } from 'vitest';
import { AchievementManager } from './gameEnhancements';

describe('AchievementManager', () => {
  test('should unlock first-game achievement when gamesPlayed >= 1', () => {
    const manager = new AchievementManager();

    const unlocked = manager.checkProgress('player-1', {
      gamesPlayed: 1,
      winStreak: 0,
      accuracy: 0,
      drawTime: 0,
      impostorWins: 0,
      detectionStreak: 0,
      uniquePlayers: 0,
      gamesWon: 0
    });

    expect(unlocked).toContain('first-game');
  });

  test('should not unlock first-game achievement when gamesPlayed is 0', () => {
    const manager = new AchievementManager();

    const unlocked = manager.checkProgress('player-2', {
      gamesPlayed: 0,
      winStreak: 0,
      accuracy: 0,
      drawTime: 0,
      impostorWins: 0,
      detectionStreak: 0,
      uniquePlayers: 0,
      gamesWon: 0
    });

    expect(unlocked).not.toContain('first-game');
  });
});
