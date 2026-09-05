import { useCallback, useEffect, useRef, useState } from "react";
import {
  configurePlayables,
  loadPlayablesSave,
  notifyPlayableIsReady,
  reportBestScore,
  reportPlayablesHealth,
  savePlayablesData,
} from "@/lib/playables";
import { playMoveSound } from "@/lib/gameAudio";

export type Tile = {
  id: number;
  value: number;
  position: { row: number; col: number };
  isNew?: boolean;
  isMerged?: boolean;
};

export type Direction = "up" | "down" | "left" | "right";

type GameState = {
  tiles: Tile[];
  score: number;
  bestScore: number;
  nextId: number;
  gameOver: boolean;
  hasWon: boolean;
};

type SavedGame = GameState & { version: 1 };
const GRID_SIZE = 4;

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

function addRandomTile(tiles: Tile[], nextId: number) {
  const empty = emptyPositions(tiles);
  if (!empty.length) return { tiles, nextId };
  const position = empty[Math.floor(Math.random() * empty.length)];
  return {
    tiles: [...tiles, { id: nextId, value: Math.random() < 0.9 ? 2 : 4, position, isNew: true }],
    nextId: nextId + 1,
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

function newGame(bestScore: number): GameState {
  const first = addRandomTile([], 0);
  const second = addRandomTile(first.tiles, first.nextId);
  return { tiles: second.tiles, score: 0, bestScore, nextId: second.nextId, gameOver: false, hasWon: false };
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

function isSavedGame(value: unknown): value is SavedGame {
  if (!value || typeof value !== "object") return false;
  const saved = value as Partial<SavedGame>;
  if (!Array.isArray(saved.tiles) || !Number.isFinite(saved.score) || !Number.isFinite(saved.bestScore)
    || !Number.isInteger(saved.nextId) || typeof saved.gameOver !== "boolean" || typeof saved.hasWon !== "boolean") return false;
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

function serializeGame(game: GameState): string {
  return JSON.stringify({ version: 1, ...game } satisfies SavedGame);
}

export const use2048Game = () => {
  const [game, setGame] = useState<GameState>(() => newGame(0));
  const [ready, setReady] = useState(false);
  const [pausedByHost, setPausedByHost] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [locale, setLocale] = useState("en-US");
  const gameRef = useRef(game);
  const pausedRef = useRef(false);

  const commitGame = useCallback((next: GameState) => {
    gameRef.current = next;
    setGame(next);
    savePlayablesData(serializeGame(next));
  }, []);

  useEffect(() => {
    let active = true;
    let cleanup = () => undefined;

    const initialize = async () => {
      const raw = await loadPlayablesSave();
      let loaded: GameState | null = null;
      if (raw) {
        try {
          const saved = JSON.parse(raw);
          if (isSavedGame(saved)) {
            loaded = {
              ...saved,
              tiles: saved.tiles.map((tile) => ({ ...tile, isNew: false, isMerged: false })),
              gameOver: saved.gameOver || !canMove(saved.tiles),
              hasWon: saved.hasWon || saved.tiles.some((tile) => tile.value >= 2048),
              bestScore: Math.max(saved.bestScore, saved.score),
            };
          } else reportPlayablesHealth("warning");
        } catch {
          reportPlayablesHealth("warning");
        }
      }

      if (!active) {
        cleanup();
        return;
      }
      const next = loaded ?? newGame(0);
      gameRef.current = next;
      setGame(next);
      cleanup = await configurePlayables({
        onAudioEnabledChange: (enabled) => {
          if (active) setAudioEnabled(enabled);
        },
        onPause: () => {
          pausedRef.current = true;
          if (active) setPausedByHost(true);
          savePlayablesData(serializeGame(gameRef.current));
        },
        onResume: () => {
          pausedRef.current = false;
          if (active) setPausedByHost(false);
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
      if (!loaded) savePlayablesData(serializeGame(next));
      setReady(true);
    };

    void initialize();
    return () => {
      active = false;
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const frame = window.requestAnimationFrame(notifyPlayableIsReady);
    return () => window.cancelAnimationFrame(frame);
  }, [ready]);

  useEffect(() => {
    const renderText = () => JSON.stringify({
      coordinateSystem: "rows increase top-to-bottom and columns increase left-to-right",
      mode: pausedByHost ? "paused" : game.gameOver ? "game-over" : "playing",
      board: game.tiles.map((tile) => ({ row: tile.position.row, col: tile.position.col, value: tile.value })),
      score: game.score,
      bestScore: game.bestScore,
      reached2048: game.hasWon,
      audioEnabled,
      controls: "Arrow keys or swipe to move; R restarts; F toggles fullscreen",
    });
    const advanceTime = () => undefined;
    window.render_game_to_text = renderText;
    window.advanceTime = advanceTime;
    return () => {
      if (window.render_game_to_text === renderText) delete window.render_game_to_text;
      if (window.advanceTime === advanceTime) delete window.advanceTime;
    };
  }, [audioEnabled, game, pausedByHost]);

  const move = useCallback((direction: Direction) => {
    if (!ready || pausedRef.current || gameRef.current.gameOver) return;
    const previousBest = gameRef.current.bestScore;
    const result = applyMove(gameRef.current, direction);
    if (!result.moved) return;

    const withRandomTile = addRandomTile(result.tiles, result.nextId);
    const score = gameRef.current.score + result.gained;
    const bestScore = Math.max(previousBest, score);
    const next: GameState = {
      tiles: withRandomTile.tiles,
      nextId: withRandomTile.nextId,
      score,
      bestScore,
      gameOver: !canMove(withRandomTile.tiles),
      hasWon: gameRef.current.hasWon || withRandomTile.tiles.some((tile) => tile.value >= 2048),
    };
    commitGame(next);
    playMoveSound(audioEnabled, result.gained > 0);
    if (bestScore > previousBest) reportBestScore(bestScore);
  }, [audioEnabled, commitGame, ready]);

  const restart = useCallback(() => {
    if (!ready || pausedRef.current) return;
    commitGame(newGame(gameRef.current.bestScore));
  }, [commitGame, ready]);

  return { ...game, move, restart, ready, pausedByHost, audioEnabled, locale };
};
