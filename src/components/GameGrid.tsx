import { Tile } from "@/hooks/use2048Game";
import { GameTile } from "./GameTile";

interface GameGridProps {
  tiles: Tile[];
}

export const GameGrid = ({ tiles }: GameGridProps) => (
  <div className="playable-board relative aspect-square shrink-0 rounded-3xl bg-[hsl(var(--card))] p-[3.45%] shadow-2xl touch-none" role="img" aria-label={`2048 board with ${tiles.length} tiles`}>
    <div className="grid h-full w-full grid-cols-4 grid-rows-4 gap-[3.45%]">
      {Array.from({ length: 16 }).map((_, index) => (
        <div key={index} className="aspect-square rounded-[16%] bg-[hsl(var(--tile-empty))]" />
      ))}
    </div>
    <div className="absolute inset-[3.45%] grid grid-cols-4 grid-rows-4 gap-[3.45%]">
      {tiles.map((tile) => <GameTile key={tile.id} tile={tile} />)}
    </div>
  </div>
);
