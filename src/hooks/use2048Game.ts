import { useCallback, useEffect, useRef, useState } from "react";
import {
  configurePlayables,
  loadPlayablesSave,
  notifyPlayableFirstFrameReady,
  notifyPlayableIsReady,
  reportBestScore,
  reportPlayablesHealth,
  savePlayablesData,
  platformManager,
} from "@/lib/playables";
import type { PlatformId, PlatformMetadata } from "@/lib/platform/types";
import {
  playMoveSound,
  playUndoSound,
  playWinSound,
  stopGameAudio,
  triggerHaptic,
} from "@/lib/gameAudio";
import { getLevelConfig, TOTAL_LEVELS } from "@/lib/levels/levelDatabase";
import type { LevelConfig, LevelProgressMap, ObstaclePosition } from "@/lib/levels/types";

export type Tile = {
  id: number;
  value: number;
  position: { row: number; col: number };
  isNew?: boolean;
  isMerged?: boolean;
};

export type Direction = "up" | "down" | "left" | "right";
export type GameMode = "classic" | "daily" | "dash" | "levels";

export const defaultLevelProgress = (): LevelProgressMap => {
  const map: LevelProgressMap = {};
  for (let i = 1; i <= TOTAL_LEVELS; i++) {
    map[i] = {
      unlocked: i === 1,
      stars: 0,
      highScore: 0,
      completed: false,
    };
  }
  return map;
};

type GameState = {
  mode: GameMode;
  tiles: Tile[];
  score: number;
  bestScore: number;
  nextId: number;
  gameOver: boolean;
  hasWon: boolean;
  rngState: number;
  dailyDate: string | null;
  dailyCompleted: boolean;
  dailyStreak: number;
  lastDailyCompletion: string | null;
  timeRemaining: number | null;
  dashEndsAt: number | null;
  currentLevel: number;
  movesRemaining: number | null;
  levelProgress: LevelProgressMap;
  levelWon: boolean;
  levelFailed: boolean;
  levelStarsEarned: number;
};

type SavedGame = Omit<GameState, "dashEndsAt"> & { version: number };
type UndoState = Pick<
  GameState,
  "tiles" | "score" | "nextId" | "gameOver" | "hasWon" | "rngState" | "movesRemaining" | "levelWon" | "levelFailed"
>;

const GRID_SIZE = 4;
const DASH_SECONDS = 120;
const DAILY_TARGET = 128;
const AD_COOLDOWN_MS = 60 * 1000;

const todayKey = () => new Date().toISOString().slice(0, 10);

function hashDate(date: string) {
  let hash = 2166136261;
  for (const character of date) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  return (hash >>> 0) || 1;
}

function seededRandom(state: number) {
  const nextState = (Math.imul(state, 1664525) + 1013904223) >>> 0;
  return { value: nextState / 4294967296, nextState };
}

function emptyPositions(tiles: Tile[], obstacles: ObstaclePosition[] = []) {
  const occupied = new Set([
    ...tiles.map((tile) => `${tile.position.row},${tile.position.col}`),
    ...obstacles.map((obs) => `${obs.row},${obs.col}`),
  ]);
  const empty: Array<{ row: number; col: number }> = [];
  for (let row = 0; row < GRID_SIZE; row += 1) {
    for (let col = 0; col < GRID_SIZE; col += 1) {
      if (!occupied.has(`${row},${col}`)) empty.push({ row, col });
    }
  }
  return empty;
}

function addRandomTile(
  tiles: Tile[],
  nextId: number,
  mode: GameMode,
  rngState: number,
  obstacles: ObstaclePosition[] = []
) {
  const empty = emptyPositions(tiles, obstacles);
  if (!empty.length) return { tiles, nextId, rngState };
  const first = mode === "daily" ? seededRandom(rngState) : { value: Math.random(), nextState: rngState };
  const second = mode === "daily" ? seededRandom(first.nextState) : { value: Math.random(), nextState: rngState };
  const position = empty[Math.floor(first.value * empty.length)];
  return {
    tiles: [...tiles, { id: nextId, value: second.value < 0.9 ? 2 : 4, position, isNew: true }],
    nextId: nextId + 1,
    rngState: mode === "daily" ? second.nextState : rngState,
  };
}

function partitionLine(coordinates: Array<{ row: number; col: number }>, obstacleSet: Set<string>) {
  const segments: Array<Array<{ row: number; col: number }>> = [];
  let currentSegment: Array<{ row: number; col: number }> = [];

  for (const coord of coordinates) {
    if (obstacleSet.has(`${coord.row},${coord.col}`)) {
      if (currentSegment.length > 0) {
        segments.push(currentSegment);
        currentSegment = [];
      }
    } else {
      currentSegment.push(coord);
    }
  }
  if (currentSegment.length > 0) {
    segments.push(currentSegment);
  }
  return segments;
}

function applyMove(
  game: { tiles: Tile[]; nextId: number },
  direction: Direction,
  obstacles: ObstaclePosition[] = []
) {
  const byPosition = new Map(game.tiles.map((tile) => [`${tile.position.row},${tile.position.col}`, tile]));
  const obstacleSet = new Set(obstacles.map((obs) => `${obs.row},${obs.col}`));
  const tiles: Tile[] = [];
  let nextId = game.nextId;
  let gained = 0;
  let moved = false;
  let maxMergeValue = 0;

  for (let line = 0; line < GRID_SIZE; line += 1) {
    const coordinates = lineCoordinates(direction, line);
    const segments = partitionLine(coordinates, obstacleSet);

    for (const segment of segments) {
      const existing = segment
        .map(({ row, col }) => byPosition.get(`${row},${col}`))
        .filter((tile): tile is Tile => Boolean(tile));

      for (let source = 0, destination = 0; source < existing.length; destination += 1) {
        const current = existing[source];
        const merge = existing[source + 1]?.value === current.value;
        const target = segment[destination];
        const nextVal = merge ? current.value * 2 : current.value;
        if (merge && nextVal > maxMergeValue) {
          maxMergeValue = nextVal;
        }
        const movedTile: Tile = {
          ...current,
          id: merge ? nextId++ : current.id,
          value: nextVal,
          position: target,
          isNew: false,
          isMerged: merge,
        };
        if (merge) {
          gained += movedTile.value;
          source += 2;
        } else {
          source += 1;
        }
        if (merge || current.position.row !== target.row || current.position.col !== target.col) {
          moved = true;
        }
        tiles.push(movedTile);
      }
    }
  }
  return { tiles, nextId, gained, moved, maxMergeValue };
}

function canMove(tiles: Tile[], obstacles: ObstaclePosition[] = []) {
  for (const dir of ["up", "down", "left", "right"] as Direction[]) {
    if (applyMove({ tiles, nextId: 0 }, dir, obstacles).moved) return true;
  }
  return false;
}

function createGame(
  mode: GameMode,
  bestScore: number,
  streak = 0,
  lastDailyCompletion: string | null = null,
  level = 1,
  progress: LevelProgressMap = defaultLevelProgress()
): GameState {
  const dailyDate = mode === "daily" ? todayKey() : null;
  const initialRng = dailyDate ? hashDate(dailyDate) : 0;
  const levelConfig = getLevelConfig(level);
  const obstacles = mode === "levels" ? levelConfig.obstacles : [];

  const first = addRandomTile([], 0, mode, initialRng, obstacles);
  const second = addRandomTile(first.tiles, first.nextId, mode, first.rngState, obstacles);
  return {
    mode,
    tiles: second.tiles,
    score: 0,
    bestScore,
    nextId: second.nextId,
    gameOver: false,
    hasWon: false,
    rngState: second.rngState,
    dailyDate,
    dailyCompleted: dailyDate === lastDailyCompletion,
    dailyStreak: streak,
    lastDailyCompletion,
    timeRemaining: mode === "dash" ? DASH_SECONDS : null,
    dashEndsAt: mode === "dash" ? Date.now() + DASH_SECONDS * 1000 : null,
    currentLevel: level,
    movesRemaining: mode === "levels" ? levelConfig.moveLimit : null,
    levelProgress: progress,
    levelWon: false,
    levelFailed: false,
    levelStarsEarned: 0,
  };
}

function lineCoordinates(direction: Direction, line: number) {
  const coordinates: Array<{ row: number; col: number }> = [];
  for (let offset = 0; offset < GRID_SIZE; offset += 1) {
    if (direction === "left") coordinates.push({ row: line, col: offset });
    if (direction === "right") coordinates.push({ row: line, col: GRID_SIZE - 1 - offset });
    if (direction === "up") coordinates.push({ row: offset, col: line });
    if (direction === "down") coordinates.push({ row: GRID_SIZE - 1 - offset, col: line });
  }
  return coordinates;
}

function currentDashSeconds(game: GameState) {
  if (game.mode !== "dash") return null;
  if (!game.dashEndsAt) return game.timeRemaining ?? 0;
  return Math.max(0, Math.ceil((game.dashEndsAt - Date.now()) / 1000));
}

function isSavedGame(value: unknown): value is Partial<SavedGame> {
  if (!value || typeof value !== "object") return false;
  const saved = value as Partial<SavedGame>;
  if (!Array.isArray(saved.tiles) || !Number.isFinite(saved.score) || !Number.isFinite(saved.bestScore) || !Number.isInteger(saved.nextId)) return false;
  const occupied = new Set<string>();
  return saved.tiles.every((tile) => {
    const valid = tile && Number.isInteger(tile.id) && Number.isInteger(tile.value) && tile.value > 0
      && Number.isInteger(tile.position?.row) && tile.position.row >= 0 && tile.position.row < GRID_SIZE
      && Number.isInteger(tile.position?.col) && tile.position.col >= 0 && tile.position.col < GRID_SIZE;
    const key = valid ? `${tile.position.row},${tile.position.col}` : "invalid";
    if (occupied.has(key)) return false;
    occupied.add(key);
    return valid;
  });
}

function hydrateGame(saved: Partial<SavedGame>): GameState {
  const mode: GameMode =
    saved.mode === "daily" || saved.mode === "dash" || saved.mode === "levels"
      ? saved.mode
      : "classic";
  const timeRemaining = mode === "dash" ? Math.max(0, Math.floor(saved.timeRemaining ?? DASH_SECONDS)) : null;
  const currentLevel =
    typeof saved.currentLevel === "number" && saved.currentLevel >= 1 && saved.currentLevel <= TOTAL_LEVELS
      ? Math.floor(saved.currentLevel)
      : 1;
  const levelConfig = getLevelConfig(currentLevel);
  const obstacles = mode === "levels" ? levelConfig.obstacles : [];
  const levelProgress =
    saved.levelProgress && typeof saved.levelProgress === "object"
      ? { ...defaultLevelProgress(), ...saved.levelProgress }
      : defaultLevelProgress();

  const movesRemaining =
    mode === "levels"
      ? typeof saved.movesRemaining === "number"
        ? Math.floor(saved.movesRemaining)
        : levelConfig.moveLimit
      : null;

  return {
    mode,
    tiles: (saved.tiles ?? []).map((tile) => ({ ...tile, isNew: false, isMerged: false })),
    score: Math.floor(saved.score ?? 0),
    bestScore: Math.max(Math.floor(saved.bestScore ?? 0), Math.floor(saved.score ?? 0)),
    nextId: Math.floor(saved.nextId ?? 0),
    gameOver: Boolean(saved.gameOver) || !canMove(saved.tiles ?? [], obstacles),
    hasWon: Boolean(saved.hasWon) || (saved.tiles ?? []).some((tile) => tile.value >= 2048),
    rngState: Number.isInteger(saved.rngState)
      ? (saved.rngState as number)
      : mode === "daily"
      ? hashDate(saved.dailyDate ?? todayKey())
      : 0,
    dailyDate: mode === "daily" && typeof saved.dailyDate === "string" ? saved.dailyDate : null,
    dailyCompleted: Boolean(saved.dailyCompleted),
    dailyStreak: Math.max(0, Math.floor(saved.dailyStreak ?? 0)),
    lastDailyCompletion: typeof saved.lastDailyCompletion === "string" ? saved.lastDailyCompletion : null,
    timeRemaining,
    dashEndsAt: mode === "dash" && timeRemaining > 0 ? Date.now() + timeRemaining * 1000 : null,
    currentLevel,
    movesRemaining,
    levelProgress,
    levelWon: Boolean(saved.levelWon),
    levelFailed: Boolean(saved.levelFailed),
    levelStarsEarned: Math.max(0, Math.floor(saved.levelStarsEarned ?? 0)),
  };
}

function serializeGame(game: GameState): string {
  const { dashEndsAt: _, ...persisted } = game;
  return JSON.stringify({ version: 3, ...persisted, timeRemaining: currentDashSeconds(game) } satisfies SavedGame);
}

function snapshotForUndo(game: GameState): UndoState {
  return {
    tiles: game.tiles.map((tile) => ({ ...tile, position: { ...tile.position } })),
    score: game.score,
    nextId: game.nextId,
    gameOver: game.gameOver,
    hasWon: game.hasWon,
    rngState: game.rngState,
    movesRemaining: game.movesRemaining,
    levelWon: game.levelWon,
    levelFailed: game.levelFailed,
  };
}

export const use2048Game = () => {
  const [game, setGame] = useState<GameState>(() => createGame("classic", 0));
  const [ready, setReady] = useState(false);
  const [pausedByHost, setPausedByHost] = useState(false);
  const [pauseMenuOpen, setPauseMenuOpen] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [locale, setLocale] = useState("en-US");
  const [achievementNotice, setAchievementNotice] = useState("");
  const [winDialogOpen, setWinDialogOpen] = useState(false);
  const [platform, setPlatform] = useState<PlatformMetadata>(() => platformManager.metadata);
  const [canUndo, setCanUndo] = useState(false);
  const [adPlaying, setAdPlaying] = useState(false);

  // Arcade game effects
  const [scoreGains, setScoreGains] = useState<Array<{ id: number; value: number }>>([]);
  const [combo, setCombo] = useState(0);
  const [shake, setShake] = useState(false);

  const gameRef = useRef(game);
  const pausedRef = useRef(false);
  const undoRef = useRef<UndoState | null>(null);
  const lastAdTimeRef = useRef<number>(0);

  const commitGame = useCallback((next: GameState, persist = true) => {
    gameRef.current = next;
    setGame(next);
    if (persist) savePlayablesData(serializeGame(next));
  }, []);

  const restoreFromSave = useCallback((raw: string | null) => {
    if (!raw) return createGame("classic", 0);
    try {
      const saved = JSON.parse(raw);
      return isSavedGame(saved) ? hydrateGame(saved) : createGame("classic", 0);
    } catch {
      reportPlayablesHealth("warning");
      return createGame("classic", 0);
    }
  }, []);

  const maybeShowInterstitial = useCallback(async () => {
    const now = Date.now();
    if (now - lastAdTimeRef.current < AD_COOLDOWN_MS) return;
    lastAdTimeRef.current = now;
    setAdPlaying(true);
    try {
      await platformManager.requestInterstitialAd();
    } catch {
      //
    } finally {
      setAdPlaying(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    let cleanup = () => undefined;

    const unsubPlatform = platformManager.subscribe((adapter) => {
      if (active) setPlatform(adapter.metadata);
    });

    const initialize = async () => {
      const restored = restoreFromSave(await loadPlayablesSave());
      if (!active) return;
      gameRef.current = restored;
      setGame(restored);
      cleanup = await configurePlayables({
        onAudioEnabledChange: (enabled) => { if (active) setAudioEnabled(enabled); },
        onPause: () => {
          pausedRef.current = true;
          stopGameAudio();
          if (active) setPausedByHost(true);
          const frozen = gameRef.current.mode === "dash"
            ? { ...gameRef.current, timeRemaining: currentDashSeconds(gameRef.current), dashEndsAt: null }
            : gameRef.current;
          commitGame(frozen);
        },
        onResume: () => {
          pausedRef.current = false;
          const resumed = gameRef.current.mode === "dash" && (gameRef.current.timeRemaining ?? 0) > 0
            ? { ...gameRef.current, dashEndsAt: Date.now() + (gameRef.current.timeRemaining ?? 0) * 1000 }
            : gameRef.current;
          if (active) setPausedByHost(false);
          commitGame(resumed, false);
        },
        onLanguage: (language) => {
          if (active) {
            setLocale(language);
            document.documentElement.lang = language;
          }
        },
      });
      if (!active) {
        cleanup();
        return;
      }
      setReady(true);
    };

    void initialize();
    return () => {
      active = false;
      cleanup();
      unsubPlatform();
    };
  }, [commitGame, restoreFromSave]);

  const tickDash = useCallback((persistWhenFinished = true) => {
    const current = gameRef.current;
    if (current.mode !== "dash" || current.gameOver || pausedRef.current) return;
    const timeRemaining = currentDashSeconds(current) ?? 0;
    if (timeRemaining === current.timeRemaining && timeRemaining > 0) return;
    const isOver = timeRemaining === 0 || current.gameOver;
    const next: GameState = {
      ...current,
      timeRemaining,
      dashEndsAt: timeRemaining > 0 ? current.dashEndsAt : null,
      gameOver: isOver,
    };
    commitGame(next, timeRemaining === 0 && persistWhenFinished);
    if (isOver) {
      void maybeShowInterstitial();
    }
  }, [commitGame, maybeShowInterstitial]);

  useEffect(() => {
    if (!ready || pausedByHost || game.mode !== "dash" || !game.dashEndsAt || game.gameOver) return;
    tickDash();
    const timer = window.setInterval(() => tickDash(), 250);
    return () => window.clearInterval(timer);
  }, [game.dashEndsAt, game.gameOver, game.mode, pausedByHost, ready, tickDash]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(notifyPlayableFirstFrameReady);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const frame = window.requestAnimationFrame(notifyPlayableIsReady);
    return () => window.cancelAnimationFrame(frame);
  }, [ready]);

  useEffect(() => {
    const renderText = () => JSON.stringify({
      coordinateSystem: "rows increase top-to-bottom and columns increase left-to-right",
      mode: pausedByHost ? "paused" : game.gameOver ? "game-over" : game.mode,
      board: game.tiles.map((tile) => ({ row: tile.position.row, col: tile.position.col, value: tile.value })),
      score: game.score,
      bestScore: game.bestScore,
      platform: platform.name,
      daily: { date: game.dailyDate, completed: game.dailyCompleted, streak: game.dailyStreak, target: DAILY_TARGET },
      dashSecondsRemaining: currentDashSeconds(game),
      controls: "Arrow keys/WASD, swipe, or mouse drag to move; U undo; R restart; F fullscreen",
    });
    const advanceTime = (milliseconds: number) => {
      const current = gameRef.current;
      if (current.mode !== "dash" || pausedRef.current || current.gameOver) return;
      const remaining = Math.max(0, (currentDashSeconds(current) ?? 0) - Math.ceil(milliseconds / 1000));
      const next = { ...current, timeRemaining: remaining, dashEndsAt: remaining ? Date.now() + remaining * 1000 : null, gameOver: remaining === 0 };
      commitGame(next, remaining === 0);
    };
    window.render_game_to_text = renderText;
    window.advanceTime = advanceTime;
    return () => {
      if (window.render_game_to_text === renderText) delete window.render_game_to_text;
      if (window.advanceTime === advanceTime) delete window.advanceTime;
    };
  }, [commitGame, game, pausedByHost, platform.name]);

  const move = useCallback((direction: Direction) => {
    const current = gameRef.current;
    if (!ready || pausedRef.current || current.gameOver || current.levelWon || current.levelFailed) return;
    if (current.mode === "dash" && (currentDashSeconds(current) ?? 0) === 0) {
      tickDash();
      return;
    }

    const levelConfig = getLevelConfig(current.currentLevel);
    const obstacles = current.mode === "levels" ? levelConfig.obstacles : [];

    const result = applyMove(current, direction, obstacles);
    if (!result.moved) return;

    undoRef.current = snapshotForUndo(current);
    setCanUndo(true);
    const withRandomTile = addRandomTile(result.tiles, result.nextId, current.mode, current.rngState, obstacles);
    const score = current.score + result.gained;
    const bestScore = Math.max(current.bestScore, score);

    // Arcade Effects
    if (result.gained > 0) {
      const gainId = Date.now() + Math.random();
      setScoreGains((prev) => [...prev, { id: gainId, value: result.gained }]);
      window.setTimeout(() => {
        setScoreGains((prev) => prev.filter((g) => g.id !== gainId));
      }, 700);

      setCombo((c) => c + 1);

      if (result.maxMergeValue >= 64) {
        setShake(true);
        triggerHaptic("heavy");
        window.setTimeout(() => setShake(false), 220);
      }
    } else {
      setCombo(0);
    }

    // Moves remaining for level mode
    const movesRemaining =
      current.mode === "levels" && current.movesRemaining !== null
        ? Math.max(0, current.movesRemaining - 1)
        : null;

    // Check level targets and win/loss
    const reachedLevelTarget =
      current.mode === "levels" && withRandomTile.tiles.some((tile) => tile.value >= levelConfig.targetTile);

    let levelWon = current.levelWon;
    let levelFailed = current.levelFailed;
    let levelStarsEarned = current.levelStarsEarned;
    let levelProgress = current.levelProgress;

    if (reachedLevelTarget && !current.levelWon) {
      levelWon = true;
      const finalMoves = movesRemaining ?? 0;
      if (finalMoves >= levelConfig.threeStarMovesRemaining) {
        levelStarsEarned = 3;
      } else if (finalMoves >= levelConfig.twoStarMovesRemaining) {
        levelStarsEarned = 2;
      } else {
        levelStarsEarned = 1;
      }

      const prevProg = levelProgress[current.currentLevel] || {
        unlocked: true,
        stars: 0,
        highScore: 0,
        completed: false,
      };
      const updatedProgress: LevelProgressMap = {
        ...levelProgress,
        [current.currentLevel]: {
          unlocked: true,
          completed: true,
          stars: Math.max(prevProg.stars, levelStarsEarned),
          highScore: Math.max(prevProg.highScore, score),
        },
      };
      if (current.currentLevel < TOTAL_LEVELS) {
        const nextLvl = updatedProgress[current.currentLevel + 1] || {
          unlocked: false,
          stars: 0,
          highScore: 0,
          completed: false,
        };
        updatedProgress[current.currentLevel + 1] = { ...nextLvl, unlocked: true };
      }
      levelProgress = updatedProgress;
      playWinSound(audioEnabled);
      triggerHaptic("heavy");
    } else if (current.mode === "levels" && !reachedLevelTarget && movesRemaining === 0) {
      levelFailed = true;
    }

    const isBoardFullStuck = !canMove(withRandomTile.tiles, obstacles);
    if (current.mode === "levels" && !levelWon && isBoardFullStuck) {
      levelFailed = true;
    }

    const isOver = current.mode === "levels" ? levelFailed : isBoardFullStuck;

    let next: GameState = {
      ...current,
      tiles: withRandomTile.tiles,
      nextId: withRandomTile.nextId,
      rngState: withRandomTile.rngState,
      score,
      bestScore,
      timeRemaining: currentDashSeconds(current),
      gameOver: isOver,
      hasWon: current.hasWon || withRandomTile.tiles.some((tile) => tile.value >= 2048),
      movesRemaining,
      levelWon,
      levelFailed,
      levelStarsEarned,
      levelProgress,
    };

    if (next.mode === "daily" && !next.dailyCompleted && next.tiles.some((tile) => tile.value >= DAILY_TARGET)) {
      const completedOn = next.dailyDate ?? todayKey();
      const previous = next.lastDailyCompletion;
      const previousTime = previous ? new Date(`${previous}T00:00:00Z`).getTime() : 0;
      const currentTime = new Date(`${completedOn}T00:00:00Z`).getTime();
      next = {
        ...next,
        dailyCompleted: true,
        dailyStreak:
          previous === completedOn
            ? next.dailyStreak
            : previousTime && Math.round((currentTime - previousTime) / 86400000) === 1
            ? next.dailyStreak + 1
            : 1,
        lastDailyCompletion: completedOn,
      };
      setAchievementNotice(`Daily target reached — ${next.dailyStreak}-day streak!`);
    }

    if (!current.hasWon && next.hasWon && next.mode !== "levels") {
      setWinDialogOpen(true);
      playWinSound(audioEnabled);
    }

    commitGame(next);
    playMoveSound(audioEnabled, result.gained > 0, result.maxMergeValue);

    if (bestScore > current.bestScore) {
      reportBestScore(bestScore);
    }

    if (isOver || levelWon) {
      void maybeShowInterstitial();
    }
  }, [audioEnabled, commitGame, maybeShowInterstitial, ready, tickDash]);

  const undo = useCallback(() => {
    const snapshot = undoRef.current;
    const current = gameRef.current;
    if (!ready || pausedRef.current || !snapshot || (current.mode === "dash" && (currentDashSeconds(current) ?? 0) === 0)) return;
    const next: GameState = {
      ...current,
      ...snapshot,
      tiles: snapshot.tiles.map((tile) => ({ ...tile, isNew: false, isMerged: false })),
      timeRemaining: currentDashSeconds(current),
    };
    undoRef.current = null;
    setCanUndo(false);
    setCombo(0);
    commitGame(next);
    playUndoSound(audioEnabled);
  }, [audioEnabled, commitGame, ready]);

  const startMode = useCallback((mode: GameMode) => {
    if (!ready || pausedRef.current) return;
    const current = gameRef.current;
    undoRef.current = null;
    setCanUndo(false);
    setCombo(0);
    setAchievementNotice("");
    commitGame(createGame(mode, current.bestScore, current.dailyStreak, current.lastDailyCompletion, current.currentLevel, current.levelProgress));
    void maybeShowInterstitial();
  }, [commitGame, maybeShowInterstitial, ready]);

  const startLevel = useCallback((lvl: number) => {
    if (!ready || pausedRef.current) return;
    const current = gameRef.current;
    const safeLvl = Math.max(1, Math.min(TOTAL_LEVELS, Math.floor(lvl)));
    undoRef.current = null;
    setCanUndo(false);
    setCombo(0);
    setAchievementNotice("");
    commitGame(
      createGame(
        "levels",
        current.bestScore,
        current.dailyStreak,
        current.lastDailyCompletion,
        safeLvl,
        current.levelProgress
      )
    );
    void maybeShowInterstitial();
  }, [commitGame, maybeShowInterstitial, ready]);

  const nextLevel = useCallback(() => {
    const current = gameRef.current;
    if (current.currentLevel < TOTAL_LEVELS) {
      startLevel(current.currentLevel + 1);
    }
  }, [startLevel]);

  const retryLevel = useCallback(() => {
    const current = gameRef.current;
    startLevel(current.currentLevel);
  }, [startLevel]);

  const restart = useCallback(() => {
    const current = gameRef.current;
    if (current.mode === "levels") {
      startLevel(current.currentLevel);
    } else {
      startMode(current.mode);
    }
  }, [startLevel, startMode]);

  const addExtraMovesWithAd = useCallback(async (): Promise<boolean> => {
    setAdPlaying(true);
    try {
      const earned = await platformManager.requestRewardedAd("level-extra-moves");
      if (earned) {
        const current = gameRef.current;
        const next: GameState = {
          ...current,
          movesRemaining: (current.movesRemaining ?? 0) + 5,
          levelFailed: false,
          gameOver: false,
        };
        commitGame(next);
        setAchievementNotice("✨ +5 Extra Moves Granted!");
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      setAdPlaying(false);
    }
  }, [commitGame]);

  const reviveGameWithAd = useCallback(async (): Promise<boolean> => {
    setAdPlaying(true);
    try {
      const earned = await platformManager.requestRewardedAd("revive-game-save");
      if (earned) {
        const current = gameRef.current;
        const sorted = [...current.tiles].sort((a, b) => a.value - b.value);
        const kept = sorted.slice(2);
        const next: GameState = {
          ...current,
          tiles: kept,
          gameOver: false,
          timeRemaining: current.mode === "dash" ? (current.timeRemaining || 30) + 30 : null,
          dashEndsAt: current.mode === "dash" ? Date.now() + ((current.timeRemaining || 30) + 30) * 1000 : null,
        };
        commitGame(next);
        setAchievementNotice("✨ Revived! 2 lowest tiles cleared.");
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      setAdPlaying(false);
    }
  }, [commitGame]);

  const getFreeUndoWithAd = useCallback(async (): Promise<boolean> => {
    setAdPlaying(true);
    try {
      const earned = await platformManager.requestRewardedAd("free-undo-perk");
      if (earned && undoRef.current) {
        undo();
        return true;
      } else if (earned) {
        const current = gameRef.current;
        if (current.tiles.length > 2) {
          const kept = current.tiles.slice(0, current.tiles.length - 1);
          commitGame({ ...current, tiles: kept });
          playUndoSound(audioEnabled);
          return true;
        }
      }
      return false;
    } catch {
      return false;
    } finally {
      setAdPlaying(false);
    }
  }, [audioEnabled, commitGame, undo]);

  const switchPlatform = useCallback(async (id: PlatformId) => {
    await platformManager.switchPlatform(id);
    setPlatform(platformManager.metadata);
  }, []);

  const currentLevelConfig = getLevelConfig(game.currentLevel);

  return {
    ...game,
    currentLevelConfig,
    obstacles: game.mode === "levels" ? currentLevelConfig.obstacles : [],
    targetTile: currentLevelConfig.targetTile,
    move,
    undo,
    canUndo,
    restart,
    startMode,
    startLevel,
    nextLevel,
    retryLevel,
    addExtraMovesWithAd,
    dismissLevelComplete: () => commitGame({ ...gameRef.current, levelWon: false }),
    dismissLevelFailed: () => commitGame({ ...gameRef.current, levelFailed: false }),
    ready,
    pausedByHost,
    pauseMenuOpen,
    setPauseMenuOpen,
    audioEnabled,
    locale,
    achievementNotice,
    winDialogOpen,
    dismissWinDialog: () => setWinDialogOpen(false),
    dailyTarget: DAILY_TARGET,
    platform,
    switchPlatform,
    reviveGameWithAd,
    getFreeUndoWithAd,
    adPlaying,
    toggleAudio: () => setAudioEnabled((prev) => !prev),
    scoreGains,
    combo,
    shake,
  };
};
