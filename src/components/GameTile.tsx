import type { Tile } from "@/hooks/use2048Game";
import { cn } from "@/lib/utils";

interface GameTileProps {
  tile: Tile;
}

const getTileStyle = (value: number): string => {
  switch (value) {
    case 2:
      return "bg-[#eee4da] text-[#776e65] shadow-sm";
    case 4:
      return "bg-[#ede0c8] text-[#776e65] shadow-sm";
    case 8:
      return "bg-[#f2b179] text-white shadow-md shadow-orange-500/30";
    case 16:
      return "bg-[#f59563] text-white shadow-md shadow-orange-600/35";
    case 32:
      return "bg-[#f67c5f] text-white shadow-lg shadow-red-500/40";
    case 64:
      return "bg-[#f65e3b] text-white shadow-lg shadow-red-600/45";
    case 128:
      return "bg-[#edcf72] text-white shadow-lg shadow-yellow-500/50 ring-2 ring-yellow-300/50";
    case 256:
      return "bg-[#edcc61] text-white shadow-xl shadow-yellow-500/60 ring-2 ring-yellow-300/60";
    case 512:
      return "bg-[#edc850] text-white shadow-xl shadow-yellow-500/70 ring-2 ring-yellow-300/70";
    case 1024:
      return "bg-[#edc53f] text-white shadow-2xl shadow-yellow-500/80 ring-2 ring-yellow-200";
    case 2048:
      return "bg-gradient-to-br from-[#edc22e] via-[#f7d138] to-[#ffb700] text-white shadow-[0_0_35px_rgba(237,194,46,0.75)] ring-2 ring-yellow-200 animate-pulse";
    default:
      // Beyond 2048: Super luminous
      return "bg-gradient-to-br from-violet-600 via-purple-600 to-pink-500 text-white shadow-[0_0_40px_rgba(168,85,247,0.8)] ring-2 ring-white/60";
  }
};

const getFontSize = (value: number): string => {
  if (value < 100) return "text-[clamp(1.5rem,11cqi,3.25rem)]";
  if (value < 1000) return "text-[clamp(1.2rem,8.5cqi,2.4rem)]";
  if (value < 10000) return "text-[clamp(0.95rem,6.8cqi,1.9rem)]";
  return "text-[clamp(0.8rem,5.5cqi,1.5rem)]";
};

export const GameTile = ({ tile }: GameTileProps) => (
  <div
    className={cn(
      "absolute left-0 top-0 w-[22.5625%] h-[22.5625%] select-none flex items-center justify-center rounded-[22%] font-black tracking-tight overflow-hidden transition-transform duration-100 ease-out will-change-transform z-10",
      getTileStyle(tile.value),
      getFontSize(tile.value),
      tile.isNew && "animate-tile-appear",
      tile.isMerged && "animate-tile-merge"
    )}
    style={{
      transform: `translate3d(calc(${tile.position.col} * 114.404%), calc(${tile.position.row} * 114.404%), 0)`,
    }}
  >
    {/* Subtle specular top gleam */}
    <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent pointer-events-none rounded-t-[22%]" />
    <span className="relative z-10 drop-shadow-sm">{tile.value}</span>
  </div>
);
