import { useCallback, useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import { use2048Game, type Direction } from "@/hooks/use2048Game";
import { GameGrid } from "@/components/GameGrid";
import { ScoreBoard } from "@/components/ScoreBoard";
import { GameOverModal } from "@/components/GameOverModal";
import { Instructions } from "@/components/Instructions";
import { PlatformSelectorModal } from "@/components/PlatformSelectorModal";
import { Button } from "@/components/ui/button";
import { Sparkles, Trophy, Play } from "lucide-react";

const gestureDirection = (dx: number, dy: number): Direction | null => {
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 30) return null;
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? "right" : "left";
  return dy > 0 ? "down" : "up";
};

const Index = () => {
  const {
    tiles,
    score,
    bestScore,
    gameOver,
    hasWon,
    move,
    undo,
    canUndo,
    restart,
    startMode,
    mode,
    timeRemaining,
    dailyStreak,
    dailyCompleted,
    dailyTarget,
    achievementNotice,
    pausedByHost,
    ready,
    winDialogOpen,
    dismissWinDialog,
    platform,
    switchPlatform,
    reviveGameWithAd,
    getFreeUndoWithAd,
    adPlaying,
    audioEnabled,
    toggleAudio,
  } = use2048Game();

  const [platformSelectorOpen, setPlatformSelectorOpen] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const mouseStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const directionMap: Record<string, Direction> = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",
        w: "up",
        W: "up",
        s: "down",
        S: "down",
        a: "left",
        A: "left",
        d: "right",
        D: "right",
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
      } else if (event.key === "Escape") {
        dismissWinDialog();
      }
    },
    [dismissWinDialog, move, restart, undo]
  );

  const handleTouchStart = useCallback((event: TouchEvent) => {
    touchStartRef.current = { x: event.touches[0].clientX, y: event.touches[0].clientY };
  }, []);

  const handleTouchEnd = useCallback(
    (event: TouchEvent) => {
      if (!touchStartRef.current) return;
      const touch = event.changedTouches[0];
      const direction = gestureDirection(
        touch.clientX - touchStartRef.current.x,
        touch.clientY - touchStartRef.current.y
      );
      touchStartRef.current = null;
      if (direction) move(direction);
    },
    [move]
  );

  const handleMouseDown = useCallback((event: ReactMouseEvent) => {
    if (event.button === 0) {
      mouseStartRef.current = { x: event.clientX, y: event.clientY };
    }
  }, []);

  const handleMouseUp = useCallback(
    (event: ReactMouseEvent) => {
      if (!mouseStartRef.current) return;
      const direction = gestureDirection(
        event.clientX - mouseStartRef.current.x,
        event.clientY - mouseStartRef.current.y
      );
      mouseStartRef.current = null;
      if (direction) move(direction);
    },
    [move]
  );

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
    <main
      className="playable-shell flex flex-col items-center justify-center min-h-[100svh] relative select-none"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      {/* Apple-style subtle ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/15 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Header section */}
      <div className="playable-heading text-center mb-3 sm:mb-4">
        <div className="playable-eyebrow inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/[0.06] border border-white/10 text-primary mb-2 shadow-inner">
          <Sparkles className="h-3.5 w-3.5" /> Apple Fluid Design · Multi-Platform
        </div>
        <h1 className="playable-title text-4xl sm:text-5xl font-black tracking-tight text-white">
          2048 <span className="font-light text-primary">Dash</span>
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-zinc-400 font-medium">
          {mode === "daily"
            ? `Daily Target: Reach ${dailyTarget} to preserve streak.`
            : mode === "dash"
            ? "Two minutes on the clock. Score maximum points."
            : "Merge matching numbers to reach the 2048 tile."}
        </p>
      </div>

      {/* Controls and Score Header */}
      <ScoreBoard
        score={score}
        bestScore={bestScore}
        mode={mode}
        canUndo={canUndo}
        timeRemaining={timeRemaining}
        audioEnabled={audioEnabled}
        platform={platform}
        onRestart={restart}
        onUndo={undo}
        onModeChange={startMode}
        onToggleAudio={toggleAudio}
        onOpenPlatformSelector={() => setPlatformSelectorOpen(true)}
        onRewardedUndo={getFreeUndoWithAd}
      />

      {/* The 2048 Game Board */}
      <GameGrid tiles={tiles} />

      {/* Badges / Streak Notification */}
      <div className="mt-2 flex min-h-6 flex-wrap items-center justify-center gap-2 text-center text-xs" aria-live="polite">
        {mode === "daily" && (
          <span className="rounded-full bg-primary/20 border border-primary/30 px-3 py-0.5 text-primary font-semibold">
            🔥 {dailyStreak}-day streak {dailyCompleted ? "· Complete" : "· In Progress"}
          </span>
        )}
        {achievementNotice && (
          <span className="rounded-full bg-accent/20 border border-accent/30 px-3 py-0.5 text-accent font-semibold animate-pulse">
            🏆 {achievementNotice}
          </span>
        )}
      </div>

      {/* Control Instructions */}
      <Instructions />

      {/* Platform Switcher Modal */}
      <PlatformSelectorModal
        open={platformSelectorOpen}
        onOpenChange={setPlatformSelectorOpen}
        currentPlatformId={platform.id}
        onSelectPlatform={switchPlatform}
      />

      {/* Initial Loading Screen */}
      {!ready && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0b14] text-white"
          role="status"
          aria-live="polite"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center mb-4 animate-bounce">
            <Play className="w-6 h-6 text-primary fill-primary" />
          </div>
          <p className="text-base font-bold tracking-tight text-white">Initializing 2048 Dash…</p>
          <p className="text-xs text-zinc-500 mt-1">Connecting to {platform.name}</p>
        </div>
      )}

      {/* Host Paused Overlay */}
      {pausedByHost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl">
          <div className="mx-4 max-w-sm text-center p-6 rounded-3xl bg-[#0f111d] border border-white/10 shadow-2xl">
            <h2 className="mb-2 text-3xl font-extrabold text-white">Game Paused</h2>
            <p className="text-sm text-zinc-400">Your session is preserved. Resume when you're ready to play.</p>
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {gameOver && !pausedByHost && (
        <GameOverModal
          score={score}
          bestScore={bestScore}
          mode={mode}
          dailyCompleted={dailyCompleted}
          platform={platform}
          onRestart={restart}
          onReviveWithAd={reviveGameWithAd}
          adPlaying={adPlaying}
        />
      )}

      {/* Win Modal (2048 Reached) */}
      {hasWon && winDialogOpen && !gameOver && !pausedByHost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xl animate-in fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="win-title"
        >
          <div className="w-full max-w-sm sm:max-w-md rounded-3xl bg-[#0e101d] border border-white/15 p-6 sm:p-8 text-center shadow-2xl animate-in zoom-in-95">
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <Trophy className="h-8 w-8 text-amber-400" aria-hidden="true" />
            </div>
            <h2 id="win-title" className="text-3xl font-extrabold text-white mb-2">
              2048 Tile Reached!
            </h2>
            <p className="text-sm text-zinc-400 mb-6">
              Congratulations! You have achieved the classic 2048 tile. You can continue playing to score even higher, or start fresh.
            </p>
            <div className="flex gap-2.5">
              <Button className="flex-1 rounded-2xl font-bold bg-primary hover:bg-primary/90 h-12" onClick={dismissWinDialog}>
                Keep Playing
              </Button>
              <Button className="flex-1 rounded-2xl font-bold bg-white/10 hover:bg-white/15 border border-white/10 h-12 text-white" onClick={restart}>
                New Game
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Index;
