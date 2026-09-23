import { Button } from "./ui/button";
import { RotateCcw, Sparkles, Trophy } from "lucide-react";
import type { GameMode } from "@/hooks/use2048Game";
import type { PlatformMetadata } from "@/lib/platform/types";

interface GameOverModalProps {
  score: number;
  bestScore: number;
  mode: GameMode;
  dailyCompleted: boolean;
  platform: PlatformMetadata;
  onRestart: () => void;
  onReviveWithAd?: () => void;
  adPlaying?: boolean;
}

export const GameOverModal = ({
  score,
  bestScore,
  mode,
  dailyCompleted,
  platform,
  onRestart,
  onReviveWithAd,
  adPlaying,
}: GameOverModalProps) => {
  const isNewBest = score > 0 && score >= bestScore;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xl flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-[#0e101c]/95 border border-white/15 rounded-3xl p-6 sm:p-8 max-w-sm sm:max-w-md w-full shadow-2xl shadow-black/60 text-center animate-in zoom-in-95 duration-200 flex flex-col items-center">
        {/* Apple-styled pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/[0.08] border border-white/10 text-white/80 mb-4">
          <span>{platform.name}</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2">
          {mode === "dash" ? "Dash Complete!" : "Game Over"}
        </h2>

        <p className="text-sm text-zinc-400 mb-4">
          {mode === "daily"
            ? dailyCompleted
              ? "Daily target reached! Streak updated."
              : "Missed today's target. Try again!"
            : isNewBest
            ? "🎉 Outstanding! You reached a new best score!"
            : "No more moves available on the board."}
        </p>

        {/* Score Card */}
        <div className="w-full bg-white/[0.04] border border-white/10 rounded-2xl p-4 mb-6 shadow-inner">
          <div className="text-xs uppercase tracking-wider text-zinc-400 font-semibold mb-1">
            Final Score
          </div>
          <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent tracking-tight tabular-nums">
            {score}
          </div>
          {isNewBest && (
            <div className="flex items-center justify-center gap-1 text-xs text-amber-400 font-bold mt-2">
              <Trophy className="w-3.5 h-3.5" /> All-Time Record!
            </div>
          )}
        </div>

        {/* Actions: Rewarded Ad Revive + Try Again */}
        <div className="w-full flex flex-col gap-2.5">
          {onReviveWithAd && platform.supportsRewardedAds && (
            <Button
              onClick={onReviveWithAd}
              disabled={adPlaying}
              size="lg"
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-2xl h-13 shadow-lg shadow-amber-500/25 transition-all active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {adPlaying ? "Loading Reward..." : "Watch Ad to Revive (Clears 2 Tiles)"}
            </Button>
          )}

          <Button
            onClick={onRestart}
            size="lg"
            variant="secondary"
            className="w-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 text-white font-bold rounded-2xl h-13 transition-all active:scale-[0.98]"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Play Again
          </Button>
        </div>
      </div>
    </div>
  );
};
