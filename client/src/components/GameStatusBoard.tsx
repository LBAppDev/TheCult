import { GameState } from "@shared/schema";
import { CheckCircle2, XCircle, Skull, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface GameStatusBoardProps {
  gameState: GameState;
}

export function GameStatusBoard({ gameState }: GameStatusBoardProps) {
  // We need 5 quest indicators
  const quests = [1, 2, 3, 4, 5];

  return (
    <div className="w-full bg-card/50 backdrop-blur border border-white/5 rounded-2xl p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-bold font-display text-foreground">Round {gameState.round}</h2>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            Phase: <span className="text-primary font-semibold">{gameState.phase.replace('_', ' ')}</span>
          </p>
        </div>
        <div className="flex gap-4 text-sm font-mono">
           <div className="flex flex-col items-center">
              <span className="text-green-400 font-bold">{gameState.succeededQuests}</span>
              <span className="text-[10px] text-muted-foreground">SUCCESS</span>
           </div>
           <div className="flex flex-col items-center">
              <span className="text-red-500 font-bold">{gameState.failedQuests}</span>
              <span className="text-[10px] text-muted-foreground">FAIL</span>
           </div>
           <div className="flex flex-col items-center border-l border-white/10 pl-4">
              <span className="text-orange-400 font-bold">{gameState.teamRefusals}/5</span>
              <span className="text-[10px] text-muted-foreground">REFUSALS</span>
           </div>
           <div className="flex flex-col items-center border-l border-white/10 pl-4">
              <span className="text-red-400 font-bold flex items-center gap-1">
                <Skull className="w-3 h-3" />
                {gameState.cultistCount}
              </span>
              <span className="text-[10px] text-muted-foreground">CULTISTS</span>
           </div>
        </div>
      </div>

      {/* Quest Track */}
      <div className="flex justify-between items-center gap-2">
        {quests.map((q, idx) => {
          const result = gameState.questResults[idx];
          const isCurrent = gameState.round === q;
          
          return (
            <div 
              key={q} 
              className={cn(
                "flex-1 aspect-square rounded-lg flex items-center justify-center border-2 transition-all duration-300",
                result === true && "bg-green-500/10 border-green-500/50 shadow-[0_0_15px_-3px_rgba(34,197,94,0.4)]",
                result === false && "bg-red-500/10 border-red-500/50 shadow-[0_0_15px_-3px_rgba(239,68,68,0.4)]",
                result === undefined && isCurrent && "bg-primary/10 border-primary shadow-[0_0_15px_-3px_rgba(233,69,96,0.4)] scale-110",
                result === undefined && !isCurrent && "bg-secondary/50 border-white/5 opacity-50"
              )}
            >
              {result === true && <CheckCircle2 className="w-6 h-6 text-green-500" />}
              {result === false && <XCircle className="w-6 h-6 text-red-500" />}
              {result === undefined && (
                <span className={cn("font-display font-bold text-lg", isCurrent ? "text-primary" : "text-muted-foreground")}>
                  {q}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
