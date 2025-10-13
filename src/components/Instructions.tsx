import { Keyboard, Smartphone } from 'lucide-react';

export const Instructions = () => {
  return (
    <div className="mt-6 max-w-[464px] text-center">
      <div className="flex items-center justify-center gap-6 text-muted-foreground">
        <div className="flex items-center gap-2">
          <Keyboard className="w-5 h-5" />
          <span className="text-sm">Use arrow keys</span>
        </div>
        <div className="w-px h-4 bg-border" />
        <div className="flex items-center gap-2">
          <Smartphone className="w-5 h-5" />
          <span className="text-sm">Swipe to move</span>
        </div>
      </div>
      <p className="mt-4 text-sm text-muted-foreground/80">
        Combine tiles with the same number to reach <span className="font-bold text-primary">2048</span>!
      </p>
    </div>
  );
};
