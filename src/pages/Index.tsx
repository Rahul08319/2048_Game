import { useCallback, useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import { use2048Game, type Direction } from "@/hooks/use2048Game";
import { GameHUD } from "@/components/GameHUD";
import { GameGrid } from "@/components/GameGrid";
import { BottomControls } from "@/components/BottomControls";
import { PauseMenuModal } from "@/components/PauseMenuModal";
import { GameOverModal } from "@/components/GameOverModal";
import { PlatformSelectorModal } from "@/components/PlatformSelectorModal";
import { LevelSelectModal } from "@/components/LevelSelectModal";
import { LevelCompleteModal } from "@/components/LevelCompleteModal";
import { LevelFailedModal } from "@/components/LevelFailedModal";
import { Button } from "@/components/ui/button";
import { Trophy, Play } from "lucide-react";

const gestureDirection = (dx: number, dy: number): Direction | null => {
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 25) return null;
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
    pausedByHost,
    pauseMenuOpen,
    setPauseMenuOpen,
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
    scoreGains,
    combo,
    shake,
    currentLevel,
    currentLevelConfig,
    movesRemaining,
    obstacles,
    targetTile,
    levelProgress,
    levelWon,
    levelFailed,
    levelStarsEarned,
    startLevel,
    nextLevel,
    retryLevel,
    addExtraMovesWithAd,
    dismissLevelComplete,
    dismissLevelFailed,
  } = use2048Game();

  const [platformSelectorOpen, setPlatformSelectorOpen] = useState(false);
  const [levelSelectOpen, setLevelSelectOpen] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const mouseStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't intercept if an overlay or modal is active
      if (pauseMenuOpen || levelSelectOpen || levelWon || levelFailed) {
        if (event.key === "Escape") {
          if (pauseMenuOpen) setPauseMenuOpen(false);
          if (levelSelectOpen) setLevelSelectOpen(false);
        }
        return;
      }

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
      } else if (event.key === "p" || event.key === "P" || event.key === "Escape") {
        setPauseMenuOpen(true);
      } else if (event.key === "f" || event.key === "F") {
        if (document.fullscreenElement) void document.exitFullscreen();
        else void document.documentElement.requestFullscreen?.();
      }
    },
    [move, pauseMenuOpen, restart, setPauseMenuOpen, undo]
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
      className="playable-shell relative"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/15 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* 1. Arcade Game Top HUD */}
      <GameHUD
        score={score}
        bestScore={bestScore}
        mode={mode}
        timeRemaining={timeRemaining}
        dailyStreak={dailyStreak}
        audioEnabled={audioEnabled}
        scoreGains={scoreGains}
        onOpenPause={() => setPauseMenuOpen(true)}
        onToggleAudio={toggleAudio}
        onModeChange={startMode}
      />

      {/* 2. Centered Game Board (The Core Gameplay) */}
      <GameGrid tiles={tiles} shake={shake} combo={combo} />

      {/* 3. Bottom Game Action Controls */}
      <BottomControls
        canUndo={canUndo}
        onUndo={undo}
        onRewardedUndo={getFreeUndoWithAd}
        onRestart={restart}
        mode={mode}
        timeRemaining={timeRemaining}
        adPlaying={adPlaying}
      />

      {/* In-Game Pause Menu */}
      <PauseMenuModal
        open={pauseMenuOpen}
        onOpenChange={setPauseMenuOpen}
        onResume={() => setPauseMenuOpen(false)}
        onRestart={restart}
        mode={mode}
        onModeChange={startMode}
        audioEnabled={audioEnabled}
        onToggleAudio={toggleAudio}
        platform={platform}
        onOpenPlatformSelector={() => setPlatformSelectorOpen(true)}
      />

      {/* Platform SDK Switcher Modal (accessible from pause menu) */}
      <PlatformSelectorModal
        open={platformSelectorOpen}
        onOpenChange={setPlatformSelectorOpen}
        currentPlatformId={platform.id}
        onSelectPlatform={switchPlatform}
      />

      {/* Initial Loading Screen */}
      {!ready && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#070810] text-white"
          role="status"
          aria-live="polite"
        >
          <div className="w-14 h-14 rounded-3xl bg-primary/20 border border-primary/40 flex items-center justify-center mb-4 animate-bounce">
            <Play className="w-7 h-7 text-primary fill-primary ml-0.5" />
          </div>
          <p className="text-base font-black tracking-tight text-white">Loading 2048…</p>
          <p className="text-xs text-zinc-500 mt-1">{platform.name}</p>
        </div>
      )}

      {/* Host Paused Overlay */}
      {pausedByHost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-2xl">
          <div className="mx-4 max-w-sm text-center p-6 rounded-3xl bg-[#0d0f1b] border border-white/10 shadow-2xl">
            <h2 className="mb-2 text-3xl font-black text-white">Game Paused</h2>
            <p className="text-xs text-zinc-400">Game session paused by host. Return to continue.</p>
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-2xl animate-in fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="win-title"
        >
          <div className="w-full max-w-sm rounded-[2rem] bg-[#0c0e1a] border border-white/15 p-6 text-center shadow-2xl animate-in zoom-in-95">
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <Trophy className="h-7 w-7 text-amber-400" aria-hidden="true" />
            </div>
            <h2 id="win-title" className="text-3xl font-black text-white mb-1.5">
              2048 Reached!
            </h2>
            <p className="text-xs text-zinc-400 mb-5">
              You achieved the 2048 tile! Keep going to set a new record or start fresh.
            </p>
            <div className="flex gap-2">
              <Button
                className="flex-1 rounded-2xl font-bold bg-primary hover:bg-primary/90 h-12 text-sm"
                onClick={dismissWinDialog}
              >
                Keep Playing
              </Button>
              <Button
                className="flex-1 rounded-2xl font-bold bg-white/10 hover:bg-white/15 border border-white/10 h-12 text-white text-sm"
                onClick={restart}
              >
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
