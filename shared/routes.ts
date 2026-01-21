import { z } from "zod";
import { 
  GameState, 
  CreateRoomSchema, 
  JoinRoomSchema, 
  SelectTeamSchema, 
  CastQuestVoteSchema, 
  GuessSeerSchema,
  SendChatSchema
} from "./schema";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  rooms: {
    create: {
      method: "POST" as const,
      path: "/api/rooms",
      input: CreateRoomSchema,
      responses: { 
        200: z.object({ code: z.string(), playerId: z.string() }),
        400: errorSchemas.validation
      }
    },
    join: {
      method: "POST" as const,
      path: "/api/rooms/join",
      input: JoinRoomSchema,
      responses: { 
        200: z.object({ code: z.string(), playerId: z.string() }),
        400: errorSchemas.validation,
        404: errorSchemas.notFound
      }
    },
    get: {
      method: "GET" as const,
      path: "/api/rooms/:code",
      // input is handled via query params in express, validated manually or via middleware if needed
      // For simplicity in client generation, we'll assume the client appends ?playerId=...
      responses: { 
        200: GameState,
        404: errorSchemas.notFound
      }
    },
    start: {
      method: "POST" as const,
      path: "/api/rooms/:code/start",
      input: z.object({}),
      responses: { 
        200: z.object({ success: z.boolean() }),
        400: errorSchemas.validation
      }
    },
    selectTeam: {
      method: "POST" as const,
      path: "/api/rooms/:code/team",
      input: SelectTeamSchema,
      responses: { 
        200: z.object({ success: z.boolean() }),
        400: errorSchemas.validation
      }
    },
    voteQuest: {
      method: "POST" as const,
      path: "/api/rooms/:code/vote",
      input: CastQuestVoteSchema,
      responses: { 
        200: z.object({ success: z.boolean() }),
        400: errorSchemas.validation
      }
    },
    guessSeer: {
      method: "POST" as const,
      path: "/api/rooms/:code/guess-seer",
      input: GuessSeerSchema,
      responses: { 
        200: z.object({ success: z.boolean() }),
        400: errorSchemas.validation
      }
    },
    chat: {
        method: "POST" as const,
        path: "/api/rooms/:code/chat",
        input: SendChatSchema,
        responses: { 
          200: z.object({ success: z.boolean() }) 
        }
    },
    kick: {
      method: "POST" as const,
      path: "/api/rooms/:code/kick",
      input: z.object({ targetId: z.string() }),
      responses: {
        200: z.object({ success: z.boolean() }),
        400: errorSchemas.validation,
        403: errorSchemas.internal
      }
    },
    leave: {
      method: "POST" as const,
      path: "/api/rooms/:code/leave",
      input: z.object({}),
      responses: {
        200: z.object({ success: z.boolean() }),
        400: errorSchemas.validation
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
