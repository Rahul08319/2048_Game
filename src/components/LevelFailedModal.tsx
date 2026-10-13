import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, RotateCcw, XCircle } from "lucide-react";
import type { LevelConfig } from "@/lib/levels/types";

interface LevelFailedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  levelConfig: LevelConfig;
  onRetry: () => void;
  onWatchAdForExtraMoves: () => void;
  adPlaying?: boolean;
}

export const LevelFailedModal = ({
  open,
  onOpenChange,
  levelConfig,
  onRetry,
  onWatchAdForExtraMoves,
  adPlaying,
}: LevelFailedModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm border border-white/15 bg-[#0b0c16]/95 backdrop-blur-3xl text-white rounded-[2.5rem] p-6 shadow-2xl text-center">
        <DialogHeader className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center mb-2 shadow-inner">
            <XCircle className="w-8 h-8 text-rose-400" />
          </div>

          <DialogTitle className="text-3xl font-black tracking-tight text-white">
            Out of Moves!
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-400 mt-0.5">
            Level {levelConfig.level}: Target {levelConfig.targetTile} not yet reached.
          </DialogDescription>
        </DialogHeader>

        <div className="my-5 bg-white/[0.04] border border-white/10 rounded-2xl p-4 text-center">
          <div className="text-xs text-zinc-400">Target to clear:</div>
          <div className="text-3xl font-black text-amber-300 mt-1">
            {levelConfig.targetTile} Tile
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          {/* Rewarded Ad Action */}
          <Button
            onClick={() => {
              onWatchAdForExtraMoves();
            }}
            disabled={adPlaying}
            size="lg"
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-sm rounded-2xl h-13 shadow-lg shadow-orange-500/25 transition-all active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {adPlaying ? "Loading..." : "Watch Ad for +5 Extra Moves"}
          </Button>

          {/* Retry Button */}
          <Button
            onClick={() => {
              onRetry();
              onOpenChange(false);
            }}
            size="lg"
            variant="secondary"
            className="w-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 text-white font-bold rounded-2xl h-12 transition-all active:scale-[0.98]"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Retry Level
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
