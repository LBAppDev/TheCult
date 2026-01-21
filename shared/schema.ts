import { z } from "zod";

// --- Enums ---
export const PlayerRole = z.enum(["Villager", "Seer", "Cultist"]);
export type PlayerRole = z.infer<typeof PlayerRole>;

export const GamePhase = z.enum([
  "lobby",
  "team_selection",
  "team_voting",
  "quest_voting",
  "quest_result",
  "game_end",
  "seer_guess"
]);
export type GamePhase = z.infer<typeof GamePhase>;

// --- Sub-Objects ---
export const Player = z.object({
  id: z.string(),
  name: z.string(),
  isHost: z.boolean(),
  role: PlayerRole.optional(), // Hidden from client mostly
  isDead: z.boolean().default(false), // For compatibility/extensions
});
export type Player = z.infer<typeof Player>;

export const ChatMessage = z.object({
  id: z.string(),
  sender: z.string(),
  message: z.string(),
  timestamp: z.number(),
  isSystem: z.boolean().default(false),
});
export type ChatMessage = z.infer<typeof ChatMessage>;

// --- Main Game State ---
export const GameState = z.object({
  roomCode: z.string(),
  phase: GamePhase,
  round: z.number(), // 1-5
  players: z.array(Player),
  leaderId: z.string().optional(),
  currentTeam: z.array(z.string()), // Player IDs on the quest
  questResults: z.array(z.boolean()), // true=Success, false=Fail
  failedQuests: z.number(),
  succeededQuests: z.number(),
  teamRefusals: z.number().default(0), // Count of refused teams in current round
  cultistCount: z.number().default(0), // Number of cultists in the game
  winner: z.enum(["Village", "Cult"]).optional(),
  chat: z.array(ChatMessage),
  phaseEndTime: z.number().optional(), // Timestamp when phase ends
  lastQuestResult: z.object({
      success: z.boolean(),
      failVotes: z.number(),
      successVotes: z.number()
  }).optional().nullable(),
  teamVotes: z.record(z.boolean()).optional(), // PlayerId -> Vote for current team proposal
});
export type GameState = z.infer<typeof GameState>;

// --- API IO Schemas ---
export const CreateRoomSchema = z.object({ name: z.string() });
export const JoinRoomSchema = z.object({ name: z.string(), code: z.string() });
export const SelectTeamSchema = z.object({ playerIds: z.array(z.string()) });
export const CastQuestVoteSchema = z.object({ vote: z.boolean() }); // true=Success, false=Fail
export const CastTeamVoteSchema = z.object({ vote: z.boolean() }); // true=Approve, false=Reject
export const GuessSeerSchema = z.object({ seerId: z.string() });
export const SendChatSchema = z.object({ message: z.string() });
