/**
 * Game Enhancement System
 * Leaderboards, achievements, difficulty levels, and categories
 */

export type DifficultyLevel = 'easy' | 'normal' | 'hard';
export type WordCategory = 'animals' | 'objects' | 'actions' | 'places' | 'abstract';

export interface PlayerScore {
  playerId: string;
  playerName: string;
  totalScore: number;
  gamesPlayed: number;
  gamesWon: number;
  winRate: number;
  averageGuesses: number;
  totalAccuracy: number;
  rank: number;
  lastUpdated: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: string;
  unlockedAt?: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export interface Leaderboard {
  topScores: PlayerScore[];
  timeRange: 'today' | 'week' | 'allTime';
  lastUpdated: number;
}

/**
 * Leaderboard management system
 */
export class LeaderboardManager {
  private leaderboardData = new Map<string, PlayerScore>();
  private readonly maxLeaderboardSize = 100;

  /**
   * Update or create a player score
   */
  public updateScore(
    playerId: string,
    playerName: string,
    points: number,
    won: boolean,
    guesses: number,
    accuracy: number
  ): PlayerScore {
    let score = this.leaderboardData.get(playerId);

    if (!score) {
      score = {
        playerId,
        playerName,
        totalScore: 0,
        gamesPlayed: 0,
        gamesWon: 0,
        winRate: 0,
        averageGuesses: 0,
        totalAccuracy: 0,
        rank: 0,
        lastUpdated: Date.now()
      };
    }

    score.totalScore += points;
    score.gamesPlayed++;
    if (won) score.gamesWon++;
    score.winRate = (score.gamesWon / score.gamesPlayed) * 100;
    score.averageGuesses = (score.averageGuesses * (score.gamesPlayed - 1) + guesses) / score.gamesPlayed;
    score.totalAccuracy = (score.totalAccuracy * (score.gamesPlayed - 1) + accuracy) / score.gamesPlayed;
    score.lastUpdated = Date.now();

    this.leaderboardData.set(playerId, score);
    this.updateRanks();

    return score;
  }

  /**
   * Get player score
   */
  public getScore(playerId: string): PlayerScore | null {
    return this.leaderboardData.get(playerId) || null;
  }

  /**
   * Get top players
   */
  public getTopScores(limit = 10): PlayerScore[] {
    return Array.from(this.leaderboardData.values())
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, Math.min(limit, this.maxLeaderboardSize));
  }

  /**
   * Get leaderboard
   */
  public getLeaderboard(timeRange: 'today' | 'week' | 'allTime' = 'allTime'): Leaderboard {
    const topScores = this.getTopScores();
    return {
      topScores,
      timeRange,
      lastUpdated: Date.now()
    };
  }

  /**
   * Update rank for all players
   */
  private updateRanks(): void {
    const sorted = Array.from(this.leaderboardData.values())
      .sort((a, b) => b.totalScore - a.totalScore);

    sorted.forEach((score, index) => {
      score.rank = index + 1;
    });
  }

  /**
   * Clear leaderboard
   */
  public clear(): void {
    this.leaderboardData.clear();
  }

  /**
   * Export leaderboard
   */
  public export() {
    return Array.from(this.leaderboardData.values());
  }

  /**
   * Import leaderboard
   */
  public import(data: PlayerScore[]): void {
    this.leaderboardData.clear();
    data.forEach(score => {
      this.leaderboardData.set(score.playerId, score);
    });
    this.updateRanks();
  }
}

/**
 * Achievement system
 */
export class AchievementManager {
  private achievements = new Map<string, Achievement>();
  private unlockedAchievements = new Map<string, Set<string>>();

  constructor() {
    this.initializeAchievements();
  }

  private initializeAchievements(): void {
    const baseAchievements: Achievement[] = [
      {
        id: 'first-game',
        name: 'First Step',
        description: 'Play your first game',
        icon: '🎮',
        condition: 'gamesPlayed >= 1',
        rarity: 'common'
      },
      {
        id: 'winning-streak',
        name: 'On Fire',
        description: 'Win 3 games in a row',
        icon: '🔥',
        condition: 'winStreak >= 3',
        rarity: 'rare'
      },
      {
        id: 'perfect-accuracy',
        name: 'Bullseye',
        description: 'Achieve 100% accuracy in a game',
        icon: '🎯',
        condition: 'accuracy === 100',
        rarity: 'epic'
      },
      {
        id: 'speed-drawer',
        name: 'Lightning Fast',
        description: 'Draw a correct word in under 10 seconds',
        icon: '⚡',
        condition: 'drawTime < 10',
        rarity: 'uncommon'
      },
      {
        id: 'master-deceiver',
        name: 'Master Deceiver',
        description: 'Win 10 games as impostor',
        icon: '🎭',
        condition: 'impostorWins >= 10',
        rarity: 'legendary'
      },
      {
        id: 'perfect-detective',
        name: 'Perfect Detective',
        description: 'Identify impostor in 5 consecutive games',
        icon: '🔍',
        condition: 'detectionStreak >= 5',
        rarity: 'legendary'
      },
      {
        id: 'social-butterfly',
        name: 'Social Butterfly',
        description: 'Play with 20 different players',
        icon: '🦋',
        condition: 'uniquePlayers >= 20',
        rarity: 'uncommon'
      },
      {
        id: 'artistic-vision',
        name: 'Artistic Vision',
        description: 'Win 50 games',
        icon: '🎨',
        condition: 'gamesWon >= 50',
        rarity: 'rare'
      }
    ];

    baseAchievements.forEach(achievement => {
      this.achievements.set(achievement.id, achievement);
    });
  }

  /**
   * Unlock achievement for player
   */
  public unlockAchievement(playerId: string, achievementId: string): boolean {
    if (!this.achievements.has(achievementId)) return false;

    if (!this.unlockedAchievements.has(playerId)) {
      this.unlockedAchievements.set(playerId, new Set());
    }

    const playerAchievements = this.unlockedAchievements.get(playerId)!;
    if (playerAchievements.has(achievementId)) return false;

    playerAchievements.add(achievementId);
    const achievement = this.achievements.get(achievementId)!;
    achievement.unlockedAt = Date.now();

    console.log(`[Achievements] ${playerId} unlocked: ${achievement.name}`);
    return true;
  }

  /**
   * Get player achievements
   */
  public getPlayerAchievements(playerId: string): Achievement[] {
    const unlockedIds = this.unlockedAchievements.get(playerId) || new Set();
    return Array.from(unlockedIds)
      .map(id => this.achievements.get(id)!)
      .sort((a, b) => (a.unlockedAt || 0) - (b.unlockedAt || 0));
  }

  /**
   * Get all achievements
   */
  public getAllAchievements(): Achievement[] {
    return Array.from(this.achievements.values());
  }

  /**
   * Check achievement progress
   */
  public checkProgress(playerId: string, metrics: Record<string, number>): string[] {
    const unlockedIds: string[] = [];

    this.achievements.forEach((achievement, id) => {
      if (this.unlockedAchievements.get(playerId)?.has(id)) return;

      // Simple evaluation of achievement condition
      // In production, would have more sophisticated logic
      if (this.evaluateCondition(achievement.condition, metrics)) {
        this.unlockAchievement(playerId, id);
        unlockedIds.push(id);
      }
    });

    return unlockedIds;
  }

  private evaluateCondition(condition: string, metrics: Record<string, number>): boolean {
    // Simple condition evaluator - in production would be more robust
    try {
      // Replace metric names with their values
      let evalString = condition;
      Object.entries(metrics).forEach(([key, value]) => {
        evalString = evalString.replace(new RegExp(key, 'g'), String(value));
      });

      // Safely evaluate (very basic - would use safer evaluation in production)
      return eval(evalString) as boolean;
    } catch {
      return false;
    }
  }
}

/**
 * Difficulty manager
 */
export class DifficultyManager {
  private currentDifficulty: DifficultyLevel = 'normal';

  public setDifficulty(level: DifficultyLevel): void {
    this.currentDifficulty = level;
  }

  public getDifficulty(): DifficultyLevel {
    return this.currentDifficulty;
  }

  public getGameSettings(difficulty: DifficultyLevel) {
    const settings = {
      easy: {
        drawTime: 120,
        roundCount: 3,
        hintCount: 2,
        difficultWords: false
      },
      normal: {
        drawTime: 90,
        roundCount: 5,
        hintCount: 1,
        difficultWords: false
      },
      hard: {
        drawTime: 60,
        roundCount: 7,
        hintCount: 0,
        difficultWords: true
      }
    };

    return settings[difficulty];
  }
}

/**
 * Category-based word selection
 */
import { CATEGORIZED_WORDS } from '../data/words';

export class WordCategoryManager {
  private categories: Map<string, string[]> = new Map();

  constructor() {
    this.initializeCategories();
  }

  private initializeCategories(): void {
    // Load from the massive data file
    this.categories.set('Animals', CATEGORIZED_WORDS.Animals);
    this.categories.set('Objects', CATEGORIZED_WORDS.Objects);
    this.categories.set('Actions', CATEGORIZED_WORDS.Actions);
    this.categories.set('Places', CATEGORIZED_WORDS.Nature); // Mapping Nature to Places/Nature
    this.categories.set('Food', CATEGORIZED_WORDS.Food);

    // Legacy mapping or just 'Mix'
    const allWords = [
      ...CATEGORIZED_WORDS.Animals,
      ...CATEGORIZED_WORDS.Objects,
      ...CATEGORIZED_WORDS.Actions,
      ...CATEGORIZED_WORDS.Nature,
      ...CATEGORIZED_WORDS.Food
    ];
    this.categories.set('Mix', allWords);
  }

  public getCategory(category: string): string[] {
    // Case-insensitive lookup
    const key = Array.from(this.categories.keys()).find(k => k.toLowerCase() === category.toLowerCase());
    return this.categories.get(key || 'Mix') || [];
  }

  public getAllCategories(): string[] {
    return Array.from(this.categories.keys());
  }

  /**
   * Get random words ensuring NO duplicates from the usedSet
   */
  public getRandomWords(category: string, count = 3, usedSet?: Set<string>): string[] {
    let pool = this.getCategory(category);

    // Filter out already used words if a set is provided
    if (usedSet && usedSet.size > 0) {
      pool = pool.filter(w => !usedSet.has(w));
    }

    // Safety: If pool is exhausted or too small, fallback to full category (ignoring history) to prevent game stall
    if (pool.length < count) {
      console.warn(`[WordManager] Pool exhausted for ${category}, resetting history for this turn.`);
      pool = this.getCategory(category);
    }

    const selected: string[] = [];
    const indices = new Set<number>();

    // Safety: don't loop forever if pool is smaller than count
    const safeCount = Math.min(count, pool.length);

    while (selected.length < safeCount) {
      const index = Math.floor(Math.random() * pool.length);
      if (!indices.has(index)) {
        indices.add(index);
        selected.push(pool[index]);
      }
    }

    return selected;
  }
}

// Export singleton instances
export const leaderboardManager = new LeaderboardManager();
export const achievementManager = new AchievementManager();
export const difficultyManager = new DifficultyManager();
export const wordCategoryManager = new WordCategoryManager();
