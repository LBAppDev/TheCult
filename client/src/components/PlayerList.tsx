import { Player } from "@shared/schema";
import { Crown, Shield, Skull, Eye, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface PlayerListProps {
  players: Player[];
  leaderId?: string;
  currentPlayerId: string;
  onSelect?: (playerId: string) => void;
  selectedIds?: string[];
  maxSelection?: number;
  selectable?: boolean;
  canKick?: boolean;
  onKick?: (playerId: string) => void;
}

export function PlayerList({ 
  players, 
  leaderId, 
  currentPlayerId, 
  onSelect, 
  selectedIds = [], 
  selectable = false,
  canKick = false,
  onKick
}: PlayerListProps) {
  
  const handleSelect = (id: string) => {
    if (!selectable || !onSelect) return;
    onSelect(id);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {players.map((player) => {
        const isSelected = selectedIds.includes(player.id);
        const isLeader = player.id === leaderId;
        const isMe = player.id === currentPlayerId;

        // Role visibility logic is handled by backend - if we see a role, it's because we're allowed to
        const RoleIcon = player.role === "Cultist" ? Skull : player.role === "Seer" ? Eye : null;

        return (
          <div
            key={player.id}
            onClick={() => handleSelect(player.id)}
            className={cn(
              "relative p-4 rounded-xl border transition-all duration-200 flex items-center gap-3 group",
              selectable ? "cursor-pointer hover:border-primary/50 hover:bg-primary/5" : "cursor-default",
              isSelected 
                ? "bg-primary/20 border-primary shadow-[0_0_15px_-5px_rgba(233,69,96,0.5)]" 
                : "bg-secondary/40 border-white/5",
              isMe && "ring-1 ring-white/20"
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg font-display overflow-hidden bg-background border border-white/10",
              isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
            )}>
              {player.avatar ? (
                <span className="text-xl" title={player.avatar}>
                  {/* Map avatar names to simple visual representation or just text for now */}
                  {player.avatar === "cow" && "🐄"}
                  {player.avatar === "bird" && "🐦"}
                  {player.avatar === "goat" && "🐐"}
                  {player.avatar === "donkey" && "🫏"}
                  {player.avatar === "cat" && "🐱"}
                  {player.avatar === "dog" && "🐶"}
                  {player.avatar === "snake" && "🐍"}
                  {player.avatar === "monkey" && "🐵"}
                  {player.avatar === "girafe" && "🦒"}
                  {player.avatar === "kwala" && "🐨"}
                  {player.avatar === "elephant" && "🐘"}
                  {player.avatar === "lion" && "🦁"}
                  {player.avatar === "tiger" && "🐯"}
                  {player.avatar === "bear" && "🐻"}
                  {player.avatar === "panda" && "🐼"}
                  {player.avatar === "rabbit" && "🐰"}
                  {player.avatar === "fox" && "🦊"}
                  {player.avatar === "wolf" && "🐺"}
                  {player.avatar === "frog" && "🐸"}
                  {player.avatar === "pig" && "🐷"}
                  {player.avatar === "chicken" && "🐔"}
                  {player.avatar === "penguin" && "🐧"}
                  {player.avatar === "owl" && "🦉"}
                  {player.avatar === "octopus" && "🐙"}
                  {player.avatar === "whale" && "🐋"}
                  {player.avatar === "unicorn" && "🦄"}
                  {player.avatar === "dragon" && "🐉"}
                  {player.avatar === "butterfly" && "🦋"}
                  {player.avatar === "bee" && "🐝"}
                  {player.avatar === "scorpion" && "🦂"}
                  {player.avatar === "cool" && "😎"}
                  {player.avatar === "ghost" && "👻"}
                  {player.avatar === "alien" && "👽"}
                  {player.avatar === "robot" && "🤖"}
                  {player.avatar === "ninja" && "🥷"}
                  {player.avatar === "vampire" && "🧛"}
                  {player.avatar === "wizard" && "🧙"}
                  {player.avatar === "detective" && "🕵️"}
                  {player.avatar === "clown" && "🤡"}
                  {player.avatar === "angel" && "😇"}
                  {player.avatar === "crystal" && "🔮"}
                  {player.avatar === "potion" && "🧪"}
                  {player.avatar === "candle" && "🕯️"}
                  {player.avatar === "book" && "📖"}
                  {player.avatar === "skull" && "💀"}
                  {player.avatar === "eye" && "👁️"}
                  {player.avatar === "moon" && "🌙"}
                  {player.avatar === "sun" && "☀️"}
                  {player.avatar === "star" && "⭐"}
                  {player.avatar === "fire" && "🔥"}
                  {player.avatar === "cloak" && "🧥"}
                  {player.avatar === "dagger" && "🗡️"}
                  {player.avatar === "mask" && "🎭"}
                  {player.avatar === "ring" && "💍"}
                  {player.avatar === "key" && "🔑"}
                </span>
              ) : (
                <span className="text-muted-foreground">
                  {player.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "font-medium truncate",
                  isSelected ? "text-white" : "text-gray-300"
                )}>
                  {player.name} {isMe && "(You)"}
                </span>
                {isLeader && (
                  <Crown className="w-4 h-4 text-yellow-500 fill-yellow-500/20" />
                )}
              </div>
              
              {/* Status indicators */}
              <div className="flex gap-2 mt-1">
                {RoleIcon && (
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1",
                    player.role === "Cultist" ? "bg-red-500/20 text-red-400" : "bg-purple-500/20 text-purple-400"
                  )}>
                    <RoleIcon className="w-3 h-3" />
                    {player.role}
                  </span>
                )}
              </div>
            </div>
            
            {canKick && !isMe && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10"
                onClick={(e) => {
                  e.stopPropagation();
                  onKick?.(player.id);
                }}
              >
                <XCircle className="w-4 h-4" />
              </Button>
            )}

            {selectable && (
              <div className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                isSelected ? "border-primary bg-primary" : "border-gray-600"
              )}>
                {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
