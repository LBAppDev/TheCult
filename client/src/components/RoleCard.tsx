import { motion } from "framer-motion";
import { type PlayerRole } from "@shared/schema";
import { Eye, Skull, Users } from "lucide-react";

interface RoleCardProps {
  role?: PlayerRole;
  isRevealed: boolean;
  onReveal: () => void;
}

export function RoleCard({ role, isRevealed, onReveal }: RoleCardProps) {
  const getRoleIcon = () => {
    switch (role) {
      case "Villager": return <Users className="w-16 h-16 text-blue-400" />;
      case "Seer": return <Eye className="w-16 h-16 text-purple-400" />;
      case "Cultist": return <Skull className="w-16 h-16 text-red-500" />;
      default: return <Users className="w-16 h-16 text-gray-400" />;
    }
  };

  const getRoleDescription = () => {
    switch (role) {
      case "Villager": return "You are a loyal member of the Village. Find the Cultists!";
      case "Seer": return "You know the true nature of players. Guide the Village without getting caught.";
      case "Cultist": return "Sabotage quests and remain hidden. The Village must fall.";
      default: return "";
    }
  };

  return (
    <div className="perspective-1000 w-full max-w-sm mx-auto h-64 cursor-pointer" onClick={onReveal}>
      <motion.div 
        className="w-full h-full relative preserve-3d transition-transform duration-700"
        animate={{ rotateY: isRevealed ? 180 : 0 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Back of Card (Hidden) */}
        <div className="absolute inset-0 backface-hidden bg-card border-2 border-primary/20 rounded-xl flex flex-col items-center justify-center p-6 shadow-2xl bg-[url('/assets/pattern.png')]">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4 border border-primary/30">
            <span className="text-4xl font-display text-primary">?</span>
          </div>
          <h3 className="text-2xl font-bold font-display text-foreground">Tap to Reveal Role</h3>
          <p className="text-sm text-muted-foreground mt-2">Keep this hidden from others!</p>
        </div>

        {/* Front of Card (Revealed) - rotated 180 initially */}
        <div 
          className="absolute inset-0 backface-hidden bg-card border-2 border-accent/20 rounded-xl flex flex-col items-center justify-center p-6 shadow-2xl shadow-accent/10"
          style={{ transform: "rotateY(180deg)" }}
        >
          <div className="mb-4 animate-bounce-slow">
            {getRoleIcon()}
          </div>
          <h3 className="text-3xl font-bold font-display text-accent mb-2">{role}</h3>
          <p className="text-center text-sm text-muted-foreground leading-relaxed">
            {getRoleDescription()}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
