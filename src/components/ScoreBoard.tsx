import { Trophy, RotateCcw } from 'lucide-react';
import { Button } from './ui/button';

interface ScoreBoardProps {
  score: number;
  bestScore: number;
  onRestart: () => void;
}

export const ScoreBoard = ({ score, bestScore, onRestart }: ScoreBoardProps) => {
  return (
    <div className="flex items-center justify-between w-full max-w-[464px] mb-6">
      <div className="flex gap-4">
        <div className="bg-[hsl(var(--card))] rounded-2xl px-6 py-3 min-w-[120px]">
          <div className="text-sm text-muted-foreground uppercase font-semibold mb-1">Score</div>
          <div className="text-3xl font-bold text-foreground">{score}</div>
        </div>
        <div className="bg-[hsl(var(--card))] rounded-2xl px-6 py-3 min-w-[120px] border-2 border-primary/30">
          <div className="text-sm text-muted-foreground uppercase font-semibold mb-1 flex items-center gap-1">
            <Trophy className="w-4 h-4" />
            Best
          </div>
          <div className="text-3xl font-bold text-primary">{bestScore}</div>
        </div>
      </div>
      <Button
        onClick={onRestart}
        size="lg"
        className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-2xl px-6 h-[86px]"
      >
        <RotateCcw className="w-5 h-5 mr-2" />
        New Game
      </Button>
    </div>
  );
};
