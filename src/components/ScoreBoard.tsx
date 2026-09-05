import { Trophy, RotateCcw } from 'lucide-react';
import { Button } from './ui/button';

interface ScoreBoardProps {
  score: number;
  bestScore: number;
  onRestart: () => void;
}

export const ScoreBoard = ({ score, bestScore, onRestart }: ScoreBoardProps) => {
  return (
    <div className="playable-scoreboard flex w-full max-w-[464px] flex-wrap items-center justify-center gap-3 sm:flex-nowrap sm:justify-between">
      <div className="flex flex-1 gap-2 sm:gap-4">
        <div className="min-w-0 flex-1 rounded-2xl bg-[hsl(var(--card))] px-3 py-2 sm:min-w-[120px] sm:px-6 sm:py-3">
          <div className="text-sm text-muted-foreground uppercase font-semibold mb-1">Score</div>
          <div className="text-3xl font-bold text-foreground">{score}</div>
        </div>
        <div className="min-w-0 flex-1 rounded-2xl border-2 border-primary/30 bg-[hsl(var(--card))] px-3 py-2 sm:min-w-[120px] sm:px-6 sm:py-3">
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
        className="h-12 rounded-2xl bg-primary px-4 font-bold text-primary-foreground hover:bg-primary/90 sm:h-[86px] sm:px-6"
      >
        <RotateCcw className="w-5 h-5 mr-2" />
        New Game
      </Button>
    </div>
  );
};
