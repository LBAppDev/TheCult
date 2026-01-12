import { 
  GameState, Player, ChatMessage, GamePhase, PlayerRole 
} from "@shared/schema";
import { v4 as uuidv4 } from 'uuid';

export interface IStorage {
  createRoom(hostName: string): Promise<{ code: string, playerId: string }>;
  joinRoom(code: string, playerName: string): Promise<{ code: string, playerId: string }>;
  getGameState(code: string, playerId: string): Promise<GameState | undefined>;
  startGame(code: string): Promise<boolean>;
  selectTeam(code: string, playerIds: string[]): Promise<boolean>;
  voteQuest(code: string, playerId: string, vote: boolean): Promise<boolean>;
  guessSeer(code: string, seerId: string): Promise<boolean>;
  addChatMessage(code: string, sender: string, message: string): Promise<boolean>;
}

// Helper to sanitize player for client
function sanitizePlayer(p: Player & { role: PlayerRole | undefined }, viewerId: string, viewerRole: PlayerRole | undefined): Player {
  // Logic:
  // - Self: sees own role.
  // - Cultist: sees other Cultists.
  // - Seer: sees Cultists (as "Cultist" or flagged).
  // - Villager: sees nothing.
  
  let visibleRole: PlayerRole | undefined = undefined;

  if (p.id === viewerId) {
    visibleRole = p.role;
  } else if (viewerRole === "Cultist" && p.role === "Cultist") {
    visibleRole = "Cultist";
  } else if (viewerRole === "Seer" && p.role === "Cultist") {
     // Seer knows they are cultists
     visibleRole = "Cultist";
  }
  
  return {
    ...p,
    role: visibleRole
  };
}

class MemStorage implements IStorage {
  // Store full server state including secrets
  private rooms: Map<string, {
    gameState: GameState, // Base state
    players: (Player & { role: PlayerRole | undefined })[], // Full player objects with roles
    questVotes: Record<string, boolean> // Current round votes
  }>;

  constructor() {
    this.rooms = new Map();
  }

  private generateCode(): string {
    return Math.random().toString(36).substring(2, 6).toUpperCase();
  }

  async createRoom(hostName: string): Promise<{ code: string, playerId: string }> {
    const code = this.generateCode();
    const playerId = uuidv4();
    const host: Player & { role: PlayerRole | undefined } = {
      id: playerId,
      name: hostName,
      isHost: true,
      role: undefined,
      isDead: false
    };

    this.rooms.set(code, {
      gameState: {
        roomCode: code,
        phase: "lobby",
        round: 1,
        players: [host], // Add the host immediately to the list
        leaderId: undefined,
        currentTeam: [],
        questResults: [],
        failedQuests: 0,
        succeededQuests: 0,
        chat: [{ id: uuidv4(), sender: "System", message: `Room ${code} created.`, timestamp: Date.now(), isSystem: true }],
        lastQuestResult: null
      },
      players: [host],
      questVotes: {}
    });

    return { code, playerId };
  }

  async joinRoom(code: string, playerName: string): Promise<{ code: string, playerId: string }> {
    const room = this.rooms.get(code);
    if (!room) throw new Error("Room not found");
    
    if (room.gameState.phase !== "lobby") throw new Error("Game already started");

    const playerId = uuidv4();
    const player: Player & { role: PlayerRole | undefined } = {
      id: playerId,
      name: playerName,
      isHost: false,
      role: undefined,
      isDead: false
    };

    room.players.push(player);
    room.gameState.chat.push({
      id: uuidv4(),
      sender: "System",
      message: `${playerName} joined the room.`,
      timestamp: Date.now(),
      isSystem: true
    });

    return { code, playerId };
  }

  async getGameState(code: string, playerId: string): Promise<GameState | undefined> {
    const room = this.rooms.get(code);
    if (!room) return undefined;

    const viewer = room.players.find(p => p.id === playerId);
    if (!viewer) return undefined; // Or throw

    // Sanitize players list
    const sanitizedPlayers = room.players.map(p => sanitizePlayer(p, playerId, viewer.role));

    return {
      ...room.gameState,
      players: sanitizedPlayers,
      // Ensure specific secret fields are handled if needed
      leaderId: room.gameState.leaderId,
      // If phase is voting, maybe hide votes? Logic says votes are secret until result.
    };
  }

  async startGame(code: string): Promise<boolean> {
    const room = this.rooms.get(code);
    if (!room) return false;

    const playerCount = room.players.length;
    if (playerCount < 4) return false; // Min 4

    // Assign Roles
    let numCultists = 1;
    if (playerCount >= 5) numCultists = 2;
    if (playerCount >= 7) numCultists = 3;
    if (playerCount >= 10) numCultists = 4;

    const shuffled = [...room.players].sort(() => 0.5 - Math.random());
    
    // Assign Cultists
    for (let i = 0; i < numCultists; i++) {
      shuffled[i].role = "Cultist";
    }
    // Assign Seer (1)
    shuffled[numCultists].role = "Seer";
    // Rest are Villagers
    for (let i = numCultists + 1; i < playerCount; i++) {
      shuffled[i].role = "Villager";
    }

    // Update main players list with roles (by ref)
    // Random Leader
    const leaderIndex = Math.floor(Math.random() * playerCount);
    room.gameState.leaderId = room.players[leaderIndex].id;
    
    room.gameState.phase = "team_selection";
    room.gameState.chat.push({ id: uuidv4(), sender: "System", message: "Game Started! Roles assigned.", timestamp: Date.now(), isSystem: true });

    return true;
  }

  async selectTeam(code: string, playerIds: string[]): Promise<boolean> {
    const room = this.rooms.get(code);
    if (!room) return false;

    // Validate Team Size based on round and player count
    // Simplified logic: 
    // 4-5 players: R1(2), R2(3), R3(2), R4(3), R5(3)
    // But for MVP, just accept any size if it matches config. 
    // Let's enforce strictly if possible, or just accept whatever leader picks for flexibility.
    
    room.gameState.currentTeam = playerIds;
    room.gameState.phase = "quest_voting";
    room.questVotes = {}; // Reset votes
    room.gameState.chat.push({ 
      id: uuidv4(), 
      sender: "System", 
      message: "Team selected! Team members, cast your votes.", 
      timestamp: Date.now(), 
      isSystem: true 
    });

    return true;
  }

  async voteQuest(code: string, playerId: string, vote: boolean): Promise<boolean> {
    const room = this.rooms.get(code);
    if (!room) return false;

    if (room.gameState.phase !== "quest_voting") return false;
    if (!room.gameState.currentTeam.includes(playerId)) return false;

    room.questVotes[playerId] = vote;

    // Check if all voted
    const votesCast = Object.keys(room.questVotes).length;
    if (votesCast >= room.gameState.currentTeam.length) {
      // Process Result
      const votes = Object.values(room.questVotes);
      const failVotes = votes.filter(v => !v).length;
      const success = failVotes === 0; // Strict fail

      room.gameState.questResults.push(success);
      if (success) room.gameState.succeededQuests++;
      else room.gameState.failedQuests++;

      room.gameState.lastQuestResult = {
        success,
        failVotes,
        successVotes: votes.length - failVotes
      };

      room.gameState.chat.push({ 
        id: uuidv4(), 
        sender: "System", 
        message: `Quest ${success ? "SUCCEEDED" : "FAILED"}! (${failVotes} fails)`, 
        timestamp: Date.now(), 
        isSystem: true 
      });

      // Check Win Condition
      if (room.gameState.failedQuests >= 3) {
        room.gameState.winner = "Cult";
        room.gameState.phase = "game_end";
      } else if (room.gameState.succeededQuests >= 3) {
        room.gameState.phase = "seer_guess"; // Cult chance
        room.gameState.chat.push({ 
            id: uuidv4(), 
            sender: "System", 
            message: "Village has 3 successes! Cult must identify the Seer to win.", 
            timestamp: Date.now(), 
            isSystem: true 
        });
      } else {
        // Next Round
        room.gameState.round++;
        room.gameState.phase = "team_selection";
        
        // Rotate Leader
        const currentLeaderIdx = room.players.findIndex(p => p.id === room.gameState.leaderId);
        const nextLeaderIdx = (currentLeaderIdx + 1) % room.players.length;
        room.gameState.leaderId = room.players[nextLeaderIdx].id;
      }
    }

    return true;
  }

  async guessSeer(code: string, seerId: string): Promise<boolean> {
    const room = this.rooms.get(code);
    if (!room) return false;

    const target = room.players.find(p => p.id === seerId);
    if (target && target.role === "Seer") {
      room.gameState.winner = "Cult"; // Cult wins by assassination
    } else {
      room.gameState.winner = "Village";
    }
    room.gameState.phase = "game_end";
    return true;
  }

  async addChatMessage(code: string, sender: string, message: string): Promise<boolean> {
    const room = this.rooms.get(code);
    if (!room) return false;

    room.gameState.chat.push({
      id: uuidv4(),
      sender,
      message,
      timestamp: Date.now(),
      isSystem: false
    });
    
    // Keep chat log reasonable
    if (room.gameState.chat.length > 50) room.gameState.chat.shift();
    return true;
  }
}

export const storage = new MemStorage();
