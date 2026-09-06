import { useCallback, useEffect, useRef, useState } from "react";
import {
  configurePlayables,
  loadPlayablesSave,
  notifyPlayableFirstFrameReady,
  notifyPlayableIsReady,
  reportBestScore,
  reportPlayablesHealth,
  savePlayablesData,
} from "@/lib/playables";
import { playMoveSound, stopGameAudio } from "@/lib/gameAudio";

export type Tile = {
  id: number;
  value: number;
  position: { row: number; col: number };
  isNew?: boolean;
  isMerged?: boolean;
};

export type Direction = "up" | "down" | "left" | "right";
export type GameMode = "classic" | "daily" | "dash";

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
};

type SavedGame = Omit<GameState, "dashEndsAt"> & { version: 2 };
type UndoState = Pick<GameState, "tiles" | "score" | "nextId" | "gameOver" | "hasWon" | "rngState">;

const GRID_SIZE = 4;
const DASH_SECONDS = 120;
const DAILY_TARGET = 128;

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

function emptyPositions(tiles: Tile[]) {
  const occupied = new Set(tiles.map((tile) => `${tile.position.row},${tile.position.col}`));
  const empty: Array<{ row: number; col: number }> = [];
  for (let row = 0; row < GRID_SIZE; row += 1) {
    for (let col = 0; col < GRID_SIZE; col += 1) {
      if (!occupied.has(`${row},${col}`)) empty.push({ row, col });
    }
  }
  return empty;
}

function addRandomTile(tiles: Tile[], nextId: number, mode: GameMode, rngState: number) {
  const empty = emptyPositions(tiles);
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

function canMove(tiles: Tile[]) {
  if (tiles.length < GRID_SIZE * GRID_SIZE) return true;
  const cells = new Map(tiles.map((tile) => [`${tile.position.row},${tile.position.col}`, tile.value]));
  for (let row = 0; row < GRID_SIZE; row += 1) {
    for (let col = 0; col < GRID_SIZE; col += 1) {
      const value = cells.get(`${row},${col}`);
      if (value === cells.get(`${row + 1},${col}`) || value === cells.get(`${row},${col + 1}`)) return true;
    }
  }
  return false;
}

function createGame(mode: GameMode, bestScore: number, streak = 0, lastDailyCompletion: string | null = null): GameState {
  const dailyDate = mode === "daily" ? todayKey() : null;
  const initialRng = dailyDate ? hashDate(dailyDate) : 0;
  const first = addRandomTile([], 0, mode, initialRng);
  const second = addRandomTile(first.tiles, first.nextId, mode, first.rngState);
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

function applyMove(game: GameState, direction: Direction) {
  const byPosition = new Map(game.tiles.map((tile) => [`${tile.position.row},${tile.position.col}`, tile]));
  const tiles: Tile[] = [];
  let nextId = game.nextId;
  let gained = 0;
  let moved = false;

  for (let line = 0; line < GRID_SIZE; line += 1) {
    const coordinates = lineCoordinates(direction, line);
    const existing = coordinates.map(({ row, col }) => byPosition.get(`${row},${col}`)).filter((tile): tile is Tile => Boolean(tile));
    for (let source = 0, destination = 0; source < existing.length; destination += 1) {
      const current = existing[source];
      const merge = existing[source + 1]?.value === current.value;
      const target = coordinates[destination];
      const movedTile: Tile = {
        ...current,
        id: merge ? nextId++ : current.id,
        value: merge ? current.value * 2 : current.value,
        position: target,
        isNew: false,
        isMerged: merge,
      };
      if (merge) {
        gained += movedTile.value;
        source += 2;
      } else source += 1;
      if (merge || current.position.row !== target.row || current.position.col !== target.col) moved = true;
      tiles.push(movedTile);
    }
  }
  return { tiles, nextId, gained, moved };
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
  const mode: GameMode = saved.mode === "daily" || saved.mode === "dash" ? saved.mode : "classic";
  const timeRemaining = mode === "dash" ? Math.max(0, Math.floor(saved.timeRemaining ?? DASH_SECONDS)) : null;
  return {
    mode,
    tiles: (saved.tiles ?? []).map((tile) => ({ ...tile, isNew: false, isMerged: false })),
    score: Math.floor(saved.score ?? 0),
    bestScore: Math.max(Math.floor(saved.bestScore ?? 0), Math.floor(saved.score ?? 0)),
    nextId: Math.floor(saved.nextId ?? 0),
    gameOver: Boolean(saved.gameOver) || !canMove(saved.tiles ?? []),
    hasWon: Boolean(saved.hasWon) || (saved.tiles ?? []).some((tile) => tile.value >= 2048),
    rngState: Number.isInteger(saved.rngState) ? saved.rngState as number : (mode === "daily" ? hashDate(saved.dailyDate ?? todayKey()) : 0),
    dailyDate: mode === "daily" && typeof saved.dailyDate === "string" ? saved.dailyDate : null,
    dailyCompleted: Boolean(saved.dailyCompleted),
    dailyStreak: Math.max(0, Math.floor(saved.dailyStreak ?? 0)),
    lastDailyCompletion: typeof saved.lastDailyCompletion === "string" ? saved.lastDailyCompletion : null,
    timeRemaining,
    dashEndsAt: mode === "dash" && timeRemaining > 0 ? Date.now() + timeRemaining * 1000 : null,
  };
}

function serializeGame(game: GameState): string {
  const { dashEndsAt: _, ...persisted } = game;
  return JSON.stringify({ version: 2, ...persisted, timeRemaining: currentDashSeconds(game) } satisfies SavedGame);
}

function snapshotForUndo(game: GameState): UndoState {
  return {
    tiles: game.tiles.map((tile) => ({ ...tile, position: { ...tile.position } })),
    score: game.score,
    nextId: game.nextId,
    gameOver: game.gameOver,
    hasWon: game.hasWon,
    rngState: game.rngState,
  };
}

export const use2048Game = () => {
  const [game, setGame] = useState<GameState>(() => createGame("classic", 0));
  const [ready, setReady] = useState(false);
  const [pausedByHost, setPausedByHost] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [locale, setLocale] = useState("en-US");
  const [achievementNotice, setAchievementNotice] = useState("");
  const [winDialogOpen, setWinDialogOpen] = useState(false);
  const gameRef = useRef(game);
  const pausedRef = useRef(false);
  const undoRef = useRef<UndoState | null>(null);

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

  useEffect(() => {
    let active = true;
    let cleanup = () => undefined;
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
    };
  }, [commitGame, restoreFromSave]);

  const tickDash = useCallback((persistWhenFinished = true) => {
    const current = gameRef.current;
    if (current.mode !== "dash" || current.gameOver || pausedRef.current) return;
    const timeRemaining = currentDashSeconds(current) ?? 0;
    if (timeRemaining === current.timeRemaining && timeRemaining > 0) return;
    const next: GameState = {
      ...current,
      timeRemaining,
      dashEndsAt: timeRemaining > 0 ? current.dashEndsAt : null,
      gameOver: timeRemaining === 0 || current.gameOver,
    };
    commitGame(next, timeRemaining === 0 && persistWhenFinished);
  }, [commitGame]);

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
  }, [commitGame, game, pausedByHost]);

  const [canUndo, setCanUndo] = useState(false);

  const move = useCallback((direction: Direction) => {
    const current = gameRef.current;
    if (!ready || pausedRef.current || current.gameOver) return;
    if (current.mode === "dash" && (currentDashSeconds(current) ?? 0) === 0) {
      tickDash();
      return;
    }
    const result = applyMove(current, direction);
    if (!result.moved) return;

    undoRef.current = snapshotForUndo(current);
    setCanUndo(true);
    const withRandomTile = addRandomTile(result.tiles, result.nextId, current.mode, current.rngState);
    const score = current.score + result.gained;
    const bestScore = Math.max(current.bestScore, score);
    let next: GameState = {
      ...current,
      tiles: withRandomTile.tiles,
      nextId: withRandomTile.nextId,
      rngState: withRandomTile.rngState,
      score,
      bestScore,
      timeRemaining: currentDashSeconds(current),
      gameOver: !canMove(withRandomTile.tiles),
      hasWon: current.hasWon || withRandomTile.tiles.some((tile) => tile.value >= 2048),
    };

    if (next.mode === "daily" && !next.dailyCompleted && next.tiles.some((tile) => tile.value >= DAILY_TARGET)) {
      const completedOn = next.dailyDate ?? todayKey();
      const previous = next.lastDailyCompletion;
      const previousTime = previous ? new Date(`${previous}T00:00:00Z`).getTime() : 0;
      const currentTime = new Date(`${completedOn}T00:00:00Z`).getTime();
      next = {
        ...next,
        dailyCompleted: true,
        dailyStreak: previous === completedOn ? next.dailyStreak : previousTime && Math.round((currentTime - previousTime) / 86400000) === 1 ? next.dailyStreak + 1 : 1,
        lastDailyCompletion: completedOn,
      };
      setAchievementNotice(`Daily target reached — ${next.dailyStreak}-day streak!`);
    }

    if (!current.hasWon && next.hasWon) setWinDialogOpen(true);

    commitGame(next);
    playMoveSound(audioEnabled, result.gained > 0);
    if (bestScore > current.bestScore) reportBestScore(bestScore);
  }, [audioEnabled, commitGame, ready, tickDash]);

  const undo = useCallback(() => {
    const snapshot = undoRef.current;
    const current = gameRef.current;
    if (!ready || pausedRef.current || !snapshot || current.mode === "dash" && (currentDashSeconds(current) ?? 0) === 0) return;
    const next: GameState = {
      ...current,
      ...snapshot,
      tiles: snapshot.tiles.map((tile) => ({ ...tile, isNew: false, isMerged: false })),
      timeRemaining: currentDashSeconds(current),
    };
    undoRef.current = null;
    setCanUndo(false);
    commitGame(next);
  }, [commitGame, ready]);

  const startMode = useCallback((mode: GameMode) => {
    if (!ready || pausedRef.current) return;
    const current = gameRef.current;
    undoRef.current = null;
    setCanUndo(false);
    setAchievementNotice("");
    commitGame(createGame(mode, current.bestScore, current.dailyStreak, current.lastDailyCompletion));
  }, [commitGame, ready]);

  const restart = useCallback(() => startMode(gameRef.current.mode), [startMode]);

  return {
    ...game,
    move,
    undo,
    canUndo,
    restart,
    startMode,
    ready,
    pausedByHost,
    audioEnabled,
    locale,
    achievementNotice,
    winDialogOpen,
    dismissWinDialog: () => setWinDialogOpen(false),
    dailyTarget: DAILY_TARGET,
  };
};
