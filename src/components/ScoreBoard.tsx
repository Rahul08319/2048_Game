import { CalendarDays, RotateCcw, Timer, Trophy, Undo2, Volume2, VolumeX, Sparkles, Layers } from "lucide-react";
import type { GameMode } from "@/hooks/use2048Game";
import type { PlatformMetadata } from "@/lib/platform/types";
import { Button } from "./ui/button";

interface ScoreBoardProps {
  score: number;
  bestScore: number;
  mode: GameMode;
  canUndo: boolean;
  timeRemaining: number | null;
  audioEnabled: boolean;
  platform: PlatformMetadata;
  onRestart: () => void;
  onUndo: () => void;
  onModeChange: (mode: GameMode) => void;
  onToggleAudio: () => void;
  onOpenPlatformSelector: () => void;
  onRewardedUndo?: () => void;
}

const formatTime = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

export const ScoreBoard = ({
  score,
  bestScore,
  mode,
  canUndo,
  timeRemaining,
  audioEnabled,
  platform,
  onRestart,
  onUndo,
  onModeChange,
  onToggleAudio,
  onOpenPlatformSelector,
  onRewardedUndo,
}: ScoreBoardProps) => (
  <section className="playable-scoreboard w-full max-w-[464px] flex flex-col gap-3" aria-label="Game controls and score">
    {/* Platform & System Bar */}
    <div className="flex items-center justify-between px-1">
      <button
        onClick={onOpenPlatformSelector}
        className="group inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 text-white/90 backdrop-blur-md transition-all active:scale-95"
        title="Switch Platform SDK Environment"
      >
        <Layers className="w-3.5 h-3.5 text-primary group-hover:rotate-12 transition-transform" />
        <span>{platform.name}</span>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
      </button>

      <div className="flex items-center gap-1.5">
        <button
          onClick={onToggleAudio}
          className="p-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 text-white/90 backdrop-blur-md transition-all active:scale-95"
          title={audioEnabled ? "Mute Game Sound" : "Enable Game Sound"}
          aria-label={audioEnabled ? "Mute audio" : "Enable audio"}
        >
          {audioEnabled ? <Volume2 className="w-4 h-4 text-primary" /> : <VolumeX className="w-4 h-4 text-zinc-400" />}
        </button>
      </div>
    </div>

    {/* Top Score Cards & Action Buttons */}
    <div className="flex items-stretch justify-between gap-2.5">
      {/* Score Box */}
      <div className="relative flex-1 min-w-0 rounded-2xl bg-white/[0.05] border border-white/10 p-3 sm:px-4 sm:py-3 shadow-lg shadow-black/20 backdrop-blur-xl transition-all">
        <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-0.5">
          Score
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight tabular-nums">
          {score}
        </div>
      </div>

      {/* Best Score Box */}
      <div className="relative flex-1 min-w-0 rounded-2xl bg-white/[0.05] border border-primary/40 p-3 sm:px-4 sm:py-3 shadow-lg shadow-black/20 backdrop-blur-xl transition-all">
        <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-primary mb-0.5">
          <Trophy className="w-3 h-3 text-primary" /> Best
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight tabular-nums">
          {bestScore}
        </div>
      </div>

      {/* Dash Timer if in Dash Mode */}
      {mode === "dash" && timeRemaining !== null && (
        <div className="flex min-w-[5.2rem] flex-col items-center justify-center rounded-2xl border border-accent/40 bg-accent/10 px-3 py-2 text-accent backdrop-blur-xl animate-pulse">
          <Timer className="h-4 w-4 mb-0.5" />
          <strong className="text-lg font-bold tabular-nums">{formatTime(timeRemaining)}</strong>
        </div>
      )}

      {/* Controls: Undo & Restart */}
      <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2">
        <Button
          onClick={canUndo ? onUndo : onRewardedUndo}
          size="sm"
          variant="secondary"
          className={`h-auto rounded-xl px-3 py-2 text-xs font-semibold border transition-all active:scale-95 ${
            canUndo
              ? "bg-white/[0.08] hover:bg-white/[0.15] border-white/10 text-white"
              : "bg-white/[0.03] border-white/5 text-zinc-400 hover:text-white"
          }`}
          title={canUndo ? "Undo last move (U)" : "Watch ad for free Undo"}
        >
          {canUndo ? (
            <>
              <Undo2 className="mr-1 h-3.5 w-3.5" /> Undo
            </>
          ) : (
            <>
              <Sparkles className="mr-1 h-3.5 w-3.5 text-amber-400" /> Undo Ad
            </>
          )}
        </Button>

        <Button
          onClick={onRestart}
          size="sm"
          className="h-auto rounded-xl px-3 py-2 text-xs font-semibold bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20 transition-all active:scale-95"
          title="Restart Game (R)"
        >
          <RotateCcw className="mr-1 h-3.5 w-3.5" /> New
        </Button>
      </div>
    </div>

    {/* Apple-Style Segmented Mode Selector */}
    <div
      className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl shadow-inner"
      role="group"
      aria-label="Game mode selection"
    >
      <button
        onClick={() => onModeChange("classic")}
        className={`relative py-1.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 ${
          mode === "classic"
            ? "bg-primary text-white shadow-md shadow-primary/25"
            : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
        }`}
      >
        Classic
      </button>

      <button
        onClick={() => onModeChange("daily")}
        className={`relative flex items-center justify-center gap-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 ${
          mode === "daily"
            ? "bg-primary text-white shadow-md shadow-primary/25"
            : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
        }`}
      >
        <CalendarDays className="h-3.5 w-3.5" /> Daily
      </button>

      <button
        onClick={() => onModeChange("dash")}
        className={`relative flex items-center justify-center gap-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 ${
          mode === "dash"
            ? "bg-primary text-white shadow-md shadow-primary/25"
            : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
        }`}
      >
        <Timer className="h-3.5 w-3.5" /> Dash
      </button>
    </div>
  </section>
);
