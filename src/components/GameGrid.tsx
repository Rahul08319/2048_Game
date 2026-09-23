import type { Tile } from "@/hooks/use2048Game";
import { GameTile } from "./GameTile";

interface GameGridProps {
  tiles: Tile[];
}

export const GameGrid = ({ tiles }: GameGridProps) => (
  <div
    className="playable-board relative aspect-square shrink-0 rounded-[2.25rem] bg-[#121422]/85 backdrop-blur-2xl p-[3.25%] border border-white/10 shadow-2xl shadow-black/50 touch-none select-none my-3 sm:my-4 transition-all"
    role="img"
    aria-label={`2048 board with ${tiles.length} tiles`}
  >
    {/* Specular edge light */}
    <div className="absolute inset-x-4 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

    {/* Background Grid Cells */}
    <div className="grid h-full w-full grid-cols-4 grid-rows-4 gap-[3.25%]">
      {Array.from({ length: 16 }).map((_, index) => (
        <div
          key={index}
          className="aspect-square rounded-[22%] bg-white/[0.04] border border-white/[0.03] shadow-inner"
        />
      ))}
    </div>

    {/* Live Game Tiles */}
    <div className="absolute inset-[3.25%] grid grid-cols-4 grid-rows-4 gap-[3.25%]">
      {tiles.map((tile) => (
        <GameTile key={tile.id} tile={tile} />
      ))}
    </div>
  </div>
);
