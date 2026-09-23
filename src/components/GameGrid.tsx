import { useEffect, useRef, useState } from "react";
import type { Tile } from "@/hooks/use2048Game";
import { GameTile } from "./GameTile";
import { ParticleBurst } from "./ParticleBurst";
import { Zap } from "lucide-react";

interface GameGridProps {
  tiles: Tile[];
  shake?: boolean;
  combo?: number;
}

export const GameGrid = ({ tiles, shake, combo = 0 }: GameGridProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [particleTrigger, setParticleTrigger] = useState<{
    x: number;
    y: number;
    color?: string;
    id: number;
  } | null>(null);

  // Trigger spark particles whenever tiles merge
  useEffect(() => {
    const merged = tiles.filter((t) => t.isMerged);
    if (merged.length > 0 && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const padding = rect.width * 0.0325;
      const innerW = rect.width - 2 * padding;
      const cellStep = innerW * 0.258125;
      const cellCenter = innerW * 0.1128;

      merged.forEach((m) => {
        const x = padding + m.position.col * cellStep + cellCenter;
        const y = padding + m.position.row * cellStep + cellCenter;
        setParticleTrigger({
          x,
          y,
          color: m.value >= 128 ? "#edc22e" : "#f67c5f",
          id: Date.now() + Math.random(),
        });
      });
    }
  }, [tiles]);

  return (
    <div
      ref={containerRef}
      className={`playable-board relative aspect-square shrink-0 rounded-[2.25rem] bg-[#121422]/95 backdrop-blur-3xl p-[3.25%] border border-white/10 shadow-2xl shadow-black/70 touch-none select-none my-auto transition-transform ${
        shake ? "animate-board-shake" : ""
      }`}
      role="img"
      aria-label={`2048 board with ${tiles.length} tiles`}
    >
      {/* Specular edge light */}
      <div className="absolute inset-x-6 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

      {/* Particle emitter overlay */}
      <ParticleBurst trigger={particleTrigger} />

      {/* Combo popup indicator */}
      {combo >= 2 && (
        <div className="absolute -top-4 right-4 z-30 flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-xs shadow-lg shadow-orange-500/30 animate-bounce pointer-events-none">
          <Zap className="w-3.5 h-3.5 fill-white" />
          <span>{combo}x COMBO!</span>
        </div>
      )}

      {/* Background Grid Cells */}
      <div className="grid h-full w-full grid-cols-4 grid-rows-4 gap-[3.25%]">
        {Array.from({ length: 16 }).map((_, index) => (
          <div
            key={index}
            className="aspect-square rounded-[22%] bg-white/[0.04] border border-white/[0.03] shadow-inner"
          />
        ))}
      </div>

      {/* Live Sliding Game Tiles Layer */}
      <div className="absolute inset-[3.25%] pointer-events-none">
        {tiles.map((tile) => (
          <GameTile key={tile.id} tile={tile} />
        ))}
      </div>
    </div>
  );
};
