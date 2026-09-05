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
  const { tiles, score, bestScore, gameOver, move, undo, canUndo, restart, startMode, mode, timeRemaining, dailyStreak, dailyCompleted, dailyTarget, achievementNotice, pausedByHost, ready } = use2048Game();
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
    } else if (event.key === "u" || event.key === "U") {
      undo();
    } else if (event.key === "r" || event.key === "R") {
      restart();
    } else if (event.key === "f" || event.key === "F") {
      if (document.fullscreenElement) void document.exitFullscreen();
      else void document.documentElement.requestFullscreen?.();
    }
  }, [move, restart, undo]);

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
        <p className="mb-4 text-sm text-muted-foreground sm:mb-6 sm:text-base">{mode === "daily" ? `Reach ${dailyTarget} to extend your streak.` : mode === "dash" ? "Two minutes. Make every move count." : "Join the tiles, get to 2048!"}</p>
      </div>
      <ScoreBoard score={score} bestScore={bestScore} mode={mode} canUndo={canUndo} timeRemaining={timeRemaining} onRestart={restart} onUndo={undo} onModeChange={startMode} />
      <GameGrid tiles={tiles} />
      <div className="mt-3 flex min-h-7 flex-wrap items-center justify-center gap-2 text-center text-sm" aria-live="polite">
        {mode === "daily" && <span className="rounded-full bg-primary/20 px-3 py-1 text-primary">🔥 {dailyStreak}-day daily streak {dailyCompleted ? "· completed" : "· in progress"}</span>}
        {achievementNotice && <span className="rounded-full bg-accent/20 px-3 py-1 text-accent">🏆 {achievementNotice}</span>}
      </div>
      <Instructions />
      <p className="sr-only" aria-live="polite">{ready ? "Game ready" : "Loading game"}</p>
      {pausedByHost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="mx-4 max-w-sm text-center"><h2 className="mb-3 text-4xl font-bold text-foreground">Game paused</h2><p className="text-muted-foreground">Return to YouTube to continue your saved game.</p></div>
        </div>
      )}
      {gameOver && !pausedByHost && <GameOverModal score={score} mode={mode} dailyCompleted={dailyCompleted} onRestart={restart} />}
    </main>
  );
};

export default Index;
