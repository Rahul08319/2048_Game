import { Tile } from '@/hooks/use2048Game';
import { GameTile } from './GameTile';

interface GameGridProps {
  tiles: Tile[];
}

export const GameGrid = ({ tiles }: GameGridProps) => {
  return (
    <div className="relative w-[464px] h-[464px] bg-[hsl(var(--card))] rounded-3xl p-4 shadow-2xl">
      {/* Empty grid cells */}
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 16 }).map((_, i) => (
          <div
            key={i}
            className="w-[100px] h-[100px] bg-[hsl(var(--tile-empty))] rounded-2xl"
          />
        ))}
      </div>
      
      {/* Tiles */}
      <div className="absolute inset-4">
        {tiles.map(tile => (
          <GameTile key={tile.id} tile={tile} />
        ))}
      </div>
    </div>
  );
};
