import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw, Volume2, VolumeX, Layers, Keyboard, Smartphone, Trophy, Sparkles } from "lucide-react";
import type { GameMode } from "@/hooks/use2048Game";
import type { PlatformMetadata } from "@/lib/platform/types";

interface PauseMenuModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResume: () => void;
  onRestart: () => void;
  mode: GameMode;
  onModeChange: (mode: GameMode) => void;
  audioEnabled: boolean;
  onToggleAudio: () => void;
  platform: PlatformMetadata;
  onOpenPlatformSelector: () => void;
}

export const PauseMenuModal = ({
  open,
  onOpenChange,
  onResume,
  onRestart,
  mode,
  onModeChange,
  audioEnabled,
  onToggleAudio,
  platform,
  onOpenPlatformSelector,
}: PauseMenuModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm sm:max-w-md border border-white/15 bg-[#0b0c16]/95 backdrop-blur-3xl text-white rounded-[2rem] p-6 shadow-2xl">
        <DialogHeader className="text-center mb-1">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center mb-2 shadow-inner">
            <span className="text-2xl">⏸️</span>
          </div>
          <DialogTitle className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Game Paused
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-400">
            Session saved. Adjust settings or switch game modes.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 my-3">
          {/* Primary Action: Resume */}
          <Button
            onClick={() => {
              onResume();
              onOpenChange(false);
            }}
            size="lg"
            className="w-full bg-primary hover:bg-primary/90 text-white font-extrabold text-base rounded-2xl h-13 shadow-lg shadow-primary/25 transition-all active:scale-[0.98]"
          >
            <Play className="w-5 h-5 mr-2 fill-white" />
            Resume Playing
          </Button>

          {/* Secondary Action: Restart */}
          <Button
            onClick={() => {
              onRestart();
              onOpenChange(false);
            }}
            size="lg"
            variant="secondary"
            className="w-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 text-white font-bold rounded-2xl h-12 transition-all active:scale-[0.98]"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Restart Board
          </Button>

          {/* Mode Switcher */}
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-3">
            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
              Select Game Mode
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {(["classic", "daily", "dash"] as GameMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    onModeChange(m);
                    onOpenChange(false);
                  }}
                  className={`py-2 px-2 rounded-xl text-xs font-bold capitalize transition-all active:scale-95 ${
                    mode === m
                      ? "bg-primary text-white shadow-md shadow-primary/30"
                      : "bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08]"
                  }`}
                >
                  {m === "dash" ? "2-Min Dash" : m}
                </button>
              ))}
            </div>
          </div>

          {/* Sound & Platform Controls */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onToggleAudio}
              className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] transition-all active:scale-95 text-left"
            >
              <div>
                <div className="text-xs font-bold text-white">Game Audio</div>
                <div className="text-[10px] text-zinc-400">{audioEnabled ? "Enabled" : "Muted"}</div>
              </div>
              <div className="p-2 rounded-xl bg-white/[0.06]">
                {audioEnabled ? <Volume2 className="w-4 h-4 text-primary" /> : <VolumeX className="w-4 h-4 text-zinc-400" />}
              </div>
            </button>

            <button
              onClick={() => {
                onOpenChange(false);
                onOpenPlatformSelector();
              }}
              className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] transition-all active:scale-95 text-left"
            >
              <div>
                <div className="text-xs font-bold text-white">SDK Runtime</div>
                <div className="text-[10px] text-primary truncate max-w-[80px]">{platform.badge}</div>
              </div>
              <div className="p-2 rounded-xl bg-white/[0.06]">
                <Layers className="w-4 h-4 text-primary" />
              </div>
            </button>
          </div>

          {/* How to Play Hints */}
          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-around text-zinc-400 text-xs">
            <div className="flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-zinc-400" />
              <span>Swipe / Drag</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-white/20" />
            <div className="flex items-center gap-1.5">
              <Keyboard className="w-3.5 h-3.5 text-zinc-400" />
              <span>WASD / Arrows</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
