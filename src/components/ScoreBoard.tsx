import { CalendarDays, RotateCcw, Timer, Trophy, Undo2 } from "lucide-react";
import type { GameMode } from "@/hooks/use2048Game";
import { Button } from "./ui/button";

interface ScoreBoardProps {
  score: number;
  bestScore: number;
  mode: GameMode;
  canUndo: boolean;
  timeRemaining: number | null;
  onRestart: () => void;
  onUndo: () => void;
  onModeChange: (mode: GameMode) => void;
}

const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

export const ScoreBoard = ({ score, bestScore, mode, canUndo, timeRemaining, onRestart, onUndo, onModeChange }: ScoreBoardProps) => (
  <section className="playable-scoreboard w-full max-w-[464px]" aria-label="Game controls and score">
    <div className="playable-readouts flex flex-wrap items-stretch justify-center gap-2 sm:flex-nowrap sm:justify-between">
      <div className="flex min-w-[10rem] flex-1 gap-2 sm:gap-4">
        <div className="playable-readout min-w-0 flex-1 px-3 py-2 sm:min-w-[120px] sm:px-5 sm:py-3">
          <div className="mb-1 text-xs font-semibold uppercase text-muted-foreground">Score</div>
          <div className="text-3xl font-bold text-foreground">{score}</div>
        </div>
        <div className="playable-readout min-w-0 flex-1 px-3 py-2 sm:min-w-[120px] sm:px-5 sm:py-3">
          <div className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase text-muted-foreground"><Trophy className="h-3.5 w-3.5" />Best</div>
          <div className="text-3xl font-bold text-primary">{bestScore}</div>
        </div>
      </div>
      {mode === "dash" && timeRemaining !== null && <div className="playable-timer flex min-w-[5.5rem] flex-col items-center justify-center px-3 py-2"><Timer className="h-4 w-4" /><strong>{formatTime(timeRemaining)}</strong></div>}
      <div className="playable-action-group flex gap-2">
        <Button onClick={onUndo} disabled={!canUndo} size="sm" variant="secondary" className="playable-action h-auto px-3"><Undo2 className="mr-1 h-4 w-4" />Undo</Button>
        <Button onClick={onRestart} size="sm" className="playable-action playable-new h-auto px-3"><RotateCcw className="mr-1 h-4 w-4" />New</Button>
      </div>
    </div>
    <div className="playable-modes mt-3 grid grid-cols-3" role="group" aria-label="Game mode">
      <Button variant={mode === "classic" ? "default" : "ghost"} size="sm" className="playable-mode" onClick={() => onModeChange("classic")}>Classic</Button>
      <Button variant={mode === "daily" ? "default" : "ghost"} size="sm" className="playable-mode" onClick={() => onModeChange("daily")}><CalendarDays className="mr-1 h-4 w-4" />Daily</Button>
      <Button variant={mode === "dash" ? "default" : "ghost"} size="sm" className="playable-mode" onClick={() => onModeChange("dash")}><Timer className="mr-1 h-4 w-4" />Dash</Button>
    </div>
  </section>
);
