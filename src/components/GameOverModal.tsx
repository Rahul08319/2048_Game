import { Button } from './ui/button';
import { RotateCcw } from 'lucide-react';
import type { GameMode } from '@/hooks/use2048Game';

interface GameOverModalProps {
  score: number;
  mode: GameMode;
  dailyCompleted: boolean;
  onRestart: () => void;
}

export const GameOverModal = ({ score, mode, dailyCompleted, onRestart }: GameOverModalProps) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
      <div className="bg-[hsl(var(--card))] rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl animate-in zoom-in-95 duration-300">
        <h2 className="text-4xl font-bold text-center mb-4 text-foreground">{mode === 'dash' ? 'Dash Complete!' : 'Game Over!'}</h2>
        <p className="text-center text-muted-foreground mb-2">Your final score:</p>
        <p className="text-5xl font-bold text-center text-primary mb-8">{score}</p>
        {mode === 'daily' && <p className="text-center text-muted-foreground mb-6">{dailyCompleted ? 'Daily streak secured!' : 'Try again to reach today\'s target.'}</p>}
        <Button
          onClick={onRestart}
          size="lg"
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-2xl h-14"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Try Again
        </Button>
      </div>
    </div>
  );
};
