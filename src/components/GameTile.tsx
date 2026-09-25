import { Tile } from "@/hooks/use2048Game";
import { cn } from "@/lib/utils";

interface GameTileProps {
  tile: Tile;
}

const getTileColor = (value: number): string => {
  const colors: Record<number, string> = {
    2: "bg-[hsl(var(--tile-2))] text-[hsl(var(--foreground))]", 4: "bg-[hsl(var(--tile-4))] text-[hsl(var(--foreground))]",
    8: "bg-[hsl(var(--tile-8))] text-white", 16: "bg-[hsl(var(--tile-16))] text-white",
    32: "bg-[hsl(var(--tile-32))] text-white", 64: "bg-[hsl(var(--tile-64))] text-white",
    128: "bg-[hsl(var(--tile-128))] text-white", 256: "bg-[hsl(var(--tile-256))] text-white",
    512: "bg-[hsl(var(--tile-512))] text-white", 1024: "bg-[hsl(var(--tile-1024))] text-white",
    2048: "bg-[hsl(var(--tile-2048))] text-white",
  };
  return colors[value] || "bg-[hsl(var(--tile-2048))] text-white";
};

const getFontSize = (value: number): string => {
  if (value < 100) return "text-[clamp(1.25rem,10cqi,3rem)]";
  if (value < 1000) return "text-[clamp(1.05rem,8cqi,2.25rem)]";
  return "text-[clamp(.8rem,6cqi,1.875rem)]";
};

export const GameTile = ({ tile }: GameTileProps) => (
  <div
    className={cn(
      "playable-tile flex h-full w-full items-center justify-center font-bold transition-all duration-150",
      getTileColor(tile.value), getFontSize(tile.value), tile.isNew && "animate-tile-appear", tile.isMerged && "animate-tile-merge",
    )}
    style={{ gridRowStart: tile.position.row + 1, gridColumnStart: tile.position.col + 1 }}
  >
    {tile.value}
  </div>
);
