import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star, Lock, Trophy, Sparkles, ChevronLeft, ChevronRight, Zap } from "lucide-react";
import { getLevelConfig, TOTAL_CHAPTERS, TOTAL_LEVELS } from "@/lib/levels/levelDatabase";
import type { LevelProgressMap } from "@/lib/levels/types";

interface LevelSelectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  levelProgress: LevelProgressMap;
  currentLevel: number;
  onSelectLevel: (level: number) => void;
}

export const LevelSelectModal = ({
  open,
  onOpenChange,
  levelProgress,
  currentLevel,
  onSelectLevel,
}: LevelSelectModalProps) => {
  const initialChapter = Math.ceil(Math.max(1, currentLevel) / 10);
  const [selectedChapter, setSelectedChapter] = useState(initialChapter);

  // Calculate total stars collected across all 100 levels
  let totalStars = 0;
  let completedCount = 0;
  for (let i = 1; i <= TOTAL_LEVELS; i++) {
    const item = levelProgress[i];
    if (item) {
      totalStars += item.stars || 0;
      if (item.completed) completedCount++;
    }
  }

  const startLevel = (selectedChapter - 1) * 10 + 1;
  const chapterLevels = Array.from({ length: 10 }, (_, idx) => startLevel + idx);
  const firstLevelConfig = getLevelConfig(startLevel);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-xl border border-white/15 bg-[#0b0c16]/95 backdrop-blur-3xl text-white rounded-[2rem] p-5 sm:p-6 shadow-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="mb-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-primary text-xs font-extrabold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> 100-Level Campaign
            </div>
            {/* Stars Counter Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-black">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{totalStars} / 300 Stars</span>
            </div>
          </div>

          <DialogTitle className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center justify-between mt-1">
            <span>Chapter {selectedChapter}: {firstLevelConfig.chapterTitle}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-400">
            Progress through 100 handcrafted puzzle challenges. Collect stars to master each tier.
          </DialogDescription>
        </DialogHeader>

        {/* Chapter Navigation Slider */}
        <div className="flex items-center justify-between bg-white/[0.04] border border-white/10 rounded-2xl p-1.5 my-2">
          <button
            onClick={() => setSelectedChapter((c) => Math.max(1, c - 1))}
            disabled={selectedChapter === 1}
            className="p-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95"
            aria-label="Previous Chapter"
          >
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>

          <div className="flex items-center gap-1 overflow-x-auto px-1 scrollbar-none">
            {Array.from({ length: TOTAL_CHAPTERS }, (_, idx) => idx + 1).map((ch) => (
              <button
                key={ch}
                onClick={() => setSelectedChapter(ch)}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl text-xs font-black transition-all active:scale-95 ${
                  selectedChapter === ch
                    ? "bg-primary text-white shadow-md shadow-primary/30"
                    : "bg-transparent text-zinc-400 hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                {ch}
              </button>
            ))}
          </div>

          <button
            onClick={() => setSelectedChapter((c) => Math.min(TOTAL_CHAPTERS, c + 1))}
            disabled={selectedChapter === TOTAL_CHAPTERS}
            className="p-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95"
            aria-label="Next Chapter"
          >
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* 10 Level Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 overflow-y-auto pr-1 my-2 flex-1">
          {chapterLevels.map((lvl) => {
            const config = getLevelConfig(lvl);
            const progress = levelProgress[lvl];
            const isUnlocked = lvl === 1 || Boolean(progress?.unlocked);
            const stars = progress?.stars || 0;
            const isCurrent = lvl === currentLevel;

            return (
              <button
                key={lvl}
                disabled={!isUnlocked}
                onClick={() => {
                  onSelectLevel(lvl);
                  onOpenChange(false);
                }}
                className={`relative flex flex-col items-center justify-between p-3 rounded-2xl border transition-all text-center select-none active:scale-[0.96] ${
                  !isUnlocked
                    ? "bg-white/[0.02] border-white/5 opacity-40 cursor-not-allowed"
                    : isCurrent
                    ? "bg-primary/20 border-primary shadow-lg shadow-primary/20 ring-1 ring-primary"
                    : "bg-white/[0.05] border-white/10 hover:bg-white/[0.1] hover:border-white/20 cursor-pointer"
                }`}
              >
                {/* Level Number & Target Pill */}
                <div className="w-full flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-white/90">#{lvl}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/[0.08] font-bold text-amber-300">
                    {config.targetTile}
                  </span>
                </div>

                {/* Center Icon: Target or Lock */}
                <div className="my-1 flex items-center justify-center">
                  {!isUnlocked ? (
                    <div className="w-9 h-9 rounded-xl bg-white/[0.04] flex items-center justify-center">
                      <Lock className="w-4 h-4 text-zinc-500" />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/30 to-accent/30 border border-white/15 flex items-center justify-center text-xs font-black text-white shadow-inner">
                      {config.targetTile}
                    </div>
                  )}
                </div>

                {/* Moves info */}
                <div className="text-[10px] text-zinc-400 font-semibold mb-1">
                  {config.moveLimit} Moves
                </div>

                {/* 3 Stars Indicator */}
                <div className="flex items-center gap-0.5 mt-0.5">
                  {[1, 2, 3].map((starIdx) => (
                    <Star
                      key={starIdx}
                      className={`w-3 h-3 ${
                        stars >= starIdx
                          ? "fill-amber-400 text-amber-400"
                          : "text-zinc-600 fill-zinc-800"
                      }`}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400">
          <span>{completedCount} / 100 Levels Completed</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="rounded-xl h-8 text-xs text-white"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
