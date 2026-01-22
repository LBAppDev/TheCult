import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { 
  getStoredPlayerId, 
  useGameState, 
  useStartGame, 
  useSelectTeam, 
  useVoteQuest, 
  useGuessSeer, 
  useSendChat,
  useKickPlayer,
  useLeaveRoom,
  useVoteTeam
} from "@/hooks/use-game";
import { PlayerList } from "@/components/PlayerList";
import { GameStatusBoard } from "@/components/GameStatusBoard";
import { ChatBox } from "@/components/ChatBox";
import { RoleCard } from "@/components/RoleCard";
import { Button } from "@/components/ui/button";
import { Loader2, Copy, Trophy, AlertTriangle, PlayCircle, Skull, LogOut } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { PlayerRole } from "@shared/schema";
import { cn } from "@/lib/utils";

export default function GameRoom() {
  const [, params] = useRoute("/room/:code");
  const code = params?.code || "";
  const playerId = getStoredPlayerId();
  const { toast } = useToast();
  
  const { data: gameState, isLoading, error } = useGameState(code, playerId);
  
  // Mutations
  const startGame = useStartGame();
  const selectTeam = useSelectTeam();
  const voteQuest = useVoteQuest();
  const guessSeer = useGuessSeer();
  const sendChat = useSendChat();
  const kickPlayer = useKickPlayer();
  const leaveRoom = useLeaveRoom();
  const voteTeam = useVoteTeam();

  // Local State
  const [isRoleRevealed, setIsRoleRevealed] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<string[]>([]);
  const [seerGuessId, setSeerGuessId] = useState<string | null>(null);

  // Derived State
  const me = gameState?.players.find(p => p.id === playerId);
  const isLeader = gameState?.leaderId === playerId;
  const isHost = me?.isHost;
  
  // Handlers
  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    toast({ title: "Copied!", description: "Room code copied to clipboard." });
  };

  const handleStartGame = () => {
    startGame.mutate({ code });
  };

  const handleTeamSelection = () => {
    selectTeam.mutate({ code, playerIds: selectedTeam });
    setSelectedTeam([]);
  };

  const handleVote = (vote: boolean) => {
    voteQuest.mutate({ code, vote });
  };

  const handleVoteTeam = (vote: boolean) => {
    voteTeam.mutate({ code, vote });
  };

  const handleGuessSeer = () => {
    if (seerGuessId) {
      guessSeer.mutate({ code, seerId: seerGuessId });
    }
  };

  const handleKick = (targetId: string) => {
    kickPlayer.mutate({ code, targetId });
  };

  const handleLeave = () => {
    leaveRoom.mutate({ code });
  };

  const toggleTeamSelection = (pid: string) => {
    if (selectedTeam.includes(pid)) {
      setSelectedTeam(prev => prev.filter(id => id !== pid));
    } else {
      // Game Balance Team Sizes
      const missionSizes: Record<number, number[]> = {
        4:  [2, 2, 2, 3, 3],
        5:  [2, 3, 2, 3, 3],
        6:  [2, 3, 4, 3, 4],
        7:  [2, 3, 3, 4, 4],
        8:  [3, 4, 4, 5, 5],
        9:  [3, 4, 4, 5, 5],
        10: [3, 4, 4, 5, 5]
      };

      const playerCount = gameState?.players.length || 0;
      const missionIndex = (gameState?.round || 1) - 1;
      const requiredSize = missionSizes[playerCount]?.[missionIndex] || 2;

      if (selectedTeam.length < requiredSize) {
        setSelectedTeam(prev => [...prev, pid]);
      }
    }
  };

  // Loading / Error States
  if (!playerId) return <div className="h-screen flex items-center justify-center text-red-500">Authentication missing. Return to lobby.</div>;
  if (isLoading) return <div className="h-screen flex items-center justify-center text-primary"><Loader2 className="animate-spin w-12 h-12" /></div>;
  if (error || !gameState) return <div className="h-screen flex items-center justify-center text-red-500">Error loading game.</div>;

  // Render Logic
  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Header Bar */}
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur border-b border-white/10 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-xl text-primary">THE CULT</span>
          <div className="h-4 w-[1px] bg-white/20 mx-2" />
          <div 
            className="flex items-center gap-2 px-3 py-1 bg-secondary/50 rounded-full border border-white/5 cursor-pointer hover:bg-secondary transition-colors"
            onClick={handleCopyCode}
          >
            <span className="font-mono text-sm tracking-widest">{code}</span>
            <Copy className="w-3 h-3 text-muted-foreground" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground font-medium hidden sm:block">
            {me?.name}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-2"
            onClick={handleLeave}
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Leave</span>
          </Button>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
        
        {/* LOBBY PHASE */}
        {gameState.phase === "lobby" && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-display text-white">Gathering Cultists...</h2>
              <p className="text-muted-foreground">Waiting for the host to start the ritual.</p>
              
              <div className="flex justify-center gap-4 mt-4">
                <span className="text-sm bg-secondary/50 px-3 py-1 rounded-full text-muted-foreground border border-white/5">
                  4-10 Players
                </span>
                <span className="text-sm bg-red-500/10 px-3 py-1 rounded-full text-red-400 border border-red-500/20">
                  {(() => {
                    const count = gameState.players.length;
                    if (count < 5) return 1;
                    if (count < 7) return 2;
                    if (count < 10) return 3;
                    return 4;
                  })()} Cultists
                </span>
              </div>
            </div>
            
            <div className="bg-card border border-white/5 rounded-2xl p-6">
              <h3 className="text-sm font-bold uppercase text-muted-foreground mb-4">Players ({gameState.players.length})</h3>
              <PlayerList 
                players={gameState.players} 
                currentPlayerId={playerId}
                leaderId={gameState.leaderId}
                canKick={isHost}
                onKick={handleKick}
              />
            </div>

            {isHost && (
              <div className="flex justify-center pt-4">
                <Button 
                  size="lg" 
                  className="font-bold text-lg px-8 shadow-lg shadow-primary/20"
                  onClick={handleStartGame}
                  disabled={gameState.players.length < 4}
                >
                  {startGame.isPending ? <Loader2 className="animate-spin mr-2" /> : <PlayCircle className="mr-2" />}
                  Start Game
                </Button>
                {gameState.players.length < 4 && (
                   <p className="block w-full text-center text-xs text-red-400 mt-2 absolute transform translate-y-12">Need 4+ players</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* ACTIVE GAME PHASES */}
        {gameState.phase !== "lobby" && (
          <div className="space-y-6 animate-in fade-in duration-500">
            
            {/* Status Board */}
            <GameStatusBoard gameState={gameState} />

            <div className="bg-card border border-white/5 rounded-2xl p-6">
              <h3 className="text-sm font-bold uppercase text-muted-foreground mb-4">Players ({gameState.players.length})</h3>
              <PlayerList 
                players={gameState.players} 
                currentPlayerId={playerId}
                leaderId={gameState.leaderId}
                canKick={isHost}
                onKick={handleKick}
              />
            </div>

            {/* Role Card (Top priority) */}
            <RoleCard 
              role={me?.role as PlayerRole} 
              isRevealed={isRoleRevealed} 
              onReveal={() => setIsRoleRevealed(!isRoleRevealed)} 
            />

            {/* Phase Specific Action Area */}
            <div className="bg-gradient-to-br from-card to-card/50 border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-500 to-blue-500 opacity-50" />
              
              <AnimatePresence mode="wait">
                
                {/* Team Selection */}
                {gameState.phase === "team_selection" && (
                  <motion.div 
                    key="team-select"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between mb-4">
                       <h3 className="text-xl font-display font-bold">
                         {isLeader ? "Choose your Team" : `Waiting for ${gameState.players.find(p => p.id === gameState.leaderId)?.name}...`}
                       </h3>
                       {(() => {
                         const missionSizes: Record<number, number[]> = {
                           4:  [2, 2, 2, 3, 3],
                           5:  [2, 3, 2, 3, 3],
                           6:  [2, 3, 4, 3, 4],
                           7:  [2, 3, 3, 4, 4],
                           8:  [3, 4, 4, 5, 5],
                           9:  [3, 4, 4, 5, 5],
                           10: [3, 4, 4, 5, 5]
                         };
                         const playerCount = gameState.players.length;
                         const missionIndex = gameState.round - 1;
                         const requiredSize = missionSizes[playerCount]?.[missionIndex] || 2;
                         return (
                           <span className="text-sm bg-primary/20 text-primary px-3 py-1 rounded-full font-bold border border-primary/30">
                             Select {requiredSize} Players ({selectedTeam.length}/{requiredSize})
                           </span>
                         );
                       })()}
                    </div>

                    <PlayerList 
                      players={gameState.players}
                      currentPlayerId={playerId}
                      leaderId={gameState.leaderId}
                      selectable={isLeader}
                      onSelect={isLeader ? toggleTeamSelection : undefined}
                      selectedIds={isLeader ? selectedTeam : gameState.currentTeam}
                    />

                    {isLeader && (
                      <div className="flex justify-end pt-4">
                         <Button 
                           onClick={handleTeamSelection}
                           disabled={selectedTeam.length === 0 || selectTeam.isPending}
                         >
                           {selectTeam.isPending && <Loader2 className="animate-spin mr-2" />}
                           Propose Team
                         </Button>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Team Voting */}
                {gameState.phase === "team_voting" && (
                  <motion.div 
                    key="team-voting"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8"
                  >
                    {(() => {
                      const timeLeft = gameState.phaseEndTime ? Math.max(0, Math.ceil((gameState.phaseEndTime - Date.now()) / 1000)) : null;
                      return timeLeft !== null && (
                        <div className="absolute top-4 right-6 flex items-center gap-2 text-primary font-mono font-bold">
                          <Loader2 className={cn("w-4 h-4 animate-spin", timeLeft < 5 && "text-red-500")} />
                          <span className={cn(timeLeft < 5 && "text-red-500")}>{timeLeft}s</span>
                        </div>
                      );
                    })()}
                    <div className="space-y-6">
                      <h3 className="text-2xl font-display font-bold text-white mb-2">Approve the Team?</h3>
                      <p className="text-muted-foreground mb-6">
                        Refusals: <span className="text-red-400 font-bold">{gameState.teamRefusals}/5</span>
                      </p>
                      
                      <div className="flex justify-center gap-4 mb-8">
                        {gameState.players.filter(p => gameState.currentTeam.includes(p.id)).map(p => (
                          <div key={p.id} className="px-3 py-1 bg-primary/20 rounded-full border border-primary/30 text-primary font-bold">
                            {p.name}
                          </div>
                        ))}
                      </div>

                      {gameState.teamVotes?.[playerId] !== undefined ? (
                        <div className="flex flex-col items-center gap-4 animate-pulse">
                          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                          </div>
                          <p className="text-lg font-medium text-white">Voted! Waiting for others...</p>
                        </div>
                      ) : (
                        <div className="flex justify-center gap-6">
                          <Button 
                            variant="outline" 
                            className="w-32 h-16 rounded-xl border-2 border-green-500/30 hover:bg-green-500/10 hover:border-green-500 flex flex-col gap-1"
                            onClick={() => handleVoteTeam(true)}
                            disabled={voteTeam.isPending}
                          >
                            <span className="font-bold text-green-500">APPROVE</span>
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            className="w-32 h-16 rounded-xl border-2 border-red-500/30 hover:bg-red-500/10 hover:border-red-500 flex flex-col gap-1"
                            onClick={() => handleVoteTeam(false)}
                            disabled={voteTeam.isPending}
                          >
                            <span className="font-bold text-red-500">REJECT</span>
                          </Button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Quest Voting */}
                {gameState.phase === "quest_voting" && (
                  <motion.div 
                    key="voting"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8"
                  >
                    {(() => {
                      const timeLeft = gameState.phaseEndTime ? Math.max(0, Math.ceil((gameState.phaseEndTime - Date.now()) / 1000)) : null;
                      return timeLeft !== null && (
                        <div className="absolute top-4 right-6 flex items-center gap-2 text-primary font-mono font-bold">
                          <Loader2 className={cn("w-4 h-4 animate-spin", timeLeft < 5 && "text-red-500")} />
                          <span className={cn(timeLeft < 5 && "text-red-500")}>{timeLeft}s</span>
                        </div>
                      );
                    })()}
                    {gameState.currentTeam.includes(playerId) ? (
                      (gameState as any).questVotes?.[playerId] !== undefined ? (
                        <div className="flex flex-col items-center gap-4 animate-pulse">
                          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                          </div>
                          <p className="text-lg font-medium text-white">Loyalty proven. Waiting for others...</p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <h3 className="text-2xl font-display font-bold text-white mb-2">Perform the Ritual</h3>
                          <p className="text-muted-foreground mb-6">Choose wisely. Your loyalty determines the outcome.</p>
                          <div className="flex justify-center gap-6">
                            <Button 
                              variant="outline" 
                              className="w-32 h-32 rounded-2xl border-2 border-green-500/30 hover:bg-green-500/10 hover:border-green-500 flex flex-col gap-2"
                              onClick={() => handleVote(true)}
                              disabled={voteQuest.isPending}
                            >
                              <Trophy className="w-10 h-10 text-green-500" />
                              <span className="font-bold text-green-500">SUCCEED</span>
                            </Button>
                            
                            <Button 
                              variant="outline" 
                              className="w-32 h-32 rounded-2xl border-2 border-red-500/30 hover:bg-red-500/10 hover:border-red-500 flex flex-col gap-2"
                              onClick={() => handleVote(false)}
                              disabled={voteQuest.isPending}
                            >
                              <Skull className="w-10 h-10 text-red-500" />
                              <span className="font-bold text-red-500">FAIL</span>
                            </Button>
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="flex flex-col items-center gap-4 opacity-70">
                        <Loader2 className="w-10 h-10 animate-spin text-primary" />
                        <p>The selected team is performing the ritual...</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Quest Result */}
                {gameState.phase === "quest_result" && gameState.lastQuestResult && (
                  <motion.div 
                    key="result"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-6"
                  >
                    <div className="mb-6">
                       {gameState.lastQuestResult.success ? (
                         <div className="inline-flex p-6 rounded-full bg-green-500/10 border-2 border-green-500 mb-4 shadow-[0_0_30px_-5px_rgba(34,197,94,0.5)]">
                           <Trophy className="w-16 h-16 text-green-500" />
                         </div>
                       ) : (
                         <div className="inline-flex p-6 rounded-full bg-red-500/10 border-2 border-red-500 mb-4 shadow-[0_0_30px_-5px_rgba(239,68,68,0.5)]">
                           <Skull className="w-16 h-16 text-red-500" />
                         </div>
                       )}
                       <h2 className="text-3xl font-display font-bold text-white mb-2">
                         {gameState.lastQuestResult.success ? "QUEST SUCCEEDED" : "QUEST FAILED"}
                       </h2>
                       <div className="flex justify-center gap-8 mt-4 text-lg font-mono">
                         <div className="text-green-400">Success Votes: {gameState.lastQuestResult.successVotes}</div>
                         <div className="text-red-400">Fail Votes: {gameState.lastQuestResult.failVotes}</div>
                       </div>
                    </div>
                    <p className="text-muted-foreground animate-pulse">Preparing next round...</p>
                  </motion.div>
                )}

                {/* Seer Guess (Cultist Win Chance) */}
                {gameState.phase === "seer_guess" && (
                   <motion.div className="space-y-4">
                      <div className="text-center mb-6">
                        <h2 className="text-2xl font-display font-bold text-red-500 mb-2">The Village is winning...</h2>
                        <p className="text-muted-foreground">But the Cult can steal victory by identifying the Seer.</p>
                      </div>
                      
                      {me?.role === "Cultist" ? (
                        <div className="space-y-4">
                           <PlayerList 
                              players={gameState.players}
                              currentPlayerId={playerId}
                              leaderId={gameState.leaderId}
                              selectable={true}
                              onSelect={(id) => setSeerGuessId(id)}
                              selectedIds={seerGuessId ? [seerGuessId] : []}
                           />
                           <Button 
                             className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-12"
                             onClick={handleGuessSeer}
                             disabled={!seerGuessId || guessSeer.isPending}
                           >
                             ASSASSINATE SEER
                           </Button>
                        </div>
                      ) : (
                        <div className="p-8 bg-black/20 rounded-xl text-center text-muted-foreground">
                          The Cultists are conferring... pray they don't find the Seer.
                        </div>
                      )}
                   </motion.div>
                )}
                
                {/* Game End */}
                {gameState.phase === "game_end" && (
                  <motion.div 
                    key="end"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-10"
                  >
                    <h1 className="text-5xl font-display font-black text-white mb-4 glow-text">
                      {gameState.winner === "Village" ? (
                        <span className="text-blue-500">VILLAGE WINS</span>
                      ) : (
                        <span className="text-red-500">CULT VICTORY</span>
                      )}
                    </h1>
                    <p className="text-xl text-muted-foreground mb-8">The truth has been revealed.</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left mb-8">
                       {gameState.players.map(p => (
                         <div key={p.id} className="flex justify-between items-center p-3 bg-white/5 rounded border border-white/5">
                            <span className="font-bold">{p.name}</span>
                            <span className={cn(
                              "text-sm px-2 py-1 rounded",
                              p.role === "Cultist" ? "bg-red-500/20 text-red-400" : 
                              p.role === "Seer" ? "bg-purple-500/20 text-purple-400" : 
                              "bg-blue-500/20 text-blue-400"
                            )}>{p.role}</span>
                         </div>
                       ))}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      {isHost && (
                        <Button 
                          size="lg"
                          className="font-bold px-8 shadow-lg shadow-primary/20"
                          onClick={handleStartGame}
                          disabled={startGame.isPending}
                        >
                          {startGame.isPending ? <Loader2 className="animate-spin mr-2" /> : <PlayCircle className="mr-2" />}
                          Play Again
                        </Button>
                      )}
                      <Button variant="outline" size="lg" onClick={() => window.location.href = "/"}>
                        Exit to Main Menu
                      </Button>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* Chat Area */}
            <div className="grid gap-2">
               <h3 className="font-display font-bold text-muted-foreground ml-1">Secure Comms</h3>
               <ChatBox 
                 messages={gameState.chat} 
                 onSend={(msg) => sendChat.mutate({ code, message: msg })}
                 currentPlayerName={me?.name || ""}
               />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
