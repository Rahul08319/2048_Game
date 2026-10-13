import { Undo2, RotateCcw, Sparkles, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GameMode } from "@/hooks/use2048Game";

interface BottomControlsProps {
  canUndo: boolean;
  onUndo: () => void;
  onRewardedUndo?: () => void;
  onRestart: () => void;
  mode: GameMode;
  timeRemaining: number | null;
  adPlaying?: boolean;
}

export const BottomControls = ({
  canUndo,
  onUndo,
  onRewardedUndo,
  onRestart,
  mode,
  timeRemaining,
  adPlaying,
}: BottomControlsProps) => {
  return (
    <footer className="w-full max-w-[440px] flex items-center justify-between gap-3 px-1 select-none z-10">
      {/* Undo Button */}
      <Button
        onClick={canUndo ? onUndo : onRewardedUndo}
        disabled={adPlaying}
        variant="secondary"
        className={`flex-1 h-12 rounded-2xl font-bold text-xs sm:text-sm border transition-transform duration-100 ease-out active:scale-95 shadow-lg ${
          canUndo
            ? "bg-white/[0.08] hover:bg-white/[0.14] border-white/10 text-white"
            : "bg-white/[0.04] hover:bg-white/[0.09] border-white/5 text-zinc-400"
        }`}
        title={canUndo ? "Undo Move (U)" : "Watch Ad for Extra Undo"}
      >
        {canUndo ? (
          <>
            <Undo2 className="w-4 h-4 mr-2" />
            Undo Move
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2 text-amber-400" />
            Ad Undo
          </>
        )}
      </Button>

      {/* Mobile Dash Timer Pill if on Mobile */}
      {mode === "dash" && timeRemaining !== null && (
        <div className="sm:hidden flex items-center gap-1 px-3 h-12 rounded-2xl bg-accent/15 border border-accent/30 text-accent font-mono font-bold text-xs">
          <Timer className="w-3.5 h-3.5" />
          <span>{Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, "0")}</span>
        </div>
      )}

      {/* Restart Button */}
      <Button
        onClick={onRestart}
        className="flex-1 h-12 rounded-2xl font-bold text-xs sm:text-sm bg-primary hover:bg-primary/90 text-white border border-primary/40 shadow-lg shadow-primary/20 transition-transform duration-100 ease-out active:scale-95"
        title="Restart Board (R)"
      >
        <RotateCcw className="w-4 h-4 mr-2" />
        New Game
      </Button>
    </footer>
  );
};
