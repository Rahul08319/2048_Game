import { Keyboard, Smartphone } from 'lucide-react';

export const Instructions = () => {
  return (
    <div className="playable-instructions mt-4 max-w-[464px] text-center sm:mt-6">
      <div className="flex items-center justify-center gap-6 text-muted-foreground">
        <div className="flex items-center gap-2">
          <Keyboard className="w-5 h-5" />
          <span className="text-sm">Use arrow keys</span>
        </div>
        <div className="w-px h-4 bg-border" />
        <div className="flex items-center gap-2">
          <Smartphone className="w-5 h-5" />
          <span className="text-sm">Drag or swipe</span>
        </div>
      </div>
      <p className="mt-4 text-sm text-muted-foreground/80">
        Use <span className="font-bold text-primary">U</span> to undo, <span className="font-bold text-primary">R</span> to restart, and <span className="font-bold text-primary">F</span> for fullscreen.
      </p>
    </div>
  );
};
