import type { LevelConfig, ObstaclePosition } from "./types";

export const TOTAL_LEVELS = 100;
export const TOTAL_CHAPTERS = 10;

const CHAPTER_TITLES: Record<number, string> = {
  1: "First Sparks",
  2: "Heat Surge",
  3: "Golden Fusion",
  4: "Stone Blockade",
  5: "Solar Flare",
  6: "Twin Cores",
  7: "Deep Space",
  8: "Supernova",
  9: "Event Horizon",
  10: "Cosmic Mastery",
};

// Handcrafted obstacle patterns for chapters 4, 6, 7, 8, 10
const OBSTACLE_PATTERNS: Record<number, ObstaclePosition[]> = {
  31: [{ row: 0, col: 0 }],
  33: [{ row: 3, col: 3 }],
  35: [{ row: 1, col: 1 }],
  37: [{ row: 1, col: 2 }],
  39: [{ row: 2, col: 2 }],
  52: [{ row: 0, col: 3 }],
  55: [{ row: 1, col: 1 }],
  58: [{ row: 2, col: 2 }],
  62: [{ row: 0, col: 0 }, { row: 3, col: 3 }],
  65: [{ row: 1, col: 2 }, { row: 2, col: 1 }],
  68: [{ row: 1, col: 1 }, { row: 2, col: 2 }],
  73: [{ row: 0, col: 1 }],
  76: [{ row: 3, col: 2 }],
  84: [{ row: 1, col: 1 }],
  88: [{ row: 2, col: 2 }],
  94: [{ row: 0, col: 0 }],
  97: [{ row: 1, col: 2 }],
  100: [{ row: 1, col: 1 }],
};

export function getLevelConfig(level: number): LevelConfig {
  const safeLevel = Math.max(1, Math.min(TOTAL_LEVELS, Math.floor(level)));
  const chapter = Math.ceil(safeLevel / 10);
  const indexInChapter = (safeLevel - 1) % 10; // 0 to 9
  const chapterTitle = CHAPTER_TITLES[chapter] || "Cosmic Challenge";

  let targetTile = 64;
  let moveLimit = 25;

  if (chapter === 1) {
    // 32 to 128
    targetTile = indexInChapter < 4 ? 32 : indexInChapter < 8 ? 64 : 128;
    moveLimit = 16 + indexInChapter * 2;
  } else if (chapter === 2) {
    // 128 to 256
    targetTile = indexInChapter < 6 ? 128 : 256;
    moveLimit = 22 + indexInChapter * 2;
  } else if (chapter === 3) {
    // 256 to 512
    targetTile = indexInChapter < 7 ? 256 : 512;
    moveLimit = 30 + indexInChapter * 2;
  } else if (chapter === 4) {
    // Obstacles intro + 256/512
    targetTile = indexInChapter < 5 ? 256 : 512;
    moveLimit = 32 + indexInChapter * 2;
  } else if (chapter === 5) {
    // Solar Flare (Tight moves)
    targetTile = indexInChapter < 4 ? 256 : indexInChapter < 8 ? 512 : 512;
    moveLimit = 25 + indexInChapter;
  } else if (chapter === 6) {
    // 512 to 1024
    targetTile = indexInChapter < 8 ? 512 : 1024;
    moveLimit = 38 + indexInChapter * 2;
  } else if (chapter === 7) {
    // Deep Space (Dual Obstacles)
    targetTile = indexInChapter < 6 ? 512 : 1024;
    moveLimit = 42 + indexInChapter * 2;
  } else if (chapter === 8) {
    // Supernova (1024 focus)
    targetTile = 1024;
    moveLimit = 45 + indexInChapter * 2;
  } else if (chapter === 9) {
    // Event Horizon (1024 to 2048)
    targetTile = indexInChapter < 7 ? 1024 : 2048;
    moveLimit = 50 + indexInChapter * 2;
  } else {
    // Chapter 10: Cosmic Mastery
    targetTile = safeLevel === 100 ? 4096 : indexInChapter < 5 ? 1024 : 2048;
    moveLimit = safeLevel === 100 ? 90 : 60 + indexInChapter * 3;
  }

  const obstacles = OBSTACLE_PATTERNS[safeLevel] || [];
  const threeStarMovesRemaining = Math.max(3, Math.floor(moveLimit * 0.35));
  const twoStarMovesRemaining = Math.max(1, Math.floor(moveLimit * 0.15));

  return {
    level: safeLevel,
    chapter,
    chapterTitle,
    name: `Level ${safeLevel}`,
    targetTile,
    moveLimit,
    obstacles,
    threeStarMovesRemaining,
    twoStarMovesRemaining,
    description: `Reach the ${targetTile} tile in ${moveLimit} moves or fewer.`,
  };
}

export function getAllLevels(): LevelConfig[] {
  const levels: LevelConfig[] = [];
  for (let i = 1; i <= TOTAL_LEVELS; i++) {
    levels.push(getLevelConfig(i));
  }
  return levels;
}
