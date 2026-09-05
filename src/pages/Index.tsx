import { useCallback, useEffect, useRef, type MouseEvent as ReactMouseEvent } from "react";
import { use2048Game, type Direction } from "@/hooks/use2048Game";
import { GameGrid } from "@/components/GameGrid";
import { ScoreBoard } from "@/components/ScoreBoard";
import { GameOverModal } from "@/components/GameOverModal";
import { Instructions } from "@/components/Instructions";

const gestureDirection = (dx: number, dy: number): Direction | null => {
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 40) return null;
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? "right" : "left";
  return dy > 0 ? "down" : "up";
};

const Index = () => {
  const { tiles, score, bestScore, gameOver, move, restart, pausedByHost, ready } = use2048Game();
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const mouseStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const directionMap: Record<string, Direction> = {
      ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
      w: "up", W: "up", s: "down", S: "down", a: "left", A: "left", d: "right", D: "right",
    };
    const direction = directionMap[event.key];
    if (direction) {
      event.preventDefault();
      move(direction);
    } else if (event.key === "r" || event.key === "R") {
      restart();
    } else if (event.key === "f" || event.key === "F") {
      if (document.fullscreenElement) void document.exitFullscreen();
      else void document.documentElement.requestFullscreen?.();
    }
  }, [move, restart]);

  const handleTouchStart = useCallback((event: TouchEvent) => {
    touchStartRef.current = { x: event.touches[0].clientX, y: event.touches[0].clientY };
  }, []);

  const handleTouchEnd = useCallback((event: TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = event.changedTouches[0];
    const direction = gestureDirection(touch.clientX - touchStartRef.current.x, touch.clientY - touchStartRef.current.y);
    touchStartRef.current = null;
    if (direction) move(direction);
  }, [move]);

  const handleMouseDown = useCallback((event: ReactMouseEvent) => {
    if (event.button === 0) mouseStartRef.current = { x: event.clientX, y: event.clientY };
  }, []);

  const handleMouseUp = useCallback((event: ReactMouseEvent) => {
    if (!mouseStartRef.current) return;
    const direction = gestureDirection(event.clientX - mouseStartRef.current.x, event.clientY - mouseStartRef.current.y);
    mouseStartRef.current = null;
    if (direction) move(direction);
  }, [move]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleKeyDown, handleTouchStart, handleTouchEnd]);

  return (
    <main className="playable-shell flex flex-col items-center justify-center" style={{ background: "var(--gradient-bg)" }} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}>
      <div className="playable-heading text-center">
        <h1 className="text-4xl font-bold text-foreground sm:text-6xl">2048</h1>
        <p className="mb-4 text-sm text-muted-foreground sm:mb-6 sm:text-base">Join the tiles, get to 2048!</p>
      </div>
      <ScoreBoard score={score} bestScore={bestScore} onRestart={restart} />
      <GameGrid tiles={tiles} />
      <Instructions />
      <p className="sr-only" aria-live="polite">{ready ? "Game ready" : "Loading game"}</p>
      {pausedByHost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="mx-4 max-w-sm text-center"><h2 className="mb-3 text-4xl font-bold text-foreground">Game paused</h2><p className="text-muted-foreground">Return to YouTube to continue your saved game.</p></div>
        </div>
      )}
      {gameOver && !pausedByHost && <GameOverModal score={score} onRestart={restart} />}
    </main>
  );
};

export default Index;
