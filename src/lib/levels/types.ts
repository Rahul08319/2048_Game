export interface ObstaclePosition {
  row: number;
  col: number;
}

export interface LevelConfig {
  level: number;
  chapter: number;
  chapterTitle: string;
  name: string;
  targetTile: number;
  targetScore?: number;
  moveLimit: number;
  obstacles: ObstaclePosition[];
  threeStarMovesRemaining: number;
  twoStarMovesRemaining: number;
  description: string;
}

export interface LevelProgressItem {
  unlocked: boolean;
  stars: number; // 0 to 3
  highScore: number;
  completed: boolean;
}

export type LevelProgressMap = Record<number, LevelProgressItem>;
