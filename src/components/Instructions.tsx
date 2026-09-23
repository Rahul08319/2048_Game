import { Keyboard, Smartphone, Compass } from "lucide-react";

export const Instructions = () => {
  return (
    <div className="playable-instructions mt-3 max-w-[464px] text-center w-full">
      <div className="flex items-center justify-center gap-4 sm:gap-6 text-zinc-400">
        <div className="flex items-center gap-1.5 text-xs">
          <Keyboard className="w-4 h-4 text-zinc-400" />
          <span>Arrows or WASD</span>
        </div>
        <div className="w-1 h-1 rounded-full bg-white/20" />
        <div className="flex items-center gap-1.5 text-xs">
          <Smartphone className="w-4 h-4 text-zinc-400" />
          <span>Swipe / Drag</span>
        </div>
        <div className="w-1 h-1 rounded-full bg-white/20" />
        <div className="flex items-center gap-1.5 text-xs">
          <Compass className="w-4 h-4 text-zinc-400" />
          <span>9:32 to 32:9</span>
        </div>
      </div>

      <div className="mt-2.5 flex items-center justify-center gap-2 text-[11px] text-zinc-500">
        <span>Shortcuts:</span>
        <kbd className="px-1.5 py-0.5 rounded-md bg-white/[0.06] border border-white/10 text-zinc-300 font-mono text-[10px]">U</kbd> Undo
        <kbd className="px-1.5 py-0.5 rounded-md bg-white/[0.06] border border-white/10 text-zinc-300 font-mono text-[10px]">R</kbd> Restart
        <kbd className="px-1.5 py-0.5 rounded-md bg-white/[0.06] border border-white/10 text-zinc-300 font-mono text-[10px]">F</kbd> Fullscreen
      </div>
    </div>
  );
};
