import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { scenariosSeed } from "./scenarios-seed";
import type { ActionType, OutcomeType, Scenario, UserProgress, BadgeId } from "@shared/schema";
import { BADGES } from "@shared/schema";

// Badge awarding logic
function checkAndAwardBadges(
  progress: UserProgress,
  scenario: Scenario | null,
  isCorrect: boolean,
  usedVerification: boolean
): BadgeId[] {
  const earnedBadges = [...(progress.earnedBadges || [])] as BadgeId[];
  const newBadges: BadgeId[] = [];

  // Domain Detective - check if scenario has domain mismatch cue
  if (scenario && isCorrect && scenario.cues.some(c => c.toLowerCase().includes("domain"))) {
    const domainDetects = progress.correctDecisions + 1;
    if (domainDetects >= BADGES.domain_detective.requirement && !earnedBadges.includes("domain_detective")) {
      newBadges.push("domain_detective");
    }
  }

  // Verification Pro - used verification correctly on malicious content
  if (usedVerification && scenario?.legitimacy === "malicious") {
    const verifyCount = (progress.totalDecisions || 0);
    if (verifyCount >= BADGES.verification_pro.requirement && !earnedBadges.includes("verification_pro")) {
      newBadges.push("verification_pro");
    }
  }

  // BEC Blocker - blocked BEC attempts
  if (isCorrect && scenario?.attackFamily === "bec") {
    const becBlocks = progress.correctDecisions + 1;
    if (becBlocks >= BADGES.bec_blocker.requirement && !earnedBadges.includes("bec_blocker")) {
      newBadges.push("bec_blocker");
    }
  }

  // Urgency Immune - resisted urgency attacks
  if (isCorrect && scenario?.cues.some(c => c.toLowerCase().includes("urgency"))) {
    const urgencyResists = progress.correctDecisions + 1;
    if (urgencyResists >= BADGES.urgency_immune.requirement && !earnedBadges.includes("urgency_immune")) {
      newBadges.push("urgency_immune");
    }
  }

  // Streak Master - 20 decision streak
  const currentStreak = progress.currentStreak + (isCorrect ? 1 : 0);
  if (currentStreak >= BADGES.streak_master.requirement && !earnedBadges.includes("streak_master")) {
    newBadges.push("streak_master");
  }

  return newBadges;
}

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
      
      // Check for new badges
      const defaultProgress: UserProgress = {
        id: '',
        userId,
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
        lastPlayedAt: null,
      };
      const newBadges = checkAndAwardBadges(progress || defaultProgress, scenario, isCorrect, usedVerification);
      const allBadges = [...(progress?.earnedBadges || []), ...newBadges];
      
      await storage.upsertProgress(userId, {
        totalDecisions: (progress?.totalDecisions || 0) + 1,
        correctDecisions: (progress?.correctDecisions || 0) + (isCorrect ? 1 : 0),
        falsePositives: (progress?.falsePositives || 0) + (isFalsePositive ? 1 : 0),
        compromised: (progress?.compromised || 0) + (isCompromised ? 1 : 0),
        currentStreak,
        longestStreak,
        totalScore: (progress?.totalScore || 0) + points,
        missedCues,
        earnedBadges: allBadges,
      });
      
      res.json({
        decision,
        outcome,
        pointsEarned: points,
        shift: updatedShift,
        newBadges,
      });
    } catch (error) {
      console.error("Error submitting decision:", error);
      res.status(500).json({ message: "Failed to submit decision" });
    }
  });

  // Get current user info (with role)
  app.get("/api/user/me", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Instructor middleware
  const isInstructor = async (req: any, res: any, next: any) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUserById(userId);
      if (!user || user.role !== "instructor") {
        return res.status(403).json({ message: "Instructor access required" });
      }
      next();
    } catch (error) {
      console.error("Error checking instructor role:", error);
      res.status(500).json({ message: "Authorization error" });
    }
  };

  // Instructor: Get cohort analytics
  app.get("/api/instructor/analytics", isAuthenticated, isInstructor, async (req: any, res) => {
    try {
      const analytics = await storage.getCohortAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Instructor: Get learner summaries
  app.get("/api/instructor/learners", isAuthenticated, isInstructor, async (req: any, res) => {
    try {
      const learners = await storage.getLearnerSummaries();
      res.json(learners);
    } catch (error) {
      console.error("Error fetching learners:", error);
      res.status(500).json({ message: "Failed to fetch learners" });
    }
  });

  // Promote user to instructor (temporary endpoint for testing)
  app.post("/api/user/promote-instructor", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.updateUserRole(userId, "instructor");
      res.json(user);
    } catch (error) {
      console.error("Error promoting user:", error);
      res.status(500).json({ message: "Failed to promote user" });
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
      
      // Update total shifts count and check for perfect shift badge
      const progress = await storage.getProgressByUserId(userId);
      const earnedBadges = [...(progress?.earnedBadges || [])] as BadgeId[];
      const newBadges: BadgeId[] = [];
      
      // Check for perfect shift (all decisions correct, no compromises or false positives)
      const isPerfect = shift.correctDecisions === shift.scenarioIds.length && 
                       shift.compromised === 0 && 
                       shift.falsePositives === 0;
      
      if (isPerfect && !earnedBadges.includes("perfect_shift")) {
        newBadges.push("perfect_shift");
      }
      
      const allBadges = [...earnedBadges, ...newBadges];
      
      await storage.upsertProgress(userId, {
        totalShifts: (progress?.totalShifts || 0) + 1,
        earnedBadges: allBadges,
      });
      
      res.json({ shift: updatedShift, newBadges });
    } catch (error) {
      console.error("Error completing shift:", error);
      res.status(500).json({ message: "Failed to complete shift" });
    }
  });

  return httpServer;
}
