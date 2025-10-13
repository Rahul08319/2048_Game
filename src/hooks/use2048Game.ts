import { useState, useCallback, useEffect } from 'react';

export type Tile = {
  id: number;
  value: number;
  position: { row: number; col: number };
  isNew?: boolean;
  isMerged?: boolean;
};

type Direction = 'up' | 'down' | 'left' | 'right';

const GRID_SIZE = 4;

export const use2048Game = () => {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    const saved = localStorage.getItem('2048-best-score');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [gameOver, setGameOver] = useState(false);
  const [nextId, setNextId] = useState(0);

  const createTile = useCallback((position: { row: number; col: number }, value: number = Math.random() < 0.9 ? 2 : 4): Tile => {
    const id = nextId;
    setNextId(prev => prev + 1);
    return { id, value, position, isNew: true };
  }, [nextId]);

  const getEmptyPositions = useCallback((currentTiles: Tile[]) => {
    const occupied = new Set(currentTiles.map(t => `${t.position.row},${t.position.col}`));
    const empty: { row: number; col: number }[] = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (!occupied.has(`${row},${col}`)) {
          empty.push({ row, col });
        }
      }
    }
    return empty;
  }, []);

  const addRandomTile = useCallback((currentTiles: Tile[]) => {
    const empty = getEmptyPositions(currentTiles);
    if (empty.length === 0) return currentTiles;
    const randomPos = empty[Math.floor(Math.random() * empty.length)];
    return [...currentTiles, createTile(randomPos)];
  }, [getEmptyPositions, createTile]);

  const initGame = useCallback(() => {
    setScore(0);
    setGameOver(false);
    setNextId(0);
    const tile1 = { id: 0, value: 2, position: { row: Math.floor(Math.random() * 4), col: Math.floor(Math.random() * 4) }, isNew: true };
    setNextId(1);
    const empty = getEmptyPositions([tile1]);
    const randomPos = empty[Math.floor(Math.random() * empty.length)];
    const tile2 = { id: 1, value: 2, position: randomPos, isNew: true };
    setNextId(2);
    setTiles([tile1, tile2]);
  }, [getEmptyPositions]);

  const move = useCallback((direction: Direction) => {
    if (gameOver) return;

    setTiles(currentTiles => {
      // Clear animation flags
      const cleanTiles = currentTiles.map(t => ({ ...t, isNew: false, isMerged: false }));
      
      // Create grid
      const grid: (Tile | null)[][] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
      cleanTiles.forEach(tile => {
        grid[tile.position.row][tile.position.col] = tile;
      });

      let newTiles: Tile[] = [];
      let newScore = score;
      let moved = false;

      const processLine = (line: (Tile | null)[]) => {
        const nonEmpty = line.filter(t => t !== null) as Tile[];
        const merged: Tile[] = [];
        let i = 0;

        while (i < nonEmpty.length) {
          if (i < nonEmpty.length - 1 && nonEmpty[i].value === nonEmpty[i + 1].value) {
            const mergedTile = { ...nonEmpty[i], value: nonEmpty[i].value * 2, isMerged: true };
            merged.push(mergedTile);
            newScore += mergedTile.value;
            i += 2;
          } else {
            merged.push(nonEmpty[i]);
            i++;
          }
        }

        return merged;
      };

      if (direction === 'left' || direction === 'right') {
        for (let row = 0; row < GRID_SIZE; row++) {
          let line = grid[row];
          if (direction === 'right') line = [...line].reverse();
          
          const processed = processLine(line);
          if (direction === 'right') processed.reverse();

          for (let col = 0; col < GRID_SIZE; col++) {
            if (processed[col]) {
              const tile = { ...processed[col], position: { row, col } };
              if (tile.position.row !== processed[col].position.row || 
                  tile.position.col !== processed[col].position.col) {
                moved = true;
              }
              newTiles.push(tile);
            }
          }
        }
      } else {
        for (let col = 0; col < GRID_SIZE; col++) {
          let line = grid.map(row => row[col]);
          if (direction === 'down') line = [...line].reverse();
          
          const processed = processLine(line);
          if (direction === 'down') processed.reverse();

          for (let row = 0; row < GRID_SIZE; row++) {
            if (processed[row]) {
              const tile = { ...processed[row], position: { row, col } };
              if (tile.position.row !== processed[row].position.row || 
                  tile.position.col !== processed[row].position.col) {
                moved = true;
              }
              newTiles.push(tile);
            }
          }
        }
      }

      if (!moved) return currentTiles;

      setScore(newScore);
      if (newScore > bestScore) {
        setBestScore(newScore);
        localStorage.setItem('2048-best-score', newScore.toString());
      }

      return addRandomTile(newTiles);
    });
  }, [gameOver, score, bestScore, addRandomTile]);

  const checkGameOver = useCallback((currentTiles: Tile[]) => {
    if (getEmptyPositions(currentTiles).length > 0) return false;

    // Check if any adjacent tiles can merge
    const grid: (number | null)[][] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
    currentTiles.forEach(tile => {
      grid[tile.position.row][tile.position.col] = tile.value;
    });

    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const value = grid[row][col];
        if (value === null) continue;
        
        if (col < GRID_SIZE - 1 && grid[row][col + 1] === value) return false;
        if (row < GRID_SIZE - 1 && grid[row + 1][col] === value) return false;
      }
    }

    return true;
  }, [getEmptyPositions]);

  useEffect(() => {
    if (tiles.length > 0 && checkGameOver(tiles)) {
      setGameOver(true);
    }
  }, [tiles, checkGameOver]);

  useEffect(() => {
    initGame();
  }, []);

  return {
    tiles,
    score,
    bestScore,
    gameOver,
    move,
    restart: initGame,
  };
};
