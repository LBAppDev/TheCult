import { useState } from "react";
import { useLocation } from "wouter";
import { useCreateRoom, useJoinRoom } from "@/hooks/use-game";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Skull } from "lucide-react";
import { motion } from "framer-motion";

export default function Lobby() {
  const [, setLocation] = useLocation();
  const createRoom = useCreateRoom();
  const joinRoom = useJoinRoom();
  
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");

  const handleCreate = async () => {
    if (!name.trim()) return;
    try {
      const { code } = await createRoom.mutateAsync({ name });
      setLocation(`/room/${code}`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleJoin = async () => {
    if (!name.trim() || !roomCode.trim()) return;
    try {
      const { code } = await joinRoom.mutateAsync({ name, code: roomCode });
      setLocation(`/room/${code}`);
    } catch (e) {
      console.error(e);
    }
  };

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
              
              <TabsContent value="join" className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs uppercase font-bold text-muted-foreground">Your Name</label>
                  <Input 
                    placeholder="Enter alias..." 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-black/20 border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase font-bold text-muted-foreground">Room Code</label>
                  <Input 
                    placeholder="XYZ123" 
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    className="bg-black/20 border-white/10 font-mono tracking-widest uppercase"
                  />
                </div>
                <Button 
                  className="w-full font-bold h-12 text-lg" 
                  onClick={handleJoin}
                  disabled={!name || !roomCode || joinRoom.isPending}
                >
                  {joinRoom.isPending ? <Loader2 className="animate-spin mr-2" /> : "Join Game"}
                </Button>
              </TabsContent>
              
              <TabsContent value="create" className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs uppercase font-bold text-muted-foreground">Your Name</label>
                  <Input 
                    placeholder="Enter alias..." 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-black/20 border-white/10"
                  />
                </div>
                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20 text-sm text-muted-foreground mb-4">
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
