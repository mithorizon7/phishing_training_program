import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { scenariosSeed } from "./scenarios-seed";

async function seedScenariosIfNeeded() {
  const existingScenarios = await storage.getScenarios();
  const existingScenarioKeys = new Set(
    existingScenarios
      .map((scenario) => scenario.i18nKey)
      .filter((key): key is string => Boolean(key))
  );
  const missingScenarios = scenariosSeed.filter((scenario) => (
    scenario.i18nKey ? !existingScenarioKeys.has(scenario.i18nKey) : true
  ));

  if (missingScenarios.length > 0) {
    console.log(`Seeding ${missingScenarios.length} missing scenarios...`);
    for (const scenario of missingScenarios) {
      await storage.createScenario(scenario as Parameters<typeof storage.createScenario>[0]);
    }
    console.log(`Scenario library ready: ${existingScenarios.length + missingScenarios.length} total scenarios`);
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await seedScenariosIfNeeded();

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
