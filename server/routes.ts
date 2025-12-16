import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { scenariosSeed } from "./scenarios-seed";
import type { ActionType, OutcomeType, Scenario } from "@shared/schema";

// Scoring logic
function calculateOutcome(
  scenario: Scenario,
  action: ActionType,
  usedVerification: boolean
): { outcome: OutcomeType; points: number } {
  const isCorrect = action === scenario.correctAction;
  const isMalicious = scenario.legitimacy === "malicious";
  const isLegitimate = scenario.legitimacy === "legitimate";
  const isSuspiciousLegit = scenario.legitimacy === "suspicious_legitimate";

  // Proceed on malicious = compromised
  if (action === "proceed" && isMalicious) {
    return { outcome: "compromised", points: -20 };
  }

  // Report legitimate = false alarm
  if (action === "report" && isLegitimate) {
    return { outcome: "false_alarm", points: -5 };
  }

  // Report suspicious-but-legit = minor false alarm
  if (action === "report" && isSuspiciousLegit) {
    return { outcome: "false_alarm", points: -2 };
  }

  // Delete legitimate = delayed work
  if (action === "delete" && isLegitimate) {
    return { outcome: "delayed_work", points: -3 };
  }

  // Verify is always safe but costs resources
  if (action === "verify") {
    if (isMalicious) {
      return { outcome: "safe", points: 15 }; // Good use of verification
    }
    if (isLegitimate || isSuspiciousLegit) {
      return { outcome: "safe", points: 8 }; // Cautious but acceptable
    }
  }

  // Report malicious = correct
  if (action === "report" && isMalicious) {
    return { outcome: "safe", points: 15 };
  }

  // Delete malicious = partial credit
  if (action === "delete" && isMalicious) {
    return { outcome: "safe", points: 10 };
  }

  // Proceed on legitimate = correct
  if (action === "proceed" && isLegitimate) {
    return { outcome: "safe", points: 10 };
  }

  // Proceed on suspicious-legit = risky but okay
  if (action === "proceed" && isSuspiciousLegit) {
    return { outcome: "safe", points: 5 };
  }

  // Delete suspicious-legit = cautious
  if (action === "delete" && isSuspiciousLegit) {
    return { outcome: "delayed_work", points: 2 };
  }

  // Default fallback
  return { outcome: "safe", points: 5 };
}

async function seedScenariosIfNeeded() {
  const count = await storage.getScenariosCount();
  if (count === 0) {
    console.log("Seeding scenarios...");
    for (const scenario of scenariosSeed) {
      await storage.createScenario(scenario);
    }
    console.log(`Seeded ${scenariosSeed.length} scenarios`);
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Set up authentication
  await setupAuth(app);
  registerAuthRoutes(app);

  // Seed scenarios
  await seedScenariosIfNeeded();

  // Get user progress
  app.get("/api/progress", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      let progress = await storage.getProgressByUserId(userId);
      
      if (!progress) {
        progress = await storage.upsertProgress(userId, {
          totalShifts: 0,
          totalDecisions: 0,
          correctDecisions: 0,
          falsePositives: 0,
          compromised: 0,
          currentStreak: 0,
          longestStreak: 0,
          totalScore: 0,
          missedCues: {},
          earnedBadges: [],
        });
      }
      
      res.json(progress);
    } catch (error) {
      console.error("Error fetching progress:", error);
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  // Create a new shift
  app.post("/api/shifts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Get random scenarios for this shift
      const scenarios = await storage.getRandomScenarios(10);
      const scenarioIds = scenarios.map(s => s.id);
      
      const shift = await storage.createShift({
        userId,
        scenarioIds,
        verificationBudget: 3,
        verificationsUsed: 0,
        score: 0,
        correctDecisions: 0,
        falsePositives: 0,
        compromised: 0,
      });
      
      res.json(shift);
    } catch (error) {
      console.error("Error creating shift:", error);
      res.status(500).json({ message: "Failed to create shift" });
    }
  });

  // Get shift by ID with scenarios
  app.get("/api/shifts/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      
      const shift = await storage.getShiftById(id);
      
      if (!shift) {
        return res.status(404).json({ message: "Shift not found" });
      }
      
      if (shift.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      // Get scenarios for this shift
      const scenarios = await storage.getScenariosByIds(shift.scenarioIds);
      
      // Sort scenarios to match the order in scenarioIds
      const orderedScenarios = shift.scenarioIds
        .map(id => scenarios.find(s => s.id === id))
        .filter(Boolean);
      
      res.json({ ...shift, scenarios: orderedScenarios });
    } catch (error) {
      console.error("Error fetching shift:", error);
      res.status(500).json({ message: "Failed to fetch shift" });
    }
  });

  // Submit a decision
  app.post("/api/shifts/:shiftId/decisions", isAuthenticated, async (req: any, res) => {
    try {
      const { shiftId } = req.params;
      const { scenarioId, action, confidence } = req.body;
      const userId = req.user.claims.sub;
      
      // Validate input
      if (!scenarioId || !action || confidence === undefined) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      const shift = await storage.getShiftById(shiftId);
      if (!shift || shift.userId !== userId) {
        return res.status(404).json({ message: "Shift not found" });
      }
      
      const scenario = await storage.getScenarioById(scenarioId);
      if (!scenario) {
        return res.status(404).json({ message: "Scenario not found" });
      }
      
      // Check if using verification
      const usedVerification = action === "verify";
      if (usedVerification && shift.verificationsUsed >= shift.verificationBudget) {
        return res.status(400).json({ message: "No verifications remaining" });
      }
      
      // Calculate outcome
      const { outcome, points } = calculateOutcome(scenario, action, usedVerification);
      
      // Create decision
      const decision = await storage.createDecision({
        shiftId,
        scenarioId,
        userId,
        action,
        confidence,
        outcome,
        pointsEarned: points,
        usedVerification,
      });
      
      // Update shift stats
      const isCorrect = action === scenario.correctAction;
      const isFalsePositive = outcome === "false_alarm";
      const isCompromised = outcome === "compromised";
      
      const updatedShift = await storage.updateShift(shiftId, {
        score: shift.score + points,
        correctDecisions: shift.correctDecisions + (isCorrect ? 1 : 0),
        falsePositives: shift.falsePositives + (isFalsePositive ? 1 : 0),
        compromised: shift.compromised + (isCompromised ? 1 : 0),
        verificationsUsed: shift.verificationsUsed + (usedVerification ? 1 : 0),
      });
      
      // Update user progress
      const progress = await storage.getProgressByUserId(userId);
      const currentStreak = isCompromised ? 0 : (progress?.currentStreak || 0) + (isCorrect ? 1 : 0);
      const longestStreak = Math.max(currentStreak, progress?.longestStreak || 0);
      
      // Track missed cues
      const missedCues = { ...(progress?.missedCues as Record<string, number> || {}) };
      if (!isCorrect && scenario.cues) {
        for (const cue of scenario.cues) {
          missedCues[cue] = (missedCues[cue] || 0) + 1;
        }
      }
      
      await storage.upsertProgress(userId, {
        totalDecisions: (progress?.totalDecisions || 0) + 1,
        correctDecisions: (progress?.correctDecisions || 0) + (isCorrect ? 1 : 0),
        falsePositives: (progress?.falsePositives || 0) + (isFalsePositive ? 1 : 0),
        compromised: (progress?.compromised || 0) + (isCompromised ? 1 : 0),
        currentStreak,
        longestStreak,
        totalScore: (progress?.totalScore || 0) + points,
        missedCues,
      });
      
      res.json({
        decision,
        outcome,
        pointsEarned: points,
        shift: updatedShift,
      });
    } catch (error) {
      console.error("Error submitting decision:", error);
      res.status(500).json({ message: "Failed to submit decision" });
    }
  });

  // Complete a shift
  app.post("/api/shifts/:shiftId/complete", isAuthenticated, async (req: any, res) => {
    try {
      const { shiftId } = req.params;
      const userId = req.user.claims.sub;
      
      const shift = await storage.getShiftById(shiftId);
      if (!shift || shift.userId !== userId) {
        return res.status(404).json({ message: "Shift not found" });
      }
      
      const updatedShift = await storage.updateShift(shiftId, {
        completedAt: new Date(),
      });
      
      // Update total shifts count
      const progress = await storage.getProgressByUserId(userId);
      await storage.upsertProgress(userId, {
        totalShifts: (progress?.totalShifts || 0) + 1,
      });
      
      res.json(updatedShift);
    } catch (error) {
      console.error("Error completing shift:", error);
      res.status(500).json({ message: "Failed to complete shift" });
    }
  });

  return httpServer;
}
