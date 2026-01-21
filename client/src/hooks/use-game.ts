import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { 
  type GameState, 
  type CreateRoomSchema, 
  type JoinRoomSchema, 
  type SelectTeamSchema, 
  type CastQuestVoteSchema, 
  type GuessSeerSchema,
  type SendChatSchema 
} from "@shared/schema";
import { z } from "zod";

// Helper for local storage of player ID
const PLAYER_ID_KEY = "cult_player_id";
export const getStoredPlayerId = () => localStorage.getItem(PLAYER_ID_KEY);
export const setStoredPlayerId = (id: string) => localStorage.setItem(PLAYER_ID_KEY, id);

// --- Hooks ---

export function useCreateRoom() {
  return useMutation({
    mutationFn: async (data: z.infer<typeof CreateRoomSchema>) => {
      const res = await fetch(api.rooms.create.path, {
        method: api.rooms.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create room");
      const json = await res.json();
      return api.rooms.create.responses[200].parse(json);
    },
    onSuccess: (data) => {
      setStoredPlayerId(data.playerId);
    }
  });
}

export function useJoinRoom() {
  return useMutation({
    mutationFn: async (data: z.infer<typeof JoinRoomSchema>) => {
      const res = await fetch(api.rooms.join.path, {
        method: api.rooms.join.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        if (res.status === 404) throw new Error("Room not found");
        throw new Error("Failed to join room");
      }
      const json = await res.json();
      return api.rooms.join.responses[200].parse(json);
    },
    onSuccess: (data) => {
      setStoredPlayerId(data.playerId);
    }
  });
}

export function useGameState(code: string, playerId: string | null) {
  return useQuery({
    queryKey: [api.rooms.get.path, code],
    queryFn: async () => {
      if (!playerId) return null;
      // Manually appending query param since the route def uses :code param
      const url = buildUrl(api.rooms.get.path, { code }) + `?playerId=${playerId}`;
      const res = await fetch(url);
      if (res.status === 404) throw new Error("Room not found");
      if (!res.ok) throw new Error("Failed to fetch game state");
      return api.rooms.get.responses[200].parse(await res.json());
    },
    enabled: !!code && !!playerId,
    refetchInterval: 1000, // Poll every 1 second
  });
}

export function useStartGame() {
  return useMutation({
    mutationFn: async ({ code }: { code: string }) => {
      const url = buildUrl(api.rooms.start.path, { code });
      const res = await fetch(url, { method: api.rooms.start.method });
      if (!res.ok) throw new Error("Failed to start game");
      return api.rooms.start.responses[200].parse(await res.json());
    }
  });
}

export function useSelectTeam() {
  return useMutation({
    mutationFn: async ({ code, playerIds }: { code: string } & z.infer<typeof SelectTeamSchema>) => {
      const url = buildUrl(api.rooms.selectTeam.path, { code });
      const res = await fetch(url, {
        method: api.rooms.selectTeam.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerIds }),
      });
      if (!res.ok) throw new Error("Failed to select team");
      return api.rooms.selectTeam.responses[200].parse(await res.json());
    }
  });
}

export function useVoteQuest() {
  return useMutation({
    mutationFn: async ({ code, vote }: { code: string } & z.infer<typeof CastQuestVoteSchema>) => {
      const playerId = getStoredPlayerId();
      const url = buildUrl(api.rooms.voteQuest.path, { code }) + `?playerId=${playerId}`;
      const res = await fetch(url, {
        method: api.rooms.voteQuest.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vote }),
      });
      if (!res.ok) throw new Error("Failed to vote");
      return api.rooms.voteQuest.responses[200].parse(await res.json());
    }
  });
}

export function useGuessSeer() {
  return useMutation({
    mutationFn: async ({ code, seerId }: { code: string } & z.infer<typeof GuessSeerSchema>) => {
      const url = buildUrl(api.rooms.guessSeer.path, { code });
      const res = await fetch(url, {
        method: api.rooms.guessSeer.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seerId }),
      });
      if (!res.ok) throw new Error("Failed to guess seer");
      return api.rooms.guessSeer.responses[200].parse(await res.json());
    }
  });
}

export function useSendChat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ code, message }: { code: string } & z.infer<typeof SendChatSchema>) => {
      const playerId = getStoredPlayerId();
      const url = buildUrl(api.rooms.chat.path, { code }) + `?playerId=${playerId}`;
      const res = await fetch(url, {
        method: api.rooms.chat.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (!res.ok) throw new Error("Failed to send message");
      return api.rooms.chat.responses[200].parse(await res.json());
    },
    // Optimistic update or just invalidation (polling will pick it up, but invalidation makes it snappier)
    onSuccess: (_, { code }) => {
      queryClient.invalidateQueries({ queryKey: [api.rooms.get.path, code] });
    }
  });
}

export function useKickPlayer() {
  return useMutation({
    mutationFn: async ({ code, targetId }: { code: string, targetId: string }) => {
      const playerId = getStoredPlayerId();
      const url = buildUrl(api.rooms.kick.path, { code }) + `?playerId=${playerId}`;
      const res = await fetch(url, {
        method: api.rooms.kick.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetId }),
      });
      if (!res.ok) throw new Error("Failed to kick player");
      return api.rooms.kick.responses[200].parse(await res.json());
    }
  });
}

export function useLeaveRoom() {
  return useMutation({
    mutationFn: async ({ code }: { code: string }) => {
      const playerId = getStoredPlayerId();
      const url = buildUrl(api.rooms.leave.path, { code }) + `?playerId=${playerId}`;
      const res = await fetch(url, {
        method: api.rooms.leave.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error("Failed to leave room");
      return api.rooms.leave.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      window.location.href = "/";
    }
  });
}
