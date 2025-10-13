import { useEffect, useCallback, useRef } from 'react';
import { use2048Game } from '@/hooks/use2048Game';
import { GameGrid } from '@/components/GameGrid';
import { ScoreBoard } from '@/components/ScoreBoard';
import { GameOverModal } from '@/components/GameOverModal';
import { Instructions } from '@/components/Instructions';

const Index = () => {
  const { tiles, score, bestScore, gameOver, move, restart } = use2048Game();
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
      const directionMap: Record<string, 'up' | 'down' | 'left' | 'right'> = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
      };
      move(directionMap[e.key]);
    }
  }, [move]);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!touchStartRef.current) return;

    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
    };

    const dx = touchEnd.x - touchStartRef.current.x;
    const dy = touchEnd.y - touchStartRef.current.y;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) > 50) {
        move(dx > 0 ? 'right' : 'left');
      }
    } else {
      if (Math.abs(dy) > 50) {
        move(dy > 0 ? 'down' : 'up');
      }
    }

    touchStartRef.current = null;
  }, [move]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleKeyDown, handleTouchStart, handleTouchEnd]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8" style={{ background: 'var(--gradient-bg)' }}>
      <h1 className="text-6xl font-bold text-foreground mb-2 animate-in fade-in slide-in-from-top duration-500">
        2048
      </h1>
      <p className="text-muted-foreground mb-8 animate-in fade-in slide-in-from-top duration-500 delay-100">
        Join the tiles, get to 2048!
      </p>
      
      <ScoreBoard score={score} bestScore={bestScore} onRestart={restart} />
      <GameGrid tiles={tiles} />
      <Instructions />

      {gameOver && <GameOverModal score={score} onRestart={restart} />}
    </div>
  );
};

export default Index;
