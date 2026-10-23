import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { seedScenarioLibrary } from "./scenario-seeding";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const seeded = await seedScenarioLibrary(db);
  if (seeded.backfilled || seeded.created) {
    console.log(`Scenario library ready: ${seeded.backfilled} localization keys restored, ${seeded.created} scenarios added`);
  }

  // Public data endpoints for the fully anonymous training experience
  app.get("/api/scenarios", async (_req, res) => {
    try {
      const scenarios = await storage.getScenarios();
      res.json(scenarios);
    } catch (error) {
      console.error("Scenario query failed");
      res.status(500).json({ message: "Failed to fetch scenarios" });
    }
  });

  app.get("/api/assignments", async (_req, res) => {
    try {
      const assignments = await storage.getPublishedAssignments();
      res.json(assignments);
    } catch (error) {
      console.error("Assignment list query failed");
      res.status(500).json({ message: "Failed to fetch assignments" });
    }
  });

  app.get("/api/assignments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const assignment = await storage.getAssignmentById(id);
      if (!assignment || !assignment.isPublished) {
        return res.status(404).json({ message: "Assignment not found" });
      }
      res.json(assignment);
    } catch (error) {
      console.error("Assignment query failed");
      res.status(500).json({ message: "Failed to fetch assignment" });
    }
  });

  return httpServer;
}
