import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star, Trophy, ArrowRight, RotateCcw, Sparkles } from "lucide-react";
import type { LevelConfig } from "@/lib/levels/types";

interface LevelCompleteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  levelConfig: LevelConfig;
  starsEarned: number;
  score: number;
  movesRemaining: number;
  onNextLevel: () => void;
  onReplay: () => void;
}

export const LevelCompleteModal = ({
  open,
  onOpenChange,
  levelConfig,
  starsEarned,
  score,
  movesRemaining,
  onNextLevel,
  onReplay,
}: LevelCompleteModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm sm:max-w-md border border-white/15 bg-[#0b0c16]/95 backdrop-blur-3xl text-white rounded-[2.5rem] p-6 sm:p-7 shadow-2xl text-center">
        <DialogHeader className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mb-2 shadow-inner">
            <Trophy className="w-8 h-8 text-amber-400" />
          </div>

          <DialogTitle className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Level {levelConfig.level} Cleared!
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-400 mt-0.5">
            {levelConfig.chapterTitle} · Target {levelConfig.targetTile} Reached
          </DialogDescription>
        </DialogHeader>

        {/* 3 Animated Gold Stars */}
        <div className="my-5 flex items-center justify-center gap-3">
          {[1, 2, 3].map((starIdx) => {
            const hasStar = starsEarned >= starIdx;
            return (
              <div
                key={starIdx}
                className={`relative flex items-center justify-center w-14 h-14 rounded-2xl border transition-all duration-500 ${
                  hasStar
                    ? "bg-gradient-to-br from-amber-400/20 to-orange-500/20 border-amber-400/50 shadow-lg shadow-amber-500/25 scale-105"
                    : "bg-white/[0.03] border-white/10 opacity-30"
                }`}
              >
                <Star
                  className={`w-8 h-8 ${
                    hasStar
                      ? "fill-amber-400 text-amber-400 animate-bounce"
                      : "text-zinc-600 fill-zinc-800"
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* Level Stats Card */}
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-3.5 mb-5 grid grid-cols-2 gap-2 text-center">
          <div>
            <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Score</div>
            <div className="text-2xl font-black text-white tabular-nums">{score}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Moves Left</div>
            <div className="text-2xl font-black text-primary tabular-nums">{movesRemaining}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2.5">
          {levelConfig.level < 100 && (
            <Button
              onClick={() => {
                onNextLevel();
                onOpenChange(false);
              }}
              size="lg"
              className="w-full bg-primary hover:bg-primary/90 text-white font-extrabold text-base rounded-2xl h-13 shadow-lg shadow-primary/25 transition-all active:scale-[0.98]"
            >
              Next Level
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          )}

          <Button
            onClick={() => {
              onReplay();
              onOpenChange(false);
            }}
            size="lg"
            variant="secondary"
            className="w-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 text-white font-bold rounded-2xl h-12 transition-all active:scale-[0.98]"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Replay for 3 Stars
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
