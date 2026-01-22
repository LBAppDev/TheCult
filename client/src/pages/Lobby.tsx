import { useState } from "react";
import { useLocation } from "wouter";
import { useCreateRoom, useJoinRoom } from "@/hooks/use-game";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Skull, Check } from "lucide-react";
import { motion } from "framer-motion";
import { AVATARS } from "@shared/schema";
import { cn } from "@/lib/utils";

const AVATAR_MAP: Record<string, string> = {
  cow: "🐄",
  bird: "🐦",
  goat: "🐐",
  donkey: "🫏",
  cat: "🐱",
  dog: "🐶",
  snake: "🐍",
  monkey: "🐵",
  girafe: "🦒",
  kwala: "🐨",
  elephant: "🐘",
  lion: "🦁",
  tiger: "🐯",
  bear: "🐻",
  panda: "🐼",
  rabbit: "🐰",
  fox: "🦊",
  wolf: "🐺",
  frog: "🐸",
  pig: "🐷",
  chicken: "🐔",
  penguin: "🐧",
  owl: "🦉",
  octopus: "🐙",
  whale: "🐋"
};

export default function Lobby() {
  const [, setLocation] = useLocation();
  const createRoom = useCreateRoom();
  const joinRoom = useJoinRoom();
  
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<string>(AVATARS[0]);

  const handleCreate = async () => {
    if (!name.trim()) return;
    try {
      const { code } = await createRoom.mutateAsync({ name, avatar: selectedAvatar });
      setLocation(`/room/${code}`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleJoin = async () => {
    if (!name.trim() || !roomCode.trim()) return;
    try {
      const { code } = await joinRoom.mutateAsync({ name, code: roomCode, avatar: selectedAvatar });
      setLocation(`/room/${code}`);
    } catch (e) {
      console.error(e);
    }
  };

  const AvatarPicker = () => (
    <div className="space-y-3">
      <label className="text-xs uppercase font-bold text-muted-foreground">Choose Your Avatar</label>
      <div className="grid grid-cols-5 gap-2">
        {AVATARS.map((avatar) => (
          <button
            key={avatar}
            onClick={() => setSelectedAvatar(avatar)}
            className={cn(
              "h-12 w-12 rounded-xl flex items-center justify-center text-2xl transition-all relative border-2",
              selectedAvatar === avatar 
                ? "bg-primary/20 border-primary scale-110 shadow-[0_0_10px_rgba(233,69,96,0.3)]" 
                : "bg-black/20 border-white/5 hover:border-white/20"
            )}
          >
            {AVATAR_MAP[avatar]}
            {selectedAvatar === avatar && (
              <div className="absolute -top-1 -right-1 bg-primary rounded-full p-0.5 shadow-lg">
                <Check className="w-2 h-2 text-white" strokeWidth={4} />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
        {/* Background Texture placeholder - css handles gradient */}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4 ring-2 ring-primary/50">
            <Skull className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-5xl font-display text-white mb-2 tracking-tighter glow-text">THE CULT</h1>
          <p className="text-muted-foreground font-mono text-sm tracking-widest uppercase">Trust No One</p>
        </div>

        <Card className="bg-card/90 backdrop-blur border-white/10 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-center">Enter the Ritual</CardTitle>
            <CardDescription className="text-center">Create a new gathering or join an existing one.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="join" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="join">Join Room</TabsTrigger>
                <TabsTrigger value="create">Create Room</TabsTrigger>
              </TabsList>
              
              <TabsContent value="join" className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs uppercase font-bold text-muted-foreground">Your Name</label>
                    <Input 
                      placeholder="Enter alias..." 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-black/20 border-white/10"
                    />
                  </div>
                  
                  <AvatarPicker />

                  <div className="space-y-2">
                    <label className="text-xs uppercase font-bold text-muted-foreground">Room Code</label>
                    <Input 
                      placeholder="XYZ123" 
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                      className="bg-black/20 border-white/10 font-mono tracking-widest uppercase"
                    />
                  </div>
                </div>
                
                <Button 
                  className="w-full font-bold h-12 text-lg" 
                  onClick={handleJoin}
                  disabled={!name || !roomCode || joinRoom.isPending}
                >
                  {joinRoom.isPending ? <Loader2 className="animate-spin mr-2" /> : "Join Game"}
                </Button>
              </TabsContent>
              
              <TabsContent value="create" className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs uppercase font-bold text-muted-foreground">Your Name</label>
                    <Input 
                      placeholder="Enter alias..." 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-black/20 border-white/10"
                    />
                  </div>

                  <AvatarPicker />
                </div>

                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20 text-sm text-muted-foreground">
                  You will be the host. You'll need at least 4 players to start the game.
                </div>
                
                <Button 
                  className="w-full font-bold h-12 text-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground" 
                  onClick={handleCreate}
                  disabled={!name || createRoom.isPending}
                >
                   {createRoom.isPending ? <Loader2 className="animate-spin mr-2" /> : "Create New Room"}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
