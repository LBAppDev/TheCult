import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // CORS not needed as we are serving from same origin in Replit env usually, 
  // but if needed, Express handles it via middleware if configured.
  // Using standard routes matching shared/routes.ts

  app.post(api.rooms.create.path, async (req, res) => {
    try {
      const input = api.rooms.create.input.parse(req.body);
      const result = await storage.createRoom(input.name);
      res.json(result);
    } catch (e) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.post(api.rooms.join.path, async (req, res) => {
    try {
      const input = api.rooms.join.input.parse(req.body);
      const result = await storage.joinRoom(input.code, input.name);
      res.json(result);
    } catch (e) {
      res.status(400).json({ message: "Could not join room" });
    }
  });

  app.get(api.rooms.get.path, async (req, res) => {
    const code = req.params.code.toUpperCase(); // Ensure uppercase matching
    const playerId = req.query.playerId as string;
    
    if (!playerId) {
      return res.status(400).json({ message: "playerId required" });
    }

    const state = await storage.getGameState(code, playerId);
    if (!state) {
      return res.status(404).json({ message: "Room not found or access denied" });
    }
    res.json(state);
  });

  app.post(api.rooms.start.path, async (req, res) => {
    const code = req.params.code;
    const success = await storage.startGame(code);
    if (!success) return res.status(400).json({ message: "Could not start game" });
    res.json({ success: true });
  });

  app.post(api.rooms.selectTeam.path, async (req, res) => {
    const code = req.params.code;
    try {
      const input = api.rooms.selectTeam.input.parse(req.body);
      const success = await storage.selectTeam(code, input.playerIds);
      if (!success) return res.status(400).json({ message: "Invalid team selection" });
      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.post(api.rooms.voteQuest.path, async (req, res) => {
    const code = req.params.code;
    try {
      const input = api.rooms.voteQuest.input.parse(req.body);
      // We need playerId from somewhere. In a real app, middleware auth.
      // Here, we'll assume it's passed in body or query? 
      // The schema didn't include playerId.
      // Let's extract from a header or query for now since we didn't add it to schema.
      // Or we can add it to schema?
      // Re-reading `shared/routes.ts`: `CastQuestVoteSchema` is `{ vote: boolean }`.
      // I'll grab playerId from query param `?playerId=...` which is common in simple apps
      const playerId = req.query.playerId as string;
      
      const success = await storage.voteQuest(code, playerId, input.vote);
      if (!success) return res.status(400).json({ message: "Invalid vote" });
      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.post(api.rooms.guessSeer.path, async (req, res) => {
    const code = req.params.code;
    try {
      const input = api.rooms.guessSeer.input.parse(req.body);
      const success = await storage.guessSeer(code, input.seerId);
      if (!success) return res.status(400).json({ message: "Invalid guess" });
      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.post(api.rooms.chat.path, async (req, res) => {
    const code = req.params.code;
    const playerId = req.query.playerId as string;
    try {
      const input = api.rooms.chat.input.parse(req.body);
      // Need sender name. Get from storage? Or pass in?
      // Simplest: Get state to find name.
      const state = await storage.getGameState(code, playerId);
      const player = state?.players.find(p => p.id === playerId);
      if (player) {
          await storage.addChatMessage(code, player.name, input.message);
          res.json({ success: true });
      } else {
          res.status(403).json({ message: "Forbidden" });
      }
    } catch (e) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  return httpServer;
}
