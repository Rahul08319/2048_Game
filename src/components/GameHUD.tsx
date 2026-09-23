import { Pause, Trophy, Volume2, VolumeX, Timer, Flame, Sparkles } from "lucide-react";
import type { GameMode } from "@/hooks/use2048Game";

interface FloatingScore {
  id: number;
  value: number;
}

interface GameHUDProps {
  score: number;
  bestScore: number;
  mode: GameMode;
  timeRemaining: number | null;
  dailyStreak: number;
  audioEnabled: boolean;
  scoreGains: FloatingScore[];
  onOpenPause: () => void;
  onToggleAudio: () => void;
  onModeChange: (mode: GameMode) => void;
}

const formatTime = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

export const GameHUD = ({
  score,
  bestScore,
  mode,
  timeRemaining,
  dailyStreak,
  audioEnabled,
  scoreGains,
  onOpenPause,
  onToggleAudio,
  onModeChange,
}: GameHUDProps) => {
  return (
    <header className="w-full max-w-[440px] flex items-center justify-between gap-2 px-1 select-none z-10">
      {/* Left: Pause/Menu & Audio */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={onOpenPause}
          className="w-10 h-10 rounded-2xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 flex items-center justify-center text-white/90 backdrop-blur-xl shadow-md transition-all active:scale-95"
          title="Pause & Settings"
          aria-label="Pause and settings"
        >
          <Pause className="w-4 h-4 fill-white/80" />
        </button>

        <button
          onClick={onToggleAudio}
          className="w-10 h-10 rounded-2xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 flex items-center justify-center text-white/90 backdrop-blur-xl shadow-md transition-all active:scale-95"
          title={audioEnabled ? "Mute Game Sound" : "Enable Game Sound"}
          aria-label={audioEnabled ? "Mute audio" : "Enable audio"}
        >
          {audioEnabled ? (
            <Volume2 className="w-4 h-4 text-primary" />
          ) : (
            <VolumeX className="w-4 h-4 text-zinc-500" />
          )}
        </button>

        {/* Mode & Streak Pill */}
        <button
          onClick={onOpenPause}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-xs font-bold text-white/90 backdrop-blur-xl transition-all active:scale-95"
        >
          {mode === "dash" ? (
            <>
              <Timer className="w-3.5 h-3.5 text-accent animate-pulse" />
              <span className="tabular-nums font-mono text-accent">
                {timeRemaining !== null ? formatTime(timeRemaining) : "2:00"}
              </span>
            </>
          ) : mode === "daily" ? (
            <>
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>{dailyStreak}d Streak</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="capitalize">Classic</span>
            </>
          )}
        </button>
      </div>

      {/* Center: Title / Logo */}
      <div className="flex flex-col items-center">
        <span className="text-xl sm:text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-primary/80 drop-shadow">
          2048
        </span>
      </div>

      {/* Right: Arcade Score Widgets */}
      <div className="flex items-center gap-2">
        {/* Current Score Box with Floating Popups */}
        <div className="relative flex flex-col items-center justify-center min-w-[70px] sm:min-w-[85px] px-2.5 py-1.5 rounded-2xl bg-white/[0.07] border border-white/10 backdrop-blur-xl shadow-md">
          <span className="text-[9px] font-extrabold uppercase tracking-widest text-zinc-400">
            Score
          </span>
          <span className="text-base sm:text-lg font-black text-white tracking-tight tabular-nums leading-none mt-0.5">
            {score}
          </span>

          {/* Floating Score Popups */}
          {scoreGains.map((gain) => (
            <span
              key={gain.id}
              className="absolute -top-3 sm:-top-4 text-xs sm:text-sm font-black text-primary drop-shadow animate-score-float pointer-events-none"
            >
              +{gain.value}
            </span>
          ))}
        </div>

        {/* Best Score Box */}
        <div className="flex flex-col items-center justify-center min-w-[65px] sm:min-w-[80px] px-2.5 py-1.5 rounded-2xl bg-white/[0.07] border border-primary/40 backdrop-blur-xl shadow-md">
          <span className="flex items-center gap-0.5 text-[9px] font-extrabold uppercase tracking-widest text-primary leading-none">
            <Trophy className="w-2.5 h-2.5" /> Best
          </span>
          <span className="text-base sm:text-lg font-black text-primary tracking-tight tabular-nums leading-none mt-0.5">
            {bestScore}
          </span>
        </div>
      </div>
    </header>
  );
};
