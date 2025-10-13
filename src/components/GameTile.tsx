import { Tile } from '@/hooks/use2048Game';
import { cn } from '@/lib/utils';

interface GameTileProps {
  tile: Tile;
}

const getTileColor = (value: number): string => {
  const colors: Record<number, string> = {
    2: 'bg-[hsl(var(--tile-2))] text-[hsl(var(--background))]',
    4: 'bg-[hsl(var(--tile-4))] text-[hsl(var(--background))]',
    8: 'bg-[hsl(var(--tile-8))] text-white',
    16: 'bg-[hsl(var(--tile-16))] text-white',
    32: 'bg-[hsl(var(--tile-32))] text-white',
    64: 'bg-[hsl(var(--tile-64))] text-white',
    128: 'bg-[hsl(var(--tile-128))] text-white',
    256: 'bg-[hsl(var(--tile-256))] text-white',
    512: 'bg-[hsl(var(--tile-512))] text-white',
    1024: 'bg-[hsl(var(--tile-1024))] text-white',
    2048: 'bg-[hsl(var(--tile-2048))] text-white',
  };
  return colors[value] || 'bg-[hsl(var(--tile-2048))] text-white';
};

const getFontSize = (value: number): string => {
  if (value < 100) return 'text-5xl';
  if (value < 1000) return 'text-4xl';
  return 'text-3xl';
};

export const GameTile = ({ tile }: GameTileProps) => {
  const { row, col } = tile.position;
  const translateX = col * 100 + col * 16; // 100px tile + 16px gap
  const translateY = row * 100 + row * 16;

  return (
    <div
      className={cn(
        'absolute w-[100px] h-[100px] rounded-2xl flex items-center justify-center font-bold shadow-lg transition-all duration-150',
        getTileColor(tile.value),
        getFontSize(tile.value),
        tile.isNew && 'animate-tile-appear',
        tile.isMerged && 'animate-tile-merge'
      )}
      style={{
        transform: `translate(${translateX}px, ${translateY}px)`,
      }}
    >
      {tile.value}
    </div>
  );
};
