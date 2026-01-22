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
      const result = await storage.createRoom(input.name, input.avatar);
      res.json(result);
    } catch (e) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.post(api.rooms.join.path, async (req, res) => {
    try {
      const input = api.rooms.join.input.parse(req.body);
      const result = await storage.joinRoom(input.code.toUpperCase(), input.name, input.avatar);
      res.json(result);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Could not join room";
      res.status(e instanceof Error && e.message === "Room not found" ? 404 : 400).json({ message });
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
    const code = req.params.code.toUpperCase();
    const success = await storage.startGame(code);
    if (!success) return res.status(400).json({ message: "Could not start game" });
    res.json({ success: true });
  });

  app.post(api.rooms.selectTeam.path, async (req, res) => {
    const code = req.params.code.toUpperCase();
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
    const code = req.params.code.toUpperCase();
    const playerId = req.query.playerId as string;
    try {
      const { vote } = req.body;
      const success = await storage.voteQuest(code, playerId, vote);
      if (!success) return res.status(400).json({ message: "Could not cast vote" });
      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.post(api.rooms.voteTeam.path, async (req, res) => {
    const code = req.params.code.toUpperCase();
    const playerId = req.query.playerId as string;
    try {
      const { vote } = req.body;
      const success = await storage.voteTeam(code, playerId, vote);
      if (!success) return res.status(400).json({ message: "Could not cast team vote" });
      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.post(api.rooms.guessSeer.path, async (req, res) => {
    const code = req.params.code.toUpperCase();
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
    const code = req.params.code.toUpperCase();
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

  app.post(api.rooms.kick.path, async (req, res) => {
    const code = req.params.code.toUpperCase();
    const hostId = req.query.playerId as string;
    try {
      const { targetId } = req.body;
      const success = await storage.kickPlayer(code, hostId, targetId);
      if (!success) return res.status(400).json({ message: "Could not kick player" });
      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.post(api.rooms.leave.path, async (req, res) => {
    const code = req.params.code.toUpperCase();
    const playerId = req.query.playerId as string;
    try {
      const success = await storage.leaveRoom(code, playerId);
      if (!success) return res.status(400).json({ message: "Could not leave room" });
      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  return httpServer;
}
